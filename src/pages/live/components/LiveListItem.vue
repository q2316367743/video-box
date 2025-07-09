<template>
  <div v-if="item" class="live-list-item" @click="openPlayer(item.name,item.url)">
    <div class="cover">
      <t-image :src="item.logo" :alt="item.name" :width="150" :height="85" fit="contain"
               :preview="false">
        <template #error>
          <div class="flex justify-center items-center h-85px w-full">
            <video-camera1-icon />
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
import {M3u8ChannelWrap} from "@/entities/LiveSource";
import {LoadingIcon, VideoCamera1Icon} from "tdesign-icons-vue-next";
import {useHead} from "@/hooks/HttpRequest";

// -1:加载中、-2:超时
const timeout = ref(0);

const props = defineProps({
  item: Object as PropType<M3u8ChannelWrap>
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

const openPlayer = (name: string, url: string) => {

}
</script>
<style scoped lang="less">
.live-list-item {
  position: relative;
  cursor: pointer;
  padding: 8px;
  transition: 0.2s;
  background-color: var(--color-fill-1);
  border-radius: var(--border-radius-medium);
  border: 1px solid var(--color-border-2);

  &:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgb(var(--primary-6));
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
    background-color: rgb(var(--primary-6));
    padding: 2px 4px;
    color: #fff;
    border-radius: 0 var(--border-radius-medium) 0 var(--border-radius-medium);

    &.red {
      background-color: rgb(var(--danger-6));
    }

    &.orange {
      background-color: rgb(var(--warning-6));
    }

    &.green {
      background-color: rgb(var(--success-6));
    }
  }
}
</style>
