import { useCallback, useEffect, useState } from 'react';
import {
  AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, ReloadOutlined, TeamOutlined,
  ToolOutlined, WarningOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { SLINK_COLORS } from '../../../theme/tokens';
import { reportService } from '../../../services/report.service';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveStats {
  pendingCount: number;
  borrowingCount: number;
  overdueCount: number;
  totalEquipment: number;
  availableEquipment: number;
  totalStudents: number;
  pendingRequests: any[];
  overdueRequests: any[];
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getReportData();
      if (res.data) {
        setStats({
          pendingCount: res.data.summary.pendingRequests || 0,
          borrowingCount: res.data.summary.borrowingRequests || 0,
          overdueCount: res.data.summary.overdueRequests || 0,
          totalEquipment: res.data.summary.totalEquipment || 0,
          availableEquipment: res.data.summary.activeEquipment || 0,
          totalStudents: res.data.summary.totalStudents || 0,
          pendingRequests: res.data.recentRequests?.filter((r: any) => r.status === 'pending') || [],
          overdueRequests: res.data.recentRequests?.filter((r: any) => r.status === 'overdue' || (r.status === 'borrowing' && new Date(r.expectedReturnDate) < new Date())) || [],
        });
      }
    } catch (e) {
      console.error("Dashboard Error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingColumns: ColumnsType<any> = [
    { title: 'Sinh viên', dataIndex: 'userFullName', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Thiết bị', dataIndex: 'equipmentName', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Gửi', dataIndex: 'createdAt', width: 90, render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(v).fromNow()}</Text> },
  ];

  const overdueColumns: ColumnsType<any> = [
    { title: 'Sinh viên', dataIndex: 'userFullName', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Thiết bị', dataIndex: 'equipmentName', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Hạn trả', dataIndex: 'expectedReturnDate', width: 96, render: (v: string) => <Text style={{ color: '#CF1322', fontWeight: 600, fontSize: 12 }}>{dayjs(v).format('DD/MM/YY')}</Text> },
  ];

  const tableProps = {
    size: 'small' as const,
    loading,
    pagination: { pageSize: PAGE_SIZE, size: 'small' as const, showSizeChanger: false },
    scroll: { y: TABLE_HEIGHT },
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>Tổng Quan Hệ Thống</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Trạng thái hoạt động thời gian thực — <span style={{ color: SLINK_COLORS.textBase }}>{dayjs().format('dddd, DD/MM/YYYY')}</span></Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Làm mới</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: 'Chờ duyệt', value: stats?.pendingCount ?? 0, icon: <ClockCircleOutlined />, iconColor: '#FA8C16', iconBg: 'rgba(250,140,22,0.1)', alert: true },
          { title: 'Đang mượn', value: stats?.borrowingCount ?? 0, icon: <AppstoreOutlined />, iconColor: SLINK_COLORS.info, iconBg: 'rgba(15,136,242,0.1)' },
          { title: 'Quá hạn', value: stats?.overdueCount ?? 0, icon: <WarningOutlined />, iconColor: '#CF1322', iconBg: 'rgba(207,19,34,0.1)', alert: true },
          { title: 'Tổng thiết bị', value: stats?.totalEquipment ?? 0, icon: <ToolOutlined />, iconColor: SLINK_COLORS.primary, iconBg: 'rgba(191,4,4,0.08)' },
          { title: 'Sẵn sàng', value: stats?.availableEquipment ?? 0, icon: <CheckCircleOutlined />, iconColor: SLINK_COLORS.success, iconBg: 'rgba(102,191,38,0.1)' },
          { title: 'Sinh viên', value: stats?.totalStudents ?? 0, icon: <TeamOutlined />, iconColor: '#722ED1', iconBg: 'rgba(114,46,209,0.1)' },
        ].map((kpi) => (
          <Col key={kpi.title} xs={12} sm={8} lg={4}><KpiCard {...kpi} /></Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={12}>
          <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClockCircleOutlined style={{ color: '#FA8C16' }} /><Text strong>Yêu cầu chờ duyệt</Text></div>} extra={<a href="/admin/requests" style={{ color: SLINK_COLORS.info, fontSize: 13 }}>Xem tất cả →</a>} style={{ height: '100%', borderRadius: 10, border: `1px solid ${SLINK_COLORS.border}` }}>
            {!loading && stats?.pendingRequests.length === 0 ? <EmptyState icon={<CheckCircleOutlined />} text="Không có yêu cầu chờ duyệt" /> : <Table {...tableProps} dataSource={stats?.pendingRequests ?? []} columns={pendingColumns} rowKey="id" />}
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><WarningOutlined style={{ color: '#CF1322' }} /><Text strong>Thiết bị quá hạn</Text></div>} extra={<a href="/admin/requests" style={{ color: '#CF1322', fontSize: 13 }}>Xem tất cả →</a>} style={{ height: '100%', borderRadius: 10, border: `1px solid ${SLINK_COLORS.border}` }}>
            {!loading && stats?.overdueRequests.length === 0 ? <EmptyState icon={<CheckCircleOutlined />} text="Không có thiết bị quá hạn" /> : <Table {...tableProps} dataSource={stats?.overdueRequests ?? []} columns={overdueColumns} rowKey="id" />}
          </Card>
        </Col>
      </Row>
    </div>
  );
}