import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import {HomeIcon, SettingIcon} from 'tdesign-icons-vue-next';

export const routes: Array<RouteRecordRaw> = [{
  name: "主页",
  path: '/home',
  alias: ['/'],
  component: () => import('@/pages/home/home.vue'),
  meta: {
    icon: HomeIcon,
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
    component: () => import('@/pages/setting/page/base/base.vue'),
  },{
    name: '订阅源设置',
    path: 'source',
    component: () => import('@/pages/setting/page/source/source.vue'),
  }]
}];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

