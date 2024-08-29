import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomePage/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('@/views/SignInPage/SignInView.vue')
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('@/views/SignUpPage/SignUpView.vue')
    },
    {
      path: '/users/:username',
      name: 'profile',
      component: () => import('@/views/ProfilePage/ProfileView.vue')
      // meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // If the route do not exists, redirect to home
  if (!to.matched.length) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
