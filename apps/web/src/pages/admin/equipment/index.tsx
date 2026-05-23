import { PlusOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title } = Typography;

interface EquipmentRow {
  id: number;
  name: string;
  category: string;
  total: number;
  available: number;
  status: 'active' | 'maintenance';
}

const demoData: EquipmentRow[] = [
  { id: 1, name: 'Máy chiếu Epson EB-X41', category: 'Trình chiếu', total: 8, available: 5, status: 'active' },
  { id: 2, name: 'Laptop Dell Inspiron 15', category: 'Máy tính', total: 12, available: 8, status: 'active' },
  { id: 3, name: 'Camera Sony Alpha A6400', category: 'Nhiếp ảnh', total: 4, available: 2, status: 'active' },
  { id: 4, name: 'Micro không dây Shure', category: 'Âm thanh', total: 6, available: 0, status: 'maintenance' },
];

const columns: ColumnsType<EquipmentRow> = [
  { title: '#', dataIndex: 'id', key: 'id', width: 60 },
  { title: 'Tên thiết bị', dataIndex: 'name', key: 'name' },
  {
    title: 'Danh mục',
    dataIndex: 'category',
    key: 'category',
    render: (cat: string) => <Tag color="blue">{cat}</Tag>,
  },
  {
    title: 'Tổng / Sẵn có',
    key: 'quantity',
    render: (_, record) => (
      <span>
        <strong style={{ color: SLINK_COLORS.textBase }}>{record.available}</strong>
        <span style={{ color: SLINK_COLORS.textSecondary }}> / {record.total}</span>
      </span>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: EquipmentRow['status']) =>
      status === 'active' ? (
        <Tag color="green">Hoạt động</Tag>
      ) : (
        <Tag color="orange">Bảo trì</Tag>
      ),
  },
  {
    title: 'Thao tác',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Button size="small" style={{ borderRadius: 4 }}>Sửa</Button>
        <Button size="small" href={`/admin/equipment/${record.id}/stock`} style={{ borderRadius: 4 }}>
          Tồn kho
        </Button>
      </Space>
    ),
  },
];

export default function AdminEquipmentPage() {
  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{
          borderRadius: 8,
          border: `1px solid ${SLINK_COLORS.border}`,
          boxShadow: SLINK_COLORS.shadow,
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${SLINK_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ToolOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <Title level={5} style={{ marginBottom: 0 }}>Quản lý thiết bị</Title>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder="Tìm kiếm thiết bị..."
              prefix={<SearchOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
              style={{ width: 220, borderRadius: 6 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary, borderRadius: 6 }}
            >
              Thêm thiết bị
            </Button>
          </div>
        </div>

        <Table
          dataSource={demoData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>
    </div>
  );
}
