import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

/**
 * 上传文件
 */
export async function uploadFileApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return requestClient.post<string>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
