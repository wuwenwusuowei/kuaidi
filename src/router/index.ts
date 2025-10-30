import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import PublishOrder from '../views/PublishOrder.vue'
import TaskHall from '../views/TaskHall.vue'
import OrderManagement from '../views/OrderManagement.vue'
import PaymentSettings from '../views/PaymentSettings.vue'
import HelpGuide from '../views/HelpGuide.vue'
import Profile from '../views/Profile.vue'
import HelpGuide from '../views/HelpGuide.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/publish', name: 'PublishOrder', component: PublishOrder },
  { path: '/task-hall', name: 'TaskHall', component: TaskHall },
  { path: '/orders', name: 'OrderManagement', component: OrderManagement },
  { path: '/payment-settings', name: 'PaymentSettings', component: PaymentSettings },
  { path: '/help', name: 'HelpGuide', component: HelpGuide },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/help', name: 'HelpGuide', component: HelpGuide }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
