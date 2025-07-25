<template>
  <div class="web-source-card" :data-id="source.id">
    <div class="web-source-card-header">
      <div class="web-source-card-title" :title="source.title">{{ source.title }}</div>
      <t-switch v-model="source.is_enabled" :loading @change="handleEnable"/>
    </div>
    <div class="web-source-card-latency" :style="{color: pingColor}">
      <t-tooltip :content="toDateTimeString(source.refresh_time)">
        <span>{{
            source.delay_time === 0 ? '未检测' : source.delay_time < 0 ? '超时' : (source.delay_time + 'ms')
          }}</span>
      </t-tooltip>
    </div>
    <div class="web-source-card-actions">
      <t-space size="small">
        <t-button theme="success" :loading @click="handleRefresh">刷新</t-button>
        <t-button theme="primary" :loading @click="handleUpdate">编辑</t-button>
        <t-button theme="danger" :loading @click="handleDelete">删除</t-button>
      </t-space>
      <web-source-folder-select v-model="source.folder" :folders="folders" :loading @change="handleMove"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {SourceWeb} from '@/views/SourceWeb.js';
import {adminSourceWebDelete, adminSourceWebEnable} from "@/apis/admin/source/web.js";
import {sourceWebInfo, sourceWebMove, sourceWebRefresh} from "@/apis/source/web.js";
import {openVideoSourceDialog} from "@/pages/setting/page/web-source/func/VideoSourceDialog.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {Folder} from "@/views/Folder.js";
import WebSourceFolderSelect from "@/pages/setting/page/web-source/components/WebSourceFolderSelect.vue";
import {toDateTimeString} from "@/utils/lang/FormatUtil.js";
import {DragMoveIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  view: {
    type: Object as PropType<SourceWeb>,
    required: true,
  },
  folders: {
    type: Object as PropType<Array<Folder>>,
    default: () => []
  }
});
const emit = defineEmits(['update']);
const source = ref<SourceWeb>(props.view);
const loading = ref(false);

const pingColor = computed(() => {
  if (source.value.delay_time < 0) {
    return 'var(--td-error-color-7)';
  } else if (source.value.delay_time < 1000) {
    return 'var(--td-success-color)';
  } else if (source.value.delay_time < 5000) {
    return 'var(--td-warning-color)';
  } else {
    return 'var(--td-error-color)';
  }
})

const handleEnable = async () => {
  if (loading.value) return;
  try {
    await adminSourceWebEnable(source.value.id);
    source.value = await sourceWebInfo(source.value.id);
  } finally {
    loading.value = false;
  }
}
const handleRefresh = async () => {
  if (loading.value) return;
  try {
    loading.value = true;
    await sourceWebRefresh(source.value.id);
    source.value = await sourceWebInfo(source.value.id);
  } finally {
    loading.value = false;
  }
}
const handleUpdate = async () => {
  if (loading.value) return;
  openVideoSourceDialog(async () => {
    try {
      loading.value = true;
      source.value = await sourceWebInfo(source.value.id);
    } finally {
      loading.value = false;
    }
  }, source.value.id)
}
const handleDelete = async () => {
  if (loading.value) return;
  try {
    loading.value = true;
    await adminSourceWebDelete(source.value.id);
    emit('update');
    MessageUtil.success("删除成功");
  } finally {
    loading.value = false;
  }
}
const handleMove = async () => {
  if (loading.value) return;
  try {
    loading.value = true;
    await sourceWebMove(source.value.id, source.value.folder);
    source.value = await sourceWebInfo(source.value.id);
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped lang="less">
.web-source-card {
  background: var(--td-bg-color-component);
  border: 1px solid var(--td-border-level-2-color);
  border-radius: var(--td-radius-medium);
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(8px);
  transition: box-shadow .2s;

  &:hover {
    box-shadow: var(--td-shadow-2);
  }

  .web-source-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--td-comp-margin-s);
  }

  .web-source-card-title {
    margin: 0;
    font-size: var(--td-font-size-title-large);
    font-weight: bold;
  }

  .web-source-card-latency {
    font-size: var(--td-font-size-body-small);
    font-weight: 600;
    margin-bottom: var(--td-comp-margin-m);
  }

  .web-source-card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: .5rem;
    width: 100%;
  }
}


</style>
