<template>
  <div class="live">
    <div class="live-header">
      <!-- 顶部工具栏 -->
      <div class="flex items-center gap-4">
        <div class="w-180px">
          <t-input placeholder="请输入频道名" v-model="keyword" clearable>
            <template #prefix-icon>
              <search-icon/>
            </template>
          </t-input>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <t-select v-model="active" :options="options" clearable auto-width/>
      </div>
    </div>
    <div class="live-container">
      <live-list :channels :loading :active :keyword/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {SelectOption} from "tdesign-vue-next";
import {SearchIcon} from "tdesign-icons-vue-next";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import LiveList from "@/pages/live/components/LiveList.vue";
import {sourceTvInfo, sourceTvList} from "@/apis/source/tv";
import {SourceTvChannelView} from "@/views/SourceTv";


const active = useLocalStorage(LocalNameEnum.KEY_SOURCE_ACTIVE_LIVE, '');

const channels = ref(new Array<SourceTvChannelView>());
const loading = ref(true);
const keyword = ref('');

const options = ref<Array<SelectOption>>([]);

watch(active, val => {
  if (!val) {
    channels.value = [];
    loading.value = false;
    return;
  }
  sourceTvInfo(val)
    .then(res => channels.value = res.channels.map(e => ({...e, timeout: res.timeout !== 0, sourceId: res.id})))
    .finally(() => loading.value = false);
}, {immediate: true})

onMounted(() => {
  sourceTvList().then(res => {
    options.value = res.map(e => ({
      label: e.name,
      value: e.id
    }))
  })
})

</script>
<style scoped lang="less">
.live {

  .live-header {
    border-bottom: 1px solid var(--td-border-level-2-color);
    display: flex;
    justify-content: space-between;
    padding: 12px 12px 11px;
  }

  .live-container {
    min-height: 100vh;
  }
}
</style>
