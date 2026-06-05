import { Outlet, useNavigate } from '@umijs/max';
import { Layout } from 'antd';
import { useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { studentMenuItems } from '@/config/menu.config';
import { ensureMockDataSeeded } from '@/mocks/offlineStorage';
import { useAuthStore } from '@/stores/auth.store';

const { Content } = Layout;

export default function StudentLayout() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  useEffect(() => {
    ensureMockDataSeeded();
  }, []);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, token, navigate]);

  if (!token || !user || user.role === 'admin') {
    return null;
  }

  return (
    <Layout hasSider style={{ height: '100vh', background: '#F2F2F2', overflow: 'hidden' }}>
      <AppSidebar items={studentMenuItems} title="Quản lý thiết bị" />
      <Layout style={{ background: '#F2F2F2', minWidth: 0, overflow: 'hidden' }}>
        <AppHeader title="Cổng sinh viên" />
        <Content style={{ margin: 16, padding: 0, background: '#F2F2F2', overflowX: 'hidden', overflowY: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
