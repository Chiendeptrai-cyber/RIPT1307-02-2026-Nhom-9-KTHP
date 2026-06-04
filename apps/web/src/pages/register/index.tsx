import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Form, Input, Space, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { SLINK_COLORS } from '../../theme/tokens';
import { register } from '../../services/auth.service';

const { Title, Text, Link } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Gọi POST /auth/register
      const res = await register(values.fullName, values.email, values.password);
      if (!res.success) {
        throw new Error(res.message ?? 'Đăng ký thất bại');
      }

      message.success('Đăng ký thành công! Hãy đăng nhập để tiếp tục.');
      // Chuyển sang trang login sau 1 giây (dùng navigate thay vì reload trang)
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err: any) {
      let msg = 'Đăng ký thất bại. Vui lòng thử lại.';
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
      {/* Header */}
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
          Tạo tài khoản mới
        </Title>
        <Text type="secondary">Đăng ký để sử dụng hệ thống quản lý thiết bị</Text>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 6 }} />
      )}

      <Form name="register" onFinish={onFinish} layout="vertical" size="large">
        <Form.Item
          name="fullName"
          label={<Text strong>Họ và tên</Text>}
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên!' },
            { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="Nguyễn Văn A"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="Ít nhất 8 ký tự"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<Text strong>Xác nhận mật khẩu</Text>}
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="Nhập lại mật khẩu"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
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
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '16px 0' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          hoặc
        </Text>
      </Divider>

      <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 13 }}>
        Đã có tài khoản?{' '}
        <Link href="/login" style={{ color: SLINK_COLORS.primary, fontWeight: 600 }}>
          Đăng nhập ngay
        </Link>
      </Text>
    </Space>
  );
}
