import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@umijs/max';
import {
  Alert, Button, Card, DatePicker, Form, Input, InputNumber,
  message, Select, Skeleton, Typography,
} from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { equipmentService, type Equipment } from '../../services/equipment.service';
import { borrowRequestService } from '../../services/borrow-request.service';
import { SLINK_COLORS } from '../../theme/tokens';

const { Title, Text } = Typography;

export default function BorrowRequestCreatePage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [form]     = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  // Pre-fill equipmentId from URL query string
  const searchParams = new URLSearchParams(location.search);
  const prefilledId  = searchParams.get('equipmentId');

  // Load available equipment list
  const loadEquipment = useCallback(async () => {
    setLoadingEquipment(true);
    try {
      const res = await equipmentService.list({ status: 'active', pageSize: 100 });
      if (res.success && res.data) {
        setEquipmentList(res.data.items.filter((e) => e.availableQuantity > 0));
      }
    } catch {
      // Silent
    } finally {
      setLoadingEquipment(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
    if (prefilledId) form.setFieldValue('equipmentId', Number(prefilledId));
  }, [loadEquipment, prefilledId, form]);

  const onFinish = async (values: {
    equipmentId: number;
    quantity: number;
    expectedReturnDate: dayjs.Dayjs;
    note?: string;
  }) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await borrowRequestService.create({
        equipmentId: values.equipmentId,
        quantity: values.quantity ?? 1,
        expectedReturnDate: values.expectedReturnDate.format('YYYY-MM-DD'),
        note: values.note,
      });

      if (res.success) {
        message.success('Đã gửi yêu cầu mượn thiết bị thành công!');
        navigate('/borrow-request');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEquipmentId = Form.useWatch('equipmentId', form);
  const selectedEquipment   = equipmentList.find((e) => e.id === selectedEquipmentId);

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        onClick={() => navigate('/borrow-request')}
        style={{ marginBottom: 16, padding: 0, color: SLINK_COLORS.textSecondary }}
      >
        Quay lại lịch sử
      </Button>

      <Card
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow, maxWidth: 600 }}
        styles={{ body: { padding: 24 } }}
      >
        <Title level={5} style={{ marginBottom: 4 }}>Tạo yêu cầu mượn thiết bị</Title>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
          Điền thông tin để gửi yêu cầu mượn đến quản trị viên
        </Text>

        {error && (
          <Alert type="error" message={error} closable onClose={() => setError(null)} style={{ marginBottom: 16, borderRadius: 6 }} />
        )}

        {loadingEquipment ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
            <Form.Item
              name="equipmentId"
              label="Thiết bị muốn mượn"
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
            >
              <Select
                placeholder="Chọn thiết bị..."
                showSearch
                optionFilterProp="label"
                options={equipmentList.map((e) => ({
                  value: e.id,
                  label: `${e.name} (còn ${e.availableQuantity} chiếc)`,
                }))}
              />
            </Form.Item>

            {selectedEquipment && (
              <Alert
                type="info"
                message={`Số lượng có thể mượn: ${selectedEquipment.availableQuantity} chiếc`}
                style={{ marginBottom: 16, borderRadius: 6 }}
              />
            )}

            <Form.Item
              name="quantity"
              label="Số lượng"
              initialValue={1}
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                {
                  validator: (_, val) => {
                    if (!selectedEquipment) return Promise.resolve();
                    if (val > selectedEquipment.availableQuantity) {
                      return Promise.reject(`Chỉ còn ${selectedEquipment.availableQuantity} chiếc`);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber min={1} max={selectedEquipment?.availableQuantity ?? 99} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="expectedReturnDate"
              label="Ngày trả dự kiến"
              rules={[
                { required: true, message: 'Vui lòng chọn ngày trả' },
                {
                  validator: (_, val: dayjs.Dayjs) => {
                    if (!val) return Promise.resolve();
                    const today = dayjs().startOf('day');
                    const maxDate = today.add(14, 'day');
                    if (val.isBefore(today.add(1, 'day'))) {
                      return Promise.reject('Ngày trả phải từ ngày mai trở đi');
                    }
                    if (val.isAfter(maxDate)) {
                      return Promise.reject('Ngày trả không được quá 14 ngày kể từ hôm nay');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(d) => d.isBefore(dayjs().add(1, 'day').startOf('day'))}
                placeholder="Chọn ngày trả"
              />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú (tùy chọn)">
              <Input.TextArea rows={3} placeholder="Mô tả mục đích sử dụng..." maxLength={200} showCount />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SendOutlined />}
                loading={submitting}
                block
                style={{ background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary, borderRadius: 6 }}
              >
                Gửi yêu cầu mượn
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
}
