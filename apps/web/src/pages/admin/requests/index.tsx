import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckOutlined,
  DeleteOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'orange' },
  approved: { label: 'Đã duyệt', color: 'blue' },
  rejected: { label: 'Từ chối', color: 'red' },
  cancelled: { label: 'Đã hủy', color: 'default' },
  borrowing: { label: 'Đang mượn', color: 'geekblue' },
  overdue: { label: 'Quá hạn', color: 'volcano' },
  returned: { label: 'Đã trả', color: 'green' },
};

export default function AdminRequestsPage() {
  const [items, setItems] = useState<BorrowRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowRequestService.listAll({
        page: p,
        pageSize: 15,
        status,
        search: search || undefined,
      });

      if (res.success && res.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPage(p);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleApprove = async (id: number) => {
    try {
      await borrowRequestService.approve(id);
      message.success('Đã duyệt yêu cầu mượn');
      load(page);
    } catch (err: any) {
      message.error(err?.message ?? 'Không thể duyệt yêu cầu');
    }
  };

  const handleDelete = (record: BorrowRequest) => {
    Modal.confirm({
      title: 'Xóa yêu cầu mượn',
      content: `Bạn có chắc chắn muốn xóa yêu cầu #${record.id}?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        await borrowRequestService.remove(record.id);
        message.success('Xóa yêu cầu mượn thành công');
        load(page);
      },
    });
  };

  const columns: ColumnsType<BorrowRequest> = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.userFullName ?? '-'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.userEmail ?? '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      render: (value) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'expectedReturnDate',
      render: (value) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value: string) => {
        const cfg = STATUS_CONFIG[value] ?? { label: value, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              size="small"
              className="admin-request-approve-btn"
              icon={<CheckOutlined style={{ color: SLINK_COLORS.success }} />}
              onClick={() => handleApprove(record.id)}
              style={{
                borderRadius: 4,
                color: SLINK_COLORS.success,
                borderColor: SLINK_COLORS.success,
                background: '#fff',
              }}
            >
              Duyệt
            </Button>
          )}
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ borderRadius: 4 }}
          >
            Xóa
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
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${SLINK_COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileTextOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <Title level={5} style={{ marginBottom: 0 }}>Danh sách yêu cầu mượn</Title>
          </div>
          <Space wrap>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 180 }}
              onChange={(value) => setStatus(value)}
              options={Object.entries(STATUS_CONFIG).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
            <Input
              placeholder="Tìm theo tên sinh viên..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 220, borderRadius: 6 }}
              allowClear
            />
          </Space>
        </div>

        {error && <Alert type="error" message={error} style={{ margin: 16, borderRadius: 6 }} />}

        {loading ? (
          <div style={{ padding: 20 }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        )}

        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={page}
            total={total}
            pageSize={15}
            onChange={load}
            showTotal={(count) => `${count} yêu cầu`}
            showSizeChanger={false}
          />
        </div>
      </Card>
    </div>
  );
}
