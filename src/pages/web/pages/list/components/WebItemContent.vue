<template>
  <div class="web-list-content">
    <t-row :gutter="[16,16]" class="w-full">
      <t-col v-for="view in views" :key="view.id" :span="4" :xs="6" :sm="4" :xl="2" :xxl="1">
        <web-list-item :view="view"/>
      </t-col>
    </t-row>
  </div>
</template>
<script lang="ts" setup>
import {sourceWebList} from "@/apis/source/web";
import WebListItem from "@/pages/web/pages/list/components/WebListItem.vue";
import {SourceWeb} from "@/views/SourceWeb";

const props = defineProps({
  folder: {
    type: String,
    default: '0'
  }
});

const views = ref(new Array<SourceWeb>());

watch(() => props.folder, val => {
  sourceWebList(val).then(res => views.value = res.sort((a, b) => a.order - b.order));
}, {immediate: true})

</script>
<style scoped lang="less">
.web-list-content {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  gap: 8px;
  padding: 8px;
}
</style>
