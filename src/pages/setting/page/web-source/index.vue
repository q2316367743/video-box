<template>
  <page-layout title="网络资源管理">
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
              新增网络资源
            </t-dropdown-item>
            <t-dropdown-item @click="addFolderWeb(init)">
              <template #prefix-icon>
                <folder-add-icon/>
              </template>
              新增文件夹
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
          <t-button theme="primary">
            <template #icon>
              <file-import-icon/>
            </template>
            导入
          </t-button>
        </t-upload>
      </t-space>
    </template>
    <div class="web-list">
      <web-source-content ref="contentRef"/>
    </div>
  </page-layout>
</template>
<script lang="ts" setup>
import {UploadProps} from "tdesign-vue-next";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {ChevronDownIcon, FileAddIcon, FileExportIcon, FileImportIcon, FolderAddIcon} from "tdesign-icons-vue-next";
import {openVideoSourceDialog} from "@/pages/setting/page/web-source/func/VideoSourceDialog.js";
import {addFolderWeb, webSourceExport} from "@/pages/setting/page/web-source/func/WebSourceContext.js";
import {adminSourceWebImport} from "@/apis/admin/source/web.js";
import WebSourceContent from "@/pages/setting/page/web-source/components/WebSourceContent.vue";

const contentRef = ref()
const init = () => {
  contentRef.value?.init();
}

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
</script>
<style scoped lang="less">
.web-list {
  min-height: 60vh;

  .web-list-content {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    gap: 8px;
    padding: 8px;
  }
}

</style>
