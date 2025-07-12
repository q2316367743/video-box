<template>
  <div :key="recommend.id"
       class="flex gap-4 p-3 rounded-lg  cursor-pointer transition-colors recommend">
    <img :src="cover" :alt="recommend.title"
         class="w-20  object-cover rounded-md flex-shrink-0"/>
    <div class="flex-1">
      <h4 class="font-medium leading-tight m-0">{{ recommend.title }}</h4>
      <div class="text-sm text-muted-foreground">{{ recommend.releaseDate }}</div>
      <div class="flex items-center gap-3">
        <t-tag theme="primary" shape="round" size="small" v-for="t in recommend.tag">
          {{ t }}
        </t-tag>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DiskProgram} from "@/entities/disk/DiskEntry";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";

const props = defineProps({
  recommend: {
    type: Object as PropType<DiskProgram>,
    required: true
  },
  plugin: {
    type: Object as PropType<DiskPlugin>,
    required: true
  },
});
const cover = computedAsync(async () => {
  if (!props.recommend.cover) return './video.png';
  return await props.plugin.getFileDownloadLink(props.recommend.cover);
}, './video.png');
</script>
<style scoped lang="less">

.recommend {
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }
}
</style>
