import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/projects',
      name: 'projects',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: HomeView
    },
    {
      path: '/desat-scale',
      name: 'desaturation scale',
      component: HomeView
    },
    {
      path: '/perlin-noise1',
      name: 'perlin noise example 1',
      component: HomeView
    },
    {
      path: '/perlin-noise',
      name: 'perlin noise example 0',
      component: HomeView
    },
    {
      path: '/circumcenter',
      name: 'curcumcenter',
      component: HomeView
    },
    {
      path: '/led-matrix',
      name: 'led matrix control',
      component: HomeView
    },
  ]
})

export default router
