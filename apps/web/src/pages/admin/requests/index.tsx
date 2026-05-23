import { CheckOutlined, ClockCircleOutlined, CloseOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;

interface RequestRow {
  id: number;
  studentName: string;
  equipment: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
}

const demoData: RequestRow[] = [
  { id: 1, studentName: 'Nguyễn Văn A', equipment: 'Máy chiếu Epson', requestDate: '2026-05-20', status: 'pending' },
  { id: 2, studentName: 'Trần Thị B', equipment: 'Laptop Dell', requestDate: '2026-05-19', status: 'approved' },
  { id: 3, studentName: 'Lê Văn C', equipment: 'Camera Sony', requestDate: '2026-05-18', status: 'returned' },
  { id: 4, studentName: 'Phạm Thị D', equipment: 'Micro không dây', requestDate: '2026-05-17', status: 'rejected' },
];

const statusConfig = {
  pending: { color: 'orange', label: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
  approved: { color: 'blue', label: 'Đã duyệt', icon: <CheckOutlined /> },
  rejected: { color: 'red', label: 'Từ chối', icon: <CloseOutlined /> },
  returned: { color: 'green', label: 'Đã trả', icon: <CheckOutlined /> },
};

const columns: ColumnsType<RequestRow> = [
  { title: '#', dataIndex: 'id', key: 'id', width: 60 },
  { title: 'Sinh viên', dataIndex: 'studentName', key: 'studentName' },
  { title: 'Thiết bị', dataIndex: 'equipment', key: 'equipment' },
  { title: 'Ngày yêu cầu', dataIndex: 'requestDate', key: 'requestDate' },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: RequestRow['status']) => {
      const cfg = statusConfig[status];
      return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
    },
  },
  {
    title: 'Thao tác',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Button size="small" href={`/admin/requests/${record.id}`} style={{ borderRadius: 4 }}>Chi tiết</Button>
        {record.status === 'pending' && (
          <>
            <Button size="small" type="primary" style={{ background: SLINK_COLORS.success, borderColor: SLINK_COLORS.success, borderRadius: 4 }}>Duyệt</Button>
            <Button size="small" danger style={{ borderRadius: 4 }}>Từ chối</Button>
          </>
        )}
      </Space>
    ),
  },
];

export default function AdminRequestsPage() {
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
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileTextOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <Title level={5} style={{ marginBottom: 0 }}>Danh sách yêu cầu mượn</Title>
          </div>
          <Input
            placeholder="Tìm theo tên sinh viên..."
            prefix={<SearchOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            style={{ width: 240, borderRadius: 6 }}
          />
        </div>

        {/* Table */}
        <Table
          dataSource={demoData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          style={{ borderRadius: '0 0 8px 8px' }}
        />
      </Card>
    </div>
  );
}
