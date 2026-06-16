import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'company',
        name: 'Company',
        component: () => import('@/views/company/index.vue'),
        meta: { title: '企业管理' }
      },
      {
        path: 'team',
        name: 'Team',
        component: () => import('@/views/team/index.vue'),
        meta: { title: '团队管理' }
      },
      {
        path: 'demand',
        name: 'Demand',
        component: () => import('@/views/demand/index.vue'),
        meta: { title: '需求管理' }
      },
      {
        path: 'quote',
        name: 'Quote',
        component: () => import('@/views/quote/index.vue'),
        meta: { title: '报价管理' }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'case',
        name: 'Case',
        component: () => import('@/views/case/index.vue'),
        meta: { title: '案例管理' }
      },
      {
        path: 'compliance',
        name: 'Compliance',
        component: () => import('@/views/compliance/index.vue'),
        meta: { title: '合规管理' }
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('@/views/log/index.vue'),
        meta: { title: '施工日志' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/demolition'),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title
    ? `${to.meta.title} - 拆除服务平台运营管理`
    : '拆除服务平台运营管理'

  const token = localStorage.getItem('admin_token')

  if (to.meta.requiresAuth !== false && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && token) {
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

export default router
