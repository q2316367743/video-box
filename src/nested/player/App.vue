<template>
  <div class="main">
    <div class="app-container">
      <div class="video-container"></div>
    </div>
    <div class="app-side">
      <div class="side-container" v-if="video">
        <div class="p-8px">
          <!-- 视频信息 -->
          <t-card class="card">
            <header class="card-header">
              <div class="space-y-3">
                <h2 class="text-2xl leading-tight">{{ video.title }}</h2>
                <div class="text-sm text-muted-foreground">
                  {{ video.titleEn }} ({{ video.releaseYear }})
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="g in video.types" :key="g" class="badge badge-secondary text-sm">
                    {{ g }}
                  </span>
                </div>
              </div>
            </header>
            <section class="card-content">
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <t-button theme="primary" class="flex-1" @click="playVideo">
                    <template #icon>
                      <play-icon/>
                    </template>
                    立即播放
                  </t-button>
                  <t-button theme="primary" shape="square" variant="outline">
                    <heart-icon/>
                  </t-button>
                  <t-button theme="primary" shape="square" variant="outline">
                    <share-icon/>
                  </t-button>
                  <t-button theme="primary" shape="square" variant="outline">
                    <download-icon/>
                  </t-button>
                </div>

                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-bold">导演：</span>
                    <span class="text-sm text-muted-foreground">{{ video.writers.join('、') }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-bold">主演：</span>
                    <span class="text-sm text-muted-foreground">{{ video.actors.join('、') }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-bold">简介：</span>
                    <p class="text-sm text-muted-foreground mt-2 leading-relaxed" v-html="video.content"></p>
                  </div>
                </div>
              </div>
            </section>
          </t-card>

          <!-- 剧集列表和推荐 -->
          <t-card class="card mt-8px">
            <t-tabs v-model="activeTab">
              <t-tab-panel label="剧集列表" value="episodes">
                <div class="space-y-2 mt-8px">
                  <div v-for="(episode, i) in video.playUrls" :key="episode.url"
                       class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-sm play-item"
                       :class="{player: index === i}"
                       @click="switchUrl(i)">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium index"
                           :class="[i < index ? 'watch' : index === i ? 'play' : '']">
                        {{ (i < index) ? '✓' : (i + 1) }}
                      </div>
                      <div>
                        <div class="font-medium">{{ episode.name }}</div>
                        <div class="text-sm text-muted-foreground">duration</div>
                      </div>
                    </div>
                  </div>
                </div>
              </t-tab-panel>
              <t-tab-panel label="相关推荐" value="recommendations">
                <div class="space-y-4">
                  <div v-for="movie in video.recommends" :key="movie.id"
                       class="flex gap-4 p-3 rounded-lg hover:bg-muted-50 cursor-pointer transition-colors">
                    <img :src="movie.cover || '/placeholder.svg'" :alt="movie.title"
                         class="w-20 h-28 object-cover rounded-md flex-shrink-0"/>
                    <div class="flex-1 space-y-2">
                      <h4 class="font-medium leading-tight">{{ movie.title }}</h4>
                      <div class="text-sm text-muted-foreground">{{ movie.releaseDate }}</div>
                      <div class="flex items-center gap-3">
                          <span v-for="t in movie.types" class="badge badge-outline text-xs">
                          {{ t }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </t-tab-panel>
            </t-tabs>
          </t-card>
        </div>
        <t-back-top container=".app-side" />
      </div>
    </div>
  </div>


</template>
<script lang="ts" setup>
import Artplayer from 'artplayer';
import {VideoDetail, VideoListItem, VideoPlugin} from "@/core/VideoPlugin";
import {buildVideoPlugin} from "@/core";
import {playFlv, playM3u8} from "@/nested/player/pplugin";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import MessageUtil from "@/utils/modal/MessageUtil";
import {LoadingPlugin, RadioValue} from "tdesign-vue-next";
import {DownloadIcon, HeartIcon, PlayIcon, ShareIcon} from "tdesign-icons-vue-next";

const activeTab = ref('episodes');

let isInit = false
const video = shallowRef<VideoDetail>();
const plugin = shallowRef<VideoPlugin>();
const art = shallowRef<Artplayer>();
const title = useTitle();
const cache = useStorage<Record<string, number>>(LocalNameEnum.KEY_PLAYER_INDEX, {}, utools.dbStorage);
const index = computed(() => cache.value[video.value?.id || ''] || 0);

const initialize = (p: VideoPlugin, v: VideoListItem) => {
  art.value = new Artplayer({
    container: '.video-container',
    url: '',
    type: 'm3u8',
    customType: {
      flv: playFlv,
      m3u8: playM3u8
    },
  });
  // 获取详情
  const lp = LoadingPlugin({
    content: '正在获取详情'
  });
  p.getDetail(v)
    .then((res) => {
      video.value = res;
      const index = cache.value[res.id] || 0;
      title.value = res.title + ' - ' + res.playUrls[index].name;
      art.value?.switchUrl(res.playUrls[index].url);
    })
    .catch(e => MessageUtil.error("获取视频详情失败", e))
    .finally(() => lp.hide());
}

const switchUrl = (index: RadioValue) => {
  index = Number(index);
  if (!video.value) return;
  cache.value[video.value.id] = index;
  const item = video.value.playUrls[index];
  title.value = video.value.title + '-' + item.name;
  art.value?.switchUrl(item.url);
}

const subWindow = window.preload.ipcRenderer.buildSubWindow('player');
subWindow.receiveMsg(({event, data}) => {
  console.log(event, data)
  if (event === 'initialize') {
    if (isInit) return;
    isInit = true;
    console.log('初始化', data);
    plugin.value = buildVideoPlugin(data.source);
    initialize(plugin.value, data.video);
    subWindow.sendMsg({event: 'initialized', data: null})
  }
});
const playVideo = () => {
  if (!art.value) return;
  art.value.play();
}
</script>
<style scoped lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  display: flex;

  .app-side {
    position: relative;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
    width: 420px;
    z-index: 50;
    overflow-y: auto;

    .play-item {
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }

      &.player {
        border-color: var(--td-border-level-2-color);
        background-color: var(--td-bg-color-container-active);
      }

      .index {
        background-color: var(--td-bg-color-component);

        &.watch {
          background-color: var(--td-success-color);
          color: var(--td-text-color-anti);
        }

        &.play {
          background-color: var(--td-bg-color-component-active);
        }
      }
    }
  }

  .app-container {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-color-page);
    flex: auto;

    .video-container {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
