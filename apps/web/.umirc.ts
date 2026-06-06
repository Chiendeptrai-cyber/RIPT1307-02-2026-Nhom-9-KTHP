import { defineConfig } from '@umijs/max';
import { slinkAntdTheme } from './src/theme/tokens';

export default defineConfig({
  npmClient: 'pnpm',
  styles: ['@/styles/global.less'],

  // Thêm content-hash vào tên chunk file khi build production.
  // Giúp browser cache chunk vĩnh viễn theo hash, không bao giờ dùng chunk cũ sai.
  hash: true,

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
    {
      path: '/reset-password',
      component: '@/layouts/AuthLayout',
      routes: [{ path: '/reset-password', component: 'reset-password/index' }],
    },
    // Root redirect – standalone, no layout wrapper so admin users
    // never briefly see the StudentLayout before being redirected.
    { path: '/', component: 'index' },
    // Student routes
    {
      path: '/',
      component: '@/layouts/StudentLayout',
      routes: [
        { path: 'equipment', component: 'equipment/index' },
        { path: 'equipment/:id', component: 'equipment/[id]' },
        { path: 'borrow-request/create', component: 'borrow-request/create' },
        { path: 'borrow-request', component: 'borrow-request/index' },
        { path: 'notifications', component: 'notifications/index' },
        { path: 'profile', component: 'profile/index' },
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
        { path: 'notifications', component: 'admin/notifications/index' },
        { path: 'profile', component: 'admin/profile/index' },
        { path: 'logs/approval', component: 'admin/logs/approval' },
        { path: 'logs/equipment', component: 'admin/logs/equipment' },
        { path: 'logs/account', component: 'admin/logs/account' },
        { path: 'logs/stock', component: 'admin/logs/stock' },
      ],
    },
  ],
  proxy: {
    '/api': {
      target: process.env.API_PROXY_TARGET ?? 'http://localhost:4000',
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
