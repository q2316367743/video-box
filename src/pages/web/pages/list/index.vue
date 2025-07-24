<template>
  <t-layout class="web-list">
    <t-aside v-if="ws.width.value > 800">
      <t-menu v-model="folder">
        <t-menu-item value="all">全部</t-menu-item>
        <t-menu-item value="root" v-if="folders.length>0">根目录</t-menu-item>
        <t-menu-item v-for="f in folders" :key="f.id" :value="f.id">{{ f.name }}</t-menu-item>
      </t-menu>
    </t-aside>
    <t-header v-else>
      <t-tabs v-model="folder">
        <t-tab-panel value="all" label="全部"/>
        <t-tab-panel v-if="folders.length>0" value="root" label="根目录"/>
        <t-tab-panel v-for="f in folders" :key="f.id" :value="f.id" :label="f.name"/>
      </t-tabs>
    </t-header>
    <t-content class="web-list-content">
      <web-item-content :folder="folder"/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {Folder} from "@/views/Folder.js";
import {folderWebList} from "@/apis/folder-web/index.js";
import {LocalNameEnum} from "@/global/LocalNameEnum.js";
import WebItemContent from "@/pages/web/pages/list/components/WebItemContent.vue";

const ws = useWindowSize();

const folder = useSessionStorage(LocalNameEnum.KEY_WEB_LIST_FOLDER, 'all');
const folders = ref(new Array<Folder>());

onMounted(() => {
  folderWebList().then(res => folders.value = res.sort((a, b) => a.order - b.order))
});
</script>
<style scoped lang="less">
.web-list {
  height: 100%;

  .web-list-content {
    background-color: var(--td-bg-color-container);
    border-left: 1px solid var(--td-border-level-2-color);
  }
}

</style>
