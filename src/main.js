import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { useGlobalStore } from './composables/useGlobalStore.js'

const app = createApp(App)

// Use router
app.use(router)

// Initialize global store on app startup
const { initialize } = useGlobalStore()
initialize().then(() => {
  console.log('🚀 Finance Tracker App initialized with global state management')
}).catch(console.error)

app.mount('#app')
