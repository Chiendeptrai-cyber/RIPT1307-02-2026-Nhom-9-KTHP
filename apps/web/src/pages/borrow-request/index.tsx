import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Empty, message, Modal, Pagination,
  Skeleton, Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowRequestService, type BorrowRequest } from '../../services/borrow-request.service';
import { SLINK_COLORS } from '../../theme/tokens';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ duyệt',   color: 'orange' },
  approved:  { label: 'Đã duyệt',    color: 'blue' },
  rejected:  { label: 'Bị từ chối',  color: 'red' },
  cancelled: { label: 'Đã hủy',      color: 'default' },
  borrowing: { label: 'Đang mượn',   color: 'geekblue' },
  overdue:   { label: 'Quá hạn',     color: 'volcano' },
  returned:  { label: 'Đã trả',      color: 'green' },
};

export default function BorrowRequestHistoryPage() {
  const [items,   setItems]   = useState<BorrowRequest[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowRequestService.listMy({ page: p, pageSize: 10 });
      if (res.success && res.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPage(p);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể tải lịch sử yêu cầu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = (record: BorrowRequest) => {
    Modal.confirm({
      title: 'Hủy yêu cầu mượn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn hủy yêu cầu mượn #${record.id}?`,
      okText: 'Hủy yêu cầu',
      okButtonProps: { danger: true },
      cancelText: 'Không',
      onOk: async () => {
        try {
          await borrowRequestService.cancel(record.id);
          message.success('Đã hủy yêu cầu mượn');
          load(page);
        } catch (err: any) {
          message.error(err?.response?.data?.message ?? 'Không thể hủy yêu cầu');
        }
      },
    });
  };

  const columns: ColumnsType<BorrowRequest> = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'expectedReturnDate',
      key: 'expectedReturnDate',
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (v) => v ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'default' };
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
              danger
              onClick={() => handleCancel(record)}
              style={{ borderRadius: 4 }}
            >
              Hủy
            </Button>
          )}
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
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileTextOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
          <div>
            <Title level={5} style={{ marginBottom: 0 }}>Lịch sử yêu cầu mượn</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Danh sách các yêu cầu mượn thiết bị của bạn</Text>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} style={{ margin: 16, borderRadius: 6 }} />
        )}

        {loading ? (
          <div style={{ padding: 20 }}>
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 40 }}>
            <Empty description="Bạn chưa có yêu cầu mượn nào" />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button type="primary" href="/borrow-request/create" style={{ background: SLINK_COLORS.primary, borderRadius: 6 }}>
                Tạo yêu cầu đầu tiên
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table
              dataSource={items}
              columns={columns}
              rowKey="id"
              pagination={false}
              style={{ borderRadius: '0 0 8px 8px' }}
            />
            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={page}
                total={total}
                pageSize={10}
                onChange={load}
                showTotal={(t) => `${t} yêu cầu`}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
