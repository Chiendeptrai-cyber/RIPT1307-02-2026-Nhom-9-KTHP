import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

  // Reject popup state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<BorrowRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Per-row action loading
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const [form] = Form.useForm();

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

  const handleApprove = async (record: BorrowRequest) => {
    setActionLoading((prev) => ({ ...prev, [record.id]: true }));
    try {
      await borrowRequestService.approve(record.id);
      message.success('Đã duyệt yêu cầu mượn — thông báo đã được gửi đến sinh viên');
      load(page);
    } catch (err: any) {
      message.error(err?.message ?? 'Không thể duyệt yêu cầu');
    } finally {
      setActionLoading((prev) => ({ ...prev, [record.id]: false }));
    }
  };

  const openRejectModal = (record: BorrowRequest) => {
    setRejectTarget(record);
    setRejectReason('');
    form.resetFields();
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    if (!rejectTarget) return;

    setRejectLoading(true);
    try {
      await borrowRequestService.reject(rejectTarget.id, rejectReason.trim());
      message.success('Đã từ chối yêu cầu mượn — thông báo đã được gửi đến sinh viên');
      setRejectModalOpen(false);
      load(page);
    } catch (err: any) {
      message.error(err?.message ?? 'Không thể từ chối yêu cầu');
    } finally {
      setRejectLoading(false);
    }
  };

  const isPending = (record: BorrowRequest) => record.status === 'pending';

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
      title: 'Thiết bị',
      key: 'equipment',
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: 13 }}>{(record as any).equipmentName ?? <Text type="secondary">—</Text>}</Text>
          {(record as any).quantity && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>SL: {(record as any).quantity}</Text>
            </>
          )}
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
      width: 180,
      render: (_, record) => {
        const pending = isPending(record);
        const rowLoading = !!actionLoading[record.id];

        return (
          <Space size={8}>
            {/* Duyệt */}
            <Tooltip title={pending ? 'Duyệt yêu cầu' : 'Yêu cầu đã được xử lý'}>
              <Button
                id={`approve-btn-${record.id}`}
                size="small"
                icon={<CheckCircleOutlined />}
                disabled={!pending || rowLoading}
                loading={rowLoading}
                onClick={() => handleApprove(record)}
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                  background: '#fff',
                  ...(pending
                    ? {
                      color: '#52c41a',
                      borderColor: '#52c41a',
                    }
                    : {
                      color: '#bfbfbf',
                      borderColor: '#d9d9d9',
                      cursor: 'not-allowed',
                    }),
                }}
              >
                Duyệt
              </Button>
            </Tooltip>

            {/* Từ chối */}
            <Tooltip title={pending ? 'Từ chối yêu cầu' : 'Yêu cầu đã được xử lý'}>
              <Button
                id={`reject-btn-${record.id}`}
                size="small"
                icon={<CloseCircleOutlined />}
                disabled={!pending || rowLoading}
                onClick={() => openRejectModal(record)}
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                  background: '#fff',
                  ...(pending
                    ? {
                      color: '#ff4d4f',
                      borderColor: '#ff4d4f',
                    }
                    : {
                      color: '#bfbfbf',
                      borderColor: '#d9d9d9',
                      cursor: 'not-allowed',
                    }),
                }}
              >
                Từ chối
              </Button>
            </Tooltip>
          </Space>
        );
      },
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

      {/* Modal từ chối */}
      <Modal
        open={rejectModalOpen}
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Từ chối yêu cầu mượn #{rejectTarget?.id}</span>
          </Space>
        }
        okText="Xác nhận từ chối"
        okButtonProps={{
          danger: true,
          loading: rejectLoading,
          id: 'reject-confirm-btn',
        }}
        cancelText="Hủy"
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalOpen(false)}
        destroyOnClose
      >
        <p style={{ color: '#595959', marginBottom: 12 }}>
          Sinh viên <strong>{rejectTarget?.userFullName}</strong> sẽ nhận được thông báo từ chối qua{' '}
          <strong>chuông thông báo</strong> và <strong>email</strong>.
        </p>
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối yêu cầu mượn..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={500}
              showCount
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
