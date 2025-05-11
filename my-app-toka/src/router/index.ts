import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue' // Импортируем MainLayout
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import TasksView from '@/views/TasksView.vue'
import CalendarView from '@/views/CalendarView.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: MainLayout, // Оборачиваем страницу в MainLayout
    children: [
      {
        path: '',
        name: 'home-view',
        component: HomeView,
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: MainLayout, // Оборачиваем страницу в MainLayout
    children: [
      {
        path: '',
        name: 'dashboard-view',
        component: DashboardView,
      },
    ],
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: MainLayout, // Оборачиваем страницу в MainLayout
    children: [
      {
        path: '',
        name: 'tasks-view',
        component: TasksView,
      },
    ],
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: MainLayout, // Оборачиваем страницу в MainLayout
    children: [
      {
        path: '',
        name: 'calendar-view',
        component: CalendarView,
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: Login, // Эта страница не использует layout
  },
  {
    path: '/register',
    name: 'register',
    component: Register, // Эта страница не использует layout
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
