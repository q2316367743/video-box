<template>
  <!-- 导航栏 -->
  <header class="app-header" :class="{shadow: showShadow}">
    <div class="app-header-container">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-lg bg-day-primary dark:bg-night-primary flex items-center justify-center"
             @click="toHome">
          <img src="/logo.png" alt="影视盒子" style="width: 40px;height: 40px"/>
        </div>
        <span class="text-xl font-bold bg-gradient-to-r bg-clip-text" @click="toHome">影视盒子</span>
        <t-dropdown v-if="mini">
          <t-button theme="primary" shape="square" variant="text">
            <template #icon>
              <view-list-icon/>
            </template>
          </t-button>
          <t-dropdown-menu>
            <t-descriptions-item v-for="menu in menus" @click="path = menu.value">{{ menu.label }}</t-descriptions-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>

      <!-- 导航链接 - 桌面版 -->
      <nav class="hidden md:flex items-center gap-6" v-if="show && !mini">
        <t-head-menu v-model="path">
          <t-menu-item v-for="menu in menus" :value="menu.value">{{ menu.label }}</t-menu-item>
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
            <t-dropdown-item @click="toMy">
              <template #prefix-icon>
                <user-icon/>
              </template>
              个人中心
            </t-dropdown-item>
            <t-dropdown-item @click="toSetting">
              <template #prefix-icon>
                <setting-icon/>
              </template>
              设置
            </t-dropdown-item>
            <t-dropdown-item @click="handleLogout">
              <template #prefix-icon>
                <logout-icon/>
              </template>
              登出
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>
    </div>

  </header>
</template>
<script lang="ts" setup>
import {colorMode} from "@/store/index";
import {useUserStore} from "@/store/UserStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {LogoutIcon, SettingIcon, UserIcon, ViewListIcon} from "tdesign-icons-vue-next";

const route = useRoute();
const router = useRouter();
const {logout} = useUserStore();

defineProps({
  showShadow: {
    type: Boolean,
    default: false
  }
});

const ws = useWindowSize();
const path = ref('/home/list');
const menus = [{
  label: "首页",
  value: "/home/list"
}, {
  label: "站点",
  value: "/web/list"
}, {
  label: "直播",
  value: "/live"
}, {
  label: "网盘",
  value: "/disk/list"
}]

const show = computed(() => !route.path.startsWith("/auth/"));
const mini = computed(() => ws.width.value < 800);

watch(path, value => {
  if (value !== route.path) router.push(value);
});
watch(() => route.path, val => {
  if (path.value !== val) path.value = val;
});

const handleLogout = () => {
  logout().then(() => MessageUtil.success("登出成功"));
}

const toHome = () => router.push('/home/list');
const toMy = () => router.push('/about');
const toSetting = () => router.push('/setting/base');
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
