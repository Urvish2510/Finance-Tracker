import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Expenses from '../views/Expenses.vue'
import Deposits from '../views/Deposits.vue'
import Categories from '../views/Categories.vue'
import Analytics from '../views/Analytics.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/expenses',
      name: 'Expenses',
      component: Expenses
    },
    {
      path: '/deposits',
      name: 'Deposits',
      component: Deposits
    },
    {
      path: '/categories',
      name: 'Categories',
      component: Categories
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: Analytics
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
})

export default router
