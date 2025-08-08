<template>
  <div class="m-8px">
    <t-row :gutter="[8,8]">
      <t-col v-for="item in items" :key="item.id" flex="300px">
        <t-card hover-shadow @click="handleJust(item)" class="cursor-pointer">
          <t-list-item-meta :title="item.title">
            <template #description>
              <t-tag theme="primary">{{ diskNameMap[item.driver] }}</t-tag>
            </template>
          </t-list-item-meta>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>
<script lang="ts" setup>
import {sourceDiskList} from "@/apis/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";
import {useDictStore} from "@/store/DictStore.ts";

const router = useRouter();
const {diskNameMap} = useDictStore();

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
