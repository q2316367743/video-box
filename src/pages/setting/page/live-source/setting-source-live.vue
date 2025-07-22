<template>
  <page-layout title="直播源设置" :subtitle="liveSources.length + '个列表'">
    <template #extra>
      <t-space size="small">
        <t-button theme="primary" variant="text" shape="square" @click="showHelp()">
          <template #icon>
            <questionnaire-icon/>
          </template>
        </t-button>
        <t-button theme="primary" variant="text" shape="square" @click="openAddDispositionDialog(init)">
          <template #icon>
            <plus-icon/>
          </template>
        </t-button>
      </t-space>
    </template>
    <t-list>
      <disposition-item v-for="item in liveSources" :key="item.id" :item="item" @update="init"/>
    </t-list>
  </page-layout>
</template>
<script lang="ts" setup>
import {openAddDispositionDialog} from "@/pages/setting/page/live-source/edit";
import DispositionItem from "@/pages/setting/page/live-source/components/DispositionItem.vue";
import {PlusIcon, QuestionnaireIcon} from "tdesign-icons-vue-next";
import {sourceTvList} from "@/apis/source/tv.js";
import {SourceTv} from "@/views/SourceTv.js";
import Constant from "@/global/Constant.js";

const liveSources = ref(new Array<SourceTv>());

const showHelp = () => window.open(Constant.help);

const init = () => sourceTvList().then(res => liveSources.value = res)

onMounted(init)
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
