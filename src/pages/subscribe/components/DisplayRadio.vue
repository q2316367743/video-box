<template>
  <div class="radio-group" ref="radioGroup">
    <t-tooltip v-for="(option, index) in options" :key="index" :content="SubscribeDisplayMap[option]" placement="bottom">
      <div @click="selectOption(option)" :class="['radio-item', { 'selected': modelValue === option }]"
        :style="{ flex: 1 }">
        <rss-icon v-if="option === '1'" />
        <chat-icon v-else-if="option === '2'" />
        <image1-icon v-else-if="option === '3'" />
        <video-icon v-else-if="option === '4'" />
        <notification-icon v-else-if="option === '5'" />
        <audio-icon v-else-if="option === '6'" />
      </div>
    </t-tooltip>
  </div>
</template>

<script setup>
import { RssIcon, ChatIcon, Image1Icon, VideoIcon, NotificationIcon, AudioIcon } from 'tdesign-icons-vue-next'
import { SubscribeDisplayMap } from '../constant';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const radioGroup = ref(null)
const selectedIndex = ref(0)

const selectOption = (option) => {
  emit('update:modelValue', option)
}

watch(() => props.modelValue, (newValue) => {
  selectedIndex.value = props.options.indexOf(newValue)
})

const highlightStyle = computed(() => {
  if (!radioGroup.value) return {}
  const itemWidth = radioGroup.value.offsetWidth / props.options.length
  return {
    width: `${itemWidth}px`,
    transform: `translateX(${selectedIndex.value * itemWidth}px)`
  }
})
</script>

<style scoped>
.radio-group {
  display: flex;
  position: relative;
  background-color: #eeeeee;
  overflow: hidden;
}

.radio-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  cursor: pointer;
  transition: background-color .3s ease;
}

.radio-item.selected {
  background-color: #ffffff;
  color: var(--td-brand-color)
}

.highlight {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: #ffffff;
  transition: transform .3s ease;
}
</style>