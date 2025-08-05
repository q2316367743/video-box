<template>
  <div class="unknow-file-view">
    <div class="ufv_icon">
      <file-icon-view :type="item.type" :extname="item.extname" size="72px"/>
    </div>
    <div class="ufv__content">
      <div class="font-size-18px font-bold mt-32px ellipsis" :title="item.name">{{ item.name }}</div>
      <div class="tag-item mt-16px">
        <div class="tag-label">磁盘文件大小</div>
        <div class="tag-value items-center flex gap-8px">
          <div>{{ prettyDataUnit(item.size || 0) }}</div>
          <t-tooltip content="文件实际大小采用1024进制">
            <info-circle-icon size="14px"/>
          </t-tooltip>
        </div>
      </div>
      <div class="tag-item mt-4px">
        <div class="tag-label">最后修改时间</div>
        <div class="tag-value">{{ toDateTimeString(item.lastModified || 0) }}</div>
      </div>
      <t-space size="small" class="mt-16px mx-auto">
        <t-button theme="success" @click="handleCopy">复制链接</t-button>
        <t-button theme="primary" @click="handleDownload">下载</t-button>
      </t-space>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DirItem} from "@/apis/plugin/disk/list.ts";
import {prettyDataUnit, toDateTimeString} from "@/utils/lang/FormatUtil.ts";
import {downloadByUrl} from "@/utils/lang/BrowserUtil.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import FileIconView from "@/pages/disk/info/components/FileIconView.vue";
import {InfoCircleIcon} from "tdesign-icons-vue-next";

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
  width: 300px;
  margin: 16px auto 0;

  .ufv_icon {
    width: 248px;
    height: 248px;
    padding: 16px;
    margin: 8px;
    border-radius: var(--td-radius-medium);
    border: 1px solid var(--td-border-level-2-color);
    box-shadow: var(--td-shadow-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease-in-out;
    background-color: var(--td-bg-color-container);
    cursor: pointer;

    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }

    &:active {
      background-color: var(--td-bg-color-container-active);
    }

  }

  .ufv__content {
    margin: 8px;
  }

  .tag-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .tag-value {
      font-size: var(--td-font-size-body-small);
      color: var(--td-text-color-placeholder);
    }
  }
}
</style>
