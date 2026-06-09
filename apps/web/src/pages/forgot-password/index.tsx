import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { SLINK_COLORS } from '../../theme/tokens';
import { forgotPassword } from '../../services/auth.service';

const { Title, Text, Link } = Typography;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToken, setSuccessToken] = useState<string | null>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(() => {
    try {
      return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from') === 'login';
    } catch {
      return false;
    }
  });

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError(null);
    setSuccessToken(null);
    setEmailPreviewUrl(null);
    setIsSent(false);

    try {
      const res = await forgotPassword(values.email);
      if (!res.success) {
        throw new Error(res.message ?? 'Không thể gửi yêu cầu đặt lại mật khẩu');
      }

      setIsSent(true);
      if (res.data?.resetToken) {
        setSuccessToken(res.data.resetToken);
      }
      if (res.data?.emailPreviewUrl) {
        setEmailPreviewUrl(res.data.emailPreviewUrl);
      }
    } catch (err: any) {
      let msg = 'Gửi yêu cầu thất bại. Vui lòng kiểm tra lại.';
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
          Quên mật khẩu?
        </Title>
        <Text type="secondary">Nhập email của bạn để nhận mã đặt lại mật khẩu</Text>
      </div>

      {showForgotNotice && (
        <Alert
          message="Lưu ý về gửi email"
          description={
            "Tính năng 'Quên mật khẩu' hoạt động tốt trên môi trường local (email gửi tới hộp thư thử nghiệm). Khi deploy, nhà cung cấp hạ tầng có thể chặn cổng SMTP nên email có thể không đến người dùng. Nếu không nhận được email, vui lòng liên hệ quản trị viên."
          }
          type="info"
          showIcon
          closable
          onClose={() => setShowForgotNotice(false)}
          style={{ marginBottom: 20, borderRadius: 6 }}
        />
      )}

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 6 }} />
      )}

      {isSent ? (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Alert
            message="Yêu cầu thành công!"
            description={
              <div>
                <p>Hệ thống đã gửi một email hướng dẫn đặt lại mật khẩu đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục Spam/Thư rác).</p>
                {emailPreviewUrl && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4 }}>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                      💡 <strong>Môi trường thử nghiệm local:</strong> Do hệ thống chạy offline, bạn có thể nhấp vào liên kết dưới đây để mở xem hòm thư ảo chứa email vừa gửi:
                    </Text>
                    <a href={emailPreviewUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: SLINK_COLORS.primary }}>
                      👉 Nhấp vào đây để xem Email đặt lại mật khẩu (Ethereal Mail)
                    </a>
                  </div>
                )}
              </div>
            }
            type="success"
            showIcon
            style={{ borderRadius: 6 }}
          />
          {successToken && (
            <Button
              type="primary"
              block
              onClick={() => navigate(`/reset-password?token=${successToken}`)}
              style={{
                height: 44,
                borderRadius: 6,
                fontWeight: 600,
                background: SLINK_COLORS.success,
                borderColor: SLINK_COLORS.success,
              }}
            >
              Đi đến trang đổi mật khẩu
            </Button>
          )}
        </Space>
      ) : (
        <Form name="forgot-password" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            label={<Text strong>Email</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
              placeholder="your@ptit.edu.vn"
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
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href="/login" style={{ color: SLINK_COLORS.textSecondary, fontSize: 13 }}>
          <ArrowLeftOutlined style={{ marginRight: 6 }} /> Quay lại đăng nhập
        </Link>
      </div>
    </Space>
  );
}
