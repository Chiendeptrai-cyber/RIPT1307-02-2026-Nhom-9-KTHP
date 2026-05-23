import { Button, Form, Input } from 'antd';

export default function BorrowRequestCreatePage() {
  const onFinish = () => {
    window.location.href = '/borrow-request';
  };

  return (
    <div>
      <h2>Tạo yêu cầu mượn</h2>
      <Form name="borrow-request" onFinish={onFinish} layout="vertical">
        <Form.Item name="equipmentIds" label="Mã thiết bị" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="expectedReturnDate" label="Ngày trả dự kiến" rules={[{ required: true }]}> 
          <Input type="date" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Gửi yêu cầu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
