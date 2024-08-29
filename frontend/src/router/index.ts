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
      path: '/profile',
      name: 'userProfile',
      component: () => import('@/views/ProfilePage/UserProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/u/:username',
      name: 'publicProfile',
      component: () => import('@/views/ProfilePage/PublicProfileView.vue')
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
