<template>
  <!-- 导航栏 -->
  <header class="app-header" :class="{shadow: showShadow}">
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
      <nav class="hidden md:flex items-center gap-6" v-if="show">
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
        <t-dropdown trigger="click" :disabled="!show">
          <div class="relative ml-8px">
            <div class="w-32px h-32px rounded-full cursor-pointer overflow-hidden">
              <img src="/user.png" alt="用户头像" class="w-full h-full object-cover">
            </div>
          </div>
          <t-dropdown-menu>
            <t-dropdown-item @click="toMy">个人中心</t-dropdown-item>
            <t-dropdown-item @click="handleLogout">登出</t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>
    </div>

  </header>
</template>
<script lang="ts" setup>
import {colorMode} from "@/store/index.js";
import {useUserStore} from "@/store/UserStore.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";

const route = useRoute();
const router = useRouter();
const {logout} = useUserStore();

defineProps({
  showShadow: {
    type: Boolean,
    default: false
  }
});

const path = ref('/home/list');

const show = computed(() => !route.path.startsWith("/auth/"));

watch(path, value => {
  if (value !== route.path) router.push(value);
});
watch(() => route.path, val => {
  if (path.value !== val) path.value = val;
});

const toMy = () => router.push('/about');
const handleLogout = () => {
  logout().then(() => MessageUtil.success("登出成功"));
}
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
