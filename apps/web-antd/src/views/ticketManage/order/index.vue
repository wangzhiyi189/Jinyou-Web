<script lang="ts" setup>
import { Page , useVbenModal } from '@vben/common-ui';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { VbenFormProps } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOrderListApi } from "@/api/index"
import { orderStatusOptions , getOrderStatusLabel} from '@/utils/orderStatus'
type RowType = {
  scheduleId: number;// 班次ID
  orderNo : string; // 订单号
  createUser: number, // 下单用户ID
  departureTime: string, // 发车时间
  arriveTime: string, // 到达时间
  startStation:string, // 出发站名称
  endStation:string, // 到达站名称
  boardPointId:number, // 上车点ID
  boardPointName:string,// 上车点名称
  ticketCount:number,// 购票数量
  unitPrice:number, // 票价
  totalAmount:number, // 总票价
  contactPhone:number, // 手机号
  seatRemaining:string, // 剩余座位数
  remark: string, // 备注
  orderStatus:number, // 订单状态
};
const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'orderNo',
      label: '订单号',
    },
  ],
   // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 是否在字段值改变时提交表单
  submitOnChange: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
}
const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { field: 'orderNo', title: '订单号',  width: 180 },
    { field: 'orderStatus', title: '订单状态' ,slots: { default: 'orderStatus' },width: 150},
    { field: 'contactPhone', title: '联系方式',  width: 180 },
    { field: 'boardPointName', title: '乘车站点',  width: 240 },
    { field: 'departureTime', title: '发车时间',width: 150 },
    { field: 'plateNumber', title: '车牌号',width: 150 },
    { field: 'arriveTime', title: '到达时间',width: 150 },
    { field: 'createTime', title: '创建时间',width: 150 },
    { field: 'updateTime', title: '修改时间' ,width: 150 },
    { field: 'remark', title: '备注' , width: 250 },
    {
      slots: { default: 'action' },
      field: 'action',
      fixed: 'right',
      title: '操作',
      width: 200,
    },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues:any) => {
        const res = await getOrderListApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        console.log(res)
        return {
          total: res.data.total,
          items: res.data.items,
        };
      },
    },
  },
  showOverflow: false,
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    resizable: true,
    search: true,
    zoom: true,
  },
};
const [Grid,{reload , getFormInstance }] = useVbenVxeGrid<RowType>({
  formOptions,
  gridOptions,
});
</script>
<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        
      </template>
      <template #orderStatus="{ row }">
        <a-tag :bordered="false" :color="getOrderStatusLabel(row?.orderStatus,'color')">{{ getOrderStatusLabel(row?.orderStatus) }}</a-tag>
      </template>
    </Grid>
  </Page>
</template>