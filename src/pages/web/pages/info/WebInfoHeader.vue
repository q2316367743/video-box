<template>
  <t-head-menu v-model="menuKey" theme="light">
    <template #logo>
      <t-button theme="primary" shape="square" variant="text" @click="goBack">
        <template #icon>
          <chevron-left-icon/>
        </template>
      </t-button>
      <div class="logo" title="返回">
        {{ plugin.props.title }}
      </div>
    </template>
    <template v-for="menu in menus">
      <t-menu-item v-if="!menu.children || menu.children.length=== 0" :value="menu.id">{{ menu.name }}</t-menu-item>
      <t-submenu v-else :value="menu.id">
        <template #title>
          <span>{{ menu.name }}</span>
        </template>
        <template v-for="subMenu in menu.children">
          <t-menu-item :value="subMenu.id">{{ subMenu.name }}</t-menu-item>
        </template>
      </t-submenu>
    </template>
  </t-head-menu>
</template>
<script lang="ts" setup>
import {VideoCategory, VideoPlugin} from "@/modules/video/VideoPlugin";
import {ChevronLeftIcon} from "tdesign-icons-vue-next";

const router = useRouter();

const menuKey = defineModel({
  type: String,
  default: ''
});
defineProps({
  menus: {
    type: Object as PropType<Array<VideoCategory>>,
    default: []
  },
  plugin: {
    type: Object as PropType<VideoPlugin>,
    required: true
  }
});
const goBack = () => router.back();
</script>
<style scoped lang="less">
.logo {
  font-size: var(--td-font-size-title-large);
  font-weight: bold;
  text-wrap: nowrap;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  margin-left: 6px;
}
</style>
