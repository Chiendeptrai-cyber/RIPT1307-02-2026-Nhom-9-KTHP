import { Button, Form, Input, Typography } from 'antd';

const { Title } = Typography;

export default function RegisterPage() {
  const onFinish = () => {
    window.location.href = '/login';
  };

  return (
    <div>
      <Title level={3}>Đăng ký</Title>
      <Form name="register" onFinish={onFinish} layout="vertical">
        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}> 
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
