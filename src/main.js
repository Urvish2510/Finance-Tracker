import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { useDatabase } from './composables/useDatabase.js'

const app = createApp(App)

// Use router
app.use(router)

// Initialize database on app startup
const { initDatabase } = useDatabase()
initDatabase().catch(console.error)

app.mount('#app')
