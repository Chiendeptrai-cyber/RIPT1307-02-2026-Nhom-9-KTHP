import { useCallback, useEffect, useState } from 'react';
import {
  AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, ReloadOutlined, TeamOutlined,
  ToolOutlined, WarningOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, Modal, Row, Statistic, Table, Tag, Tooltip, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from '@umijs/max';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { equipmentService } from '../../../services/equipment.service';
import { http } from '../../../services/http';
import type { ApiResponse } from '@equipment-mgmt/shared';
import { SLINK_COLORS } from '../../../theme/tokens';
import { reportService } from '../../../services/report.service';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardApiStats {
  pendingRequests: number;
  overdueItems: number;
  violationCount: number;
  totalUsers: number;
  totalEquipment: number;
  totalBorrowed: number;
}

interface LiveStats {
  pendingCount: number;
  borrowingCount: number;
  overdueCount: number;
  totalEquipment: number;
  availableEquipment: number;
  totalStudents: number;
  pendingRequests: BorrowRequest[];
  overdueRequests: BorrowRequest[];
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  alert?: boolean;
  subtitle?: string;
}

function KpiCard({ title, value, icon, iconColor, iconBg, alert, subtitle }: KpiCardProps) {
  return (
    <Card
      style={{
        borderRadius: 10,
        border: `1px solid ${alert && value > 0 ? 'rgba(191,4,4,0.25)' : SLINK_COLORS.border}`,
        boxShadow: alert && value > 0 ? '0 2px 12px rgba(191,4,4,0.10)' : SLINK_COLORS.shadow,
        background: alert && value > 0 ? 'rgba(191,4,4,0.02)' : '#fff',
        height: 104,
      }}
      styles={{ body: { padding: '14px 18px', height: '100%' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: '100%' }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, color: iconColor }}>
          {alert && value > 0 ? <Badge count={value} size="small" offset={[6, -6]}>{icon}</Badge> : icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>{title}</Text>
          <Statistic value={value} valueStyle={{ fontSize: 24, fontWeight: 700, color: alert && value > 0 ? SLINK_COLORS.primary : SLINK_COLORS.textBase, lineHeight: 1 }} />
          {subtitle && <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>{subtitle}</Text>}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 36, color: SLINK_COLORS.success, marginBottom: 8 }}>{icon}</div>
      <Text type="secondary" style={{ fontSize: 13 }}>{text}</Text>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;
const TABLE_HEIGHT = 480;

const cardStyle = {
  borderRadius: 10,
  border: `1px solid ${SLINK_COLORS.border}`,
  boxShadow: SLINK_COLORS.shadow,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // ── 1. Dashboard stats from real API ──────────────────────────────────
      const [dashRes, pendingRes, overdueRes, equipRes] = await Promise.all([
        http.get<ApiResponse<DashboardApiStats>>('/reports/dashboard'),
        borrowRequestService.listAll({ page: 1, pageSize: 50, status: 'pending' }),
        borrowRequestService.listAll({ page: 1, pageSize: 50, status: 'overdue' }),
        equipmentService.list({ page: 1, pageSize: 1 }),
      ]);

      const apiStats = dashRes.data.data;
      const pendingItems = pendingRes.data?.items ?? [];
      const overdueItems = overdueRes.data?.items ?? [];
      const equip = equipRes.data;

      setStats({
        pendingCount: apiStats?.pendingRequests ?? pendingItems.length,
        borrowingCount: apiStats?.totalBorrowed ?? 0,
        overdueCount: apiStats?.overdueItems ?? overdueItems.length,
        totalEquipment: apiStats?.totalEquipment ?? equip?.total ?? 0,
        availableEquipment: equip?.items?.[0] ? (equip.items as any).availableTotal ?? 0 : 0,
        totalStudents: apiStats?.totalUsers ?? 0,
        pendingRequests: pendingItems,
        overdueRequests: overdueItems,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
      messageApi.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => { load(); }, [load]);

  // ── Approve / Reject ──────────────────────────────────────────────────────

  const handleApprove = (record: BorrowRequest) => {
    Modal.confirm({
      title: 'Xác nhận duyệt',
      content: `Duyệt yêu cầu của ${record.userFullName ?? `User #${record.userId}`}?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      okButtonProps: { style: { background: SLINK_COLORS.success, borderColor: SLINK_COLORS.success } },
      onOk: async () => {
        try {
          await borrowRequestService.approve(record.id);
          messageApi.success(`Đã duyệt yêu cầu của ${record.userFullName ?? `User #${record.userId}`}`);
          load();
        } catch {
          messageApi.error('Không thể duyệt yêu cầu');
        }
      },
    });
  };

  const handleReject = (record: BorrowRequest) => {
    Modal.confirm({
      title: 'Xác nhận từ chối',
      content: `Từ chối yêu cầu của ${record.userFullName ?? `User #${record.userId}`}?`,
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await borrowRequestService.reject(record.id, 'Quản trị viên từ chối yêu cầu.');
          messageApi.success(`Đã từ chối yêu cầu của ${record.userFullName ?? `User #${record.userId}`}`);
          load();
        } catch {
          messageApi.error('Không thể từ chối yêu cầu');
        }
      },
    });
  };

  // ── Pending columns ───────────────────────────────────────────────────────

  const pendingColumns: ColumnsType<BorrowRequest> = [
    {
      title: 'Sinh viên',
      dataIndex: 'userFullName',
      key: 'userFullName',
      ellipsis: true,
      render: (v: string, r: BorrowRequest) => (
        <Text style={{ fontSize: 13 }}>{v ?? `User #${r.userId}`}</Text>
      ),
    },
    {
      title: 'Ghi chú / Thiết bị',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{v ?? '—'}</Text>
      ),
    },
    {
      title: 'Gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 90,
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(v).fromNow()}
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 72,
      render: (_: unknown, record: BorrowRequest) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Duyệt yêu cầu">
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: SLINK_COLORS.success, borderColor: SLINK_COLORS.success }}
              onClick={() => handleApprove(record)}
            />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Overdue columns ───────────────────────────────────────────────────────

  const overdueColumns: ColumnsType<BorrowRequest> = [
    {
      title: 'Sinh viên',
      dataIndex: 'userFullName',
      key: 'userFullName',
      ellipsis: true,
      render: (v: string, r: BorrowRequest) => (
        <Text style={{ fontSize: 13 }}>{v ?? `User #${r.userId}`}</Text>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{v ?? '—'}</Text>
      ),
    },
    {
      title: 'Hạn trả',
      dataIndex: 'expectedReturnDate',
      key: 'expectedReturnDate',
      width: 96,
      render: (v: string) => (
        <Text style={{ color: '#CF1322', fontWeight: 600, fontSize: 12 }}>
          {dayjs(v).format('DD/MM/YY')}
        </Text>
      ),
    },
    {
      title: 'Trễ',
      key: 'days',
      width: 64,
      render: (_: unknown, r: BorrowRequest) => {
        const d = dayjs().diff(dayjs(r.expectedReturnDate), 'day');
        return <Tag color="volcano" style={{ fontSize: 11 }}>{d}N</Tag>;
      },
    },
  ];

  const tableProps = {
    size: 'small' as const,
    loading,
    pagination: { pageSize: PAGE_SIZE, size: 'small' as const, showSizeChanger: false },
    scroll: { y: TABLE_HEIGHT },
  };

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      {/* ── Header ── */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>Tổng Quan Hệ Thống</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Trạng thái hoạt động thời gian thực — <span style={{ color: SLINK_COLORS.textBase }}>{dayjs().format('dddd, DD/MM/YYYY')}</span></Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Làm mới</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          {
            title: 'Chờ duyệt',
            value: stats?.pendingCount ?? 0,
            icon: <ClockCircleOutlined />,
            iconColor: '#FA8C16',
            iconBg: 'rgba(250,140,22,0.1)',
            alert: true,
            subtitle: 'Cần xử lý',
          },
          {
            title: 'Đang mượn',
            value: stats?.borrowingCount ?? 0,
            icon: <AppstoreOutlined />,
            iconColor: SLINK_COLORS.info,
            iconBg: 'rgba(15,136,242,0.1)',
            subtitle: 'Đồ đang lưu hành',
          },
          {
            title: 'Quá hạn',
            value: stats?.overdueCount ?? 0,
            icon: <WarningOutlined />,
            iconColor: '#CF1322',
            iconBg: 'rgba(207,19,34,0.1)',
            alert: true,
            subtitle: 'Cần thu hồi',
          },
          {
            title: 'Tổng thiết bị',
            value: stats?.totalEquipment ?? 0,
            icon: <ToolOutlined />,
            iconColor: SLINK_COLORS.primary,
            iconBg: 'rgba(191,4,4,0.08)',
            subtitle: 'Trong kho',
          },
          {
            title: 'Tổng vi phạm',
            value: 0, // filled from apiStats
            icon: <CheckCircleOutlined />,
            iconColor: SLINK_COLORS.success,
            iconBg: 'rgba(102,191,38,0.1)',
            subtitle: 'Hồ sơ vi phạm',
          },
          {
            title: 'Người dùng',
            value: stats?.totalStudents ?? 0,
            icon: <TeamOutlined />,
            iconColor: '#722ED1',
            iconBg: 'rgba(114,46,209,0.1)',
            subtitle: 'Đã đăng ký',
          },
        ].map((kpi) => (
          <Col key={kpi.title} xs={12} sm={8} lg={4}><KpiCard {...kpi} /></Col>
        ))}
      </Row>

      {/* ── Tables Row ── */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={12}>
          <Card
            style={{ ...cardStyle, height: '100%' }}
            bodyStyle={{ padding: 0 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#FA8C16' }} />
                <Text strong style={{ fontSize: 14 }}>Yêu cầu chờ duyệt</Text>
                {!!stats?.pendingCount && (
                  <Badge count={stats.pendingCount} style={{ backgroundColor: '#FA8C16' }} />
                )}
              </div>
            }
            extra={
              <Link to="/admin/requests" style={{ color: SLINK_COLORS.info, fontSize: 13 }}>
                Xem tất cả →
              </Link>
            }
          >
            {!loading && stats?.pendingRequests.length === 0 ? (
              <EmptyState
                icon={<CheckCircleOutlined />}
                text="Không có yêu cầu nào đang chờ duyệt"
              />
            ) : (
              <Table<BorrowRequest>
                {...tableProps}
                dataSource={stats?.pendingRequests ?? []}
                columns={pendingColumns}
                rowKey="id"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            style={{ ...cardStyle, height: '100%' }}
            bodyStyle={{ padding: 0 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: '#CF1322' }} />
                <Text strong style={{ fontSize: 14 }}>Thiết bị quá hạn</Text>
                {!!stats?.overdueCount && <Badge count={stats.overdueCount} />}
              </div>
            }
            extra={
              <Link to="/admin/requests" style={{ color: '#CF1322', fontSize: 13 }}>
                Xem tất cả →
              </Link>
            }
          >
            {!loading && stats?.overdueRequests.length === 0 ? (
              <EmptyState
                icon={<CheckCircleOutlined />}
                text="Không có thiết bị nào quá hạn"
              />
            ) : (
              <Table<BorrowRequest>
                {...tableProps}
                dataSource={stats?.overdueRequests ?? []}
                columns={overdueColumns}
                rowKey="id"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}