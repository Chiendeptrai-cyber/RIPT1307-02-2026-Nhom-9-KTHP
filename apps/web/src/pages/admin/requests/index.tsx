import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Button, Form, Input, message, Modal, Popconfirm,
  Skeleton, Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined,
  SearchOutlined, InboxOutlined, StopOutlined, RollbackOutlined,
  EyeOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { extractApiError } from '../../../utils/error';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── Types ──────────────────────────────────────────────── */
type TabKey = 'pending' | 'approved' | 'borrowing' | 'overdue' | 'returned' | 'cancelled' | 'rejected';

interface TabDef { key: TabKey; label: string; color: string; }
const TABS: TabDef[] = [
  { key: 'pending',   label: 'Chờ duyệt',  color: '#fa8c16' },
  { key: 'approved',  label: 'Đã duyệt',   color: '#1677ff' },
  { key: 'borrowing', label: 'Đang mượn',  color: '#722ed1' },
  { key: 'overdue',   label: 'Quá hạn',    color: '#cf1322' },
  { key: 'returned',  label: 'Đã trả',     color: '#389e0d' },
  { key: 'cancelled', label: 'Đã hủy',     color: '#8c8c8c' },
  { key: 'rejected',  label: 'Từ chối',    color: '#ff4d4f' },
];

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = (v?: string | null) => v ? dayjs(v).format('DD/MM/YYYY') : '—';
const fmtFull = (v?: string | null) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—';
const daysFromNow = (d?: string | null) => d ? dayjs(d).diff(dayjs().startOf('day'), 'day') : 0;
const displayCode = (r: BorrowRequest) =>
  r.displayCode ?? `PH-${dayjs(r.createdAt).format('YYYYMMDD')}-${String(r.id).padStart(5, '0')}`;

function Countdown({ dateStr, warnDays = 1 }: { dateStr?: string | null; warnDays?: number }) {
  const days = daysFromNow(dateStr);
  const color = days <= 0 ? '#ff4d4f' : days <= warnDays ? '#fa8c16' : '#389e0d';
  return <span style={{ color, fontWeight: 600 }}>
    {days > 0 ? `Còn ${days} ngày` : days === 0 ? 'Hôm nay' : `Quá ${Math.abs(days)} ngày`}
  </span>;
}

function StudentCell({ r }: { r: BorrowRequest }) {
  return <div>
    <Text strong style={{ fontSize: 13 }}>{r.userFullName ?? '—'}</Text><br />
    <Text type="secondary" style={{ fontSize: 12 }}>{r.userEmail ?? ''}</Text>
  </div>;
}

function EqCell({ r }: { r: BorrowRequest }) {
  return <div>
    <Text style={{ fontSize: 13 }}>{r.equipmentName ?? '—'}</Text>
    {r.quantity && <><br /><Text type="secondary" style={{ fontSize: 12 }}>SL: {r.quantity}</Text></>}
  </div>;
}

function CodeCell({ r }: { r: BorrowRequest }) {
  return <Text code style={{ fontSize: 12, color: SLINK_COLORS.primary, fontWeight: 600 }}>
    {displayCode(r)}
  </Text>;
}

/* ─── Cache type ──────────────────────────────────────────── */
interface TabCache { items: BorrowRequest[]; total: number; page: number; }
type CacheMap = Partial<Record<TabKey, TabCache>>;

