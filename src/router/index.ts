import { createRouter, createWebHistory } from 'vue-router'

import { HEADERNAV } from '@/assets/lists/HeaderNavList'
import { PROJECTLIST } from '@/assets/lists/ProjectList'

import ProjectsPageContent from '@/components/utils/ProjectsPageContent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

console.log();

HEADERNAV.forEach((item) => {
  if (!item.external) {
    router.addRoute({
      path: item.path,
      name: item.name,
      component: item.component,
    })
  }
})

router.addRoute('Projects', {
  path: '',
  component: ProjectsPageContent
})

PROJECTLIST.forEach((item) => {
  router.addRoute({
    path: `/${item.name}`,
    name: item.title,
    component: item.component,
  })

  if (item.readMore) {
    router.addRoute('Projects', {
      path: item.name,
      component: item.readMoreComp
    })
  }
})



/*router.addRoute({
  path: '/',
  name: 'Home',
  component: HomePage
})*/

/*const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    },
    {
      path: '/projects',
      component: ProjectsPage,
      children: [
        {
          path: '',
          component: ProjectsPageContent
        },
        {
          path: 'led_matrix',
          component: LEDMatrixReadMore
        },
        {
          path: 'perlin_noise_zero_wasm',
          component: PerlinNoiseZeroWasmReadMore
        },
      ]
    },
    {
      path: '/about',
      name: 'About',
      component: AboutPage
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
      component: LEDMatrixControl,
    },
    {
      path: '/perlin_noise_zero_wasm',
      name: 'Wasm Perlin Noise Example 0',
      component: PerlinNoiseZeroWasmControl,
    },
  ]
})*/

export default router
