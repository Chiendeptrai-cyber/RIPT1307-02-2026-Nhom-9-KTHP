import type { ReactNode } from 'react';
import { Layout, Menu } from 'antd';

const { Header, Content, Sider } = Layout;

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <Menu
          theme="dark"
          mode="inline"
          items={[
            { key: '1', label: <a href="/admin/dashboard">Dashboard</a> },
            { key: '2', label: <a href="/admin/requests">Yêu cầu</a> },
            { key: '3', label: <a href="/admin/equipment">Thiết bị</a> },
            { key: '4', label: <a href="/admin/users">Người dùng</a> },
            { key: '5', label: <a href="/admin/reports">Báo cáo</a> },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>Admin Portal</Header>
        <Content style={{ margin: 24, background: '#fff', padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
