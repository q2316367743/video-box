<template>
  <page-layout title="网络资源">
    <template #extra>
      <t-space size="small">
        <t-button theme="primary" @click="openVideoSourceDialog()">新增</t-button>
        <t-dropdown trigger="click">
          <t-button theme="default" shape="square">
            <template #icon>
              <more-icon/>
            </template>
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item @click="webImport()">
              <template #prefix-icon>
                <file-import-icon/>
              </template>
              导入
            </t-dropdown-item>
            <t-dropdown-item @click="webExport()">
              <template #prefix-icon>
                <file-export-icon/>
              </template>
              导出
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </t-space>
    </template>
    <div class="web-list">
      <empty-result v-if="sources.length === 0" title="暂无资源"/>
      <t-list v-else :split="true" style="margin-top: 56px">
        <t-list-item v-for="source in sources" :key="source.id">
          <t-list-item-meta :description="source.type">
            <template #title>
              <t-link theme="primary" @click="openInfo(source.id)">{{ source.title }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-space size="small">
              <t-button theme="primary" shape="square" @click="openVideoSourceDialog(source)">
                <template #icon>
                  <edit-icon/>
                </template>
              </t-button>
              <t-popconfirm content="是否立即删除" confirm-btn="删除" @confirm="removeVideoSource(source)">
                <t-button theme="danger" shape="square">
                  <template #icon>
                    <delete-icon/>
                  </template>
                </t-button>
              </t-popconfirm>
            </t-space>
          </template>
        </t-list-item>
      </t-list>
    </div>
    <div class="web-search">
      <div class="web-search-content">
        <t-input v-model="keyword" placeholder="请输入资源名，回车搜索" :disabled="sources.length === 0" clearable
                 @enter="openSearch">
          <template #prefix-icon>
            <search-icon/>
          </template>
        </t-input>
      </div>
    </div>
    <t-back-top container=".web-list"/>
  </page-layout>
</template>
<script lang="ts" setup>
import {useVideoSourceStore} from "@/store";
import {openVideoSourceDialog} from "@/pages/web/pages/components/VideoSourceDialog";
import {DeleteIcon, EditIcon, FileExportIcon, FileImportIcon, MoreIcon, SearchIcon} from "tdesign-icons-vue-next";
import {VideoSourceEntry} from "@/entities/VideoSource";
import {webExport, webImport} from "@/pages/web/pages/list/dialog/WebTransfer";

const router = useRouter();

const keyword = ref('');

const sources = computed(() => useVideoSourceStore().sources);

const openInfo = (id: string) => {
  router.push(`/web/info/${id}`)
}
const openSearch = () => {
  router.push({
    path: '/web/search',
    query: {
      keyword: keyword.value
    }
  })
}
const removeVideoSource = (source: VideoSourceEntry) => {
  useVideoSourceStore().remove(source);
}
</script>
<style scoped lang="less">
.web-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--td-bg-color-container);
  overflow: auto;
}

.web-search {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: var(--td-bg-color-container);

  .web-search-content {
    padding: 12px;
    z-index: 1;
  }
}
</style>
