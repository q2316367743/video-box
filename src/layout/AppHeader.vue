<template>
  <!-- 导航栏 -->
  <header
    class="app-header">
    <div class="app-header-container">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-lg bg-day-primary dark:bg-night-primary flex items-center justify-center">
          <img src="/logo.png" alt="影视盒子" style="width: 40px;height: 40px"/>
        </div>
        <span
          class="text-xl font-bold bg-gradient-to-r bg-clip-text">影视盒子</span>
      </div>

      <!-- 导航链接 - 桌面版 -->
      <nav class="hidden md:flex items-center gap-6">
        <t-head-menu v-model="path">
          <t-menu-item value="/home/list">首页</t-menu-item>
          <!--          <t-menu-item value="/home/movie">电影</t-menu-item>-->
          <!--          <t-menu-item value="/home/series">剧集</t-menu-item>-->
          <t-menu-item value="/web/list">站点</t-menu-item>
          <t-menu-item value="/live">直播</t-menu-item>
          <t-menu-item value="/setting/base">设置</t-menu-item>
        </t-head-menu>
      </nav>

      <!-- 用户区域和主题切换 -->
      <div class="flex items-center gap-4">
        <!-- 主题切换按钮 -->
        <theme-switch v-model="colorMode"/>
        <!-- 用户头像 -->
        <div class="relative ml-8px" @click="toMy">
          <button
            class="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent transition-colors cursor-pointer">
            <img src="/user.png" alt="用户头像" class="w-full h-full object-cover">
          </button>
        </div>
      </div>
    </div>

  </header>
</template>
<script lang="ts" setup>
import {colorMode} from "@/store/index.js";

const route = useRoute();
const router = useRouter();

const path = ref('/home/list');

watch(path, value => {
  router.push(value);
});
watch(() => route.path, val => {
  if (path.value !== val) path.value = val;
})

const toMy = () => router.push('/about')
</script>
<script lang="ts">
export default defineComponent({
  name: 'AppHeader',
});
</script>
<style scoped lang="less">
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  box-shadow: var(--td-shadow-2);
  background-color: var(--td-bg-color-container);

  .app-header-container {
    margin: 0 auto;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
