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
          <span>{{ prettyDate(item.update_time) }}</span>
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
        <t-button theme="primary" variant="text" shape="square" :loading @click="refresh(item.id)"
                  :disabled="item.url.trim() === ''">
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square" :loading
                  @click="openUpdateDispositionDialog(item, () => $emit('update'))">
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
import MessageUtil from "@/utils/modal/MessageUtil";
import {prettyDate} from "@/utils/lang/FormatUtil";
import {openUpdateDispositionDialog} from "@/pages/setting/page/live-source/edit";
import {openDispositionInfo} from "@/pages/setting/page/live-source/components/DispositionInfo";
import {DeleteIcon, EditIcon, InfoCircleIcon, LoadingIcon, RefreshIcon, TimeIcon} from "tdesign-icons-vue-next";
import {SourceTv} from "@/views/SourceTv.js";
import {sourceTvDel, sourceTvRefresh} from "@/apis/source/tv.js";
import {LoadingPlugin} from "tdesign-vue-next";

defineProps({
  item: Object as PropType<SourceTv>
});
const emit = defineEmits(['update']);

const loading = ref(false);

function refresh(id: string) {
  const {hide} = LoadingPlugin({
    text: '正在刷新中',
    fullscreen: true
  });
  sourceTvRefresh(id).then(() => {
    MessageUtil.success("刷新成功");
    emit("update");
  }).finally(hide);
}

function onRemove(id: string) {
  sourceTvDel(id)
    .then(() => {
      MessageUtil.success("删除成功");
      emit("update");
    })
}

</script>
<style scoped>
.disposition-item {
}
</style>
