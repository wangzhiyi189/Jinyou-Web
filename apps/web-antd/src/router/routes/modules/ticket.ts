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
        name: 'scheduleTemplate',
        path: '/scheduleTemplate',
        component: () => import('#/views/ticketManage/scheduleTemplate/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '车次模板管理',
        },
      },
      {
        name: 'schedule',
        path: '/schedule',
        component: () => import('#/views/ticketManage/schedule/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '车次管理',
        },
      },
      {
        name: 'order',
        path: '/order',
        component: () => import('#/views/ticketManage/order/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: '订单管理',
        },
      },
    ]
  }
]

export default routes;