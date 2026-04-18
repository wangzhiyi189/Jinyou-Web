<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
const description = '';
const itemsList = ref([])
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen:Boolean) {
    if (isOpen) {
      var data = modalApi.getData();
      itemsList.value = data
      // itemsList.value = handleSetpItems(data)
    }else{
      itemsList.value = []
      modalApi.setData({})
    }
  }
});
const handleSetpItems = (list) => {
  return list.map((item, index) => {
    return {
      title: item.stationName, // 站点名作为步骤标题
      description: `站点ID: ${item.stationId}` // 可选：附加描述信息
    }
  })
}
const stepItems = computed(() => {
  console.log(itemsList.value)
  return itemsList.value.map((item, index) => {
    return {
      title: item.stationName, // 站点名作为步骤标题
      description: item.address // 可选：附加描述信息
    }
  })
})
</script>
<template>
  <Modal class="w-130" title="线路">
    <a-steps
    direction="vertical"
    size="small"
    :current="0"
    :items="stepItems"
  ></a-steps>
  </Modal>
</template>