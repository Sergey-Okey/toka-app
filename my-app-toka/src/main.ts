import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia' // Import Pinia
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// Создаем приложение
const app = createApp(App)

// Подключаем Pinia
const pinia = createPinia()
app.use(pinia) // Now using only Pinia

// Подключаем роутер
app.use(router)

// Монтируем приложение
app.mount('#app')
