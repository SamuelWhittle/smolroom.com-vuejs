import { createApp } from 'vue'
import router from './router'

import App from './App.vue'

import './assets/css/main.css'

import directiveLongpress from '@/directives/longpress'

const app = createApp(App)

app.use(router)

directiveLongpress(app)

app.mount('#app')
