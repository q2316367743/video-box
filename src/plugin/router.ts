import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import {CloudIcon, HomeIcon, InfoCircleIcon, SettingIcon, TvIcon} from 'tdesign-icons-vue-next';

export const routes: Array<RouteRecordRaw> = [{
  name: "主页",
  path: '/',
  component: () => import('@/pages/home/home.vue'),
  meta: {
    icon: HomeIcon,
  }
}, {
  name: '直播',
  path: '/live',
  component: () => import('@/pages/live/index.vue'),
  meta: {
    icon: TvIcon,
  }
}, {
  name: '网盘',
  path: '/disk',
  component: () => import('@/pages/disk/index.vue'),
  meta: {
    icon: CloudIcon,
  }
}, {
  name: '设置',
  path: '/setting',
  component: () => import('@/pages/setting/index.vue'),
  meta: {
    icon: SettingIcon,
  },
  children: [{
    name: '基础设置',
    path: 'base',
    component: () => import('@/pages/setting/page/base/setting-base.vue'),
  }, {
    name: '视频源设置',
    path: 'video-source',
    component: () => import('@/pages/setting/page/video-source/setting-source-video.vue'),
  }, {
    name: '直播源设置',
    path: 'live-source',
    component: () => import('@/pages/setting/page/live-source/setting-source-live.vue'),
  }]
}, {
  name: '关于',
  path: '/about',
  component: () => import('@/pages/about/about.vue'),
  meta: {
    icon: InfoCircleIcon,
  }
}];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

