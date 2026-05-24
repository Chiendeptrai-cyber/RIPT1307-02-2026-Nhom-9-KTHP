import { Outlet } from '@umijs/max';
import { Layout } from 'antd';
import { useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { adminMenuItems } from '@/config/menu.config';
import { ensureMockDataSeeded } from '@/mocks/offlineStorage';

const { Content } = Layout;

export default function AdminLayout() {
  useEffect(() => {
    ensureMockDataSeeded();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#F2F2F2' }}>
      <AppSidebar items={adminMenuItems} title="Quản trị hệ thống" />
      <Layout style={{ background: '#F2F2F2' }}>
        <AppHeader title="Cổng quản trị" />
        <Content style={{ margin: 16, padding: 0, background: '#F2F2F2' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
