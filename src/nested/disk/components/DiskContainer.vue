<template>
  <div class="disk">
    <div class="disk-container">
      <disk-player :url="videoUrl"/>
    </div>
    <div class="disk-side">
      <div class="side-container" v-if="program">
        <div class="p-8px">
          <!-- 视频信息 -->
          <t-card class="card">
            <header class="card-header">
              <div class="space-y-3">
                <h2 class="text-2xl leading-tight ellipsis" :title="program.title">{{ program.title }}</h2>
                <div class="text-sm" v-if="program.year || program.releaseDate">
                  {{ program.originalTitle }} ({{ program.year || program.releaseDate }})
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="g in program.tag" :key="g">
                    <t-tag theme="primary" shape="round" size="small" v-if="g">
                      {{ g }}
                    </t-tag>
                  </template>
                </div>
              </div>
            </header>
            <section class="mt-8px">
              <div class="space-y-4">
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-bold">导演：</span>
                    <span class="text-sm">{{ program.directors.join('、') }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-bold">主演：</span>
                    <span class="text-sm">{{ program.actors.map(a => a.name).join('、') }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-bold">简介：</span>
                    <t-paragraph :ellipsis="{row: 3,expandable: true,collapsible: true}" style="margin: -14px 0">
                      <div class="text-sm text-muted-foreground mt-2 leading-relaxed"
                           v-html="program.description"></div>
                    </t-paragraph>
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
                  <t-tabs v-model="sessionId">
                    <t-tab-panel v-for="session in program.sessions" :label="session.name" :value="session.id"
                                 class="mt-8px">
                      <div v-for="(chapter, i) in session.chapters" :key="chapter.id"
                           class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-sm play-item"
                           :class="{play: sessionId === session.id && chapterIndex === i}"
                           @click="switchUrl(session.id, i)">
                        <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium index"
                               :class="{watch: sessionId === session.id && chapterIndex > i, play: sessionId === session.id && chapterIndex === i}">
                            <span v-if="sessionId === session.id && chapterIndex === i">
                              <play-icon size="24px"/>
                            </span>
                            <span v-else>{{ (i + 1) }}</span>
                          </div>
                          <div>
                            <div class="font-medium">{{ chapter.name }}</div>
                            <div class="text-sm" v-if="chapter.description">{{ chapter.description }}</div>
                          </div>
                        </div>
                      </div>
                    </t-tab-panel>
                  </t-tabs>
                </div>
              </t-tab-panel>
              <t-tab-panel label="相关推荐" value="recommendations" v-if="recommends.length > 0">
                <div class="space-y-4 mt-8px">
                  <disk-recommend v-for="recommend in recommends" :key="recommend.id" :plugin="plugin"
                                  :recommend="recommend"/>
                </div>
              </t-tab-panel>
            </t-tabs>
          </t-card>
        </div>
        <t-back-top container=".disk-side"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {shuffle} from "radash";
import {DiskInfo} from "@/entities/disk/DiskEntry";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {useCacheRecordStorage} from "@/hooks/CacheRecordStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import MessageUtil from "@/utils/modal/MessageUtil";
import DiskPlayer from "@/nested/disk/components/DiskPlayer.vue";
import DiskRecommend from "@/nested/disk/components/DiskRecommend.vue";
import {PlayIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  info: {
    type: Object as PropType<DiskInfo>,
    required: true
  },
  plugin: {
    type: Object as PropType<DiskPlugin>,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});
const program = props.info.programs[props.index];
const recommends = shuffle(props.info.programs).slice(0, 10);

const activeTab = ref('episodes');
const createRef = useCacheRecordStorage(LocalNameEnum.KEY_PLAYER_DISK_INDEX);
// 季索引
const sessionId = createRef<string>(`/${props.info.id}/${program.id}`, 'session', program.sessions[0].id);
// 章节索引
const chapterIndex = createRef<number>(`/${props.info.id}/${program.id}`, 'index', 0);

const videoUrl = computedAsync(async () => {
  const session = program.sessions.find(s => s.id === sessionId.value);
  if (!session) {
    MessageUtil.error("未找到该剧集");
    return "";
  }
  const chapter = session.chapters[chapterIndex.value];
  if (!chapter) {
    MessageUtil.error("未找到该章节");
    return "";
  }
  console.log(chapter)
  return props.plugin.getFileDownloadLink(chapter.path)
})

const switchUrl = (res1: string, res2: number) => {
  sessionId.value = res1;
  chapterIndex.value = res2;
}
</script>
<style scoped lang="less">
.disk {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  display: flex;

  .disk-side {
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

  .disk-container {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-color-page);
    flex: auto;

  }
}
</style>
