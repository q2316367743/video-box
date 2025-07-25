<template>
  <page-layout :title="liveSources.length + '个列表'">
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
      <disposition-item v-for="item in liveSources" :key="item.id" :item="item" :loading="runningIds.includes(`/task/${item.id}`)" @update="init"/>
    </t-list>
  </page-layout>
</template>
<script lang="ts" setup>
import {openAddDispositionDialog} from "@/pages/setting/page/live-source/edit";
import DispositionItem from "@/pages/setting/page/live-source/components/DispositionItem.vue";
import {PlusIcon, QuestionnaireIcon} from "tdesign-icons-vue-next";
import {sourceTvList, sourceTvTask} from "@/apis/source/tv.js";
import {SourceTv} from "@/views/SourceTv.js";
import Constant from "@/global/Constant.js";

const liveSources = ref(new Array<SourceTv>());
const runningIds = ref(new Array<string>());

const showHelp = () => window.open(Constant.help);

const init = () => sourceTvList().then(res => liveSources.value = res);

useIntervalFn(() => {
  if (liveSources.value.length === 0) return;
  sourceTvTask(liveSources.value.map(e => e.id)).then(e => {
    const current = e.map(e => e.id);
    if (current.length != runningIds.value.length) {
      init()
    }
    runningIds.value = current;
  })
}, 1000);

onMounted(init)
</script>
<style scoped lang="less">
</style>
