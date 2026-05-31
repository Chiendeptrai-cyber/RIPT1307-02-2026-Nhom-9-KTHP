import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Form, Input, message, Modal, Popconfirm,
  Skeleton, Space, Table, Tag, Typography, Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined,
  SearchOutlined, InboxOutlined, StopOutlined, RollbackOutlined, EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { extractApiError } from '../../../utils/error';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── Tab definitions ─────────────────────────────────────── */
type TabKey = 'pending' | 'approved' | 'borrowing' | 'overdue' | 'returned' | 'cancelled' | 'rejected';

interface TabDef {
  key: TabKey;
  label: string;
  color: string;
  badgeColor: string;
}

const TABS: TabDef[] = [
  { key: 'pending',   label: 'Chờ duyệt',  color: '#fa8c16', badgeColor: '#fa8c16' },
  { key: 'approved',  label: 'Đã duyệt',   color: '#1677ff', badgeColor: '#1677ff' },
  { key: 'borrowing', label: 'Đang mượn',  color: '#722ed1', badgeColor: '#722ed1' },
  { key: 'overdue',   label: 'Quá hạn',    color: '#cf1322', badgeColor: '#cf1322' },
  { key: 'returned',  label: 'Đã trả',     color: '#389e0d', badgeColor: '#389e0d' },
  { key: 'cancelled', label: 'Đã hủy',     color: '#8c8c8c', badgeColor: '#8c8c8c' },
  { key: 'rejected',  label: 'Từ chối',    color: '#ff4d4f', badgeColor: '#ff4d4f' },
];

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = (v?: string | null) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
const fmtFull = (v?: string | null) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—');

function daysFromNow(dateStr?: string | null): number {
  if (!dateStr) return 0;
  return dayjs(dateStr).diff(dayjs().startOf('day'), 'day');
}

function CountdownBadge({ dateStr, warnDays = 1, label = '' }: { dateStr?: string | null; warnDays?: number; label?: string }) {
  const days = daysFromNow(dateStr);
  const color = days <= warnDays ? '#ff4d4f' : days <= 3 ? '#fa8c16' : '#389e0d';
  return (
    <span style={{ color, fontWeight: 600 }}>
      {days > 0 ? `Còn ${days} ngày` : days === 0 ? 'Hôm nay' : `Quá ${Math.abs(days)} ngày`}
      {label && <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 4 }}>{label}</span>}
    </span>
  );
}

function EquipmentCell({ record }: { record: BorrowRequest }) {
  return (
    <div>
      <Text style={{ fontSize: 13 }}>{record.equipmentName ?? <Text type="secondary">—</Text>}</Text>
      {record.quantity && (
        <><br /><Text type="secondary" style={{ fontSize: 12 }}>SL: {record.quantity}</Text></>
      )}
    </div>
  );
}

