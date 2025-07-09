<template>
  <div class="tv-container">
    <div class="tv-content">
      <tv-player :url="url"/>
    </div>
    <div class="tv-side">
      <div class="tv-side-content" v-if="info">
        <t-card>
          <h2 class="text-2xl leading-tight ellipsis">{{ info.name }}</h2>
        </t-card>
        <t-list
          class="play-items"
          ref="list"
          :scroll="{ type: 'virtual', rowHeight: 70, bufferSize: 10, threshold: 10 }"
        >
          <t-list-item v-for="channel in info.channels" :key="channel.url">
            <div
              class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-sm play-item"
              :class="{play: channel.url === url}"
              @click="switchUrl(channel)">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium index">
                  <t-avatar :image="channel.logo"/>
                </div>
                <div>
                  <div class="font-medium ellipsis">{{ channel.name }}</div>
                  <div class="text-sm ellipsis" v-if="channel.group">{{ channel.group }}</div>
                </div>
              </div>
            </div>
          </t-list-item>
        </t-list>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useLiveSourceStore} from "@/store";
import {LiveSourceInfo, M3u8Channel} from "@/entities/LiveSource";
import TvPlayer from "@/nested/tv/components/TvPlayer.vue";

const props = defineProps({
  defaultUrl: {
    type: String,
    required: true
  },
  sourceId: {
    type: Number,
    required: true
  }
});
const info = shallowRef<LiveSourceInfo>();
const url = ref(props.defaultUrl);

const switchUrl = (channel: M3u8Channel) => {
  url.value = channel.url;
}

onMounted(async () => {
  // 获取视频源
  await useLiveSourceStore().init();
  info.value = await useLiveSourceStore().getChannel(props.sourceId);
})
</script>
<style scoped lang="less">
.tv-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;

  .tv-content {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-color-page);
    flex: auto;

  }

  .tv-side {
    position: relative;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
    width: 420px;
    z-index: 50;
    overflow-y: auto;
    padding: 8px;

    .play-items {
      height: calc(100vh - 120px);
      border: 1px solid var(--td-border-level-2-color);
      margin-top: 8px;
      border-radius: var(--td-radius-medium);
    }

    .play-item {
      transition: all 0.2s;
      border: 1px solid transparent;
      width: 256px;
      overflow: hidden;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }

      &.play {
        border-color: var(--td-border-level-2-color);
        background-color: var(--td-bg-color-container-active);
      }

      .index {
        background-color: var(--td-bg-color-component);
        flex: 0 0 35px;

        &.watch {
          background-color: var(--td-success-color);
          color: var(--td-text-color-anti);
        }

        &.play {
          background-color: var(--td-bg-color-component-active);
        }
      }
    }

    .recommend {
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
  }
}
</style>
