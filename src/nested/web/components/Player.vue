<template>
  <div class="player">
    <div class="player-container">
      <video-container :url="videoUrl" @next="handleNext"/>
    </div>
    <div class="player-side">
      <t-tabs v-model="active">
        <t-tab-panel value="info" label="基本信息"/>
        <t-tab-panel value="list" label="选集"/>
        <t-tab-panel value="recommend" label="推荐" v-if="(video?.recommends || []).length > 0"/>
        <t-tab-panel value="search" label="更多源" v-if="searchItems.length > 0"/>
      </t-tabs>
      <div class="side-container" v-if="video">
        <!-- 视频信息 -->
        <div class="card relative" v-if="active === 'info'">
          <header class="card-header">
            <div class="space-y-3">
              <h2 class="text-2xl leading-tight mt-0" :title="video.title">{{ video.title }}</h2>
              <div class="text-sm" v-if="video.subtitle || video.releaseYear">
                {{ video.subtitle }} ({{ video.releaseYear }})
              </div>
              <div class="flex flex-wrap gap-2">
                <template v-for="g in video.types" :key="g">
                  <t-tag theme="primary" shape="round" size="small" v-if="g">
                    {{ g }}
                  </t-tag>
                </template>
              </div>
              <div v-if="s">
                <t-tag theme="primary">{{ s.title }}</t-tag>
              </div>
            </div>
          </header>
          <section class="mt-8px">
            <div class="space-y-4">
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-bold">导演：</span>
                  <span class="text-sm">{{ video.writers.join('、') }}</span>
                </div>
                <div>
                  <span class="text-sm font-bold">主演：</span>
                  <span class="text-sm">{{ video.actors.join('、') }}</span>
                </div>
                <div>
                  <span class="text-lg font-bold">简介：</span>
                  <div class="text-sm text-muted-foreground mt-2 leading-relaxed" v-html="video.content"></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 剧集列表 -->
        <div class="card" v-else-if="active === 'list'">
          <div class="space-y-2">
            <t-tabs v-model="chapterTabId">
              <t-tab-panel v-for="chapter in video.chapters" :label="chapter.name" :value="chapter.id"
                           class="mt-8px">
                <t-row :gutter="[8,8]">
                  <t-col :span="4" v-for="(episode, i) in chapter.items" :key="episode.url">
                    <div class="play-item"
                         :class="{play: chapterId === chapter.id && index === i}"
                         @click="switchUrl(chapter.id, i)">
                      <div class="gap-4">
                            <span v-if="chapterId === chapter.id && index === i">
                              <play-icon size="24px"/>
                            </span>
                        <span v-else>{{ episode.name }}</span>
                      </div>
                    </div>
                  </t-col>
                </t-row>
              </t-tab-panel>
            </t-tabs>
          </div>
        </div>

        <!-- 推荐 -->
        <div class="card" v-else-if="active === 'recommend'">
          <div class="space-y-4">
            <div v-for="movie in video.recommends" :key="movie.id"
                 class="flex gap-4 p-3 rounded-lg  cursor-pointer transition-colors recommend">
              <img :src="movie.cover || '/placeholder.svg'" :alt="movie.title"
                   class="w-20 h-28 object-cover rounded-md flex-shrink-0"/>
              <div class="flex-1">
                <h4 class="font-medium leading-tight m-0">{{ movie.title }}</h4>
                <div class="text-sm text-muted-foreground">{{ movie.releaseDate }}</div>
                <div class="flex items-center gap-3">
                  <t-tag theme="primary" shape="round" size="small" v-for="t in movie.types">
                    {{ t }}
                  </t-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 更多搜索项 -->
        <div class="card" v-else-if="active === 'search'">
          <search-item v-for="(item, index) in searchItems" :key="`${item.source.id}:${item.item.id}`"
                       :item="item" @choose="chooseItem(index)" :video-id="videoId" :source-id="sourceId"/>
        </div>
        <t-back-top container=".side-container"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {PlayIcon} from "tdesign-icons-vue-next";
import {VideoDetail} from "@/modules/video/VideoPlugin";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useCacheRecordStorage} from "@/hooks/CacheRecordStorage";
import {isEmptyArray} from "@/utils/lang/FieldUtil";
import {SearchResultItem} from "@/pages/home/types/SearchResult";
import {SourceWeb} from "@/views/SourceWeb";
import VideoContainer from "@/nested/web/components/VideoContainer.vue";
import SearchItem from "@/nested/web/components/SearchItem.vue";

const props = defineProps({
  sourceId: String,
  videoId: String,
  v: {
    type: Object as PropType<VideoDetail>,
    required: true
  },
  s: {
    type: Object as PropType<SourceWeb>,
  },
  searchItems: {
    type: Array as PropType<Array<SearchResultItem>>,
    default: () => []
  }
});
const emit = defineEmits(['choose']);

const active = ref('info');
const video = shallowRef<VideoDetail>();
const createRef = useCacheRecordStorage(LocalNameEnum.KEY_PLAYER_VIDEO_INDEX);
const chapterId = createRef<string>(`/${props.sourceId}/${props.videoId}`, 'chapter', '');
const index = createRef<number>(`/${props.sourceId}/${props.videoId}`, 'index', 0);

const title = useTitle();
const videoUrl = ref('');

const chapterTabId = ref(chapterId.value);


const playItem = (name: string, url: string) => {
  title.value = video.value?.title + '-' + name;
  videoUrl.value = url;
}

const switchUrl = (res1: string, res2: number) => {
  if (!video.value) return;
  if (isEmptyArray(video.value.chapters)) return MessageUtil.error("播放章节为空");
  const target = res1 || video.value.chapters[0]?.name;
  const idx = res2 || 0;

  for (let chapter of video.value.chapters) {
    if (chapter.id === target) {
      if (isEmptyArray(chapter.items)) return MessageUtil.error("章节目录为空");
      const {name, url} = chapter.items[idx];
      // 播放音乐
      playItem(name, url);
      // 赋值
      chapterId.value = chapter.id;
      index.value = idx;
      return;
    }
  }
  // 没找到
  const first = video.value.chapters[0];
  if (isEmptyArray(first.items)) return MessageUtil.error("默认章节目录为空");
  const {name, url} = first.items[0];
  // 播放音乐
  playItem(name, url);
  // 赋值
  chapterId.value = first.id;
  index.value = 0;
}

const handleNext = () => {
  switchUrl(chapterId.value, index.value + 1);
}

const chooseItem = (index: number) => {
  emit('choose', index);
}

onMounted(() => {
  const {v} = props;
  title.value = v.title
  // 获取详情
  video.value = v;
  // 默认值
  if (!chapterId.value) chapterId.value = v.chapters[0]?.id;
  chapterTabId.value = chapterId.value;
  switchUrl(chapterId.value, index.value);
});
</script>
<style scoped lang="less">
.player {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  display: flex;

  .player-side {
    position: relative;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
    width: 420px;
    height: 100vh;
    z-index: 50;
    overflow-y: auto;

    .side-container {
      position: absolute;
      top: 48px;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 8px;
      overflow: auto;
    }


    .play-item {
      transition: all 0.2s;
      border: 1px solid transparent;
      border-radius: var(--td-radius-default);
      background-color: var(--td-bg-color-component);
      height: 24px;
      line-height: 24px;
      text-align: center;
      cursor: pointer;
      padding: 4px 8px;

      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }

      &.play {
        border-color: var(--td-border-level-2-color);
        background-color: var(--td-bg-color-component-active);
        color: var(--td-success-color);
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

  .player-container {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-color-page);
    flex: auto;
  }

}
</style>
