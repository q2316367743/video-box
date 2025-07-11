<template>
  <sub-page-layout>
    <template #title>
      <t-space>
        <span style="font-size: var(--td-font-size-title-medium);font-weight: bold">{{
            info?.title || '剧集详情'
          }}</span>
        <t-tag theme="primary" variant="outline">{{ info?.driver }}</t-tag>
      </t-space>
    </template>
    <div class="program-info">
      <program-card v-for="program in programs" :program="program" :key="program.id"/>
    </div>
  </sub-page-layout>
</template>
<script lang="ts" setup>
import {useDiskSourceStore} from "@/store/db/DiskSourceStore";
import {DiskInfo} from "@/entities/disk/DiskEntry";
import MessageUtil from "@/utils/modal/MessageUtil";
import ProgramCard from "@/pages/disk/pages/info/components/ProgramCard.vue";

const route = useRoute();
const info = ref<DiskInfo>();

const programs = computed(() => info.value?.programs || []);

onMounted(() => {
  useDiskSourceStore().getInfo(route.params.id as string)
    .then(res => {
      info.value = res;
    })
    .catch(e => MessageUtil.error("获取云盘详情失败", e));
});
</script>
<style scoped lang="less">
.program-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 使用 column-width 实现自适应列数 */
  column-width: 300px;
  column-gap: 12px;
  padding: 8px;
}
</style>
