<template>
  <div class="web-source-item" :title="source.title" :data-id="source.id">
    <div class="web-source-item__info flex-auto ml-8px">
      <div class="web-source-item__title">{{ source.title }}</div>
      <div class="web-source-item__desc">
        <t-tag v-if="source.delay_time < 0" theme="danger">超时</t-tag>
        <t-tag v-else-if="source.delay_time < 1000" theme="success">{{ source.delay_time }}ms</t-tag>
        <t-tag v-else-if="source.delay_time < 5000" theme="warning">{{ source.delay_time }}ms</t-tag>
        <t-tag v-else theme="danger">{{ source.delay_time }}ms</t-tag>
      </div>
    </div>
    <div class="web-source-item__action">
      <t-space size="small">
        <t-switch v-model="source.is_enabled" class="m-6px" :loading="loading" @change="handleEnable"/>
        <t-button theme="success" shape="square" :loading="loading" @click="handleRefresh">
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
        <t-button theme="primary" shape="square" :loading="loading" @click="handleUpdate">
          <template #icon>
            <edit-icon/>
          </template>
        </t-button>
        <t-popconfirm content="是否删除此资源，删除后将无法恢复" confirm-btn="删除" @confirm="handleDelete">
          <t-button theme="danger" shape="square" :loading="loading">
            <template #icon>
              <delete-icon/>
            </template>
          </t-button>
        </t-popconfirm>
      </t-space>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DeleteIcon, EditIcon, RefreshIcon} from "tdesign-icons-vue-next";
import {WebSourceFileView} from "@/pages/setting/page/web-source/types/WebSourceView.js";
import {SourceWeb} from '@/views/SourceWeb.js';
import {adminSourceWebDelete, adminSourceWebEnable} from "@/apis/admin/source/web.js";
import {sourceWebInfo, sourceWebRefresh} from "@/apis/source/web.js";
import {openVideoSourceDialog} from "@/pages/setting/page/web-source/func/VideoSourceDialog.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";

const props = defineProps({
  view: {
    type: Object as PropType<WebSourceFileView>,
    required: true,
  }
});
const emit = defineEmits(['update']);
const source = ref<SourceWeb>(props.view.payload);
const loading = ref(false);

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
</script>
<style scoped lang="less">
.web-source-item {
  margin-top: 8px;
  padding: 8px;
  cursor: pointer;
  transition: border 0.3s ease, background-color 0.3s ease;
  border-radius: var(--td-radius-default);
  border: 1px solid var(--td-border-level-2-color);
  background-color: var(--td-bg-color-component);
  width: calc(100% - 16px);
  display: flex;

  &:hover {
    background-color: var(--td-bg-color-component-hover);
  }

  &:active {
    background-color: var(--td-bg-color-component-active);
  }

  .web-source-item__title {
    font-weight: bold;
    font-size: var(--td-font-size-title-medium);
  }

  .web-source-item__desc {
    margin-top: 8px;
  }

  .web-source-item__action {
    margin-left: auto;
    padding: 12px;
  }
}
</style>
