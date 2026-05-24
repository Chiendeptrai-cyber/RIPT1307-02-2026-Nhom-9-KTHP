import { useCallback, useEffect, useState } from 'react';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Skeleton, Statistic, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { http } from '../../../services/http';
import { SLINK_COLORS } from '../../../theme/tokens';
import type { ApiResponse } from '@equipment-mgmt/shared';

const { Title, Text } = Typography;

interface DashboardStats {
  totalEquipment:    number;
  pendingRequests:   number;
  borrowing:         number;
  returned:          number;
  overdue:           number;
  totalStudents:     number;
  recentRequests: Array<{
    id: number;
    userFullName: string;
    status: string;
    createdAt: string;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Chờ duyệt', color: 'orange' },
  approved: { label: 'Đã duyệt',  color: 'blue' },
  rejected: { label: 'Từ chối',   color: 'red' },
  borrowing:{ label: 'Đang mượn', color: 'geekblue' },
  overdue:  { label: 'Quá hạn',   color: 'volcano' },
  returned: { label: 'Đã trả',    color: 'green' },
};

function StatCard({ title, value, icon, color, bgColor, suffix }: any) {
  return (
    <Card
      style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 22, color }}>{icon}</span>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{title}</Text>
          <Statistic value={value} suffix={suffix} valueStyle={{ fontSize: 26, fontWeight: 700, color: SLINK_COLORS.textBase, lineHeight: 1 }} />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get<ApiResponse<DashboardStats>>('/reports/dashboard');
      if (res.data.success && res.data.data) setStats(res.data.data);
    } catch {
      // Backend may not be running — show 0s
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const recentColumns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Sinh viên', dataIndex: 'userFullName', key: 'userFullName' },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s] ?? { label: s, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>Dashboard Quản Trị</Title>
          <Text type="secondary">Tổng quan hệ thống quản lý thiết bị PTIT</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Làm mới</Button>
      </div>

      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} xl={4}>
              <Skeleton.Button active block style={{ height: 90, borderRadius: 8 }} />
            </Col>
          ))}
        </Row>
      ) : (
        <>
          {/* Stats Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} xl={4}>
              <StatCard title="Tổng thiết bị" value={stats?.totalEquipment ?? 0} icon={<AppstoreOutlined />} color={SLINK_COLORS.info} bgColor="rgba(15,136,242,0.1)" />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <StatCard title="Sinh viên" value={stats?.totalStudents ?? 0} icon={<TeamOutlined />} color="#722ED1" bgColor="rgba(114,46,209,0.1)" />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <StatCard title="Chờ duyệt" value={stats?.pendingRequests ?? 0} icon={<ClockCircleOutlined />} color="#FA8C16" bgColor="rgba(250,140,22,0.1)" />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <StatCard title="Đang mượn" value={stats?.borrowing ?? 0} icon={<FileTextOutlined />} color={SLINK_COLORS.primary} bgColor="rgba(191,4,4,0.08)" />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <StatCard title="Quá hạn" value={stats?.overdue ?? 0} icon={<WarningOutlined />} color="#CF1322" bgColor="rgba(207,19,34,0.1)" />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <StatCard title="Đã hoàn trả" value={stats?.returned ?? 0} icon={<CheckCircleOutlined />} color={SLINK_COLORS.success} bgColor="rgba(102,191,38,0.1)" />
            </Col>
          </Row>

          {/* Recent Requests */}
          <Card
            title={<Text strong>Yêu cầu gần đây</Text>}
            extra={<a href="/admin/requests" style={{ color: SLINK_COLORS.info }}>Xem tất cả</a>}
            style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
          >
            <Table
              dataSource={stats?.recentRequests ?? []}
              columns={recentColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  );
}