/* ─── Main ────────────────────────────────────────────────── */
export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [cache, setCache] = useState<CacheMap>({});
  const [initialLoading, setInitialLoading] = useState(true);  // first load
  const [refreshing, setRefreshing] = useState(false);         // silent refresh indicator
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; record?: BorrowRequest }>({ open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [form] = Form.useForm();

  // Detail modal
  const [detailModal, setDetailModal] = useState<{ open: boolean; record?: BorrowRequest }>({ open: false });

  // Search debounce
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  /* ── Fetch a single tab ─────────────────────────────────── */
  const fetchTab = useCallback(async (tab: TabKey, page = 1, searchVal = '') => {
    const res = await borrowRequestService.listAll({
      page, pageSize: 15, status: tab,
      search: searchVal || undefined,
    });
    if (res.success && res.data) {
      setCache(prev => ({ ...prev, [tab]: { items: res.data!.items, total: res.data!.total, page } }));
    }
  }, []);

  /* ── Initial: load ALL tabs in parallel ─────────────────── */
  const loadAll = useCallback(async (searchVal = '') => {
    setError(null);
    try {
      await Promise.all(TABS.map(t => fetchTab(t.key, 1, searchVal)));
    } catch (e: any) {
      setError(e?.message ?? 'Không thể tải dữ liệu');
    }
  }, [fetchTab]);

  useEffect(() => {
    setInitialLoading(true);
    loadAll('').finally(() => setInitialLoading(false));
  }, []);

  /* ── Search: debounce then reload all tabs ──────────────── */
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setRefreshing(true);
      loadAll(search).finally(() => setRefreshing(false));
    }, 400);
  }, [search]);

  /* ── Silent refresh a specific tab after action ─────────── */
  const refreshTab = async (tab: TabKey) => {
    const cur = cache[tab];
    await fetchTab(tab, cur?.page ?? 1, search);
  };

  /* ── Page change for current tab ───────────────────────── */
  const handlePageChange = async (p: number) => {
    await fetchTab(activeTab, p, search);
  };

  /* ── Action helper ──────────────────────────────────────── */
  const setRowLoading = (id: number, a: string) => setActionLoading(p => ({ ...p, [id]: a }));
  const clearRowLoading = (id: number) => setActionLoading(p => { const n = { ...p }; delete n[id]; return n; });

  const doAction = async (id: number, action: string, fn: () => Promise<any>, msg: string, affectedTabs: TabKey[]) => {
    setRowLoading(id, action);
    try {
      await fn();
      message.success(msg);
      // Refresh affected tabs silently — NO page reload, NO skeleton
      await Promise.all(affectedTabs.map(t => refreshTab(t)));
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
      message.success('Đã từ chối — thông báo đã gửi cho sinh viên');
      setRejectModal({ open: false });
      await Promise.all([refreshTab('pending'), refreshTab('rejected')]);
    } catch (e: any) {
      message.error(e?.message ?? 'Thao tác thất bại');
    } finally {
      setRejectLoading(false);
    }
  };

  /* ─── Columns per tab ─────────────────────────────────────── */
  const base = (extra: ColumnsType<BorrowRequest>): ColumnsType<BorrowRequest> => [
    { title: 'Mã phiếu', key: 'code', width: 160, render: (_, r) => <CodeCell r={r} /> },
    { title: 'Sinh viên', key: 'sv', render: (_, r) => <StudentCell r={r} /> },
    { title: 'Thiết bị', key: 'tb', render: (_, r) => <EqCell r={r} /> },
    ...extra,
  ];

  const cols: Record<TabKey, ColumnsType<BorrowRequest>> = {
    pending: base([
      { title: 'Ngày gửi', key: 'c', render: (_, r) => fmt(r.createdAt) },
      { title: 'Trả dự kiến', key: 'rd', render: (_, r) => fmt(r.expectedReturnDate) },
      {
        title: 'Thao tác', key: 'act', width: 180,
        render: (_, r) => (
          <Space size={6}>
            <Popconfirm title="Duyệt yêu cầu này?" okText="Duyệt" cancelText="Hủy"
              onConfirm={() => doAction(r.id, 'approve',
                () => borrowRequestService.approve(r.id),
                'Đã duyệt — thông báo đã gửi cho sinh viên',
                ['pending', 'approved']
              )}>
              <Button size="small" icon={<CheckCircleOutlined />}
                style={{ color: '#389e0d', borderColor: '#389e0d' }}
                loading={actionLoading[r.id] === 'approve'}>Duyệt</Button>
            </Popconfirm>
            <Button size="small" danger icon={<CloseCircleOutlined />}
              onClick={() => { setRejectModal({ open: true, record: r }); setRejectReason(''); form.resetFields(); }}>
              Từ chối
            </Button>
          </Space>
        ),
      },
    ]),

    approved: base([
      { title: 'Ngày duyệt', key: 'ad', render: (_, r) => fmt(r.approvedAt) },
      { title: 'Trả dự kiến', key: 'rd', render: (_, r) => fmt(r.expectedReturnDate) },
      {
        title: 'Hạn đến nhận', key: 'hdn',
        render: (_, r) => {
          const dl = r.approvedAt ? dayjs(r.approvedAt).add(3, 'day').toISOString() : null;
          return <Countdown dateStr={dl} warnDays={1} />;
        },
      },
      {
        title: 'Thao tác', key: 'act', width: 200,
        render: (_, r) => (
          <Space size={6}>
            <Popconfirm title="Sinh viên đã đến nhận thiết bị?" okText="Đã nhận" cancelText="Hủy"
              onConfirm={() => doAction(r.id, 'recv',
                () => borrowRequestService.markReceived(r.id),
                'Phiếu chuyển sang Đang mượn',
                ['approved', 'borrowing']
              )}>
              <Button size="small" type="primary" icon={<InboxOutlined />}
                loading={actionLoading[r.id] === 'recv'}>Đã nhận</Button>
            </Popconfirm>
            <Popconfirm title="Sinh viên chưa đến nhận?" okText="Hủy đơn" cancelText="Không" okType="danger"
              onConfirm={() => doAction(r.id, 'norecv',
                () => borrowRequestService.markNotReceived(r.id),
                'Đã hủy — sinh viên không đến nhận',
                ['approved', 'cancelled']
              )}>
              <Button size="small" danger icon={<StopOutlined />}
                loading={actionLoading[r.id] === 'norecv'}>Chưa nhận</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]),

    borrowing: base([
      { title: 'Ngày nhận', key: 'bd', render: (_, r) => fmt(r.borrowedAt) },
      { title: 'Trả dự kiến', key: 'rd', render: (_, r) => fmt(r.expectedReturnDate) },
      { title: 'Còn lại', key: 'cl', render: (_, r) => <Countdown dateStr={r.expectedReturnDate} warnDays={2} /> },
      {
        title: 'Thao tác', key: 'act', width: 150,
        render: (_, r) => (
          <Popconfirm title="Xác nhận đã nhận lại thiết bị?" okText="Đã nhận lại" cancelText="Hủy"
            onConfirm={() => doAction(r.id, 'ret',
              () => borrowRequestService.markReturned(r.id),
              'Phiếu chuyển sang Đã trả',
              ['borrowing', 'returned']
            )}>
            <Button size="small" icon={<RollbackOutlined />}
              style={{ color: '#389e0d', borderColor: '#389e0d' }}
              loading={actionLoading[r.id] === 'ret'}>Đã nhận lại</Button>
          </Popconfirm>
        ),
      },
    ]),

    overdue: base([
      { title: 'Trả dự kiến', key: 'rd', render: (_, r) => fmt(r.expectedReturnDate) },
      {
        title: 'Quá hạn', key: 'qh',
        render: (_, r) => <Tag color="error" style={{ fontWeight: 700 }}>Trễ {Math.abs(daysFromNow(r.expectedReturnDate))} ngày</Tag>,
      },
      {
        title: 'Thao tác', key: 'act', width: 150,
        render: (_, r) => (
          <Popconfirm title="Xác nhận đã nhận lại (quá hạn)?" okText="Đã nhận lại" cancelText="Hủy"
            onConfirm={() => doAction(r.id, 'ret',
              () => borrowRequestService.markReturned(r.id),
              'Ghi nhận trả không đúng hạn',
              ['overdue', 'returned']
            )}>
            <Button size="small" danger icon={<RollbackOutlined />}
              loading={actionLoading[r.id] === 'ret'}>Đã nhận lại</Button>
          </Popconfirm>
        ),
      },
    ]),

    returned: base([
      { title: 'Trả dự kiến', key: 'rd', render: (_, r) => fmt(r.expectedReturnDate) },
      { title: 'Ngày trả thực tế', key: 'ra', render: (_, r) => fmtFull(r.returnedAt) },
      {
        title: 'Kết quả', key: 'kq',
        render: (_, r) => {
          if (!r.returnedAt) return '—';
          const ok = dayjs(r.returnedAt) <= dayjs(r.expectedReturnDate);
          return ok
            ? <Tag color="success" icon={<CheckCircleOutlined />}>Trả đúng hạn</Tag>
            : <Tag color="error" icon={<CloseCircleOutlined />}>Trả không đúng hạn</Tag>;
        },
      },
      {
        title: 'Thao tác', key: 'act', width: 100,
        render: (_, r) => (
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, record: r })}>Xem</Button>
        ),
      },
    ]),

    cancelled: base([
      { title: 'Ngày tạo', key: 'c', render: (_, r) => fmt(r.createdAt) },
      { title: 'Ngày hủy', key: 'u', render: (_, r) => fmt(r.updatedAt) },
      { title: 'Lý do', key: 'lr', render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{r.rejectReason ?? r.note ?? '—'}</Text> },
    ]),

    rejected: base([
      { title: 'Ngày gửi', key: 'c', render: (_, r) => fmt(r.createdAt) },
      { title: 'Ngày từ chối', key: 'u', render: (_, r) => fmt(r.updatedAt) },
      { title: 'Lý do', key: 'lr', render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{r.rejectReason ?? r.note ?? '—'}</Text> },
    ]),
  };

  /* ─── Current tab data ────────────────────────────────────── */
  const curCache = cache[activeTab];
  const tabDef = TABS.find(t => t.key === activeTab)!;

  /* ─── Manual refresh ──────────────────────────────────────── */
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadAll(search).finally(() => setRefreshing(false));
  };

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div style={{ padding: 24, background: SLINK_COLORS.surface, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileTextOutlined style={{ fontSize: 22, color: SLINK_COLORS.primary }} />
        <Title level={4} style={{ margin: 0 }}>Quản lý phiếu mượn</Title>
        <Button
          size="small" icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleManualRefresh} loading={refreshing}
          style={{ marginLeft: 'auto' }}
        >Làm mới</Button>
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16, borderRadius: 6 }} closable />}

      {initialLoading ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: SLINK_COLORS.shadow }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 8,
          boxShadow: SLINK_COLORS.shadow,
          border: `1px solid ${SLINK_COLORS.border}`,
          overflow: 'hidden',
        }}>
          {/* ── Tab bar ─────────────────────────────────────── */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${SLINK_COLORS.border}`, overflowX: 'auto' }}>
            {TABS.map(tab => {
              const isActive = tab.key === activeTab;
              const count = cache[tab.key]?.total ?? 0;
              return (
                <button
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}   // ← instant, no API call
                  style={{
                    flex: '0 0 auto',
                    padding: '14px 22px',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                    background: 'transparent',
                    color: isActive ? tab.color : '#595959',
                    fontWeight: isActive ? 700 : 400,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'color 0.2s, border-color 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      background: isActive ? tab.color : '#f0f0f0',
                      color: isActive ? '#fff' : '#595959',
                      borderRadius: 10, fontSize: 11, fontWeight: 700,
                      padding: '1px 7px',
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Toolbar ─────────────────────────────────────── */}
          <div style={{
            padding: '12px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: `1px solid ${SLINK_COLORS.border}`, flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 18, background: tabDef.color, borderRadius: 2 }} />
              <Text strong style={{ color: tabDef.color }}>{tabDef.label}</Text>
              {curCache && <Text type="secondary" style={{ fontSize: 13 }}>· {curCache.total} phiếu</Text>}
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

          {/* ── Table: key={activeTab} forces remount on tab change so columns update correctly ── */}
          <Table<BorrowRequest>
            key={activeTab}
            dataSource={curCache?.items ?? []}
            columns={cols[activeTab]}
            rowKey="id"
            loading={refreshing}
            pagination={{
              current: curCache?.page ?? 1,
              total: curCache?.total ?? 0,
              pageSize: 15,
              onChange: handlePageChange,
              showTotal: c => `${c} phiếu`,
              showSizeChanger: false,
              style: { padding: '12px 20px' },
            }}
            size="middle"
            scroll={{ x: 900 }}
            locale={{ emptyText: `Không có phiếu ${tabDef.label.toLowerCase()} nào` }}
            rowClassName={r => activeTab === 'overdue' ? 'row-overdue' : activeTab === 'pending' ? 'row-pending' : ''}
          />
        </div>
      )}

      {/* ── Reject Modal ─────────────────────────────────────── */}
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
          Sinh viên <strong>{rejectModal.record?.userFullName}</strong> sẽ nhận thông báo qua <strong>chuông</strong> và <strong>email</strong>.
        </p>
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="Lý do từ chối" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <TextArea rows={4} placeholder="Nhập lý do..." value={rejectReason}
              onChange={e => setRejectReason(e.target.value)} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Detail Modal ─────────────────────────────────────── */}
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
            <div style={{ lineHeight: 2.2 }}>
              <div><Text type="secondary">Mã phiếu:</Text> <Text code style={{ color: SLINK_COLORS.primary }}>{displayCode(r)}</Text></div>
              <div><Text type="secondary">Sinh viên:</Text> <Text strong>{r.userFullName}</Text></div>
              <div><Text type="secondary">Email:</Text> <Text>{r.userEmail}</Text></div>
              <div><Text type="secondary">Thiết bị:</Text> <Text>{r.equipmentName} × {r.quantity}</Text></div>
              <div><Text type="secondary">Ngày tạo:</Text> <Text>{fmtFull(r.createdAt)}</Text></div>
              <div><Text type="secondary">Trả dự kiến:</Text> <Text>{fmt(r.expectedReturnDate)}</Text></div>
              <div><Text type="secondary">Ngày trả thực tế:</Text> <Text>{fmtFull(r.returnedAt)}</Text></div>
              {onTime !== null && (
                <div><Text type="secondary">Kết quả:</Text>{' '}
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
        .row-pending  > td { background: #fffbe6 !important; }
      `}</style>
    </div>
  );
}
