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
        name: 'banner',
        path: '/Banner',
        component: () => import('#/views/homeManage/banner/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: '轮播图管理',
        },
      },
    ]
  }
]

export default routes;