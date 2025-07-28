<template>
  <div class="web-list-item">
    <div class="top">
      <t-link  class="title" :title="sourceWeb.title">{{ sourceWeb.title }}</t-link>
      <t-tooltip :content="toDateTimeString(sourceWeb.refresh_time)">
        <t-tag v-if="sourceWeb.delay_time < 0" color="var(--td-gray-color-12)">超时</t-tag>
        <t-tag v-else-if="sourceWeb.delay_time === 0" theme="primary">未检测</t-tag>
        <t-tag v-else-if="sourceWeb.delay_time < 1000" theme="success">{{ sourceWeb.delay_time }}ms</t-tag>
        <t-tag v-else-if="sourceWeb.delay_time < 5000" theme="warning">{{ sourceWeb.delay_time }}ms</t-tag>
        <t-tag v-else theme="danger">{{ sourceWeb.delay_time }}ms</t-tag>
      </t-tooltip>
    </div>
    <div class="actions">
      <t-button theme="primary" @click="openInfo()">打开</t-button>
      <t-button theme="primary" variant="outline" :loading="loading" @click="handleRefresh()">测速</t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {SourceWeb} from "@/views/SourceWeb";
import {toDateTimeString} from "@/utils/lang/FormatUtil";
import {sourceWebInfo, sourceWebRefresh} from "@/apis/source/web";

const props = defineProps({
  view: {
    type: Object as PropType<SourceWeb>,
    required: true,
  }
});

const router = useRouter();

const sourceWeb = ref(props.view);
const loading = ref(false);

const openInfo = () => {
  router.push(`/web/info/${sourceWeb.value.id}`)
}

const handleRefresh = () => {
  if (loading.value) return;
  loading.value = true;
  sourceWebRefresh(sourceWeb.value.id)
    .then(() => sourceWebInfo(props.view.id).then(res => sourceWeb.value = res))
    .finally(() => loading.value = false);
}
</script>
<style scoped lang="less">
.web-list-item {
  background: var(--td-bg-color-component);
  border-radius: var(--td-radius-medium);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: .2s;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;


    .online {
      background: #005c5c;
      color: var(--accent);
    }

    .offline {
      background: #5c0000;
      color: var(--danger);
    }
  }

  .title {
    font-size: 17px;
    font-weight: 600;
  }


  .actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;

    .web-list-item__move {
      margin-left: auto;
      height: 32px;
      width: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

  }
}

</style>
