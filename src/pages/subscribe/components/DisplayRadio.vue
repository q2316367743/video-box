<template>
  <div class="radio-group">
    <t-tooltip v-for="(option, index) in options"  :key="index" :content="option.label"
      placement="bottom">
      <div @click="selectOption(option.value)" :class="['radio-item', { 'selected': modelValue === option.value }]"
        :style="{ flex: 1 }" v-show="option.count > 0">
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
import { DisplayStatistics } from '@/apis/plugin/subscribe';
import { map } from '@/utils/lang/ArrayUtil';
import { PropType } from 'vue';

const props = defineProps({
  display: {
    type: Object as PropType<Array<DisplayStatistics>>,
    default: () => []
  }
});
const emit = defineEmits(['change']);

const modelValue = ref(1);

const options = computed(() => {
  const o = [{
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
  }, {
    label: '通知',
    value: 5,
    count: 0
  }, {
    label: '音频',
    value: 6,
    count: 0
  }];
  const displayMap = map(props.display, 'display');
  o.forEach(option => {
    const count = displayMap.get(Number(option.value));
    if (count != null) {
      option.count = count.record_count;
    }
  });
  return o
})

const selectOption = (option: number) => {
  modelValue.value = option;
  emit('change', option)
}
</script>

<style scoped lang="less">
.radio-group {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-around;
  padding: 0 12px;

  .radio-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 44px;
    width: 36px;
    max-width: 36px;
    cursor: pointer;
    transition: background-color .3s ease;
    border-radius: var(--td-radius-medium);

    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }
  }

  .radio-item.selected {
    color: var(--td-brand-color);
  }
}
</style>