import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'

import DesaturationScale from '@/views/projects/DesaturationScale.vue'
import PerlinNoiseZero from '@/views/projects/PerlinNoiseZero.vue'
import Circumcenter from '@/views/projects/Circumcenter.vue'
import PerlinNoiseOne from '@/views/projects/PerlinNoiseOne.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/projects',
      name: 'Projects',
      component: HomeView
    },
    {
      path: '/about',
      name: 'About',
      component: HomeView
    },
    {
      path: '/desat_scale',
      name: 'Desaturation Scale',
      component: DesaturationScale
    },
    {
      path: '/perlin_noise_zero',
      name: 'Perlin Noise Example 0',
      component: PerlinNoiseZero
    },
    {
      path: '/perlin_noise_one',
      name: 'Perlin Noise Example 1',
      component: PerlinNoiseOne
    },
    {
      path: '/circumcenter',
      name: 'Circumcenter',
      component: Circumcenter
    },
    {
      path: '/led_matrix',
      name: 'LED Matrix Control',
      component: HomeView
    },
  ]
})

export default router
