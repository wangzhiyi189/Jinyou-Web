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
/**
 * 修改轮播图
 */
export async function putBannerUpdateApi(data: any) {
  return requestClient.put('/banner/update',data);
}

/**
 * 删除轮播图
 */
export async function deleteBannerDeleteApi(id: Number) {
  return requestClient.delete(`/banner/delete/${id}`);
}
/**
 * 修改banner状态
 */
export async function putBannerStatusApi(data: any) {
  return requestClient.put('/banner/update/status',data);
}

/**
 * 获取顶部轮播图列表
 */
export async function getTopBannerListApi(params:any) {
  return requestClient.get('/topBanner',{params});
}
/**
 * 添加顶部轮播图
 */
export async function postTopBannerAddApi(data: any) {
  return requestClient.post('/topBanner/add',data);
}
/**
 * 修改顶部轮播图
 */
export async function putTopBannerUpdateApi(data: any) {
  return requestClient.put('/topBanner/update',data);
}

/**
 * 删除顶部轮播图
 */
export async function deleteTopBannerDeleteApi(id: Number) {
  return requestClient.delete(`/topBanner/delete/${id}`);
}
/**
 * 修改顶部轮播图状态
 */
export async function putTopBannerStatusApi(data: any) {
  return requestClient.put('/topBanner/update/status',data);
}


