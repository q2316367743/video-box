<template>
  <div class="live-list" ref="el">
    <loading-result v-if="loading" title="正在加载中">
    </loading-result>
    <empty-result v-else-if="results.length === 0" status="404" title="没有频道"/>
    <div class="container">
      <div class="container-content">
        <t-row :gutter="[16,16]">
          <t-col v-for="item in items" :key="item.id" flex="170px">
            <live-list-item :item="item"/>
          </t-col>
        </t-row>
      </div>
    </div>
    <div class="footer" v-if="results.length > 0">
      <t-pagination :total="results.length" :page-size="pageSize" size="small" v-model:current="current" show-total/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {M3u8ChannelWrap} from "@/entities/LiveSource";
import LiveListItem from "@/pages/live/components/LiveListItem.vue";


const props = defineProps({
  results: {
    type: Object as PropType<Array<M3u8ChannelWrap>>,
    default: []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const el = ref<HTMLDivElement>();
const current = ref(1);

const size = useElementSize(el);

const columns = computed(() => Math.floor((size.width.value + 16) / 184));
const cols = computed(() => Math.ceil((size.height.value + 16) / 141));
const pageSize = computed(() => columns.value * cols.value);

const items = computed(() => props.results.slice(
  Math.max(0, (current.value - 1) * pageSize.value),
  Math.min(props.results.length, current.value * pageSize.value)))

watch(() => props.results, () => current.value = 1, {deep: true});


</script>
<style scoped lang="less">
.live-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .container {
    position: absolute;
    top: 4px;
    left: 0;
    right: 0;
    bottom: 33px;
    overflow-y: auto;
    overflow-x: hidden;

    .container-content {
      width: calc(100% - 16px);
      height: calc(100% - 16px);
      padding: 8px;
    }
  }

  .footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-fill-1);
    padding: 4px;
    display: flex;
    justify-content: right;
    border-radius: var(--border-radius-medium);
    border-top: 1px solid var(--td-border-level-2-color);
  }
}
</style>
