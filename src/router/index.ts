import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'

import DesaturationScaleControl from '@/views/projects/DesaturationScaleControl.vue'
import PerlinNoiseZeroControl from '@/views/projects/PerlinNoiseZeroControl.vue'
import CircumcenterControl from '@/views/projects/CircumcenterControl.vue'
import PerlinNoiseOneControl from '@/views/projects/PerlinNoiseOneControl.vue'
import PerlinNoiseOne from '@/components/projects/PerlinNoiseOne.vue'
import LEDMatrixControl from '@/views/projects/LEDMatrixControl.vue'
import PerlinNoiseZeroWasmControl from '@/views/projects/PerlinNoiseZeroWasmControl.vue';

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
      component: DesaturationScaleControl
    },
    {
      path: '/perlin_noise_zero',
      name: 'Perlin Noise Example 0',
      component: PerlinNoiseZeroControl
    },
    {
      path: '/perlin_noise_one',
      name: 'Perlin Noise Example 1',
      component: PerlinNoiseOne
    },
    {
      path: '/circumcenter',
      name: 'Circumcenter',
      component: CircumcenterControl
    },
    {
      path: '/led_matrix',
      name: 'LED Matrix Control',
      component: LEDMatrixControl
    },
    {
      path: '/perlin_noise_zero_wasm',
      name: 'Wasm Perlin Noise Example 0',
      component: PerlinNoiseZeroWasmControl
    },
  ]
})

export default router
