<template>
  <div class="about">
    <div class="p-4 max-w-4xl mx-auto">
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

      <t-tabs default-value="watched" class="mt-8px">
        <t-tab-panel value="watched" :label="`看过的影视 (${watched.length})`">
          <empty-result v-if="watched.length === 0" title="空空如也"/>
          <div class="p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="item in watched" :key="item.id" class="border rounded-lg overflow-hidden">
                <img
                  :src="item.cover"
                  :alt="item.title"
                  class="w-full h-40 object-cover"
                />
                <div class="p-2">
                  <div class="font-medium truncate">{{ item.title }}</div>
                  <div class="text-sm text-gray-500">{{ item.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="liked" :label="`喜欢的影视 (${liked.length})`">
          <empty-result v-if="liked.length === 0" title="空空如也"/>
          <div class="p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="item in liked" :key="item.id" class="border rounded-lg overflow-hidden">
                <img
                  :src="item.cover"
                  :alt="item.title"
                  class="w-full h-40 object-cover"
                />
                <div class="p-2">
                  <div class="font-medium truncate">{{ item.title }}</div>
                  <div class="text-sm text-gray-500">{{ item.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="following" :label="`在追的影视 (${following.length})`">
          <empty-result v-if="following.length === 0" title="空空如也"/>
          <div class="p-4">
            <div class="space-y-4">
              <div v-for="item in following" :key="item.id" class="flex border rounded-lg p-3">
                <img
                  :src="item.cover"
                  :alt="item.title"
                  class="w-24 h-32 object-cover rounded"
                />
                <div class="ml-4 flex-1 flex flex-col">
                  <div class="font-bold text-lg mb-8px">{{ item.title }}</div>
                  <div class="text-gray-600 mt-1">{{ item.description }}</div>
                  <div class="mt-auto w-full">
                    <t-progress :percentage="30" :label="`已看30%`"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useErrorStore} from "@/store";
import Constant from "@/global/Constant.js";
import {useMyVideoItemStore} from "@/store/db/MyVideoItemStore.js";

const {changeConsole} = useErrorStore();
const {consoleShow} = toRefs(useErrorStore());
const watched = computed(() => useMyVideoItemStore().playHistoryItems.filter(e => e.type === 'watched'));
const liked = computed(() => useMyVideoItemStore().playHistoryItems.filter(e => e.type === 'liked'));
const following = computed(() => useMyVideoItemStore().playHistoryItems.filter(e => e.type === 'following'));

const user = utools.getUser() || {
  nickname: '匿名用户',
  type: 'user',
  avatar: './user.png'
}
</script>
<style scoped lang="less">
.about {

}
</style>
