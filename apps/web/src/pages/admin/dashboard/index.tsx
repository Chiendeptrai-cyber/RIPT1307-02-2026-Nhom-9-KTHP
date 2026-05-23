import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, suffix, icon, color, bgColor }: StatCardProps) {
  return (
    <Card
      style={{
        borderRadius: 8,
        border: `1px solid ${SLINK_COLORS.border}`,
        boxShadow: SLINK_COLORS.shadow,
      }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22, color }}>{icon}</span>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{title}</Text>
          <Statistic
            value={value}
            suffix={suffix}
            valueStyle={{ fontSize: 26, fontWeight: 700, color: SLINK_COLORS.textBase, lineHeight: 1 }}
          />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4, color: SLINK_COLORS.textBase }}>
          Dashboard Quản Trị
        </Title>
        <Text type="secondary">Tổng quan hệ thống quản lý thiết bị PTIT</Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng thiết bị"
            value={48}
            icon={<AppstoreOutlined />}
            color={SLINK_COLORS.info}
            bgColor="rgba(15, 136, 242, 0.1)"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Yêu cầu chờ duyệt"
            value={12}
            icon={<ClockCircleOutlined />}
            color="#FA8C16"
            bgColor="rgba(250, 140, 22, 0.1)"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Đang cho mượn"
            value={23}
            icon={<FileTextOutlined />}
            color={SLINK_COLORS.primary}
            bgColor="rgba(191, 4, 4, 0.08)"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Đã hoàn trả"
            value={156}
            icon={<CheckCircleOutlined />}
            color={SLINK_COLORS.success}
            bgColor="rgba(102, 191, 38, 0.1)"
          />
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={<Text strong>Yêu cầu gần đây</Text>}
            extra={<a href="/admin/requests" style={{ color: SLINK_COLORS.info }}>Xem tất cả</a>}
            style={{
              borderRadius: 8,
              border: `1px solid ${SLINK_COLORS.border}`,
              boxShadow: SLINK_COLORS.shadow,
            }}
          >
            <Text type="secondary">Danh sách yêu cầu mượn thiết bị sẽ hiển thị tại đây.</Text>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<Text strong>Thống kê người dùng</Text>}
            extra={<TeamOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
            style={{
              borderRadius: 8,
              border: `1px solid ${SLINK_COLORS.border}`,
              boxShadow: SLINK_COLORS.shadow,
            }}
          >
            <Text type="secondary">Thống kê sinh viên hoạt động sẽ hiển thị tại đây.</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
