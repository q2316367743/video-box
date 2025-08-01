<template>
  <div class="unknow-file-view">
    <div class="ufv__content">
      <file-icon size="56px"/>
      <div class="font-size-18px font-bold mt-32px">{{ item.name }}</div>
      <t-space class="mt-4px">
        <div class="ufv-tag">{{ prettyDataUnit(item.size || 0) }}</div>
        <div class="ufv-tag">{{ item.lastModified ? toDateTimeString(item.lastModified) : '' }}</div>
      </t-space>
      <t-space class="mt-4px">
        <t-button theme="success" @click="handleCopy">复制链接</t-button>
        <t-button theme="primary" @click="handleDownload">下载</t-button>
      </t-space>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DirItem} from "@/apis/plugin/disk/list.ts";
import {FileIcon} from "tdesign-icons-vue-next";
import {prettyDataUnit, toDateTimeString} from "@/utils/lang/FormatUtil.ts";
import {downloadByUrl} from "@/utils/lang/BrowserUtil.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";

const props = defineProps({
  item: {
    type: Object as PropType<DirItem>,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});
const handleCopy = () => {
  navigator.clipboard.writeText(props.url)
    .then(() => MessageUtil.success('复制成功'))
    .catch(e => MessageUtil.error('复制失败', e));
};
const handleDownload = () => {
  downloadByUrl(props.url)
}
</script>
<style scoped lang="less">
.unknow-file-view {
  flex-direction: column;
  align-items: center;
  row-gap: 0.5rem;
  width: calc(100% - var(--td-pop-padding-xxl) - var(--td-pop-padding-xxl));
  border-radius: var(--td-radius-default);
  background-color: var(--td-bg-color-component);
  padding: var(--td-comp-paddingTB-xl) var(--td-pop-padding-xxl);
  box-shadow: var(--td-shadow-2);
  display: flex;
  margin: 8px 0;

  .ufv__content {
    flex-direction: column;
    align-items: center;
    row-gap: 0.5rem;
    padding-top: var(--td-pop-padding-xl);
    padding-bottom: var(--td-pop-padding-xl);
    display: flex;
  }

  .ufv-tag {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-placeholder);
  }
}
</style>
