import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@umijs/max';
import {
  Alert, Button, Card, Checkbox, Collapse, DatePicker, Form, Input, InputNumber,
  message, Select, Skeleton, Space, Typography,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { equipmentService, type Equipment } from '../../services/equipment.service';
import { borrowRequestService } from '../../services/borrow-request.service';
import { SLINK_COLORS } from '../../theme/tokens';

const { Title, Text } = Typography;

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

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
    if (prefilledId) {
      // Pre-fill with single item from URL (date is now at request level)
      form.setFieldsValue({
        items: [{ equipmentId: Number(prefilledId), quantity: 1 }],
        expectedReturnDate: dayjs().add(7, 'day'),
      });
    } else {
      // Initialize with one empty item
      form.setFieldsValue({ items: [{}] });
    }
  }, [loadEquipment, prefilledId, form]);

  const onFinish = async (values: {
    items: Array<{ equipmentId: number; quantity: number }>;
    expectedReturnDate: dayjs.Dayjs;
    note?: string;
  }) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await borrowRequestService.create({
        items: values.items.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity ?? 1,
        })),
        expectedReturnDate: values.expectedReturnDate.format('YYYY-MM-DD'),
        note: values.note,
        rulesAccepted: true,
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

  // Get all selected equipment IDs for validation (no duplicate)
  const getSelectedIds = (currentFields: any[], currentIndex: number, currentId?: number) => {
    return currentFields
      .filter((_, idx) => idx !== currentIndex)
      .map((f: any) => f?.equipmentId)
      .filter(Boolean);
  };

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
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow, maxWidth: 700 }}
        styles={{ body: { padding: 24 } }}
      >
        <Title level={5} style={{ marginBottom: 4 }}>Tạo yêu cầu mượn thiết bị</Title>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
          Điền thông tin để gửi yêu cầu mượn đến quản trị viên. Bạn có thể thêm nhiều thiết bị.
          <br />Tất cả thiết bị trong cùng phiếu sẽ có chung một ngày trả. Muốn trả ngày khác, vui lòng tạo phiếu mới.
        </Text>

        {error && (
          <Alert type="error" message={error} closable onClose={() => setError(null)} style={{ marginBottom: 16, borderRadius: 6 }} />
        )}

        {loadingEquipment ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">

            {/* Single return date for the entire request */}
            <Form.Item
              name="expectedReturnDate"
              label="Ngày trả dự kiến (chung cho tất cả thiết bị)"
              rules={[
                { required: true, message: 'Chọn ngày trả' },
                {
                  validator: (_, val: dayjs.Dayjs) => {
                    if (!val) return Promise.resolve();
                    const today = dayjs().startOf('day');
                    const maxDate = today.add(14, 'day');
                    if (val.isBefore(today.add(1, 'day'))) {
                      return Promise.reject('Phải từ ngày mai');
                    }
                    if (val.isAfter(maxDate)) {
                      return Promise.reject('Tối đa 14 ngày');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: 20 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(d) => d.isBefore(dayjs().add(1, 'day').startOf('day'))}
                placeholder="Chọn ngày trả cho tất cả thiết bị"
              />
            </Form.Item>

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size="small"
                      style={{ marginBottom: 12, borderRadius: 6, background: '#fafafa' }}
                      styles={{ body: { padding: '12px 16px' } }}
                      title={
                        <Text strong style={{ fontSize: 13 }}>
                          Thiết bị #{index + 1}
                        </Text>
                      }
                      extra={
                        fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          >
                            Xóa
                          </Button>
                        )
                      }
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, 'equipmentId']}
                        label="Thiết bị muốn mượn"
                        rules={[
                          { required: true, message: 'Vui lòng chọn thiết bị' },
                          ({ getFieldsValue }) => ({
                            validator(_, value) {
                              if (!value) return Promise.resolve();
                              const items = (getFieldsValue() as any).items || [];
                              const selectedIds = getSelectedIds(items, index, value);
                              if (selectedIds.includes(value)) {
                                return Promise.reject('Thiết bị này đã được chọn');
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                        style={{ marginBottom: 12 }}
                      >
                        <Select
                          placeholder="Chọn thiết bị..."
                          showSearch
                          filterOption={(input, option) =>
                            removeAccents(option?.label ?? '')
                              .toLowerCase()
                              .includes(removeAccents(input).toLowerCase())
                          }
                          options={equipmentList.map((e) => ({
                            value: e.id,
                            label: `${e.name} (còn ${e.availableQuantity} chiếc)`,
                          }))}
                        />
                      </Form.Item>

                      <Form.Item noStyle shouldUpdate={(prev, cur) => {
                        const prevItems = (prev as any).items || [];
                        const curItems = (cur as any).items || [];
                        return prevItems[index]?.equipmentId !== curItems[index]?.equipmentId;
                      }}>
                        {({ getFieldValue }) => {
                          const equipmentId = getFieldValue(['items', field.name, 'equipmentId']);
                          const selectedEquipment = equipmentList.find((e) => e.id === equipmentId);
                          if (!selectedEquipment) return null;
                          return (
                            <Alert
                              type="info"
                              message={`Số lượng có thể mượn: ${selectedEquipment.availableQuantity} chiếc`}
                              style={{ marginBottom: 12, borderRadius: 6 }}
                            />
                          );
                        }}
                      </Form.Item>

                      <Form.Item noStyle shouldUpdate={(prev, cur) => {
                        const prevItems = (prev as any).items || [];
                        const curItems = (cur as any).items || [];
                        return prevItems[index]?.equipmentId !== curItems[index]?.equipmentId;
                      }}>
                        {({ getFieldValue }) => {
                          const equipmentId = getFieldValue(['items', field.name, 'equipmentId']);
                          const selectedEquipment = equipmentList.find((e) => e.id === equipmentId);
                          return (
                            <Form.Item
                              {...field}
                              name={[field.name, 'quantity']}
                              label="Số lượng"
                              initialValue={1}
                              rules={[
                                { required: true, message: 'Nhập số lượng' },
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
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber min={1} max={selectedEquipment?.availableQuantity ?? 99} style={{ width: '100%' }} />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    </Card>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{ borderRadius: 6 }}
                    >
                      Thêm thiết bị
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item name="note" label="Ghi chú (tùy chọn)">
              <Input.TextArea rows={3} placeholder="Mô tả mục đích sử dụng..." maxLength={200} showCount />
            </Form.Item>

            {/* Borrowing rules */}
            <Form.Item label="Quy định mượn">
              <Collapse
                size="small"
                items={[
                  {
                    key: 'rules',
                    label: 'Xem quy định mượn thiết bị',
                    children: (
                      <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, lineHeight: 2 }}>
                        <li>Thời gian mượn tối đa <strong>14 ngày</strong>.</li>
                        <li>Tất cả thiết bị trong cùng phiếu phải trả cùng ngày.</li>
                        <li>Trả thiết bị đúng hạn — quá hạn sẽ bị ghi nhận <strong>vi phạm</strong>.</li>
                        <li>Thiết bị hư hỏng do người mượn chịu <strong>trách nhiệm</strong>.</li>
                        <li>Không cho người khác mượn lại thiết bị.</li>
                        <li>Báo ngay cho quản trị viên nếu thiết bị gặp sự cố.</li>
                      </ul>
                    ),
                  },
                ]}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            <Form.Item
              name="rulesAccepted"
              valuePropName="checked"
              rules={[{
                validator: (_, val) =>
                  val ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý quy định trước khi gửi')),
              }]}
            >
              <Checkbox>Tôi đã đọc và đồng ý với các quy định trên</Checkbox>
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
