import type { CustomRoute } from '@/assets/types'

import HomePage from '@/views/HomePage.vue'
import ProjectsPage from '@/views/ProjectsPage.vue'
import AboutPage from '@/views/AboutPage.vue'

export const HEADERNAV: CustomRoute[] = [
  {
    id: 0,
    name: 'Home',
    path: "/",
    component: HomePage,
    external: false,
  },
  {
    id: 1,
    name: 'Projects',
    path: "/projects",
    component: ProjectsPage,
    external: false,
  },
  {
    id: 2,
    name: 'About',
    path: "/about",
    component: AboutPage,
    external: false,
  },
  {
    id: 3,
    name: 'Github',
    path: "https://github.com/SamuelWhittle",
    component: {},
    external: true,
  },
]
