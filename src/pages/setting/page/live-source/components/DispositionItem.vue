<template>
  <t-list-item v-if="item" class="disposition-item">
    <div>
      <t-list-item-meta :title="item.name">
        <template #description>
          <div style="width: 60vw;word-wrap: break-word">{{ item.url }}</div>
        </template>
      </t-list-item-meta>
      <t-space style="margin-top: 8px;">
        <t-tag theme="primary" v-if="loading">
          <template #icon>
            <loading-icon/>
          </template>
          <span>正在加载中</span>
        </t-tag>
        <t-tag theme="primary" v-else>共 {{ item.length }} 个频道</t-tag>
        <t-tag theme="warning">
          <template #icon>
            <time-icon/>
          </template>
          <span>{{ prettyDate(item.updateTime) }}</span>
        </t-tag>
      </t-space>
    </div>
    <template #action>
      <t-space size="small">
        <t-button theme="primary" variant="text" shape="square" :loading @click="openDispositionInfo(item.id)">
          <template #icon>
            <info-circle-icon/>
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square" :loading @click="refresh()"
                  :disabled="item.url.trim() === ''">
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square" :loading
                  @click="openUpdateDispositionDialog(item, refresh)">
          <template #icon>
            <edit-icon/>
          </template>
        </t-button>
        <t-popconfirm content="是否删除次订阅链接，删除后无法恢复。" confirm-btn="删除" @confirm="onRemove(item.id)">
          <t-button theme="danger" variant="text" shape="square" :loading>
            <template #icon>
              <delete-icon/>
            </template>
          </t-button>
        </t-popconfirm>
      </t-space>
    </template>
  </t-list-item>
</template>
<script lang="ts" setup>
import {useLiveSourceStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {prettyDate} from "@/utils/lang/FormatUtil";
import {openUpdateDispositionDialog} from "@/pages/setting/page/live-source/edit";
import {openDispositionInfo} from "@/pages/setting/page/live-source/components/DispositionInfo";
import {LiveSource} from "@/entities/LiveSource";
import {DeleteIcon, EditIcon, InfoCircleIcon, LoadingIcon, RefreshIcon, TimeIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  item: Object as PropType<LiveSource>
});

const loading = ref(false);

onMounted(() => {
  if (props.item) {
    if ((props.item.updateTime === 0 || !props.item.success) && props.item.url.trim() !== '') {
      // 新的 要刷新
      loading.value = true;
      useLiveSourceStore().refreshChannels(props.item.id)
        .catch(e => MessageUtil.error("刷新失败", e))
        .finally(() => loading.value = false);
    }
  }
});

function refresh() {
  if (props.item && props.item.url.trim() !== '') {
    loading.value = true;
    useLiveSourceStore().refreshChannels(props.item.id)
      .then(() => MessageUtil.success("刷新成功"))
      .catch(e => MessageUtil.error("刷新失败", e))
      .finally(() => loading.value = false);
  }
}

function onRemove(id: number) {
  useLiveSourceStore().remove(id)
    .then(() => MessageUtil.success("删除成功"))
    .catch(e => MessageUtil.error("删除失败", e))
}

</script>
<style scoped>
.disposition-item {
}
</style>