function StudentCell({ record }: { record: BorrowRequest }) {
  return (
    <div>
      <Text strong style={{ fontSize: 13 }}>{record.userFullName ?? '—'}</Text>
      <br />
      <Text type="secondary" style={{ fontSize: 12 }}>{record.userEmail ?? ''}</Text>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [items, setItems] = useState<BorrowRequest[]>([]);
  const [counts, setCounts] = useState<Partial<Record<TabKey, number>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; record?: BorrowRequest }>({ open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [form] = Form.useForm();

  // Detail modal
  const [detailModal, setDetailModal] = useState<{ open: boolean; record?: BorrowRequest }>({ open: false });

  const load = useCallback(async (p = 1, tab = activeTab) => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowRequestService.listAll({ page: p, pageSize: 15, status: tab, search: search || undefined });
      if (res.success && res.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPage(p);
        setCounts(prev => ({ ...prev, [tab]: res.data!.total }));
      }
    } catch (e: any) {
      setError(e?.message ?? 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => { load(1, activeTab); }, [activeTab, search]);

  const setRowLoading = (id: number, action: string) =>
    setActionLoading(prev => ({ ...prev, [id]: action }));
  const clearRowLoading = (id: number) =>
    setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; });

  const doAction = async (id: number, action: string, fn: () => Promise<any>, successMsg: string) => {
    setRowLoading(id, action);
    try {
      await fn();
      message.success(successMsg);
      load(page, activeTab);
    } catch (e: any) {
      message.error(e?.message ?? 'Thao tác thất bại');
    } finally {
      clearRowLoading(id);
    }
  };

  const handleRejectConfirm = async () => {
    try { await form.validateFields(); } catch { return; }
    if (!rejectModal.record) return;
    setRejectLoading(true);
    try {
      await borrowRequestService.reject(rejectModal.record.id, rejectReason.trim());
      message.success('Đã từ chối yêu cầu');
      setRejectModal({ open: false });
      load(page, activeTab);
    } catch (e: any) {
      message.error(e?.message ?? 'Thao tác thất bại');
    } finally {
      setRejectLoading(false);
    }
  };

  /* ─── Column definitions per tab ──────────────────────── */
  const baseColumns = (extra: ColumnsType<BorrowRequest>): ColumnsType<BorrowRequest> => [
    {
      title: 'Mã phiếu',
      key: 'code',
      width: 160,
      render: (_, r) => (
        <Text code style={{ fontSize: 12, color: SLINK_COLORS.primary, fontWeight: 600 }}>
          {r.displayCode ?? `PH-${dayjs(r.createdAt).format('YYYYMMDD')}-${String(r.id).padStart(5, '0')}`}
        </Text>
      ),
    },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_, r) => <StudentCell record={r} />,
    },
    {
      title: 'Thiết bị',
      key: 'equipment',
      render: (_, r) => <EquipmentCell record={r} />,
    },
    ...extra,
  ];

  const columnsByTab: Record<TabKey, ColumnsType<BorrowRequest>> = {
    pending: baseColumns([
      { title: 'Ngày gửi', key: 'createdAt', render: (_, r) => fmt(r.createdAt) },
      { title: 'Mượn dự kiến', key: 'borrow', render: (_, r) => fmt(r.borrowStartDate ?? r.createdAt) },
      { title: 'Trả dự kiến', key: 'ret', render: (_, r) => fmt(r.expectedReturnDate) },
      {
        title: 'Thao tác', key: 'actions', width: 180,
        render: (_, r) => (
          <Space size={6}>
            <Popconfirm
              title="Duyệt yêu cầu mượn này?"
              okText="Duyệt" cancelText="Hủy"
              onConfirm={() => doAction(r.id, 'approve', () => borrowRequestService.approve(r.id), 'Đã duyệt — thông báo đã gửi cho sinh viên')}
            >
              <Button size="small" icon={<CheckCircleOutlined />} style={{ color: '#389e0d', borderColor: '#389e0d' }} loading={actionLoading[r.id] === 'approve'}>Duyệt</Button>
            </Popconfirm>
            <Button size="small" danger icon={<CloseCircleOutlined />}
              onClick={() => { setRejectModal({ open: true, record: r }); setRejectReason(''); form.resetFields(); }}
            >Từ chối</Button>
          </Space>
        ),
      },
    ]),

    approved: baseColumns([
      { title: 'Ngày duyệt', key: 'approvedAt', render: (_, r) => fmt(r.approvedAt) },
      { title: 'Mượn dự kiến', key: 'borrow', render: (_, r) => fmt(r.expectedReturnDate) },
      {
        title: 'Hạn đến nhận',
        key: 'pickup',
        render: (_, r) => {
          const deadline = r.approvedAt ? dayjs(r.approvedAt).add(3, 'day') : null;
          return deadline ? <CountdownBadge dateStr={deadline.toISOString()} warnDays={1} label="(deadline)" /> : '—';
        },
      },
      {
        title: 'Thao tác', key: 'actions', width: 200,
        render: (_, r) => (
          <Space size={6}>
            <Popconfirm
              title="Xác nhận sinh viên đã đến nhận thiết bị?"
              okText="Đã nhận" cancelText="Hủy"
              onConfirm={() => doAction(r.id, 'received', () => borrowRequestService.markReceived(r.id), 'Đã xác nhận nhận — phiếu chuyển sang Đang mượn')}
            >
              <Button size="small" type="primary" icon={<InboxOutlined />} loading={actionLoading[r.id] === 'received'}>Đã nhận</Button>
            </Popconfirm>
            <Popconfirm
              title="Xác nhận sinh viên chưa đến nhận?" okType="danger"
              okText="Hủy đơn" cancelText="Không"
              onConfirm={() => doAction(r.id, 'notreceived', () => borrowRequestService.markNotReceived(r.id), 'Đã hủy phiếu — sinh viên không đến nhận')}
            >
              <Button size="small" danger icon={<StopOutlined />} loading={actionLoading[r.id] === 'notreceived'}>Chưa nhận</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]),

    borrowing: baseColumns([
      { title: 'Ngày bắt đầu mượn', key: 'borrowedAt', render: (_, r) => fmt(r.borrowedAt) },
      { title: 'Trả dự kiến', key: 'ret', render: (_, r) => fmt(r.expectedReturnDate) },
      {
        title: 'Còn lại',
        key: 'remaining',
        render: (_, r) => <CountdownBadge dateStr={r.expectedReturnDate} warnDays={2} />,
      },
      {
        title: 'Thao tác', key: 'actions', width: 160,
        render: (_, r) => (
          <Popconfirm
            title="Xác nhận đã nhận lại thiết bị từ sinh viên?"
            okText="Đã nhận lại" cancelText="Hủy"
            onConfirm={() => doAction(r.id, 'returned', () => borrowRequestService.markReturned(r.id), 'Đã nhận lại thiết bị — phiếu chuyển sang Đã trả')}
          >
            <Button size="small" icon={<RollbackOutlined />} style={{ color: '#389e0d', borderColor: '#389e0d' }} loading={actionLoading[r.id] === 'returned'}>Đã nhận lại</Button>
          </Popconfirm>
        ),
      },
    ]),

    overdue: baseColumns([
      { title: 'Trả dự kiến', key: 'ret', render: (_, r) => fmt(r.expectedReturnDate) },
      {
        title: 'Quá hạn',
        key: 'overdue',
        render: (_, r) => {
          const days = Math.abs(daysFromNow(r.expectedReturnDate));
          return <Tag color="error" style={{ fontWeight: 700 }}>Trễ {days} ngày</Tag>;
        },
      },
      {
        title: 'Thao tác', key: 'actions', width: 160,
        render: (_, r) => (
          <Popconfirm
            title="Xác nhận đã nhận lại thiết bị (quá hạn)?"
            okText="Đã nhận lại" cancelText="Hủy"
            onConfirm={() => doAction(r.id, 'returned', () => borrowRequestService.markReturned(r.id), 'Đã nhận lại — ghi nhận trả không đúng hạn')}
          >
            <Button size="small" danger icon={<RollbackOutlined />} loading={actionLoading[r.id] === 'returned'}>Đã nhận lại</Button>
          </Popconfirm>
        ),
      },
    ]),

    returned: baseColumns([
      { title: 'Trả dự kiến', key: 'ret', render: (_, r) => fmt(r.expectedReturnDate) },
      { title: 'Ngày trả thực tế', key: 'returnedAt', render: (_, r) => fmtFull(r.returnedAt) },
      {
        title: 'Ghi chú',
        key: 'note',
        render: (_, r) => {
          if (!r.returnedAt) return '—';
          const onTime = dayjs(r.returnedAt) <= dayjs(r.expectedReturnDate);
          return onTime
            ? <Tag color="success" icon={<CheckCircleOutlined />}>Trả đúng hạn</Tag>
            : <Tag color="error" icon={<CloseCircleOutlined />}>Trả không đúng hạn</Tag>;
        },
      },
      {
        title: 'Thao tác', key: 'actions', width: 120,
        render: (_, r) => (
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, record: r })}>Xem</Button>
        ),
      },
    ]),

    cancelled: baseColumns([
      { title: 'Ngày tạo', key: 'createdAt', render: (_, r) => fmt(r.createdAt) },
      { title: 'Ngày hủy', key: 'updatedAt', render: (_, r) => fmt(r.updatedAt) },
      {
        title: 'Lý do hủy',
        key: 'reason',
        render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{r.rejectReason ?? r.note ?? '—'}</Text>,
      },
    ]),

    rejected: baseColumns([
      { title: 'Ngày gửi', key: 'createdAt', render: (_, r) => fmt(r.createdAt) },
      { title: 'Ngày từ chối', key: 'updatedAt', render: (_, r) => fmt(r.updatedAt) },
      {
        title: 'Lý do từ chối',
        key: 'reason',
        render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{r.rejectReason ?? r.note ?? '—'}</Text>,
      },
    ]),
  };

  /* ─── Render ───────────────────────────────────────────── */
  const activeTabDef = TABS.find(t => t.key === activeTab)!;

  return (
    <div style={{ padding: 24, background: SLINK_COLORS.surface, minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileTextOutlined style={{ fontSize: 22, color: SLINK_COLORS.primary }} />
        <Title level={4} style={{ margin: 0, color: SLINK_COLORS.textBase }}>Quản lý phiếu mượn</Title>
      </div>

      {/* Shopee-style status tabs */}
      <div style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: SLINK_COLORS.shadow,
        border: `1px solid ${SLINK_COLORS.border}`,
        marginBottom: 0,
        overflow: 'hidden',
      }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${SLINK_COLORS.border}`,
          overflowX: 'auto',
        }}>
          {TABS.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => { setActiveTab(tab.key); setPage(1); setSearch(''); }}
                style={{
                  flex: '0 0 auto',
                  padding: '14px 24px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                  background: 'transparent',
                  color: isActive ? tab.color : '#595959',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                {counts[tab.key] !== undefined && counts[tab.key]! > 0 && (
                  <span style={{
                    background: isActive ? tab.color : '#f0f0f0',
                    color: isActive ? '#fff' : '#595959',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 7px',
                    minWidth: 20,
                    textAlign: 'center',
                  }}>{counts[tab.key]}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + active tab label */}
        <div style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${SLINK_COLORS.border}`,
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, background: activeTabDef.color, borderRadius: 2 }} />
            <Text strong style={{ color: activeTabDef.color }}>
              {activeTabDef.label}
            </Text>
            {total > 0 && <Text type="secondary" style={{ fontSize: 13 }}>· {total} phiếu</Text>}
          </div>
          <Input
            placeholder="Tìm theo tên sinh viên..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240, borderRadius: 6 }}
            allowClear
          />
        </div>

        {/* Error */}
        {error && <Alert type="error" message={error} style={{ margin: 16, borderRadius: 6 }} />}

        {/* Table */}
        {loading ? (
          <div style={{ padding: 24 }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <Table<BorrowRequest>
            dataSource={items}
            columns={columnsByTab[activeTab]}
            rowKey="id"
            pagination={{
              current: page,
              total,
              pageSize: 15,
              onChange: (p) => load(p, activeTab),
              showTotal: (c) => `${c} phiếu`,
              showSizeChanger: false,
              style: { padding: '12px 20px' },
            }}
            size="middle"
            scroll={{ x: 900 }}
            locale={{ emptyText: `Không có phiếu ${activeTabDef.label.toLowerCase()} nào` }}
            rowClassName={(r) => {
              if (activeTab === 'overdue') return 'row-overdue';
              if (activeTab === 'pending') return 'row-pending';
              return '';
            }}
          />
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        open={rejectModal.open}
        title={<Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} /><span>Từ chối phiếu mượn</span></Space>}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true, loading: rejectLoading, id: 'reject-confirm-btn' }}
        cancelText="Hủy"
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModal({ open: false })}
        destroyOnClose
      >
        <p style={{ color: '#595959', marginBottom: 12 }}>
          Sinh viên <strong>{rejectModal.record?.userFullName}</strong> sẽ nhận thông báo từ chối qua <strong>chuông thông báo</strong> và <strong>email</strong>.
        </p>
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="Lý do từ chối" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailModal.open}
        title={<Space><EyeOutlined /><span>Chi tiết phiếu mượn</span></Space>}
        footer={<Button onClick={() => setDetailModal({ open: false })}>Đóng</Button>}
        onCancel={() => setDetailModal({ open: false })}
        destroyOnClose
      >
        {detailModal.record && (() => {
          const r = detailModal.record!;
          const onTime = r.returnedAt ? dayjs(r.returnedAt) <= dayjs(r.expectedReturnDate) : null;
          return (
            <div style={{ lineHeight: 2 }}>
              <div><Text type="secondary">Mã phiếu:</Text> <Text strong>{r.displayCode ?? `PH-${dayjs(r.createdAt).format('YYYYMMDD')}-${String(r.id).padStart(5, '0')}`}</Text></div>
              <div><Text type="secondary">Sinh viên:</Text> <Text strong>{r.userFullName}</Text></div>
              <div><Text type="secondary">Email:</Text> <Text>{r.userEmail}</Text></div>
              <div><Text type="secondary">Thiết bị:</Text> <Text>{r.equipmentName} × {r.quantity}</Text></div>
              <div><Text type="secondary">Ngày tạo:</Text> <Text>{fmtFull(r.createdAt)}</Text></div>
              <div><Text type="secondary">Trả dự kiến:</Text> <Text>{fmt(r.expectedReturnDate)}</Text></div>
              <div><Text type="secondary">Ngày trả thực tế:</Text> <Text>{fmtFull(r.returnedAt)}</Text></div>
              {onTime !== null && (
                <div>
                  <Text type="secondary">Kết quả:</Text>{' '}
                  {onTime
                    ? <Tag color="success" icon={<CheckCircleOutlined />}>Trả đúng hạn</Tag>
                    : <Tag color="error" icon={<CloseCircleOutlined />}>Trả không đúng hạn</Tag>}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      <style>{`
        .row-overdue > td { background: #fff1f0 !important; }
        .row-pending > td { background: #fffbe6 !important; }
      `}</style>
    </div>
  );
}
