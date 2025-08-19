<template>
  <div :style="{ transformOrigin: '50% 50%', backgroundColor: source.primary_color }" class="news-item">
    <div class="news-item-header">
      <div class="news-item-header__left">
        <img class="w-8 h-8 rounded-full bg-cover" :src="source.logo"/>
        <span class="flex flex-col">
          <span class="flex items-center gap-2">
            <span class="news-item-header__title" @click="openWebsite">{{ source.title }}</span>
            <t-tag class="news-item-header__tag" v-if="source.tag" size="small" theme="primary">{{
              source.tag
            }}</t-tag>
          </span>
          <span class="news-item-header__date">{{ date }}</span></span>
      </div>
      <div class="news-item-header__opt">
        <div class="btn">
          <refresh-icon size="16px" :class="{ spin: loading }" @click="refresh" />
        </div>
      </div>
    </div>
    <div class="news-item-container">
      <scrollbar>
        <template v-for="(record, index) in records" :key="record.id">
          <a class="news-item-time" v-if="record.date" :href="record.url" target="_blank">
            <div class="news-item-time__date">
              <span class="split">— </span>
              <span class="date">{{ prettyDate(record.date) }}</span>
            </div>
            <div class="news-item-time__content">
              <span class="news-item-time__title" :class="{ read: record.read }">{{ record.title }}</span>
              <span class="news-item-time__tip" v-if="record.tip">{{ record.tip }}</span>
              <span class="news-item-time__tag" v-if="tag">
                <img :src="tag.text" alt="标签" class="tag-img" v-if="tag.type === 'img'" />
                <span v-else-if="tag.type === 'outline'" class="tag tag-outline"
                  :style="{ borderColor: tag.color, color: tag.color }">{{ tag.text }}
                </span>
                <span v-else class="tag" :style="{ backgroundColor: tag.color }">
                  {{ tag.text }}
                </span>
              </span>
            </div>
          </a>
          <a class="news-item-record" :href="record.url" target="_blank" :title="record.hover" v-else>
            <div class="news-item-record__index">
              {{ index + 1 }}
            </div>
            <div class="news-item-record__content">
              <span class="news-item-record__title" :class="{ read: record.read }">{{ record.title }}</span>
              <span class="news-item-record__tip" v-if="record.tip">{{ record.tip }}</span>
              <span class="news-item-record__tag" v-if="tag">
                <img :src="tag.text" alt="标签" class="tag-img" v-if="tag.type === 'img'" />
                <span v-else-if="tag.type === 'outline'" class="tag tag-outline"
                  :style="{ borderColor: tag.color, color: tag.color }">{{ tag.text }}
                </span>
                <span v-else class="tag" :style="{ backgroundColor: tag.color }">
                  {{ tag.text }}
                </span>
              </span>
            </div>
          </a>
        </template>
      </scrollbar>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { MenuApplicationIcon, RefreshIcon } from "tdesign-icons-vue-next";
import { prettyDate } from "@/utils/lang/FormatUtil";
import { SourceNewsItem, SourceNewsRecordTag } from '@/types/SourceNews';
import { pluginNewsRefresh, pluginNewsInfo } from "@/apis/plugin/news";

const props = defineProps({
  source: {
    type: Object as PropType<SourceNewsItem>,
    required: true
  }
});

const item = ref(props.source);

const records = computed(() => item.value.records);

const loading = ref(false);

const tag = computed<SourceNewsRecordTag | null>(() => {
  if (props.source.tag) {
    return JSON.parse(props.source.tag);
  }
  return null;
})


const date = ref('很久很久以前更新');

const renderDate = () => date.value = (prettyDate(props.source.updated_at) + '更新');

useIntervalFn(renderDate, 1000 * 60, { immediate: true, immediateCallback: true });

function openWebsite() {
  window.open(props.source.website);
}
const refresh = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await pluginNewsRefresh(item.value.id)
    item.value = await pluginNewsInfo(item.value.id);
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped lang="less">

html[theme-mode="dark"] {
  .news-item {
    --nn-app-header-bg-color: rgba(0, 0, 0, 0.35);
    --nn-news-container-bg-color: rgba(0, 0, 0, 0.55);
    --nn-news-item-bg-color-hover: rgba(0, 0, 0, 0.35);
    --nn-news-item-bg-color-index: rgba(0, 0, 0, 0.35);
    --nn-news-tag-bg-color: rgba(0, 0, 0, 0.55);
  }
}

