<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page , useVbenModal } from '@vben/common-ui';

import { Button,message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getBannerListApi } from '#/api';


import CreateDemo from './create-demo.vue';
interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'title',
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
            value: 2,
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
    { field: 'title', title: '标题',  width: 150 },
    { field: 'imageUrl', title: '轮播图' ,slots: { default: 'image-url' },width: 200,cellRender: { name: 'CellImage' },},
    { field: 'linkType', title: '跳转链接',slots: { default: 'link-type' } },
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
      query: async ({ page }, formValues) => {
        const res = await getBannerListApi({
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

const [Grid,{reload,getFormInstance }] = useVbenVxeGrid({
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
  console.log(BaseModal,baseModalApi,'打开')
  baseModalApi.open();
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
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="handleCreateBanner">新建轮播图</Button>
      </template>
      <template #image-url="{ row }">
        <a-image :src="row.imageUrl" :height="100" />
      </template>
      <template #link-type="{ row }">
        <div class="link-type-box">
          <span v-if="row.linkType == 0">不跳转</span>
          <span v-if="row.linkType != 0">{{row.linkUrl}}</span>
        </div>
      </template>
      <template #status="{ row }">
        <a-switch v-model:checked="row.status" checked-children="启用" un-checked-children="禁用" :checkedValue="1" :unCheckedValue="0" default-checked />
      </template>
      <template #action={row}>
        <a-button type="link">编辑</a-button>
        <a-button type="link">删除</a-button>
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
