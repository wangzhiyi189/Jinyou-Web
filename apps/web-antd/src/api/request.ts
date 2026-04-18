/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions, AxiosRequestConfig } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';
import axios from 'axios';

// const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const apiURL = 'http://localhost:8081/admin';

// ===================== 新增：重复请求拦截 =====================
const pendingRequests = new Map<string, AbortController>();

/**
 * 生成请求唯一标识
 */
function getRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

/**
 * 移除重复请求
 */
function removePendingRequest(config: AxiosRequestConfig) {
  const key = getRequestKey(config);
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key);
    controller?.abort(); // 取消上一次请求
    pendingRequests.delete(key);
  }
}

// ============================================================

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // ===================== 新增：请求拦截器处理重复请求 =====================
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      // 取消重复请求
      removePendingRequest(config);

      // 添加新的请求控制器
      const controller = new AbortController();
      config.signal = controller.signal;
      pendingRequests.set(getRequestKey(config), controller);

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // 响应清理
  client.addResponseInterceptor({
    fulfilled: (response) => {
      removePendingRequest(response.config);
      return response;
    },
    rejected: (error) => {
      console.log(error)
      if (!axios.isCancel(error)) {
        // 只有非主动取消的错误才清理
        removePendingRequest(error.config || {});
      }
      return Promise.reject(error);
    },
  });
  // ====================================================================

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 200,
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
    
  );
  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'body',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });