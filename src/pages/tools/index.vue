<template>
  <div class="tools">
    <div class="tools-top">
      <t-breadcrumb :options="options" />
      <t-space size="small">
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <refresh-icon />
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square" @click="handleChat()">
          <template #icon>
            <plus-icon />
          </template>
        </t-button>
      </t-space>
    </div>
    <div class="tools-body">
      <router-view />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PlusIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import type { TdBreadcrumbProps } from 'tdesign-vue-next';

const route = useRoute();
const router = useRouter();

const options = computed<TdBreadcrumbProps["options"]>(() => {
  const op: TdBreadcrumbProps["options"] = [
    { content: 'AI工具', to: '/tools/list'},
  ];
  if (route.path === '/tools/list') {
    op.push({ content: '列表' });
  } else if (route.path === '/tools/chat') {
    op.push({ content: '新建' });
  }
  return op;
});

const handleAdd = () => {
  router.push('/tools/add');
}

const handleChat = () => {
  router.push('/tools/chat');
}
</script>
<style scoped lang="less">
.tools {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--td-bg-color-container);

  .tools-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 32px;
    border-bottom: 1px solid var(--td-border-level-2-color);
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
  }

  .tools-body {
    position: absolute;
    top: 49px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>