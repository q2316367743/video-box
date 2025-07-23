<template>
  <div class="web-list-item" :title="view.name">
    <div class="top">
      <span class="title">{{ view.name }}</span>
      <span class="status online">325ms</span>
    </div>
    <div class="actions">
      <t-button theme="primary" @click="openInfo(view)">打开</t-button>
      <t-button theme="primary">测速</t-button>
      <div class="web-list-item__move">
        <drag-move-icon/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {WebItemView} from "@/views/WebItemView.js";
import {openWebFolderDialog} from "@/pages/setting/page/web-source/components/WebFolder.js";
import {DragMoveIcon} from "tdesign-icons-vue-next";

defineProps({
  view: {
    type: Object as PropType<WebItemView>,
    required: true,
  }
});

const router = useRouter();

const openInfo = (view: WebItemView) => {
  if (view.folder) {
    openWebFolderDialog(view)
  } else {
    router.push(`/web/info/${view.id}`)
  }
}

</script>
<style scoped lang="less">
.web-list-item {
  background: var(--td-bg-color-component);
  border-radius: var(--td-radius-medium);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: .2s;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .status {
      font-size: 13px;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .online {
      background: #005c5c;
      color: var(--accent);
    }

    .offline {
      background: #5c0000;
      color: var(--danger);
    }
  }

  .title {
    font-size: 17px;
    font-weight: 600;
  }


  .actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;

    .web-list-item__move {
      margin-left: auto;
      height: 32px;
      width: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

  }
}

</style>
