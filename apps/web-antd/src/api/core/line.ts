// 线路管理
import {  requestClient } from '#/api/request';

/**
 * 获取线路列表
 */
export async function getLineListApi(params:any) {
  return requestClient.get('/line',{params});
}

/**
 * 获取线路选项列表
 */
export async function getOptionListApi() {
  return requestClient.get(`/station/optionList`);
}
/**
 * 根据id获取线路
 */
export async function getByStationApi(params: any) {
  return requestClient.get(`/station/listByStationIds`, {
    params,
    // 👇 关键：解决数组传参问题，把 stationIds[]=3 变成 stationIds=3
    paramsSerializer: {
      indexes: null
    }
  });
}
/**
 * 添加线路
 */
export async function postLineAddApi(data:any) {
  return requestClient.post(`/line/add`, data);
}

/**
 * 修改线路
 */
export async function postLineUpdateApi(data:any) {
  return requestClient.put(`/line/update`, data);
}

/**
 * 删除线路
 */
export async function deleteLineDeleteApi(id:any) {
  return requestClient.delete(`/line/delete/${id}`);
}

/**
 * 修改线路状态
 */
export async function putLineStatusApi(data: any) {
  return requestClient.put('/line/update/status',data);
}

