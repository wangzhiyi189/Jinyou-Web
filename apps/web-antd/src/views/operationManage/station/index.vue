<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page , useVbenModal } from '@vben/common-ui';

import { Button,message,Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getStationListApi , deleteStationDeleteApi ,putStationStatusApi } from '#/api/index';

import CreateDemo from './create-demo.vue';
type RowType = {
  stationId: Number;
  stationName: string;
  city: string; 
  address: number; 
  lng: number;  
  lat: number;
  sort: number;
  status: number;
  remark: string;
};

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'stationName',
      label: '车站名称',
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
    { field: 'sort', title: '序号', width: 100 },
    { field: 'stationName', title: '车站名称',  width: 150 },
    { field: 'city', title: '所属城市' , width:200},
    { field: 'address', title: '详细地址', width:240 },
    { field: 'status', title: '状态',slots: { default: 'status' } },
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
        const res = await getStationListApi({
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
  // toolbarConfig: {
  //   custom: true,
  //   export: true,
  //   refresh: true,
  //   resizable: true,
  //   search: true,
  //   zoom: true,
  // },
};

const [Grid,{reload }] = useVbenVxeGrid<RowType>({
  formOptions,
  gridOptions,
});

// 新建轮播图
const [BaseModal, baseModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CreateDemo,
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
  message.success('已主动触发表格搜索');
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
      const res = await deleteStationDeleteApi(row.stationId);
      if(res.code == 200){
        message.success(res.message);
        handleTriggerSearch();
      }else{
        message.error(res.message);
      }
    },
  });
};
// 修改状态
const handleChangeStatus = async (row:any) => {
  const res = await putStationStatusApi({
    stationId: row.stationId,
    status: row.status,
  });
  if(res.code == 200){
    message.success(res.message);
    handleTriggerSearch();
  }else{
    message.error(res.message);

  }
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="handleCreateBanner">新建站点</Button>
      </template>
      <template #status="{ row }">
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <a-switch v-model:checked="row.status" checked-children="启用" un-checked-children="禁用" :checkedValue="1" :unCheckedValue="0" default-checked @Change="handleChangeStatus(row)" />
      </template>
      <template #action={row}>
        <a-button type="link" @click="handleEditBanner(row)">编辑</a-button>
        <a-button type="link" @click="handleDeleteBanner(row)">删除</a-button>
      </template>
    </Grid>
    <BaseModal @refresh="handleTriggerSearch" />
  </Page>
</template>
<style lang="less" scoped>
.link-type-box{
  display: flex;
  flex-direction: column;
}
</style>
