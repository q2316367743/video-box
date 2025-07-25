<template>
  <t-layout class="app-page">
    <t-aside v-if="max">
      <t-menu v-model="path">
        <t-menu-item v-for="menu in menus" :key="menu.value" :value="menu.value">{{ menu.label }}</t-menu-item>
      </t-menu>
    </t-aside>
    <t-header v-else>
      <t-tabs v-model="path">
        <t-tab-panel v-for="menu in menus" :key="menu.value" :value="menu.value" :label="menu.label"/>
      </t-tabs>
    </t-header>
    <t-content :class="{'app-page-container': true, max}">
      <slot/>
    </t-content>
  </t-layout>
</template>
<script setup lang="ts">

interface MenuOption {
  label: string;
  value: string;
}

const path = defineModel({
  type: String,
  default: ''
})
defineProps({
  menus: {
    type: Array as PropType<Array<MenuOption>>,
    default: () => []
  }
});

const route = useRoute();
const router = useRouter();
const ws = useWindowSize();

const max = computed(() => ws.width.value >= 800);

watch(path, value => {
  if (value !== route.path) router.push(value);
});
watch(() => route.path, val => {
  if (path.value !== val) path.value = val;
});

</script>
<script lang="ts">
export default defineComponent({
  name: 'AppPage',
})
</script>
<style scoped lang="less">
.app-page {
  .app-page-container {
    background-color: var(--td-bg-color-container);

    &.max {
      border-left: 1px solid var(--td-border-level-2-color)
    }
  }
}
</style>
