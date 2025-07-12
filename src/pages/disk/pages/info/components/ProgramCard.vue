<template>
  <t-card v-if="program"
          class="program-card rounded-lg border bg-card text-card-foreground shadow-2xs overflow-hidden hover:shadow-lg transition-shadow duration-300"
          data-v0-t="card">
    <div class="relative ">
      <t-image :alt="program.title" class="w-full h-full object-cover" :src="cover" style="min-height: 200px">
        <template #error>
          <img src="/movie.svg" :alt="program.title" style="width: 300px;height: 200px;"/>
        </template>
      </t-image>
      <div class="absolute top-2 right-2" style="z-index: 2">
        <div v-if="program.year"
             class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 bg-black/70 text-white"
             data-v0-t="badge">{{ program.year }}
        </div>
      </div>
      <div class="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm"
           style="z-index: 2"
           v-if="program.userRating">
        <star-icon style="color: var(--td-warning-color)"/>
        <span>{{ program.userRating }}</span></div>
    </div>
    <div class="p-4">
      <h3 class="title" :title="program.title" @click="handlePlay">{{ program.title }}</h3>
      <!--      <p class="text-sm text-muted-foreground mb-2">{{ program.originalTitle }}</p>-->
      <div class="flex flex-wrap gap-1 mb-3">
        <t-tag v-for="g in program.genre" :key="g" theme="primary" variant="outline" shape="round">{{ g }}</t-tag>
      </div>
      <t-paragraph :ellipsis="ellipsis(program.description)">{{ program.description }}
      </t-paragraph>
      <div class="space-y-2 text-xs text-muted-foreground">
        <div class="flex items-center gap-1" v-if="program.directors.length > 0">
          <usergroup-icon/>
          <span>导演: {{ program.directors.join("、") }}</span>
        </div>
        <div class="flex items-center gap-1" v-if="program.release || program.releaseDate">
          <calendar1-icon/>
          <span>首映: {{ program.release || program.releaseDate }}</span>
        </div>
        <div v-if="program.country">
          <span>国家: {{ program.country }}</span>
        </div>
        <div class="flex items-center" v-if="program.actors.length > 0">
          <div class="w-full">
            <div class="text-xs items-center mb-2">
              <usergroup-icon/>
              <span>主演：</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <t-tag v-for="g in program.actors" :key="g.name" theme="default" shape="round">{{
                  g.name
                }}
              </t-tag>
            </div>
          </div>
        </div>
      </div>

    </div>

  </t-card>
</template>
<script lang="ts" setup>
import {DiskProgram} from "@/entities/disk/DiskEntry";
import {Calendar1Icon, StarIcon, UsergroupIcon} from "tdesign-icons-vue-next";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";

const props = defineProps({
  program: {
    type: Object as PropType<DiskProgram>,
    required: true
  },
  plugin: {
    type: Object as PropType<DiskPlugin>,
    required: true
  }
});
const emit = defineEmits(['play']);

const ellipsis = (description: string) => ({
  row: 3,
  tooltipProps: {
    content: description,
    showArrow: false,
  }
})

const cover = computedAsync(async () => {
  if (!props.program.cover) return '';
  return await props.plugin.getFileDownloadLink(props.program.cover)
});
const handlePlay = () => {
  emit('play');
}
</script>
<style scoped lang="less">
.program-card {
  margin-bottom: 8px;

  .title {
    color: var(--td-text-color-primary);
    display: -webkit-box;
    font-size: var(--td-font-size-title-large);
    font-weight: bold;
    margin-block-end: 7px;
    margin-block-start: 0;
    margin-bottom: 7px;
    margin-inline-end: 0;
    margin-inline-start: 0;
    margin-top: 0;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
      color: var(--td-text-color-link);
    }
  }
}
</style>
