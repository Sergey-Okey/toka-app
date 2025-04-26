import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// Создаем приложение
const app = createApp(App)

// Подключаем Pinia

// Подключаем Vuex (если еще нужен)
app.use(store)

// Подключаем роутер
app.use(router)

// Монтируем приложение
app.mount('#app')
