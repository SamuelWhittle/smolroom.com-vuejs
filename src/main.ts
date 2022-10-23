import { createApp } from 'vue'
import router from './router'

import VueCookies from 'vue-cookies'

import App from './App.vue'

import './assets/css/main.css'

import directiveLongpress from '@/directives/longpress'

const app = createApp(App)

app.use(router)
app.use(VueCookies, { expire: '30d'})

directiveLongpress(app)

app.mount('#app')
