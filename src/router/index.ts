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
import AdminLogin from '../views/AdminLogin.vue'
import AdminLayout from '../views/AdminLayout.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminOrders from '../views/AdminOrders.vue'
import AdminSettings from '../views/AdminSettings.vue'
import AdminMaintenance from '../views/AdminMaintenance.vue'

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
  
  // 管理员路由
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'orders', name: 'AdminOrders', component: AdminOrders },
      { path: 'settings', name: 'AdminSettings', component: AdminSettings },
      { path: 'maintenance', name: 'AdminMaintenance', component: AdminMaintenance }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否是管理员路由
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const isAdmin = localStorage.getItem('is_admin') === 'true'
    if (!isAdmin) {
      next('/admin/login')
      return
    }
  }
  
  next()
})

export default router
