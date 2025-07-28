<template>
  <page-layout>
    <template #title>
      <web-source-folder-select v-model="folder" root="root" :folders/>
    </template>
    <template #extra>
      <t-space size="small">
        <t-dropdown trigger="click" max-column-width="200px">
          <t-button theme="primary">
            新增
            <template #suffix>
              <chevron-down-icon/>
            </template>
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item @click="openVideoSourceDialog(init)">
              <template #prefix-icon>
                <file-add-icon/>
              </template>
              新增
            </t-dropdown-item>
            <t-dropdown-item @click="webSourceExport()">
              <template #prefix-icon>
                <file-export-icon/>
              </template>
              导出
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
        <t-upload accept="application/json" :request-method="handleImportMethod" :show-upload-progress="false">
          <t-button theme="primary" style="margin-top: 1px;">
            <template #icon>
              <file-import-icon/>
            </template>
            导入
          </t-button>
        </t-upload>
      </t-space>
    </template>
    <div class="web-source-content" ref="web-source-content">
      <web-source-item v-for="source in sources" :key="source.id" :view="source" :folders @update="init"/>
    </div>
  </page-layout>
</template>
<script lang="ts" setup>
import {UploadProps} from "tdesign-vue-next";
import MessageUtil from "@/utils/modal/MessageUtil";
import {ChevronDownIcon, FileAddIcon, FileExportIcon, FileImportIcon, FolderAddIcon} from "tdesign-icons-vue-next";
import {openVideoSourceDialog} from "@/pages/setting/page/web-source/func/VideoSourceDialog";
import {webSourceExport} from "@/pages/setting/page/web-source/func/WebSourceContext";
import {adminSourceWebImport, adminSourceWebList} from "@/apis/admin/source/web";
import {Folder} from "@/views/Folder";
import {SourceWeb} from "@/views/SourceWeb";
import {map, set} from "@/utils/lang/ArrayUtil";
import {folderWebList} from "@/apis/folder-web/index";
import WebSourceItem from "@/pages/setting/page/web-source/components/WebSourceItem.vue";
import WebSourceFolderSelect from "@/pages/setting/page/web-source/components/WebSourceFolderSelect.vue";
import {useSortable} from "@vueuse/integrations/useSortable";
import {sourceWebSort} from "@/apis/source/web";


const folder = ref('all');
const folders = ref(new Array<Folder>());
const sourceMap = ref(new Map<string, SourceWeb>());
const contentRef = useTemplateRef<HTMLDivElement>('web-source-content');

const sources = computed(() => {
  if (folder.value === 'all') {
    return Array.from(sourceMap.value.values()).sort((a, b) => a.order - b.order);
  } else if (folder.value === 'root') {
    const folderIds = set(folders.value, 'id');
    return Array.from(sourceMap.value.values())
      .filter(it => !folderIds.has(it.folder))
      .sort((a, b) => a.order - b.order);
  } else {
    return Array.from(sourceMap.value.values())
      .filter(it => it.folder === folder.value)
      .sort((a, b) => a.order - b.order);
  }
});

const handleImportMethod: UploadProps['requestMethod'] = async (file) => {
  const target = (Array.isArray(file) ? file : [file])[0];
  if (target) {
    const {raw} = target;
    if (raw) {
      await adminSourceWebImport(raw);
      // 导入成功，重新初始化
      MessageUtil.success("导入成功")
      init();
      return {
        status: 'success',
        response: {
          url: 'https://tdesign.gtimg.com/site/avatar.jpg',
        },
      }
    }
  }
  return {
    status: 'fail',
    response: {},
  }
};

const init = () => {
  (async () => {
    const [res1, res2] = await Promise.all([folderWebList(), adminSourceWebList('all')]);
    folders.value = res1;
    sourceMap.value = map(res2, 'id');
  })().catch(console.error);
}

const {option} = useSortable(contentRef, sources, {
  animation: 150,
  handle: '.web-source-card',
  onUpdate(e) {
    const temp = Array.from(sources.value);
    // 移动数组。将e.oldIndex!位置移动到e.newIndex!
    if (e.oldIndex === e.newIndex) {
      return;
    }
    // 从原位置移除元素
    const [movedItem] = temp.splice(e.oldIndex!, 1);
    // 将元素插入到新位置
    temp.splice(e.newIndex!, 0, movedItem);
    // 修改
    sourceWebSort(temp.map((item, order) => ({
      id: item.id,
      folder: false,
      order: order
    })))
  }
})


watch([folder, folders, sources], () => option('disabled', folder.value === 'all'), {immediate: true});

onMounted(init);
</script>
<style scoped lang="less">

.web-source-content {
  display: grid;
  gap: 8px;
  margin: 8px;
  grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));
}

</style>
