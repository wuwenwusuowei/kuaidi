import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { DatabaseService } from './services/databaseService'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

// 初始化数据库连接和示例数据
DatabaseService.initialize().then(isConnected => {
  if (isConnected) {
    console.log('数据库连接成功，应用已准备就绪')
  } else {
    console.warn('数据库连接失败，应用将使用模拟数据运行')
  }
  
  // 初始化认证状态
  const authStore = useAuthStore()
  authStore.checkAuth()
  
  app.mount('#app')
})
