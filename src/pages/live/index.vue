<template>
  <page-layout title="默认分组" :subtitle="channels.length + '个频道'" class="home">
    <template #extra>
      <t-space size="small">
        <t-select v-model="active" :options="liveSourceOptions" style="width: 120px;" clearable/>
        <t-select v-model="activeKeys" style="width: 120px;">
          <t-option value="">全部分组</t-option>
          <t-option v-for="name in groupNames" :key="name" :value="name">{{ name }}</t-option>
        </t-select>
      </t-space>
    </template>
    <live-list :results="items" :loading/>
  </page-layout>
</template>
<script lang="ts" setup>
import {useLiveSourceStore} from "@/store";
import {M3u8ChannelWrap} from "@/entities/LiveSource";
import {channelsToGroup} from "@/utils/file/M3u8Util";
import LiveList from "@/pages/live/components/LiveList.vue";
import {SelectOption} from "tdesign-vue-next";
import {useUtoolsKvStorage} from "@/hooks/UtoolsKvStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import MessageUtil from "@/utils/modal/MessageUtil";


const active = useUtoolsKvStorage(LocalNameEnum.KEY_SOURCE_ACTIVE_LIVE, 0);

const activeKeys = ref('');
const channels = ref(new Array<M3u8ChannelWrap>());
const loading = ref(true);
const subInput = ref('');

const liveSourceOptions = computed<Array<SelectOption>>(() => useLiveSourceStore().liveSources.map(e => ({
  label: e.name,
  value: e.id
})));
const groups = computed(() => channelsToGroup(channels.value));
const groupNames = computed(() => groups.value.map(e => e.group));
const items = computed<Array<M3u8ChannelWrap>>(() => {
  if (activeKeys.value === '') {
    return channels.value;
  }
  return channels.value.filter(e => e.group === activeKeys.value)
});

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
</style>
