// 车次模板管理
import {  requestClient } from '#/api/request';

/**
 * 获取车次管理列表
 */
export async function getScheduleTemplateListApi(params:any) {
  return requestClient.get('/scheduleTemplate/list',{params});
}

// 添加
export async function postScheduleTemplateAddApi(params:any) {
  return requestClient.post('/scheduleTemplate/add',params);
}