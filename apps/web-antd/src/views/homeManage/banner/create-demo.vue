<script lang="ts" setup>
import { defineEmits , nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { uploadFileApi  } from '#/api/core/user';
import { postBannerAddApi } from '#/api/core/home';
import { reactive , ref } from 'vue';
import { linkTypeData } from '#/utils/banner.ts'
import Cropper from '#/components/cropper/index.vue';
import { fileToBase64, base64ToFile } from '#/utils/tools';
const emit = defineEmits<{
  refresh: []; // 定义 refresh 事件，无参数
}>();
const [Modal, modalApi] = useVbenModal({
});
const formData = reactive({
  title: '', // 轮播图标题
  imageUrl: '', // 轮播图图片
  linkType: 0, // 跳转类型 0-不跳转 1-小程序页面 2-外部链接
  linkUrl: '', // 跳转链接
  sort: 0,//排序
  status:1, // 状态 1-启用 2-禁用
  remark: '', // 备注
});
const form = ref();
const loading = ref(false)
const handleSubmit = async () => { 
  try { 
    await form.value?.validateFields();
    loading.value = true
    const {data,code,msg} = await postBannerAddApi(formData);
    if(code == 200){
      message.success(msg);
      emit('refresh');
      handleClose()
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false;
  }
};
const handleClose = () => { 
  modalApi.close();
  loading.value = false
};
const cutterImgRef = ref();
const beforeUpload = async(file:any) =>{
  console.log(file)
  const url = URL.createObjectURL(file)
  await nextTick();
  cutterImgRef.value?.open(url, 0)
  return 
  // const {data,code} = await uploadFileApi(file);
  // if(code == 200){
  //   formData.imageUrl = data
  // }
  
}
const handleChange = (info:any) => {
  console.log(info.file.originFileObj)
};
const onComplete = async(row:any) =>{ 
  const file = base64ToFile(row.imgUrl, 'upload.png');
  const {data,code} = await uploadFileApi(file);
  if(code == 200){
    formData.imageUrl = data
  }
}
</script>
<template>
  <Modal class="w-150" title="新建轮播图">
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
        <a-formItem label="跳转类型" name="linkType">
          <a-radio-group v-model:value="formData.linkType">
            <a-radio :value="item.value" v-for="item in linkTypeData" :key="item.value">{{ item.label }}</a-radio>
          </a-radio-group>
        </a-formItem>
        <a-formItem
          label="跳转链接"
          name="linkUrl"
          :rules="[{ required: true, message: '请输入跳转链接' }]"
          v-if="formData.linkType != 0"
        >
          <a-input v-model:value="formData.linkUrl" />
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
