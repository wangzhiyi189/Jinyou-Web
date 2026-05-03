import type { RouteRecordRaw } from 'vue-router';


const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: '运营管理',
    },
    name: 'OperationManage',
    path: '/operationManage',
    children: [
      {
        name: 'Station',
        path: '/station',
        component: () => import('#/views/operationManage/station/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '站点管理',
        },
      },
      {
        name: 'Line',
        path: '/line',
        component: () => import('#/views/operationManage/line/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '线路管理',
        },
      },
    ]
  },
]

export default routes;