.news-item {
  height: 430px;
  display: flex;
  flex-direction: column;
  border-radius: var(--td-radius-large);
  cursor: default;
  transition: opacity 0.3s ease-in-out;
  padding: 1rem;
  width: 300px;
  --nn-app-header-bg-color: rgba(255, 255, 255, 0.35);
  --nn-news-container-bg-color: rgba(255, 255, 255, 0.55);
  --nn-news-item-bg-color-hover: rgba(255, 255, 255, 0.35);
  --nn-news-item-bg-color-index: rgba(255, 255, 255, 0.35);
  --nn-news-tag-bg-color: rgba(255, 255, 255, 0.55);


  .news-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0.5rem 0.5rem;
    user-select: none;

    &__left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    &__title {
      font-size: var(--td-font-size-title-large);
      font-weight: bold;
      line-height: 24px;
      cursor: pointer;
      transition: color 0.3s ease-in-out;

      &:hover {
        color: var(--td-text-color-link);
      }
    }

    &__date {
      font-size: var(--td-font-size-body-small);
      color: var(--td-text-color-secondary);
    }


    &__tag {
      background-color: var(--nn-news-tag-bg-color);
      margin-left: 4px;
    }

    &__opt {
      display: flex;
      align-items: center;
      gap: 1rem;

      .btn {
        cursor: pointer;
        color: var(--td-text-color-primary);
        transition: color 0.3s ease-in-out;

        &:hover {
          color: var(--td-text-color-secondary);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        &.drag {
          cursor: grab;

          &:active {
            cursor: grabbing;
          }
        }
      }
    }
  }

  .news-item-container {
    overflow: auto;
    height: 100%;
    border-radius: var(--td-radius-large);
    background-color: var(--nn-news-container-bg-color);

    .news-item-record {
      display: flex;
      padding: 3px 0.5rem;
      border-radius: var(--td-radius-default);
      transition: background-color 0.3s ease-in-out;
      cursor: pointer;
      font-size: var(--td-font-size-title-medium);
      line-height: 24px;

      &:hover {
        background-color: var(--nn-news-item-bg-color-hover);
      }

      &:first-child {
        margin-top: 0.5rem;
      }

      &:last-child {
        margin-bottom: 0.5rem;
      }

      &__index {
        font-size: 0.875rem;
        line-height: 1.25rem;
        background-color: var(--nn-news-item-bg-color-index);
        border-radius: var(--td-radius-default);
        justify-content: center;
        align-items: center;
        display: flex;
        min-width: 1.5rem;
      }

      &__content {
        align-items: center;
        margin-left: 6px;
      }


      &__title {

        &.read {
          color: var(--td-text-color-placeholder);
        }
      }

      &__tip {
        font-size: var(--td-font-size-title-small);
        margin-left: 4px;
        color: var(--td-text-color-placeholder);
      }

      &__tag {
        margin-left: 5px;
        height: 16px;
        font-size: var(--td-font-size-body-small);


        .tag {
          height: 16px;
          line-height: 16px;
          padding: 0 2px;
          border-radius: var(--td-radius-default);
          color: var(--td-text-color-anti);

          &.tag-outline {
            border-style: solid;
            border-width: 1px;
            height: 15px;
            line-height: 14px;
            font-size: 10px;
          }
        }

        .tag-img {
          height: 16px;
          vertical-align: text-top;
        }
      }
    }

    .news-item-time {
      display: flex;
      flex-direction: column;
      border-radius: var(--td-radius-default);
      transition: background-color 0.3s ease-in-out;
      cursor: pointer;
      font-size: var(--td-font-size-title-medium);
      line-height: 24px;
      border-left: 1px solid var(--td-border-level-1-color);
      margin-left: 8px;
      padding: 3px 0.5rem 3px 0;

      &:first-child {
        margin-top: 0.5rem;
      }

      &:last-child {
        margin-bottom: 0.5rem;
      }

      &__date {
        font-size: var(--td-font-size-body-small);
        color: var(--td-text-color-placeholder);
        user-select: none;

        .split {
          color: var(--td-border-level-1-color);
        }

        .date {
          margin-left: 4px;
        }
      }

      &__content {
        align-items: center;
        margin-left: 6px;
        transition: background-color 0.3s ease-in-out;
        padding: 0 4px;
        border-radius: var(--td-radius-default);

        &:hover {
          background-color: var(--nn-news-item-bg-color-hover);
        }
      }


      &__title {

        &.read {
          color: var(--td-text-color-placeholder);
        }
      }

      &__tip {
        font-size: var(--td-font-size-title-small);
        margin-left: 4px;
        color: var(--td-text-color-placeholder);
      }

      &__tag {
        margin-left: 5px;
        height: 16px;
        font-size: var(--td-font-size-body-small);


        .tag {
          height: 16px;
          line-height: 16px;
          padding: 0 2px;
          border-radius: var(--td-radius-default);
          color: var(--td-text-color-anti);

          &.tag-outline {
            border-style: solid;
            border-width: 1px;
            height: 15px;
            line-height: 14px;
            font-size: 10px;
          }
        }

        .tag-img {
          height: 16px;
          vertical-align: text-top;
        }
      }
    }

    .news-item-record,
    .news-item-time {
      color: var(--td-text-color-primary);
      text-decoration: none;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
