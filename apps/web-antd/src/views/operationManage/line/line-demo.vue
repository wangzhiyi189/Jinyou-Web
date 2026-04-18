<script lang="ts" setup>
import { ref, nextTick, onUnmounted } from 'vue'
import { useVbenModal } from '@vben/common-ui';
import { MapManager } from '@/utils/mapManager.js';
import { getByStationApi } from '#/api/index';

const title = ref('线路');
const detail = ref({});
const mapRef = ref();
let mapManager = null;
const lineList = ref([]);

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (isOpen) {
      try {
        const data = modalApi.getData() || {};
        detail.value = data;
        await handleRequestLine();
        await nextTick();
        await initMap();
      } catch (e) {
        console.error(e);
      }
    } else {
      modalApi.setData({});
      mapManager?.destroy();
      mapManager = null;
    }
  },
});

const initMap = async () => {
  if (!mapRef.value || lineList.value.length === 0) return;

  mapManager = new MapManager();
  await mapManager.initLineMap(mapRef.value);

  // 构造坐标点
  const points = lineList.value.map(item => [item.lng, item.lat]);

  // 画路线
  mapManager.drawDetailedRoute(points);

  mapManager.drawStationLabels(lineList.value);

  mapManager.fitView();
};

const handleRequestLine = async () => {
  try {
    const str = detail.value?.stationList;
    if (!str) return;

    const ids = JSON.parse(str);
    const { data } = await getByStationApi({ stationIds: ids });
    lineList.value = data || [];
  } catch (e) {
    lineList.value = [];
  }
};

onUnmounted(() => {
  mapManager?.destroy();
});
</script>

<template>
  <Modal class="w-300" :title="title">
    <div ref="mapRef" class="flex-1 border rounded" style="height:600px"></div>
  </Modal>
</template>