<template>
  <div class="main">
    <div class="main-aside" :style="{width: collapsed ? '64px' : '232px'}">
      <app-side v-model="collapsed"/>
    </div>
    <div class="main-content" ref="mainRef" @scroll="handleScroll">
      <app-header :show-shadow="showShadow"/>
      <router-view/>
    </div>
    <t-back-top container=".main-content"/>
  </div>
</template>
<script lang="ts" setup>
import AppHeader from "@/layout/AppHeader.vue";
import AppSide from "@/layout/AppSide.vue";
import {emitScrollToTop, onScrollToBottom} from "@/store";

const mainRef = ref();
const showShadow = ref(false);
const collapsed = ref(true);

useInfiniteScroll(mainRef, () => {
  onScrollToBottom.trigger();
})
emitScrollToTop.on(() => {
  mainRef.value?.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  })
});
const handleScroll = (e: Event) => {
  showShadow.value = (e.target as HTMLDivElement)?.scrollTop > 10
}
</script>
<style scoped lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  background-color: var(--td-bg-color-container);
  overflow: auto;
  flex-direction: row;
  display: flex;
  background: var(--td-bg-color-page);
  flex: auto;
  font: var(--td-font-body-medium);
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  list-style: none;

  .main-aside {
    border-right: 1px solid var(--td-border-level-2-color);
    position: relative;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
  }

  .main-content {
    height: 100vh;
    overflow-y: auto;
    position: relative;
    flex: auto;
  }
}
</style>
