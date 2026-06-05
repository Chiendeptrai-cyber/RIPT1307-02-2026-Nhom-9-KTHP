import { Outlet, useNavigate } from '@umijs/max';
import { Card } from 'antd';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export default function AuthLayout() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/equipment', { replace: true });
      }
    }
  }, [user, token, navigate]);

  if (token && user) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(135deg, #F2F2F2 0%, #e8e8e8 100%)',
      }}
    >
      <Card
        style={{
          width: 440,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: 'none',
        }}
        styles={{ body: { padding: '40px 36px' } }}
      >
        <Outlet />
      </Card>
    </div>
  );
}
