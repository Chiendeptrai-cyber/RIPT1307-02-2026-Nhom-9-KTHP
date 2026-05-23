import type { ReactNode } from 'react';
import { Layout, Menu } from 'antd';

const { Header, Content, Sider } = Layout;

interface Props {
  children: ReactNode;
}

export default function StudentLayout({ children }: Props) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <Menu
          theme="dark"
          mode="inline"
          items={[
            { key: '1', label: <a href="/equipment">Thiết bị</a> },
            { key: '2', label: <a href="/borrow-request">Yêu cầu</a> },
            { key: '3', label: <a href="/notifications">Thông báo</a> },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>Student Portal</Header>
        <Content style={{ margin: 24, background: '#fff', padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
