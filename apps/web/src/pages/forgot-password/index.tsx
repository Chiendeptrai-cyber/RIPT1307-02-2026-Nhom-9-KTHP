import { Button, Form, Input, Typography } from 'antd';

const { Title } = Typography;

export default function ForgotPasswordPage() {
  const onFinish = () => {
    window.location.href = '/login';
  };

  return (
    <div>
      <Title level={3}>Quên mật khẩu</Title>
      <Form name="forgot-password" onFinish={onFinish} layout="vertical">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> 
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Gửi email
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
