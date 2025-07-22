<template>
  <div class="main" ref="mainRef">
    <app-header/>
    <div class="pt-96px max-w-1200px mx-auto">
      <router-view v-slot="{ Component }">
        <keep-alive :exclude="['about', /^setting/]">
          <component :is="Component"/>
        </keep-alive>
      </router-view>
    </div>
    <app-footer/>
    <t-back-top container=".main"/>
  </div>
</template>
<script lang="ts" setup>
import AppHeader from "@/layout/AppHeader.vue";
import AppFooter from "@/layout/AppFooter.vue";
import {emitScrollToTop, onScrollToBottom} from "@/store/index.js";

const route = useRoute();
const router = useRouter();
const path = ref('/');
const mainRef=  ref();

watch(path, value => router.push(value));

watch(() => route.path, value => {
  if (value !== path.value) {
    path.value = value;
  }
}, {immediate: true})

useInfiniteScroll(mainRef, () => {
  onScrollToBottom.trigger();
})
emitScrollToTop.on(() => {
  mainRef.value?.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  })
})
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
