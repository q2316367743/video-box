<template>
  <!--  <template #extra>-->
  <!--    <t-upload accept="application/json" :request-method="handleImportMethod" :show-upload-progress="false">-->
  <!--      <t-button theme="primary">导入</t-button>-->
  <!--    </t-upload>-->
  <!--  </template>-->
  <div class="web-list" @contextmenu="handleListContextmenu($event, init)">
    <web-item-content folder="0" ref="contentRef"/>
  </div>
</template>
<script lang="ts" setup>
import {UploadProps} from "tdesign-vue-next";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {handleListContextmenu} from "@/pages/web/pages/list/components/WebListContext";
import {sourceWebImport} from "@/apis/source/web.js";
import WebItemContent from "@/pages/web/pages/list/components/WebItemContent.vue";

const contentRef = ref()
const init = () => {
  contentRef.value?.init();
}

const handleImportMethod: UploadProps['requestMethod'] = async (file) => {
  const target = (Array.isArray(file) ? file : [file])[0];
  if (target) {
    const {raw} = target;
    if (raw) {
      await sourceWebImport(raw);
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
onMounted(init);
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
