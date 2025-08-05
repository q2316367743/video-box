<template>
  <aside class="h-100vh">
    <t-menu collapsed v-model="path">
      <t-menu-item value="/home/list">
        <template #icon>
          <home-icon/>
        </template>
        首页
      </t-menu-item>
      <t-menu-item value="/web/list">
        <template #icon>
          <video-icon/>
        </template>
        影视
      </t-menu-item>
      <t-menu-item value="/live">
        <template #icon>
          <tv-icon/>
        </template>
        直播
      </t-menu-item>
      <t-menu-item value="/disk/list">
        <template #icon>
          <hard-disk-storage-icon/>
        </template>
        网盘
      </t-menu-item>
      <t-menu-item value="/task">
        <template #icon>
          <task-icon/>
        </template>
        任务
      </t-menu-item>
      <t-menu-item value="/setting/base">
        <template #icon>
          <setting-icon />
        </template>
        设置
      </t-menu-item>
      <t-menu-item value="/about">
        <template #icon>
          <user-icon/>
        </template>
        我的
      </t-menu-item>
    </t-menu>
  </aside>
</template>
<script lang="ts" setup>
import {
  HardDiskStorageIcon, HomeIcon, SettingIcon, TaskIcon,
  TvIcon, UserIcon,
  VideoIcon,
} from "tdesign-icons-vue-next";

const route = useRoute();
const router = useRouter();

const path = ref('/home/list');

watch(path, value => {
  if (value !== route.path) router.push(value);
});
watch(() => route.path, val => {
  if (path.value !== val) path.value = val;
});

</script>
<script lang="ts">
export default defineComponent({
  name: 'AppHeader',
});
</script>
<style scoped lang="less">
.app-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 501;
  transition: all 0.3s, background-color 0s;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--td-border-level-2-color);
  background-color: var(--td-bg-color-container);
  height: 80px;


  &.shadow {
    box-shadow: var(--td-shadow-2);
  }

  .app-header-container {
    margin: 0 auto;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
  }
}
</style>
