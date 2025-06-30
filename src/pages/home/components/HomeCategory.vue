<template>
  <div class="w-full">
    <t-card size="small" class="mt-8px">
      <t-empty style="margin: 15vh 0" v-if="list.length === 0"/>
      <div class="waterfall-list">
        <div v-for="r in list" :key="r.id" class="waterfall-item">
          <t-card :title="r.title" size="small" hoverable>
            <!-- 这里可以放置视频缩略图或其他内容 -->
          </t-card>
        </div>
      </div>
    </t-card>
    <t-card size="small" class="mt-8px">
      <t-pagination v-model="pageNum" :page-size="20" :total class="mt-8px"/>
    </t-card>
  </div>
</template>
<script lang="ts" setup>

import {VideoListItem, VideoPlugin} from "@/core/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";

const props = defineProps({
  value: {
    type: String,
    default: () => ('')
  },
  plugin: {
    type: Object as PropType<VideoPlugin>,
    required: true
  }
});

const loading = ref(false);
const pageNum = ref(1);
const total = ref(0);
const list = ref<Array<VideoListItem>>([]);

const fetch = () => {
  if (loading.value) return;
  if (!props.plugin) return;
  loading.value = true;
  props.plugin?.getVideos(props.value!, pageNum.value)
    .then(res => {
      pageNum.value  = res.page;
      total.value =res.total;
      list.value = res.data
    }).catch(e => MessageUtil.error("获取资源数据出错", e))
    .finally(() => loading.value = false);

}

watch(() => props.value, () => {
  loading.value = false;
  pageNum.value = 1;
  total.value = 0;
  list.value = [];
  fetch();
});
watch(pageNum, () => fetch());

</script>
<style scoped lang="less">

</style>
