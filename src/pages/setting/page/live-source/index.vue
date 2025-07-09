<template>
  <page-layout title="配置中心" :subtitle="liveSources.length + '个列表'">
    <template #extra>
      <t-space size="small">
        <t-button theme="primary" variant="text" shape="square" @click="showHelp()">
          <template #icon>
            <questionnaire-icon/>
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square" @click="openAddDispositionDialog()">
          <template #icon>
            <plus-icon/>
          </template>
        </t-button>
      </t-space>
    </template>
    <t-list>
      <disposition-item v-for="item in liveSources" :key="item.id" :item="item"/>
    </t-list>
  </page-layout>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import {useLiveSourceStore} from "@/store";
import {openAddDispositionDialog} from "@/pages/setting/page/live-source/edit";
import DispositionItem from "@/pages/setting/page/live-source/components/DispositionItem.vue";
import Constant from "@/global/Constant";
import {PlusIcon, QuestionnaireIcon} from "tdesign-icons-vue-next";

const liveSources = computed(() => useLiveSourceStore().liveSources);

const showHelp = () => utools.shellOpenExternal(Constant.help);
</script>
<style scoped lang="less">
.disposition {
  height: 100%;

  .main {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
