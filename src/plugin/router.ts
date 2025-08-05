import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import {
  HomeIcon,
  InternetIcon,
  SettingIcon,
  TvIcon,
  User1Icon
} from 'tdesign-icons-vue-next';
import {emitScrollToTop} from "@/store";

export const routes: Array<RouteRecordRaw> = [{
  name: '主页',
  path: '/',
  redirect: '/home/list'
}, {
  name: '首页',
  path: '/home',
  component: () => import("@/pages/home/index.vue"),
  meta: {
    icon: HomeIcon
  },
  children: [{
    name: '首页列表',
    path: 'list',
    component: () => import('@/pages/home/pages/list/index.vue'),
  }, {
    name: '首页电影',
    path: 'movie',
    component: () => import('@/pages/home/pages/movie/index.vue'),
  }, {
    name: '首页剧集',
    path: 'series',
    component: () => import('@/pages/home/pages/series/index.vue'),
  }]
},
  // {
  //   name: '网盘',
  //   path: '/disk',
  //   component: () => import('@/pages/disk/index.vue'),
  //   meta: {
  //     icon: HomeIcon,
  //     single: true
  //   },
  //   redirect: '/disk/list',
  //   children: [{
  //     name: '网盘列表',
  //     path: 'list',
  //     component: () => import('@/pages/disk/pages/list/index.vue'),
  //   }, {
  //     name: '网盘详情',
  //     path: 'info/:id',
  //     component: () => import('@/pages/disk/pages/info/index.vue'),
  //   }]
  // },
  {
    name: "网络资源",
    path: '/web',
    component: () => import('@/pages/web/web.vue'),
    meta: {
      icon: InternetIcon,
      single: true
    },
    redirect: '/web/list',
    children: [{
      name: '网络资源列表',
      path: 'list',
      component: () => import('@/pages/web/pages/list/index.vue'),
    }, {
      name: '网络资源搜索',
      path: 'search',
      component: () => import('@/pages/web/pages/search/index.vue'),
    }, {
      name: '网络资源详情',
      path: 'info/:id',
      component: () => import('@/pages/web/pages/info/index.vue'),
    }]
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
    component: () => import('@/pages/disk/disk.vue'),
    redirect: '/disk/list',
    children: [{
      name: '网盘列表',
      path: 'list',
      component: () => import('@/pages/disk/list/index.vue'),
    },{
      name: '网盘详情',
      path: 'info/:id',
      component: () => import('@/pages/disk/info/index.vue'),
    }]
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
      name: '直播源设置',
      path: 'live',
      component: () => import('@/pages/setting/page/live-source/setting-source-live.vue'),
    }, {
      name: '网络资源设置',
      path: 'web',
      component: () => import('@/pages/setting/page/web-source/index.vue'),
    }, {
      name: '文件夹设置',
      path: 'folder',
      component: () => import('@/pages/setting/page/web-folder/index.vue'),
    }, {
      name: '网盘设置',
      path: 'disk',
      component: () => import('@/pages/setting/page/disk-source/DiskSource.vue'),
    }]
  }, {
    name: '关于',
    path: '/about',
    component: () => import('@/pages/about/about.vue'),
    meta: {
      icon: User1Icon,
    }
  }, {
    name: '认证-登录',
    path: '/auth/login',
    component: () => import('@/pages/auth/login/index.vue'),
  }, {
    name: '任务',
    path: '/task',
    component: () => import('@/pages/task/list/index.vue'),
  }];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.afterEach(() => emitScrollToTop.trigger().catch(console.error))

