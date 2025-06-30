<template>
  <div class="main">
    <div class="app-container">
      <div class="video-container"></div>
    </div>
    <div class="app-side">
      <div class="side-container" v-if="video">
        <div class="video-title">{{ video.title }}</div>
        <t-alert>剧集</t-alert>
        <t-radio-group :value="index" @change="switchUrl">
          <t-radio v-for="(item, index) in video.playUrls" :key="item.url" :value="index" :label="item.name"/>
        </t-radio-group>
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
console.log('开始', subWindow);
onMounted(() => {
  console.log("挂载")
})
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
