import { useState } from 'react';
import {
  Badge, Button, Card, Empty, List, message,
  Skeleton, Tabs, Tag, Typography,
} from 'antd';
import {
  BellOutlined, CheckOutlined, ExclamationCircleOutlined,
  FileTextOutlined, SwapOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNotifications } from '../../../hooks/useNotifications';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;

/** Admin-facing notification type display config */
const ADMIN_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new_request:        { label: 'Yêu cầu mới',       color: 'blue',    icon: <FileTextOutlined /> },
  overdue_alert:      { label: 'Quá hạn',            color: 'volcano', icon: <ExclamationCircleOutlined /> },
  return_confirmed:   { label: 'Đã trả',             color: 'green',   icon: <SwapOutlined /> },
  checkout_confirmed: { label: 'Bàn giao',           color: 'purple',  icon: <SwapOutlined /> },
  due_reminder:       { label: 'Nhắc nhở',           color: 'orange',  icon: <BellOutlined /> },
  approved:           { label: 'Đã duyệt',           color: 'green',   icon: <CheckOutlined /> },
  rejected:           { label: 'Từ chối',            color: 'red',     icon: <ExclamationCircleOutlined /> },
};

export default function AdminNotificationsPage() {
  const { items, unreadCount, loading, markRead, markAllRead } = useNotifications('admin');
  const [activeTab, setActiveTab] = useState('all');

  const displayed = activeTab === 'unread' ? items.filter((n) => !n.isRead) : items;

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BellOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <div>
              <Title level={5} style={{ marginBottom: 0 }}>
                Thông báo hệ thống{' '}
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: 4 }} />
                )}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Thông báo dành cho quản trị viên</Text>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              icon={<CheckOutlined />}
              size="small"
              onClick={async () => {
                await markAllRead();
                message.success('Đã đánh dấu tất cả là đã đọc');
              }}
              style={{ borderRadius: 6 }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 20px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: `Tất cả (${items.length})` },
              { key: 'unread', label: `Chưa đọc (${unreadCount})` },
            ]}
            style={{ borderBottom: 'none' }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: 20 }}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: 40 }}>
            <Empty description={activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'} />
          </div>
        ) : (
          <List
            dataSource={displayed}
            renderItem={(notif) => {
              const cfg = ADMIN_TYPE_CONFIG[notif.type] ?? { label: notif.type, color: 'default', icon: <BellOutlined /> };
              return (
                <List.Item
                  onClick={() => !notif.isRead && markRead(notif.id)}
                  style={{
                    padding: '14px 20px',
                    cursor: notif.isRead ? 'default' : 'pointer',
                    background: notif.isRead ? 'transparent' : 'rgba(191, 4, 4, 0.03)',
                    borderBottom: `1px solid ${SLINK_COLORS.border}`,
                    transition: 'background 0.2s',
                  }}
                  actions={[
                    !notif.isRead && (
                      <Button
                        type="link"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                        style={{ color: SLINK_COLORS.info, padding: 0 }}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(191,4,4,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: SLINK_COLORS.primary, fontSize: 16 }}>{cfg.icon}</span>
                        </div>
                        {!notif.isRead && (
                          <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: SLINK_COLORS.primary }} />
                        )}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>{notif.title}</Text>
                        <Tag color={cfg.color} style={{ margin: 0, fontSize: 11 }}>{cfg.label}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 13 }}>{notif.message}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(notif.createdAt).format('HH:mm DD/MM/YYYY')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}
