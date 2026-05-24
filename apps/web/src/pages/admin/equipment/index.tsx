import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Form, Input, InputNumber, message,
  Modal, Pagination, Skeleton, Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, PlusOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { equipmentService, type Equipment } from '../../../services/equipment.service';
import { http } from '../../../services/http';
import { SLINK_COLORS } from '../../../theme/tokens';
import type { ApiResponse } from '@equipment-mgmt/shared';

const { Title } = Typography;

export default function AdminEquipmentPage() {
  const [items,   setItems]   = useState<Equipment[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState('');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editRecord,  setEditRecord]  = useState<Equipment | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await equipmentService.list({ page: p, pageSize: 15, search: search || undefined });
      if (res.success && res.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPage(p);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Equipment) => {
    setEditRecord(record);
    form.setFieldsValue({ name: record.name, totalQuantity: record.totalQuantity, status: record.status });
    setModalOpen(true);
  };

  const handleSubmit = async (values: { name: string; totalQuantity: number; status?: string }) => {
    setSubmitting(true);
    try {
      if (editRecord) {
        await http.put<ApiResponse<Equipment>>(`/equipment/${editRecord.id}`, values);
        message.success('Cập nhật thiết bị thành công');
      } else {
        await http.post<ApiResponse<Equipment>>('/equipment', {
          ...values,
          categoryId: 1,
          status: 'active',
        });
        message.success('Thêm thiết bị thành công');
      }
      setModalOpen(false);
      load(page);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<Equipment> = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tên thiết bị', dataIndex: 'name', key: 'name' },
    {
      title: 'Tổng / Sẵn có',
      key: 'qty',
      render: (_, r) => (
        <span>
          <strong style={{ color: SLINK_COLORS.textBase }}>{r.availableQuantity}</strong>
          <span style={{ color: SLINK_COLORS.textSecondary }}> / {r.totalQuantity}</span>
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) =>
        s === 'active'
          ? <Tag color="green">Hoạt động</Tag>
          : <Tag color="orange">Bảo trì</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            style={{ borderRadius: 4 }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ToolOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <Title level={5} style={{ marginBottom: 0 }}>Quản lý thiết bị</Title>
          </div>
          <Space>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220, borderRadius: 6 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              style={{ background: SLINK_COLORS.primary, borderRadius: 6 }}
            >
              Thêm thiết bị
            </Button>
          </Space>
        </div>

        {error && <Alert type="error" message={error} style={{ margin: 16 }} />}

        {loading ? (
          <div style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : (
          <Table dataSource={items} columns={columns} rowKey="id" pagination={false} />
        )}

        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination current={page} total={total} pageSize={15} onChange={load} showTotal={(t) => `${t} thiết bị`} showSizeChanger={false} />
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editRecord ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
        okText={editRecord ? 'Lưu thay đổi' : 'Thêm mới'}
        cancelText="Hủy"
        onOk={() => form.submit()}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên thiết bị" rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}>
            <Input placeholder="Ví dụ: Máy chiếu Epson EB-X41" />
          </Form.Item>
          <Form.Item name="totalQuantity" label="Tổng số lượng" rules={[{ required: true, message: 'Nhập số lượng' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          {editRecord && (
            <Form.Item name="status" label="Trạng thái">
              <Input placeholder="active / under_maintenance" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
