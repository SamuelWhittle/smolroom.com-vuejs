import { createRouter, createWebHistory } from 'vue-router'

import { HEADERNAV } from '@/assets/lists/HeaderNavList'
import { PROJECTLIST } from '@/assets/lists/ProjectList'

import UnderConstruction from '@/components/utils/UnderConstruction.vue'
import ProjectsPageContent from '@/components/utils/ProjectsPageContent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

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
  name: 'ProjectsList',
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

export default router
