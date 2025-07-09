<template>
  <div class="live">
    <div class="live-header">
      <t-tabs v-model="active" theme="card">
        <t-tab-panel v-for="live in liveSources" :key="live.id" :label="live.name" :value="live.id"/>
      </t-tabs>
    </div>
    <div class="live-container">
      <live-list :channels :loading :active/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useLiveSourceStore} from "@/store";
import {M3u8ChannelWrap} from "@/entities/LiveSource";
import {useUtoolsKvStorage} from "@/hooks/UtoolsKvStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import MessageUtil from "@/utils/modal/MessageUtil";
import LiveList from "@/pages/live/components/LiveList.vue";


const active = useUtoolsKvStorage(LocalNameEnum.KEY_SOURCE_ACTIVE_LIVE, 0);

const channels = ref(new Array<M3u8ChannelWrap>());
const loading = ref(true);

const liveSources = computed(() => useLiveSourceStore().liveSources);

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
  }

  .live-container {
    position: absolute;
    top: 49px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
