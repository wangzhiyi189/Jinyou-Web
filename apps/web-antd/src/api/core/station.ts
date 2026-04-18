// 站点管理
import {  requestClient } from '#/api/request';

/**
 * 获取站点管理列表
 */
export async function getStationListApi(params:any) {
  return requestClient.get('/station',{params});
}

/**
 * 添加站点
 */
export async function postStationAddApi(data: any) {
  return requestClient.post('/station/add',data);
}

/**
 * 修改站点
 */
export async function putStationUpdateApi(data: any) {
  return requestClient.put('/station/update',data);
}

/**
 * 删除站点
 */
export async function deleteStationDeleteApi(id: any) {
  return requestClient.delete(`/station/delete/${id}`);
}

/**
 * 修改站点状态
 */
export async function putStationStatusApi(data: any) {
  return requestClient.put('/station/update/status',data);
}

