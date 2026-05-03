<script lang="ts" setup>
import { defineEmits, nextTick, reactive, ref, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { postStationAddApi, putStationUpdateApi } from '#/api/core/station';
import cityOption from '#/utils/city.json';

// 引入封装地图
import { MapManager } from '@/utils/mapManager';

const status = ref(0);
const title = ref('');
const form = ref();
const loading = ref(false);
const selectCity = ref('临汾市');
const searchResultList = ref([]);
const fieldNamesOptions = { label: 'name', value: 'name', children: 'children' };

// 地图实例（全部封装）
const mapManager = new MapManager();

const formData = reactive({
  stationId: '',
  stationName: '',
  city: '',
  address: '',
  lng: '',
  lat: '',
  sort: 0,
  status: 1,
  remark: '',
  selectedLocation: '',
});

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData();
      status.value = data.stationId ? 1 : 0;
      title.value = status.value === 0 ? '新增站点' : '修改站点';
      Object.assign(formData, data);
      await nextTick();
      initMap();

      formData.selectedLocation = data.stationName;
    } else {
      mapManager.clearAll();
      modalApi.setData({});
      Object.assign(formData, {
        stationId: '', stationName: '', city: '', address: '',
        lng: '', lat: '', sort: 0, status: 1, remark: '', selectedLocation: ''
      });
    }
  },
});
const initMap = async () => { 
  // 初始化地图
  await mapManager.initLineMap('amap-container');
  // 点击地图选点
  mapManager.onMapClick(async (e) => {
    const { lng, lat } = e.lnglat;
    const addrData = await mapManager.getAddressByLngLat(lng, lat);
    if (addrData) {
      const select = addrData.addressComponent;
      formData.selectedLocation = select.building || select.street || select.township;
      formData.address = addrData.formattedAddress;
      formData.lng = lng;
      formData.lat = lat;
      mapManager.addMarker(lng, lat);
    }
  });
  // 回显坐标
  if (formData.lng && formData.lat) {
    mapManager.setCenter(formData.lng, formData.lat);
    mapManager.addMarker(formData.lng, formData.lat);
  }
};
// 地址搜索
const handleAddressInput = (val) => {
  if (!val) {
    searchResultList.value = [];
    return;
  }
  mapManager.searchAddress(val, selectCity.value, (list) => {
    searchResultList.value = list;
  });
};

// 选择地址
const handleAddressChange = (val, option) => {
  if (!option?.location) return;
  const { lng, lat } = option.location;
  mapManager.addMarker(lng, lat);
  formData.lng = lng;
  formData.lat = lat;
  formData.address = option.district + option.address + option.name;
};

onUnmounted(() => {
  mapManager.destroy();
});

const emit = defineEmits<{ refresh: [] }>();

const handleSubmit = async () => {
  console.log(formData)
  try {
    await form.value?.validateFields();
    loading.value = true;
    let res;
    if (status.value === 0) {
      res = await postStationAddApi(formData);
    } else {
      res = await putStationUpdateApi(formData);
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
</script>

<template>
  <Modal class="w-200" :title="title">
    <a-form
      ref="form"
      :model="formData"
      :label-col="{ span: 3 }"
      :wrapper-col="{ span: 25 }"
      autocomplete="off">

      <a-formItem label="序号" name="sort" :rules="[{ required: true, message: '请输入序号' }]">
        <a-input v-model:value="formData.sort" type="number" />
      </a-formItem>

      <a-formItem label="车站名称" name="stationName" :rules="[{ required: true, message: '请输入车站名称' }]">
        <a-input v-model:value="formData.stationName" />
      </a-formItem>

      <a-formItem label="城市" name="city" :rules="[{ required: true, message: '请选择城市' }]">
        <a-cascader
          v-model:value="formData.city"
          :fieldNames="fieldNamesOptions"
          :changeOnSelect="true"
          :options="cityOption"
          placeholder="选择城市"
          @change="(value) => {
            formData.city = value[value.length - 1];
            selectCity = value[value.length - 2];
          }"
        />
      </a-formItem>

      <a-formItem label="坐标" name="selectedLocation" :rules="[{ required: true, message: '请选择坐标' }]">
        <a-select
          v-model:value="formData.selectedLocation"
          placeholder="选择坐标"
          style="width: 100%"
          @search="handleAddressInput"
          show-search
          :options="searchResultList"
          :fieldNames="{ label: 'name', value: 'name' }"
          @change="handleAddressChange"
        />
        <!-- 地图容器 -->
        <div id="amap-container" class="map-box"></div>
      </a-formItem>

      <a-formItem label="详细地址" name="address" :rules="[{ required: true, message: '请输入详细地址' }]">
        <a-textarea v-model:value="formData.address" placeholder="请输入详细地址" />
      </a-formItem>

      <a-formItem label="状态" name="status">
        <a-switch v-model:checked="formData.status" checked-children="启用" un-checked-children="禁用" :checkedValue="1" :unCheckedValue="0" default-checked />
      </a-formItem>

      <a-formItem label="备注" name="remark">
        <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :auto-size="{ minRows: 2, maxRows: 5 }" />
      </a-formItem>
    </a-form>

    <template #footer>
      <a-button @click="handleClose">取消</a-button>
      <a-button type="primary" @click="handleSubmit" :loading="loading">确定</a-button>
    </template>
  </Modal>
</template>

<style scoped lang="less">
.map-box {
  height: 300px;
  margin-top: 8px;
}
</style>