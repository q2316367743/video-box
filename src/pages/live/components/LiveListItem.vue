<template>
  <div v-if="item" class="live-list-item" @click="openPlayer(item)">
    <div class="cover">
      <t-image :src="item.logo" :alt="item.name" :width="150" :height="85" fit="contain"
               :preview="false">
        <template #error>
          <div class="flex justify-center items-center h-85px w-full">
            <video-camera1-icon/>
          </div>
        </template>
      </t-image>
    </div>
    <div class="title ellipsis">
      {{ item.name }}
    </div>
    <div @click.stop="onTimeout()" class="badge" v-if="timeout === -1">
      <loading-icon/>
      加载中
    </div>
    <div @click.stop="onTimeout()" class="badge red" v-else-if="timeout === -2">超时</div>
    <div @click.stop="onTimeout()" class="badge green" v-else-if="timeout > 0 && timeout < 2000">
      {{ timeout }}ms
    </div>
    <div @click.stop="onTimeout()" class="badge orange" v-else-if="timeout > 2000">{{ timeout }}ms</div>
  </div>
</template>
<script lang="ts" setup>
import {LoadingIcon, VideoCamera1Icon} from "tdesign-icons-vue-next";
import {M3u8Channel, M3u8ChannelWrap} from "@/entities/LiveSource.js";
import {useHead} from "@/hooks/HttpRequest.js";
import {useTvWindowStore} from "@/store/index.js";

// -1:加载中、-2:超时
const timeout = ref(0);

const props = defineProps({
  item: Object as PropType<M3u8ChannelWrap>,
  active: {
    type: Number,
    default: 0
  }
});

onMounted(onTimeout);

function onTimeout() {
  if (!props.item) {
    return;
  }
  if (props.item.disableTimeout) {
    // 禁用超时检测
    return;
  }
  if (timeout.value === -1) {
    // 正在加载中
    return;
  }
  timeout.value = -1;
  const now = Date.now();
  useHead(props.item.url, {}, {
    timeout: 5000
  })
    .then(() => {
      timeout.value = Date.now() - now;
    })
    .catch(e => {
      console.error(e);
      timeout.value = -2;
    })
}

const openPlayer = (item: M3u8Channel) => {
  useTvWindowStore().openTvWindow(props.active, item);

}
</script>
<style scoped lang="less">
.live-list-item {
  position: relative;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  border: 1px solid var(--td-border-level-2-color);

  &:hover {
    box-shadow: var(--td-shadow-2);
    border: 1px solid var(--td-brand-color);
  }

  .cover {
    width: 150px;
    height: 85px;
    object-fit: cover;
    overflow-y: hidden;

    .lazy__img {
      width: 150px;
      height: 85px;
    }

    :deep(.t-image__error) {
      height: 85px;
    }
  }

  .title {
    width: 150px;
    margin-top: 6px;
    text-align: center;
  }

  .badge {
    position: absolute;
    top: -1px;
    right: -1px;
    background-color: var(--td-brand-color);
    padding: 2px 4px;
    color: #fff;
    border-radius: 0 var(--td-radius-medium) 0 var(--td-radius-medium);

    &.red {
      background-color: var(--td-error-color);
    }

    &.orange {
      background-color: var(--td-warning-color);
    }

    &.green {
      background-color: var(--td-success-color);
    }
  }
}
</style>
