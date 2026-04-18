// 车次管理
import {  requestClient } from '#/api/request';

/**
 * 获取车次管理列表
 */
export async function getScheduleListApi(params:any) {
  return requestClient.get('/schedule',{params});
}
/**
 * 获取车次管理列表返回线路
 */
export async function getScheduleVoListApi(params:any) {
  return requestClient.get('/schedule/vo',{params});
}
/**
 * 查询线路列表
 */
export async function getLineOptionListApi() {
  return requestClient.get('/line/optionList');
}
/**
 * 添加车次
 */
export async function postScheduleAddApi(data: any) {
  return requestClient.post('/schedule/add',data);
}

/**
 * 修改车次
 */
export async function putScheduleUpdateApi(data: any) {
  return requestClient.put('/schedule/update',data);
}

/**
 * 删除车次
 */
export async function deleteScheduleDeleteApi(id:Number) {
  return requestClient.delete(`/schedule/delete/${id}`);
}

/**
 * 修改车次状态
 */
export async function putScheduleStatusApi(data:any) {
  return requestClient.put(`/schedule/update/status`, data);
}

/**
 * 修改车次是否推荐
 */
export async function putScheduleIsRecommendApi(data:any) {
  return requestClient.put(`/schedule/update/isRecommend`, data);
}
