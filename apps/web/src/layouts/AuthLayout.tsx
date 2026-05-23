import { type ReactNode } from 'react';
import { Card } from 'antd';

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f0f2f5' }}>
      <Card style={{ width: 420 }}>{children}</Card>
    </div>
  );
}
