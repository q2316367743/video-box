<template>
  <div class="radio-group">
    <t-tooltip v-for="(option, index) in options" :key="index" :content="option.label" placement="bottom">
      <div @click="selectOption(option.value)" :class="['radio-item', { 'selected': modelValue === option.value }]"
        :style="{ flex: 1 }">
        <div class="icon">
        <rss-icon v-if="option.value === 1" />
        <chat-icon v-else-if="option.value === 2" />
        <image1-icon v-else-if="option.value === 3" />
        <video-icon v-else-if="option.value === 4" />
        <notification-icon v-else-if="option.value === 5" />
        <audio-icon v-else-if="option.value === 6" />
        </div>
        <div class="count">{{ option.count > 99 ? '99+' : option.count }}</div>
      </div>
    </t-tooltip>
  </div>


</template>

<script setup lang="ts">
import { RssIcon, ChatIcon, Image1Icon, VideoIcon, NotificationIcon, AudioIcon } from 'tdesign-icons-vue-next'
import { pluginSubscribeDisplay } from '@/apis/plugin/subscribe';
import { map } from '@/utils/lang/ArrayUtil';


const modelValue = defineModel({
  type: Number
})

const options = ref([{
  label: '文章',
  value: 1,
  count: 0
}, {
  label: '社交媒体',
  value: 2,
  count: 0
}, {
  label: '图片',
  value: 3,
  count: 0
}, {
  label: '视频',
  value: 4,
  count: 0
}])

const selectOption = (option: number) => {
  modelValue.value = option;
}

onMounted(() => {
  pluginSubscribeDisplay().then(res => {
    const displayMap = map(res, 'display');
    options.value.forEach(option => {
      const count = displayMap.get(Number(option.value));
      if (count != null) {
        option.count = count.record_count;
      }
    })
  })
})

</script>

<style scoped lang="less">
.radio-group {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  padding: 0 8px;

  .radio-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 44px;
    width: 36px;
    cursor: pointer;
    transition: background-color .3s ease;
    border-radius: var(--td-radius-medium);
  }

  .radio-item.selected {
    color: var(--td-brand-color);
    background-color: var(--td-bg-color-container-active);
  }
}
</style>