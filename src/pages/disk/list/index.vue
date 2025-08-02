<template>
  <div class="m-8px">
    <t-row :gutter="[8,8]">
      <t-col v-for="item in items" :key="item.id" flex="300px">
        <t-card hover-shadow @click="handleJust(item)" class="cursor-pointer">
          <t-list-item-meta :title="item.title" :description="item.driver"/>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>
<script lang="ts" setup>
import {sourceDiskList} from "@/apis/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";

const router = useRouter();

const items = ref(new Array<DiskSourceEntry>());

const handleJust = (item: DiskSourceEntry) => {
  router.push({
    path: `/disk/info/${item.id}`,
    query: {
      path: '/'
    }
  })
}

onMounted(() => {
  sourceDiskList().then(res => items.value = res);
});
</script>
<style scoped lang="less">

</style>
