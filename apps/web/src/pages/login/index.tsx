import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useAuthStore } from '../../stores/auth.store';
import { SLINK_COLORS } from '../../theme/tokens';
import { login, getMe } from '../../services/auth.service';
import type { UserRole } from '@equipment-mgmt/shared';

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Gọi POST /auth/login → nhận accessToken
      const loginRes = await login(values.email, values.password);
      if (!loginRes.success || !loginRes.data?.accessToken) {
        throw new Error(loginRes.message ?? 'Đăng nhập thất bại');
      }

      // 2. Lưu token vào localStorage (http interceptor đính vào mọi request tiếp theo)
      localStorage.setItem('access_token', loginRes.data.accessToken);

      // 3. Gọi GET /auth/me → nhận thông tin user (role, fullName, email)
      const meRes = await getMe();
      if (!meRes.success || !meRes.data) {
        throw new Error('Không lấy được thông tin tài khoản');
      }

      const { userId, role, fullName, email, phoneNumber, avatarUrl } = meRes.data;

      // 4. Lưu vào Zustand store (persist vào localStorage)
      setAuth(
        { id: userId, fullName, email, role: role as UserRole, phoneNumber, avatarUrl },
        loginRes.data.accessToken,
      );

      // 5. Redirect theo role (dùng navigate để chuyển trang mượt mà không load lại trang)
      navigate(role === 'admin' ? '/admin/dashboard' : '/equipment', { replace: true });
    } catch (err: any) {
      let msg = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
      if (err?.response?.data) {
        const resData = err.response.data;
        if (resData.errors) {
          msg = Object.values(resData.errors)
            .flatMap((messages: any) => messages)
            .join('; ');
        } else if (resData.message) {
          msg = resData.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={0} style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${SLINK_COLORS.primary} 0%, #8B0000 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(191, 4, 4, 0.3)',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '0.5px' }}>
            PTIT
          </span>
        </div>
        <Title level={3} style={{ marginBottom: 4, color: SLINK_COLORS.textBase }}>
          Chào mừng trở lại
        </Title>
        <Text type="secondary">Đăng nhập vào hệ thống quản lý thiết bị</Text>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 6 }} />
      )}

      <Form name="login" onFinish={onFinish} layout="vertical" size="large">
        <Form.Item
          name="email"
          label={<Text strong>Email</Text>}
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="your@ptit.edu.vn"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<Text strong>Mật khẩu</Text>}
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          style={{ marginBottom: 8 }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="••••••••"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <Link href="/forgot-password" style={{ color: SLINK_COLORS.info, fontSize: 13 }}>
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 44,
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
              background: SLINK_COLORS.primary,
              borderColor: SLINK_COLORS.primary,
              boxShadow: '0 4px 12px rgba(191, 4, 4, 0.3)',
            }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '16px 0' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          hoặc
        </Text>
      </Divider>

      <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 13 }}>
        Chưa có tài khoản?{' '}
        <Link href="/register" style={{ color: SLINK_COLORS.primary, fontWeight: 600 }}>
          Đăng ký ngay
        </Link>
      </Text>
    </Space>
  );
}
