<template>
  <footer class="app-footer">
    <div class="container mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <div class="flex items-center justify-center md:justify-start">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span class="gradient-text font-bold">影视盒子</span>
          </div>
          <p class="text-gray-500 text-sm mt-2 text-center md:text-left">© 2025 影视盒子 - 自由观影，畅享精彩</p>
          <p class="text-gray-500 text-sm mt-1 text-center md:text-left">版本: {{ Constant.version }}
            <!--            <span-->
            <!--            class="inline-flex items-center bg-red-600 text-white text-xs px-2 py-0.5 rounded-md ml-1 cursor-pointer animate-pulse font-medium">-->
            <!--                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24"-->
            <!--                     stroke="currentColor">-->
            <!--                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"-->
            <!--                          d="M13 10V3L4 14h7v7l9-11h-7z"></path>-->
            <!--                </svg>-->
            <!--                发现新版-->
            <!--            </span>-->
          </p>
        </div>

        <div class="text-center md:text-right">
          <p class="text-gray-500 text-sm ">
            免责声明：本站仅为视频搜索工具，不存储、上传或分发任何视频内容。
            所有视频均来自第三方API接口。如有侵权，请联系相关内容提供方。
          </p>
          <div class="mt-2 flex justify-center md:justify-end space-x-4">
            <t-link href="about.html">关于我们</t-link>
            <t-link href="privacy.html">隐私政策</t-link>
            <t-link href="https://www.unicef.org/zh" target="_blank">捐赠</t-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
<script lang="ts">
import Constant from "@/global/Constant";

export default defineComponent({
  name: 'AppFooter',
  computed: {
    Constant() {
      return Constant
    }
  },
});
</script>
<style scoped lang="less">
.app-footer {
  margin-top: 8px;
  padding: 24px 12px;
  border-top: 1px solid var(--td-border-level-2-color);
}
</style>