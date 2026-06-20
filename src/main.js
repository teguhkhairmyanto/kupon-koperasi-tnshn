import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Import router
import './style.css'

const app = createApp(App)
app.use(router) // Gunakan router di Vue instance
app.mount('#app')