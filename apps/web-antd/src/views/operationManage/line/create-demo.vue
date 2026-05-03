<script lang="ts" setup>
import { defineEmits, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { getOptionListApi , postLineAddApi, postLineUpdateApi } from '#/api';
import { reactive, ref } from 'vue';
import cityOption from '#/utils/city.json'
import { router } from '#/router';
const fieldNamesOptions = { label: 'name', value: 'name', children: 'children' };
const status = ref(0)
const title = ref('')
const form = ref();
const loading = ref(false)
const stationOptions = ref([])
const formData = reactive({
  lineId : '',//路线ID
  createUser : '',//创建人ID
  lineName : '',//路线名 北京→石家庄
  stationList : [],//站点顺序数组，逗号分隔
  startCity : [],//出发城市
  endCity : [],//到达城市
  price:'', // 价格
  status : 1,//状态 0-禁用 1-启用
  isPopular:0, // 是否热门 1-是 0-否
  createTime : '',//创建时间
  remark : '',//备注
});


const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: Boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      status.value = data.lineId ? 1 : 0
      title.value = status.value === 0 ? '新增线路' : '修改线路'
      Object.assign(formData, data);
      formData.startCity = JSON.parse(data.startCity);
      formData.endCity = JSON.parse(data.endCity);
      formData.stationList = JSON.parse(data.stationList);
    } else {
      // 🔴 关闭弹窗只清空标记，不销毁地图！避免重复创建
      modalApi.setData({})
      // 重置表单
      Object.assign(formData, {
        lineId : '',//路线ID
        createUser : '',//创建人ID
        lineName : '',//路线名 北京→石家庄
        stationList : [],//站点顺序数组，逗号分隔
        startCity : [],//出发城市
        endCity : [],//到达城市
        price:'',
        status : 1,//状态 1-启用 2-禁用
        isPopular:0,
        createTime : '',//创建时间
        remark : '',//备注
        
      });
    }
  },
});


onMounted(() => {
  handleSelectOptions()
});
const handleSelectOptions = async() => {
  const {data,code,msg} = await getOptionListApi();
  console.log(data,code,msg)
  stationOptions.value = data;
}
const emit = defineEmits<{
  refresh: [];
}>();

const handleSubmit = async () => {
  console.log(formData)
  try {
    await form.value?.validateFields();
    loading.value = true;
    let res;
    if (status.value === 0) {
      res = await postLineAddApi({
        ...formData,
        startCity: JSON.stringify(formData.startCity),
        endCity: JSON.stringify(formData.endCity),
        stationList: JSON.stringify(formData.stationList),
      });
    } else {
      res = await postLineUpdateApi({
        ...formData,
        startCity: JSON.stringify(formData.startCity),
        endCity: JSON.stringify(formData.endCity),
        stationList: JSON.stringify(formData.stationList),
      });
    }
    if (res.code === 200) {
      message.success(res.msg);
      emit('refresh');
      handleClose();
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  modalApi.close();
  loading.value = false;
};
const filterOption = (input : any, option : any) => {
  // input：用户输入的搜索词
  // option：当前选项对象
  return option.stationName.toLowerCase().includes(input.toLowerCase())
}
const handlePushStation = () =>{
  router.push({
    name: 'Station',
  });
}
</script>

<template>
  <Modal class="w-120" :title="title">
    <a-form
      class="w-110"
      ref="form"
      :model="formData"
      name="basic"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 25 }"
      autocomplete="off">
        <a-formItem
          label="线路名称"
          name="lineName"
          :rules="[{ required: true, message: '请输入线路名称' }]"
        >
          <a-input v-model:value="formData.lineName" placeholder="如洪洞-临汾" />
        </a-formItem>
        <a-formItem
          label="出发城市"
          name="startCity"
          :rules="[{ required: true, message: '请先择出发城市' }]"
        >
          <a-cascader v-model:value="formData.startCity" :fieldNames="fieldNamesOptions" @change="(value : any) => {formData.startCity = value}" :changeOnSelect="true" :options="cityOption" placeholder="选择出发城市" />
        </a-formItem>
        <a-formItem
          label="到达城市"
          name="endCity"
          :rules="[{ required: true, message: '请先择到达城市' }]"
        >
          <a-cascader v-model:value="formData.endCity" :fieldNames="fieldNamesOptions" @change="(value : any) => {formData.endCity = value}" :changeOnSelect="true" :options="cityOption" placeholder="选择到达城市" />
        </a-formItem>
        <a-formItem
          label="途径站"
          name="stationList"
          :rules="[{ required: true, message: '请先择途径站' }]"
        >
          <a-select
            v-model:value="formData.stationList"
            :options="stationOptions"
            mode="multiple"
            placeholder="选择途径站,按顺序排序"
            :fieldNames="{ label: 'stationName', value: 'stationId' }"
            showSearch  
             :filter-option="filterOption"
          >
            <template #notFoundContent>
              <a-empty>
                <a-button type="primary" ghost @click="handlePushStation">前往站点添加</a-button>
              </a-empty>
            </template>
          </a-select>
        </a-formItem>
        <a-formItem
          label="票价"
          name="price"
          :rules="[{ required: true, message: '请输入票价' }]"
        >
          <a-input type="number" :min="0.1" v-model:value="formData.price" prefix="￥" suffix="RMB起"  />
        </a-formItem>
        <a-formItem
          label="状态"
          name="status"
        >
          <!-- 0-禁用 1-启用 -->
          <a-switch v-model:checked="formData.status" checked-children="启用" un-checked-children="禁用" :checkedValue="1" :unCheckedValue="0" default-checked />
        </a-formItem>
        <a-formItem
          label="是否热门"
          name="status"
        >
          <!-- 0-不热门 1-热门 -->
          <a-switch v-model:checked="formData.isPopular" checked-children="是" un-checked-children="否" :checkedValue="1" :unCheckedValue="0" default-checked />
        </a-formItem>
        <a-formItem
          label="备注"
          name="remark"
        >
          <a-textarea
            v-model:value="formData.remark"
            placeholder="请输入备注"
            :auto-size="{ minRows: 2, maxRows: 5 }"
          />
        </a-formItem>
    </a-form>
    <template #footer>
      <a-button @click="handleClose">取消</a-button>
      <a-button type="primary" @click="handleSubmit" :loading="loading">确定</a-button>
    </template>
  </Modal>
</template>

<style scoped lang="less">
#amap-container{
  height:400px;
  margin-top: 8px;
}
</style>