import { Outlet } from '@umijs/max';
import { Layout } from 'antd';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { studentMenuItems } from '@/config/menu.config';

const { Content } = Layout;

export default function StudentLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#F2F2F2' }}>
      <AppSidebar items={studentMenuItems} title="Quản lý thiết bị" />
      <Layout style={{ background: '#F2F2F2' }}>
        <AppHeader title="Cổng sinh viên" />
        <Content style={{ margin: 16, padding: 0, background: '#F2F2F2' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
