<template>
  <div class="about">
    <div class="p-8px max-w-4xl mx-auto">
      <t-card size="small">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <t-avatar
              :image="user.avatar"
              size="48px"
              class="border-2 border-yellow-400"
            />
            <div>
              <div class="text-xl font-bold mb-4px">{{ user.nickname }}</div>
              <t-tag theme="success" v-if="user.type === 'member'">
                uTools 会员
              </t-tag>
            </div>
          </div>

          <div class="text-right">
            <div class="text-lg font-semibold select-none cursor-pointer" @dblclick="changeConsole()"
                 :style="{color: consoleShow ? 'var(--td-success-color)': ''}">{{ Constant.name }}
            </div>
            <div class="text-gray-500">{{ Constant.version }}</div>
          </div>
        </div>
      </t-card>
      <t-tabs v-model="activeKey" class="mt-8px">
        <t-tab-panel value="watched" label="看过的影视"/>
        <t-tab-panel value="liked" label="喜欢的影视"/>
        <t-tab-panel value="following" label="在追的影视"/>
      </t-tabs>
    </div>
    <div class="about-container">
      <my-watched v-if="activeKey === 'watched'"/>
      <my-liked v-else-if="activeKey === 'liked'"/>
      <my-following v-else-if="activeKey === 'following'"/>
    </div>
    <t-back-top container=".about-container"/>
  </div>
</template>
<script lang="ts" setup>
import {useErrorStore} from "@/store";
import Constant from "@/global/Constant.js";
import MyWatched from "@/pages/about/components/MyWatched.vue";
import MyLiked from "@/pages/about/components/MyLiked.vue";
import MyFollowing from "@/pages/about/components/MyFollowing.vue";

const activeKey = ref('watched');

const {changeConsole} = useErrorStore();
const {consoleShow} = toRefs(useErrorStore());

const user = utools.getUser() || {
  nickname: '匿名用户',
  type: 'user',
  avatar: './user.png'
}
</script>
<style scoped lang="less">
.about {
  width: 100%;
  height: 100%;
  position: relative;

  .about-container {
    position: absolute;
    top: 150px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    overflow-y: auto;
  }
}
</style>
