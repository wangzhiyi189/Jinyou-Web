// 首页管理
import {  requestClient } from '#/api/request';

/**
 * 获取轮播图列表
 */
export async function getBannerListApi(params:any) {
  return requestClient.get('/banner',{params});
}

/**
 * 添加轮播图
 */
export async function postBannerAddApi(data: any) {
  return requestClient.post('/banner/add',data);
}
