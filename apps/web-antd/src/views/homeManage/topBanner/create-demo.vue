<script lang="ts" setup>
import { defineEmits , nextTick , defineProps, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { uploadFileApi  } from '#/api/core/user';
import { postTopBannerAddApi, putTopBannerUpdateApi } from '#/api/core/home';
import { reactive , ref } from 'vue';
import { linkTypeData } from '#/utils/banner.ts'
import Cropper from '#/components/cropper/index.vue';
import {  base64ToFile } from '#/utils/tools';
const status = ref(0) // 0新增 1修改
const title = ref('')
const form = ref();
const loading = ref(false)

const formData = reactive({
  topBannerId:'',
  title: '', // 轮播图标题
  imageUrl: '', // 轮播图图片
  sort: 0,//排序
  status:1, // 状态 0-禁用 1-启用
  remark: '', // 备注
});
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen:Boolean) {
    if (isOpen) {
      var data = modalApi.getData();
      if(data.topBannerId){
        status.value = 1
      }else{
        status.value = 0
      }
      title.value = status.value == 0 ? '新增顶部轮播图' : '修改轮播图'
      Object.assign(formData, data);
    }else{
      modalApi.setData({})
      Object.assign(formData, {
        TopBannerId: '',
        title: '',
        imageUrl: '',
        sort: 0,
        status: 1,
        remark: '',
      });
    }
  },
});
const emit = defineEmits<{
  refresh: []; // 定义 refresh 事件，无参数
}>();


const handleSubmit = async () => { 
  try { 
    await form.value?.validateFields();
    loading.value = true
    var res;
    if(status.value == 0){
      res = await postTopBannerAddApi(formData);
    }else{
      res = await putTopBannerUpdateApi(formData);
    }
    if(res.code == 200){
      message.success(res.msg);
      emit('refresh');
      handleClose()
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
const cutterImgRef = ref();
const beforeUpload = async(file:any) =>{
  const url = URL.createObjectURL(file)
  await nextTick();
  cutterImgRef.value?.open(url, 0)
  return 
  // const {data,code} = await uploadFileApi(file);
  // if(code == 200){
  //   formData.imageUrl = data
  // }
  
}
const onComplete = async(row:any) =>{ 
  const file = base64ToFile(row.imgUrl, 'upload.png');
  const {data,code} = await uploadFileApi(file);
  if(code == 200){
    formData.imageUrl = data
  }
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
          label="序号"
          name="sort"
          :rules="[{ required: true, message: '请输入序号' }]"
        >
          <a-input v-model:value="formData.sort" type="number" />
        </a-formItem>
        <a-formItem
          label="标题"
          name="title"
          :rules="[{ required: true, message: '请输入标题' }]"
        >
          <a-input v-model:value="formData.title" />
        </a-formItem>
        
        <a-formItem
          label="轮播图"
          name="imageUrl"
          :rules="[{ required: true, message: '请上传图片', trigger: 'change'}]"
        >
          <a-upload
            name="avatar"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :before-upload="beforeUpload"
          >
            <img v-if="formData.imageUrl" :src="formData.imageUrl" alt="avatar" />
            <div v-else>
              <!-- <loading-outlined v-if="loading"></loading-outlined> -->
              <!-- <plus-outlined v-else></plus-outlined> -->
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
        </a-formItem>
        <a-formItem
          label="状态"
          name="status"
        >
          <!-- 0-禁用 1-启用 -->
          <a-switch v-model:checked="formData.status" checked-children="启用" un-checked-children="禁用" :checkedValue="1" :unCheckedValue="0" default-checked />
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
    <Cropper ref="cutterImgRef" @complete="onComplete" />
  </Modal>
</template>
