<template>
  <div class="live">
    <div class="live-header">
      <!-- 顶部工具栏 -->
      <div class="flex items-center gap-4">
        <div class="title">电视直播</div>
        <t-tag class="text-xs">
          {{ channels.length || 0 }} 个频道
        </t-tag>
      </div>

      <div class="flex items-center gap-4">
        <div class="w-180px">
          <t-input placeholder="请输入频道名" v-model="keyword">
            <template #prefix-icon>
              <search-icon/>
            </template>
          </t-input>
        </div>
        <div class="flex-46px text-sm ">来源：</div>
        <div class="w-120px">
          <t-select v-model="active" :options="liveSourceOptions"/>
        </div>
      </div>
    </div>
    <div class="live-container">
      <live-list :channels :loading :active :keyword/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {SelectOption} from "tdesign-vue-next";
import {SearchIcon} from "tdesign-icons-vue-next";
import {useLiveSourceStore} from "@/store";
import {M3u8ChannelWrap} from "@/entities/LiveSource";
import {useUtoolsKvStorage} from "@/hooks/UtoolsKvStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import MessageUtil from "@/utils/modal/MessageUtil";
import LiveList from "@/pages/live/components/LiveList.vue";


const active = useUtoolsKvStorage(LocalNameEnum.KEY_SOURCE_ACTIVE_LIVE, 0);

const channels = ref(new Array<M3u8ChannelWrap>());
const loading = ref(true);
const keyword = ref('');

const liveSourceOptions = computed<Array<SelectOption>>(() => useLiveSourceStore().liveSources.map(e => ({
  value: e.id,
  label: e.name,
})));

watch(active, val => {
  if (!val) {
    channels.value = [];
    loading.value = false;
    return;
  }
  useLiveSourceStore().getChannels([val])
    .then(res => channels.value = res.flatMap(e => e.channels.map(c => ({...c, disableTimeout: e.disableTimeout}))))
    .catch(e => MessageUtil.error("获取订阅列表失败", e))
    .finally(() => loading.value = false);
}, {immediate: true})

</script>
<style scoped lang="less">
.live {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .live-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-bottom: 1px solid var(--td-border-level-2-color);
    display: flex;
    justify-content: space-between;
    padding: 12px 12px 11px;
  }

  .live-container {
    position: absolute;
    top: 57px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
