import { LockOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Space, Typography, message } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { SLINK_COLORS } from '../../theme/tokens';
import { resetPassword } from '../../services/auth.service';

const { Title, Text, Link } = Typography;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const tokenFromUrl = searchParams.get('token') || '';

  useEffect(() => {
    if (tokenFromUrl) {
      form.setFieldsValue({ token: tokenFromUrl });
    }
  }, [tokenFromUrl, form]);

  const onFinish = async (values: { token: string; passwordStr: string }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await resetPassword(values.token, values.passwordStr);
      if (!res.success) {
        throw new Error(res.message ?? 'Đặt lại mật khẩu thất bại');
      }

      message.success('Đặt lại mật khẩu thành công! Quay lại trang Đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      let msg = 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại.';
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
          Đặt lại mật khẩu
        </Title>
        <Text type="secondary">Nhập mã xác nhận và mật khẩu mới của bạn</Text>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 6 }} />
      )}

      <Form form={form} name="reset-password" onFinish={onFinish} layout="vertical" size="large">
        <Form.Item
          name="token"
          label={<Text strong>Mã xác thực (Token)</Text>}
          rules={[{ required: true, message: 'Vui lòng nhập mã xác thực (Token)!' }]}
        >
          <Input
            prefix={<KeyOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="Dán mã UUID nhận được từ hệ thống"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="passwordStr"
          label={<Text strong>Mật khẩu mới</Text>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<Text strong>Xác nhận mật khẩu</Text>}
          dependencies={['passwordStr']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('passwordStr') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            placeholder="Nhập lại mật khẩu mới"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

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
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href="/login" style={{ color: SLINK_COLORS.textSecondary, fontSize: 13 }}>
          <ArrowLeftOutlined style={{ marginRight: 6 }} /> Quay lại đăng nhập
        </Link>
      </div>
    </Space>
  );
}
