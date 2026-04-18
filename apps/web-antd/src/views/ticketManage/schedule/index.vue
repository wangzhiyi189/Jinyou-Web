<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page , useVbenModal } from '@vben/common-ui';

import { Button,message,Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getScheduleListApi , deleteScheduleDeleteApi , putScheduleStatusApi  , putScheduleIsRecommendApi , getScheduleVoListApi } from '#/api/index';

import CreateDemo from './create-demo.vue';
import LineDemo from './line-demo.vue';
import { parseCity } from '@/utils/tools';
type RowType = {
  scheduleId: number;
  scheduleName : string;
  lineId: number, // 线路列表
  departTime: string, // 发车时间
  arriveTime: string, // 到达时间
  duration:string, // 运行时长
  plateNumber:string, // 车牌号
  vehicleType:string, // 车型
  price:number, // 票价
  seatTotal:number, // 总座位数
  seatRemaining:string, // 剩余座位数
  sort: number,//排序
  status:number, // 状态 0-禁用 1-启用
  isRecommend:number, // 是否推荐 0-否 1-是
  remark: string, // 备注
  startCity:string,
  endCity:string
};

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'scheduleName',
      label: '标题',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '启用',
            value: 1,
          },
          {
            label: '禁用',
            value: 0,
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 是否在字段值改变时提交表单
  submitOnChange: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    // { field: 'sort', title: '序号', width: 100 },
    { field: 'scheduleName', title: '车次名称',  width: 150 },
    { field: 'stationList', title: '线路' ,slots: { default: 'stationList' },width: 100},
    { field: 'startCity', title: '出发城市',slots: { default: 'startCity' },width: 150 },
    { field: 'endCity', title: '到达城市',slots: { default: 'endCity' },width: 150 },
    { field: 'duration', title: '预计到达时间',slots: { default: 'duration' } ,width: 150},
    { field: 'price', title: '票价',slots: { default: 'price' } ,width: 150},
    { field: 'plateNumber', title: '车牌号' ,width: 150},
    { field: 'vehicleType', title: '车型',slots: { default: 'vehicleType' } ,width: 150},
    { field: 'seatTotal', title: '总座位数',width: 150 },
    { field: 'seatRemaining', title: '剩余座位数',width: 150 },
    { field: 'status', title: '状态',slots: { default: 'status' } ,width: 150},
    { field: 'isRecommend', title: '是否推荐',slots: { default: 'isRecommend' },width: 150 },
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
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues:any) => {
        const res = await getScheduleVoListApi({
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

const [Grid,{reload }] = useVbenVxeGrid<RowType>({
  formOptions,
  gridOptions,
});

const [BaseModal, baseModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CreateDemo,
});
const [LineModal, LineModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: LineDemo,
});
const handleCreateBanner = () => {
  // handleTriggerSearch()
  baseModalApi.open();
  baseModalApi.setData({});
};
const handleTriggerSearch = async () => {
  // 1. 最简单：直接刷新（使用当前表单条件）
  await reload();
  // 2. 进阶：先设置表单值 → 再搜索
  // const form = await getFormInstance();
  // if (form) {
  //   form.setFieldsValue({ category: '2', color: '1' });
  //   await reload();
  // }
  // message.success('已主动触发表格搜索');
};
// 编辑
const handleEditBanner = (row:any) => {
  baseModalApi.setData(row);
  baseModalApi.open();
};
// 删除
const handleDeleteBanner = async (row:any) => {
  Modal.confirm({
    title: '操作提示',
    content: "确定要删除吗？",
    okText:"确定",
    cancelText:"取消",
    async onOk() {
      const res = await deleteScheduleDeleteApi(row.scheduleId);
      if(res.code == 200){
        message.success(res.message);
        handleTriggerSearch();
      }
    },
  });
};
// 修改状态
const handleChangeStatus = async (row:any) => {
  console.log(row.status,row.bannerId)
  const res = await putScheduleStatusApi({
    scheduleId: row.scheduleId,
    status: row.status,
  });
  if(res.code == 200){
    message.success(res.message);
    handleTriggerSearch();
  }
};
// 是否推荐
const handleChangeIsRecommend = async(row:any) => {
    console.log(row.isRecommend,row.scheduleId)
  const res = await putScheduleIsRecommendApi({
    scheduleId: row.scheduleId,
    isRecommend: row.isRecommend,
  });
  if(res.code == 200){
    message.success(res.message);
    handleTriggerSearch();
  }
}
// 线路详情
const handleLineDetail = (row:any) => {
  console.log(row.stationList)
  LineModalApi.setData(row.stationList);
  LineModalApi.open();
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="handleCreateBanner">新建车次</Button>
      </template>
      <template #stationList="{ row }">
        <a-button type="link" @click="handleLineDetail(row)">查看</a-button>
      </template>
      <template #startCity="{ row }">
        {{ parseCity(row?.startCity) }}
      </template>
      <template #endCity="{ row }">
        {{ parseCity(row?.endCity) }}
      </template>
      <template #duration="{ row }">
        {{ row.duration }} 小时
      </template>
      <template #price="{ row }">
        {{ row.price }} 元
      </template>
       <template #vehicleType="{ row }">
        {{ row.vehicleType }}
      </template>
      <template #status="{ row }">
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <a-switch v-model:checked="row.status" checked-children="启用" un-checked-children="禁用" :checkedValue="1" :unCheckedValue="0" default-checked @Change="handleChangeStatus(row)" />
      </template>
      <template #isRecommend="{ row }">
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <a-switch v-model:checked="row.isRecommend" checked-children="推荐" un-checked-children="不推荐" :checkedValue="1" :unCheckedValue="0" default-checked @Change="handleChangeIsRecommend(row)" />
      </template>
      <template #action={row}>
        <a-button type="link" @click="handleEditBanner(row)">编辑</a-button>
        <a-button type="link" @click="handleDeleteBanner(row)">删除</a-button>
      </template>
    </Grid>
    <BaseModal @refresh="handleTriggerSearch" />
    <LineModal />
  </Page>
</template>
<style lang="less" scoped>
.link-type-box{
  display: flex;
  flex-direction: column;
}
</style>
