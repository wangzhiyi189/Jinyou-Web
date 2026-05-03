// 车次管理
import {  requestClient } from '#/api/request';

/**
 * 获取车次管理列表
 */
export async function getOrderListApi(params:any) {
  return requestClient.get('/order/list',{params});
}