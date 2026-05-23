import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'pnpm',
  routes: [
    { path: '/login', component: 'login' },
    { path: '/register', component: 'register' },
    { path: '/forgot-password', component: 'forgot-password' },
    {
      path: '/',
      component: '@/layouts/StudentLayout',
      routes: [
        { path: 'equipment', component: 'equipment/index' },
        { path: 'equipment/:id', component: 'equipment/[id]' },
        { path: 'borrow-request', component: 'borrow-request/index' },
        { path: 'borrow-request/create', component: 'borrow-request/create' },
        { path: 'notifications', component: 'notifications/index' },
      ],
    },
    {
      path: '/admin',
      component: '@/layouts/AdminLayout',
      routes: [
        { path: 'dashboard', component: 'admin/dashboard/index' },
        { path: 'requests', component: 'admin/requests/index' },
        { path: 'requests/:id', component: 'admin/requests/[id]' },
        { path: 'equipment', component: 'admin/equipment/index' },
        { path: 'users', component: 'admin/users/index' },
        { path: 'reports', component: 'admin/reports/index' },
      ],
    },
    { path: '/', redirect: '/equipment' },
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
});
