<script lang="ts" setup>
import { defineEmits , nextTick , defineProps, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { uploadFileApi  } from '#/api/core/user';
import { getLineOptionListApi , postScheduleAddApi , putScheduleUpdateApi } from '#/api/index.ts';
import dayjs from 'dayjs';
import { reactive , ref } from 'vue';
import { getTimeInterval } from '#/utils/tools';
import cityOption from '#/utils/city.json'
import { router } from '#/router';
const fieldNamesOptions = { label: 'name', value: 'name', children: 'children' };
const status = ref(0) // 0新增 1修改
const title = ref('')
const form = ref();
const loading = ref(false)
const lineOptions = ref([])
const time = ref([])
const formData = reactive({
  scheduleId:'', // 车次id
  scheduleName: '', // 车次名称
  lineId: '', // 线路列表
  time:[], // 发车时间和到达时间
  departTime: '', // 发车时间
  arriveTime: '', // 到达时间
  duration:'', // 运行时长
  plateNumber:'', // 车牌号
  vehicleType:'', // 车型
  price:'', // 票价
  seatTotal:'', // 总座位数
  seatRemaining:'', // 剩余座位数
  sort: 0,//排序
  status:1, // 状态 0-禁用 1-启用
  isRecommend:0, // 是否推荐 0-否 1-是
  remark: '', // 备注
});
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen:Boolean) {
    if (isOpen) {
      var data = modalApi.getData();
      if(data.scheduleId){
        status.value = 1
      }else{
        status.value = 0
      }
      title.value = status.value == 0 ? '新增车次' : '修改车次'
      const allowedKeys = Object.keys(formData);
      // 遍历源数据，只给允许的键赋值
      Object.keys(data).forEach(key => {
        if (allowedKeys.includes(key)) {
          formData[key] = data[key];
        }
      });
    }else{
      modalApi.setData({})
      Object.assign(formData, {
        scheduleId:'', // 车次id
        scheduleName: '', // 车次名称
        lineId: '', // 线路列表
        time:'', // 发车时间和到达时间
        departTime: '', // 发车时间
        arriveTime: '', // 到达时间
        duration:'', // 运行时长
        plateNumber:'', // 车牌号
        vehicleType:'', // 车型
        price:'', // 票价
        seatTotal:'', // 总座位数
        seatRemaining:'', // 剩余座位数
        sort: 0,//排序
        status:1, // 状态 0-禁用 1-启用
        isRecommend:0, // 是否推荐 0-否 1-是
        remark: '', // 备注
      });
    }
  },
});
const emit = defineEmits<{
  refresh: []; // 定义 refresh 事件，无参数
}>();
onMounted(() => { 
  handleRequestLine()
});
// 获取线路列表
const handleRequestLine = async () => { 
  const {data} = await getLineOptionListApi();
  lineOptions.value = data;
};
const handleTime = (e) =>{
  formData.departTime = e[0].format('YYYY-MM-DD HH:mm')
  formData.arriveTime = e[1].format('YYYY-MM-DD HH:mm')
  const interval = getTimeInterval(formData.departTime, formData.arriveTime);
  formData.duration = interval.simpleFormat
  
}
const handleSubmit = async () => { 
  console.log(formData)
  try { 
    await form.value?.validateFields();
    loading.value = true
    var res;
    if(status.value == 0){
      res = await postScheduleAddApi(formData);
    }else{
      res = await putScheduleUpdateApi(formData);
    }
    if(res.code == 200){
      message.success(res.message);
      emit('refresh');
      // handleClose()
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false;
  }
};
const handleClose = async() => { 
  modalApi.close();
  loading.value = false
};
const filterOption = (input, option) => {
  // input：用户输入的搜索词
  // option：当前选项对象
  return option.lineName.toLowerCase().includes(input.toLowerCase())
}
const handlePushLine = () => { 
  router.push({
    name: 'Line',
  })
}
</script>
<template>
  <Modal class="w-150" :title="title">
    <a-form
      ref="form"
      class="w-130"
      :model="formData"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 25 }"
      autocomplete="off">
        <a-formItem
          label="车次名称"
          name="scheduleName"
          :rules="[{ required: true, message: '请输入车次名称' }]"
        >
          <a-input v-model:value="formData.scheduleName" />
        </a-formItem>
        
        <a-formItem
          label="线路"
          name="lineId"
          :rules="[{ required: true, message: '请选择线路', trigger: 'change'}]"
        >
         <a-select
            v-model:value="formData.lineId"
            :options="lineOptions"
            placeholder="选择线路,按顺序排序"
            :fieldNames="{ label: 'lineName', value: 'lineId' }"
            showSearch  
             :filter-option="filterOption"
          >
            <template #notFoundContent>
              <a-empty>
                <a-button type="primary" ghost @click="handlePushLine">前往线路添加</a-button>
              </a-empty>
            </template>
          </a-select>
        </a-formItem>
        <a-formItem label="发车时间-到达时间" name="departTime" :rules="[{ required: true, message: '请选择发车时间-到达时间', trigger: 'change'}]">
          <a-range-picker show-time format="YYYY-MM-DD HH:mm" @change="handleTime" :default-value="[formData.departTime ? dayjs(formData.departTime) : '', formData.arriveTime ? dayjs(formData.arriveTime) :'']" />
        </a-formItem>
        <a-formItem
          label="运行时长"
          name="duration"
          :rules="[{ required: true, message: '请输入运行时长' }]"
        >
          <a-input type="number" v-model:value="formData.duration" suffix="小时"  />
        </a-formItem>
        <a-formItem
          label="车牌号"
          name="plateNumber"
          :rules="[{ required: true, message: '请输入车牌号' }]"
        >
          <a-input v-model:value="formData.plateNumber" />
        </a-formItem>
        <a-formItem
          label="车型"
          name="vehicleType"
          :rules="[{ required: true, message: '请输入车型' }]"
        >
          <a-input v-model:value="formData.vehicleType" />
        </a-formItem>
        <a-formItem
          label="票价"
          name="price"
          :rules="[{ required: true, message: '请输入票价' }]"
        >
          <a-input type="number" v-model:value="formData.price" prefix="￥" suffix="RMB"  />
        </a-formItem>
        <a-formItem
          label="总座位数"
          name="seatTotal"
          :rules="[{ required: true, message: '请输入总座位数' }]"
        >
          <a-input type="number" :min="5" v-model:value="formData.seatTotal" />
        </a-formItem>
        <a-formItem
          label="剩余座位数"
          name="seatRemaining"
          :rules="[{ required: true, message: '请输入剩余座位数' }]"
        >
          <a-input type="number" v-model:value="formData.seatRemaining" />
        </a-formItem>
        <a-formItem
          label="状态"
          name="status"
        >
          <!-- 0-禁用 1-启用 -->
          <a-switch v-model:checked="formData.status" checked-children="启用" un-checked-children="禁用" :checkedValue="1" :unCheckedValue="0" default-checked />
        </a-formItem>
        <a-formItem
          label="是否推荐"
          name="isRecommend"
        >
          <!-- 0-禁用 1-启用 -->
          <a-switch v-model:checked="formData.isRecommend" checked-children="推荐" un-checked-children="不推荐" :checkedValue="1" :unCheckedValue="0" default-checked />
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
