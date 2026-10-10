import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { vuetify } from './plugins/vuetify'
import { router } from './plugins/router'
import './assets/styles/styles.css'

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app')
