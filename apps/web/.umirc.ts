import { defineConfig } from '@umijs/max';
import { slinkAntdTheme } from './src/theme/tokens';

export default defineConfig({
  npmClient: 'pnpm',
  styles: ['@/styles/global.less'],

  // Fix MFSU duplicate React instance:
  // MFSU (Module Federation Speed Up) prebuild vendor bundle chứa React riêng.
  // Zustand trong async chunk (AppHeader) resolve React khác → "Cannot read useRef of null".
  // Giải pháp: tắt MFSU để mọi module dùng chung 1 React bundle duy nhất.
  mfsu: false,

  routes: [
    // Auth routes - bọc trong AuthLayout
    {
      path: '/login',
      component: '@/layouts/AuthLayout',
      routes: [{ path: '/login', component: 'login/index' }],
    },
    {
      path: '/register',
      component: '@/layouts/AuthLayout',
      routes: [{ path: '/register', component: 'register/index' }],
    },
    {
      path: '/forgot-password',
      component: '@/layouts/AuthLayout',
      routes: [{ path: '/forgot-password', component: 'forgot-password/index' }],
    },
    // Student routes
    {
      path: '/',
      component: '@/layouts/StudentLayout',
      routes: [
        { path: '', redirect: '/equipment' },
        { path: 'equipment', component: 'equipment/index' },
        { path: 'equipment/:id', component: 'equipment/[id]' },
        { path: 'borrow-request', component: 'borrow-request/index' },
        { path: 'borrow-request/create', component: 'borrow-request/create' },
        { path: 'notifications', component: 'notifications/index' },
      ],
    },
    // Admin routes
    {
      path: '/admin',
      component: '@/layouts/AdminLayout',
      routes: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', component: 'admin/dashboard/index' },
        { path: 'requests', component: 'admin/requests/index' },
        { path: 'requests/:id', component: 'admin/requests/[id]' },
        { path: 'equipment', component: 'admin/equipment/index' },
        { path: 'users', component: 'admin/users/index' },
        { path: 'reports', component: 'admin/reports/index' },
      ],
    },
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
  antd: {
    configProvider: {},
    theme: slinkAntdTheme,
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
});
