import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomePage/HomeView.vue'
import SettingsLayout from '@/views/SettingsPage/layout/SettingsLayout.vue'

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
      path: '/settings',
      component: SettingsLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'settings.profile',
          component: () => import('@/views/SettingsPage/components/ProfileForm.vue')
        },
        {
          path: 'account',
          name: 'settings.account',
          component: () => import('@/views/SettingsPage/components/AccountForm.vue')
        }
      ]
    },
    {
      path: '/u/:username',
      name: 'publicProfile',
      component: () => import('@/views/ProfilePage/PublicProfileView.vue')
    },
    {
      path: '/mangas/:mangaid/:mangatitle',
      name: 'items',
      component: () => import('@/views/SingleItemPage/index.vue')
    },
    {
      path: '/verify-email',
      name: 'VerifyEmail',
      component: () => import('@/views/VerifyEmailPage/VerifyEmailView.vue')
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash }
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (!to.matched.length) {
    next({ name: 'home' })
    return
  }

  // Check if the browser supports View Transitions API
  // @ts-ignore
  if (document.startViewTransition) {
    // @ts-ignore
    document.startViewTransition(() => {
      next()
    })
  } else {
    next()
  }

  // next()
})

export default router
