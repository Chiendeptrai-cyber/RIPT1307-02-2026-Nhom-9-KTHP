import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Input, message, Modal, Pagination,
  Select, Skeleton, Space, Table, Tag, Textarea, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckOutlined, CloseOutlined, FileTextOutlined, SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ duyệt',  color: 'orange' },
  approved:  { label: 'Đã duyệt',   color: 'blue' },
  rejected:  { label: 'Từ chối',    color: 'red' },
  cancelled: { label: 'Đã hủy',     color: 'default' },
  borrowing: { label: 'Đang mượn',  color: 'geekblue' },
  overdue:   { label: 'Quá hạn',    color: 'volcano' },
  returned:  { label: 'Đã trả',     color: 'green' },
};

export default function AdminRequestsPage() {
  const [items,   setItems]   = useState<BorrowRequest[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState<string | undefined>();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId,  setRejectingId]  = useState<number | null>(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowRequestService.listAll({
        page: p, pageSize: 15, status, search: search || undefined,
      });
      if (res.success && res.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPage(p);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(1); }, [load]);

  const handleApprove = async (id: number) => {
    try {
      await borrowRequestService.approve(id);
      message.success('Đã duyệt yêu cầu mượn');
      load(page);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Không thể duyệt yêu cầu');
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await borrowRequestService.reject(rejectingId, rejectReason || 'Không đáp ứng yêu cầu');
      message.success('Đã từ chối yêu cầu mượn');
      setRejectingId(null);
      setRejectReason('');
      load(page);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Không thể từ chối yêu cầu');
    }
  };

  const columns: ColumnsType<BorrowRequest> = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.userFullName ?? '—'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.userEmail ?? '—'}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'expectedReturnDate',
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s] ?? { label: s, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size={4}>
          {record.status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{ background: SLINK_COLORS.success, borderColor: SLINK_COLORS.success, borderRadius: 4 }}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => setRejectingId(record.id)}
                style={{ borderRadius: 4 }}
              >
                Từ chối
              </Button>
            </>
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
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileTextOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <Title level={5} style={{ marginBottom: 0 }}>Danh sách yêu cầu mượn</Title>
          </div>
          <Space wrap>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 180 }}
              onChange={(v) => setStatus(v)}
              options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Input
              placeholder="Tìm theo tên sinh viên..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220, borderRadius: 6 }}
              allowClear
            />
          </Space>
        </div>

        {error && <Alert type="error" message={error} style={{ margin: 16, borderRadius: 6 }} />}

        {loading ? (
          <div style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : (
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        )}

        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination current={page} total={total} pageSize={15} onChange={load} showTotal={(t) => `${t} yêu cầu`} showSizeChanger={false} />
        </div>
      </Card>

      {/* Reject Modal */}
      <Modal
        open={!!rejectingId}
        title="Từ chối yêu cầu mượn"
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        onOk={handleReject}
        onCancel={() => { setRejectingId(null); setRejectReason(''); }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Nhập lý do từ chối (sẽ được gửi đến sinh viên qua thông báo):</Text>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Ví dụ: Số lượng thiết bị không đủ, thông tin không hợp lệ..."
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  );
}
