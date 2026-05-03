<script lang="ts" setup>
import { defineEmits , onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { getLineOptionListApi , postScheduleTemplateAddApi , putScheduleUpdateApi } from '#/api/index.ts';
import dayjs from 'dayjs';
import { reactive , ref } from 'vue';
import { router } from '#/router';
import { departureModeOptions } from '@/utils/departureMode.ts';
const status = ref(0) // 0新增 1修改
const title = ref('')
const formRef = ref();
const loading = ref(false)
const lineOptions = ref([])
const formData = reactive({
  templateId:'', // 车次id
  scheduleName: '', // 车次名称
  lineId: '', // 线路列表
  time:[], // 发车时间和到达时间
  departTime: '', // 发车时间
  arriveTime: '', // 到达时间
  duration:'', // 运行时长
  runStartDate:"", // 运行开始时间
  plateNumber:'', // 车牌号
  vehicleType:'', // 车型
  price:'', // 票价
  seatTotal:'', // 总座位数
  autoCreate:1, // 是否自动生成 1=是 0=否
  runMode:2,// 发车模式 1=指定日期 2=每日发车 3=间隔N天 4=每周固定 5=常驻滚动 6=节假日
  assignDates:<Array<string>>[], // 指定发车日期 逗号分隔
  intervalDay:'', // 间隔天数 1=每天 2=隔天
  weekDays:'', // 周几发车 1=周一 ... 7=周日 逗号分隔
  keepDays:'', // 常驻保留天数 7/8/9
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
        templateId:'', // 车次id
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
const disabledDate = (current : any) => {
  return current && current < dayjs().startOf('day');
};
// 获取线路列表
const handleRequestLine = async () => { 
  const {data} = await getLineOptionListApi();
  lineOptions.value = data;
};
const handleSubmit = async () => { 
  console.log(formData)
  try { 
    await formRef.value?.validateFields();
    loading.value = true
    var res;
    var assignDatesStr = ""
    if(formData.runMode == 1){
      // 把formData.assignDates 转成字符串
      assignDatesStr = formData.assignDates.join(',');
    }
    if(status.value == 0){
      res = await postScheduleTemplateAddApi({
        ...formData,
        assignDates:assignDatesStr,
      });
    }else{
      res = await putScheduleUpdateApi(formData);
    }
    if(res.code == 200){
      message.success(res.msg);
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
const filterOption = (input : any, option : {lineName : string}) => {
  // input：用户输入的搜索词
  // option：当前选项对象
  return option.lineName.toLowerCase().includes(input.toLowerCase())
}
const handleRunModeChange = ():void =>{
  formData.assignDates = [];
  formData.intervalDay = "";
  formData.weekDays = "";
  formData.keepDays = "";
}
const tempDate = ref('')
// 日期格式化 + 去重添加
const addDate = () => {
  if (!tempDate.value) return

  // 1. 把 dayjs 对象 / 时间字符串 转成 YYYY-MM-DD
  const formattedDate = dayjs(tempDate.value).format('YYYY-MM-DD')

  // 2. 去重判断：如果已经存在，直接返回
  if (formData.assignDates.includes(formattedDate)) {
    message.error('日期已存在，无需重复添加');
    tempDate.value = '' // 清空选择器
    return
  }

  // 3. 添加到数组
  formData.assignDates.push(formattedDate)
  tempDate.value = '' // 清空选择器
  formRef.value?.validateFields(['assignDates'])
}
// 删除日期
const removeDate = (date : string) => {
  formData.assignDates = formData.assignDates.filter(
    (item) => item !== date
  )
  formRef.value?.validateFields(['assignDates'])
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
      ref="formRef"
      class="w-130"
      :model="formData"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 25 }"
      autocomplete="off">
        <a-formItem
          label="车次模板名称"
          name="scheduleName"
          :rules="[{ required: true, message: '请输入车次模板名称' }]"
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
        <a-formItem label="发车时间" name="departTime" :rules="[{ required: true, message: '请选择发车时间', trigger: 'change'}]">
          <a-time-picker v-model:value="formData.departTime" value-format="HH:mm:ss" />
        </a-formItem>
        <a-formItem label="到达时间" name="arriveTime" :rules="[{ required: true, message: '请选择到达时间', trigger: 'change'}]">
          <a-time-picker v-model:value="formData.arriveTime" value-format="HH:mm:ss" />
        </a-formItem>
        <a-formItem
          label="运行时长"
          name="duration"
          :rules="[{ required: true, message: '请输入运行时长' }]"
        >
          <a-input type="number" v-model:value="formData.duration" suffix="小时"  />
        </a-formItem>
        <a-formItem label="运营基准日期" name="runStartDate" :rules="[{ required: true, message: '请选择运营基准日期', trigger: 'change'}]">
          <a-date-picker v-model:value="formData.runStartDate" :disabled-date="disabledDate" value-format="YYYY-MM-DD" />
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
          label="发车模式"
          name="runMode"
          :rules="[{ required: true, message: '请选择发车模式', trigger: 'change'}]"
        >
         <a-select
            v-model:value="formData.runMode"
            :options="departureModeOptions"
            placeholder="选择线路,按顺序排序"
            :fieldNames="{ label: 'label', value: 'value' }" showSearch @change="handleRunModeChange" />
        </a-formItem>
        <a-formItem
          v-if="formData.runMode === 1"
          label="指定日期"
          name="assignDates"
          :rules="[{ required: true, message: '请选择指定日期', trigger: 'change'}]"
        >
          <a-space>
            <a-date-picker
              v-model:value="tempDate"
              format="YYYY-MM-DD"
              placeholder="选择日期"
            />
            <a-button type="primary" @click="addDate">添加</a-button>
          </a-space>
          <view class="date-tags" style="margin-top: 12px">
            <a-tag
              v-for="(date) in formData.assignDates"
              :key="date"
              closable
              @close="() => removeDate(date)"
              color="blue"
            >
              {{ date }}
            </a-tag>
          </view>
        </a-formItem>
        <!-- 1=每天 2=隔天 -->
        <a-formItem
          v-if="formData.runMode === 3"
          label="间隔天数"
          name="intervalDay"
          :rules="[{ required: true, message: '请输入间隔天数', trigger: 'change'}]"
        >
          <a-input type="number" v-model:value="formData.intervalDay" placeholder="1=每天 2=隔天"  />
        </a-formItem>
        <!-- 周几发车 1=周一 ... 7=周日 逗号分隔 -->
        <a-formItem
          v-if="formData.runMode === 4"
          label="发车周期"
          name="weekDays"
          :rules="[{ required: true, message: '请输入发车周期', trigger: 'change'}]"
        >
          <a-input v-model:value="formData.weekDays" placeholder="周几发车 1=周一 ... 7=周日 逗号分隔"  />
        </a-formItem>
        <!-- 常驻保留天数 7/8/9 -->
        <a-formItem
          v-if="formData.runMode === 5"
          label="常驻滚动"
          name="keepDays"
          :rules="[{ required: true, message: '请常驻保留天数', trigger: 'change'}]"
        >
          <a-input type="number" v-model:value="formData.keepDays" placeholder="常驻保留天数 7/8/9"  />
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
<style lag="less" scoped>
.date-tags {
  display: flex;
  flex-wrap: wrap;
  gap:10px;
}
</style>
