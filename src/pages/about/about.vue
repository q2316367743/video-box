<template>
  <div class="about">
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
              会员
            </t-tag>
          </div>
        </div>

        <div class="text-right">
          <div class="text-lg font-semibold select-none cursor-pointer">{{ Constant.name }}
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
    <div class="about-container">
      <empty-result v-if="items.length === 0" title="空空如也"/>
      <div class="about-content">
        <my-video-item v-for="item in items" :key="item.id" :item="item" :type="activeKey" @update="init"/>
      </div>
    </div>
    <t-back-top container=".about-container"/>
  </div>
</template>
<script lang="ts" setup>
import Constant from "@/global/Constant";
import MyVideoItem from "@/pages/about/components/MyVideoItem.vue";
import {MyVideoItemView} from "@/views/MyVideoItemView";
import {myVideoItemList} from "@/apis/my/video-item";

const activeKey = ref('watched');


const items = ref(new Array<MyVideoItemView>());

const user = {
  nickname: '匿名用户',
  type: 'user',
  avatar: './user.png'
}

const init = () => myVideoItemList().then(res => items.value = res);

onMounted(init)
</script>
<style scoped lang="less">
.about {
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  position: relative;
  padding: 16px;

  .about-container {
    .about-content {
      display: grid;
      gap: 8px;
      margin: 8px;
      grid-template-columns:repeat(auto-fill, minmax(120px, 1fr));
    }
  }
}
</style>
