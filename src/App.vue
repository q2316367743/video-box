<template>
  <div :class="{main: true,'bg-color': true, detach: detach}">
    <div class="app-side" style="z-index: 50" :style="{width: collapsed?'64px':'232px'}">
      <t-menu v-model="path" :collapsed="collapsed"
              style="height: 100vh;border-right: 1px solid var(--td-border-level-1-color)">
        <template #logo>
          <div class="ml-16px">
            <t-avatar :image="avatar">匿名用户</t-avatar>
          </div>
        </template>
        <template #operations>
          <t-button theme="primary" variant="text" shape="square" @click="toggleCollapsed()">
            <template #icon>
              <view-list-icon/>
            </template>
          </t-button>
        </template>
        <template v-for="r in routes">
          <t-submenu v-if="r.children && r.children.length > 0 && !r.meta?.hidden" :value="r.path"
                     :title="`${r.name as string}`">
            <template #icon v-if="r.meta?.icon">
              <component :is="r.meta.icon"/>
            </template>
            <t-menu-item v-for="c in r.children" :value="`${r.path}/${c.path}`">
              {{ c.name }}
            </t-menu-item>
          </t-submenu>
          <t-menu-item v-else-if="!r.meta?.hidden" :value="r.path">
            <template #icon v-if="r.meta?.icon">
              <component :is="r.meta.icon"/>
            </template>
            {{ r.name }}
          </t-menu-item>
        </template>
      </t-menu>
    </div>
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['home']">
          <component :is="Component"/>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useUtoolsColorMode} from "@/hooks/ColorMode";
import {ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {detach} from "@/store/AppStore";
import {routes} from "@/plugin/router";
import {ViewListIcon} from "tdesign-icons-vue-next";
import {useUtoolsDbStorage} from "@/hooks/UtoolsDbStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {useLiveSourceStore, useVideoSourceStore} from "@/store";

const route = useRoute();
const router = useRouter();
const path = ref('/home');
const avatar = utools.getUser()?.avatar;

const collapsed = useUtoolsDbStorage(LocalNameEnum.KEY_APP_COLLAPSED, true);

watch(path, value => router.push(value));

watch(() => route.path, value => {
  if (value !== path.value) {
    path.value = value;
  }
}, {immediate: true})

// 颜色模式
useUtoolsColorMode();
useVideoSourceStore().init();
useLiveSourceStore().init();
const toggleCollapsed = useToggle(collapsed);

utools.onPluginEnter(action => {
  detach.value = utools.getWindowType() !== 'main';
  // 对关键字进行处理
  console.log(action);
});


</script>
<style scoped lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  display: flex;

  .app-side {
    position: relative;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
    width: 232px;
    z-index: 50;
  }

  .app-container {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-color-container);
    flex: auto;
  }
}
</style>
