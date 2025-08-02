<template>
  <div class="web-list">
    <t-tabs v-model="folder">
      <t-tab-panel value="all" label="全部"/>
      <t-tab-panel v-if="folders.length>0" value="root" label="根目录"/>
      <t-tab-panel v-for="f in folders" :key="f.id" :value="f.id" :label="f.name"/>
    </t-tabs>
    <div class="web-list-content">
      <web-item-content :folder="folder"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {Folder} from "@/views/Folder";
import {folderWebList} from "@/apis/folder-web";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import WebItemContent from "@/pages/web/pages/list/components/WebItemContent.vue";


const folder = useSessionStorage(LocalNameEnum.KEY_WEB_LIST_FOLDER, 'all');
const folders = ref(new Array<Folder>());

onMounted(() => {
  folderWebList().then(res => folders.value = res.sort((a, b) => a.order - b.order))
});
</script>
<style scoped lang="less">
.web-list {
  height: calc(100% - 57px);
  background-color: var(--td-bg-color-container);
}

</style>
