import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('home.title'),
    },
    name: 'HomeManage',
    path: '/homeManage',
    children: [
      {
        name: 'topBanner',
        path: '/topBanner',
        component: () => import('#/views/homeManage/topBanner/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '顶部轮播图管理',
        },
      },
      {
        name: 'banner',
        path: '/Banner',
        component: () => import('#/views/homeManage/banner/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '轮播图管理',
        },
      },
      {
        name: 'recommend',
        path: '/Recommend',
        component: () => import('#/views/homeManage/recommend/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '推荐管理',
        },
      },
    ]
  },
]

export default routes;