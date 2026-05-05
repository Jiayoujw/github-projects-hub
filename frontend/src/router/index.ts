import { createRouter, createWebHistory } from 'vue-router'
import { cancelAllRequests } from '@/api/request'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('@/views/explore/index.vue'),
    },
    {
      path: '/trending',
      name: 'trending',
      component: () => import('@/views/trending/index.vue'),
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/analytics/index.vue'),
    },
    {
      path: '/compare',
      name: 'compare',
      component: () => import('@/views/compare/index.vue'),
    },
    {
      path: '/submit',
      name: 'submit',
      component: () => import('@/views/submit/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/project/:id',
      name: 'project-detail',
      component: () => import('@/views/project/detail.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/login.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/auth/callback.vue'),
    },
    {
      path: '/user',
      name: 'user-center',
      component: () => import('@/views/user/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/notifications',
      name: 'user-notifications',
      component: () => import('@/views/user/Notifications.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/share/collection/:id',
      name: 'shared-collection',
      component: () => import('@/views/shared/CollectionView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'], layout: 'admin' },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },
        {
          path: 'projects',
          name: 'admin-projects',
          component: () => import('@/views/admin/Projects.vue'),
        },
        {
          path: 'pending',
          name: 'admin-pending',
          component: () => import('@/views/admin/Pending.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/Users.vue'),
        },
        {
          path: 'tags',
          name: 'admin-tags',
          component: () => import('@/views/admin/Tags.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/views/admin/Categories.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  cancelAllRequests()
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  const requiredRoles = (to.meta.roles as string[] | undefined) ?? []
  if (requiredRoles.length > 0) {
    const userRaw = localStorage.getItem('user')
    const user = userRaw ? JSON.parse(userRaw) : null
    const userRole = user?.role || ''
    if (!requiredRoles.includes(userRole)) {
      next('/')
      return
    }
  }
  next()
})

export default router
