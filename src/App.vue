<template>
  <div class="main" ref="mainRef" @scroll="handleScroll">
    <app-header :show-shadow="showShadow"/>
    <div class="pt-96px max-w-1200px mx-auto" style="min-height: calc(100vh - 253px);overflow-x: hidden">
      <router-view/>
    </div>
    <app-footer/>
    <t-back-top container=".main"/>
  </div>
</template>
<script lang="ts" setup>
import AppHeader from "@/layout/AppHeader.vue";
import AppFooter from "@/layout/AppFooter.vue";
import {emitScrollToTop, onScrollToBottom} from "@/store/index.js";

const mainRef = ref();
const showShadow = ref(false);

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
}
</style>
