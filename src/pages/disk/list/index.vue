<template>
  <div class="mt-16px">
    <t-row :gutter="[16,16]">
      <t-col v-for="item in items" :key="item.id" flex="150px">
        <t-card hover-shadow>
          <t-link @click="handleJust(item)">{{ item.title }}</t-link>
          <div>{{ item.driver }}</div>
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
