import { Button, Form, Input, Typography } from 'antd';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@equipment-mgmt/shared';

const { Title } = Typography;

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = (values: { email: string; password: string }) => {
    setAuth({ id: 1, fullName: 'Sinh viên', email: values.email, role: UserRole.STUDENT }, 'demo-token');
    window.location.href = '/equipment';
  };

  return (
    <div>
      <Title level={3}>Đăng nhập</Title>
      <Form name="login" onFinish={onFinish} layout="vertical">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}> 
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
