import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: '车票管理',
    },
    name: 'TicketManage',
    path: '/ticketManage',
    children: [
      {
        name: 'schedule',
        path: '/schedule',
        component: () => import('#/views/ticketManage/schedule/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: '车次管理',
        },
      },
    ]
  }
]

export default routes;