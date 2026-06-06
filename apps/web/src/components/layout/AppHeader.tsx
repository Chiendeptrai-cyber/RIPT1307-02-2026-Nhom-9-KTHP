import { BellOutlined, CheckOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Empty, Layout, List, Popover, Skeleton, Spin, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import type { UIEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@umijs/max';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth.store';
import { SLINK_COLORS } from '@/theme/tokens';
import {
  NOTIFICATION_CHANGED_EVENT,
  notificationService,
  type Notification,
} from '@/services/notification.service';

const { Header } = Layout;
const { Text } = Typography;

const POLL_INTERVAL_MS = 60_000; // Poll mỗi 60 giây
const NOTIFICATION_PAGE_SIZE = 20;

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  new_request: { label: 'Yêu cầu mới', color: 'blue' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
  checkout_confirmed: { label: 'Bàn giao', color: 'purple' },
  return_confirmed: { label: 'Đã trả', color: 'cyan' },
  due_reminder: { label: 'Nhắc nhở', color: 'orange' },
  overdue_alert: { label: 'Quá hạn', color: 'volcano' },
};

interface Props {
  title: string;
}

export default function AppHeader({ title }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPage, setNotificationPage] = useState(1);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationLoadingMore, setNotificationLoadingMore] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationService.list({ pageSize: 1 });
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount ?? 0);
      }
    } catch {
      // Silent - keep header usable when the notification API is temporarily unavailable.
    }
  }, []);

  const loadNotifications = useCallback(async (nextPage = 1, reset = false) => {
    if (reset) {
      setNotificationLoading(true);
    } else {
      setNotificationLoadingMore(true);
    }

    try {
      const res = await notificationService.list({
        page: nextPage,
        pageSize: NOTIFICATION_PAGE_SIZE,
      });

      if (res.success && res.data) {
        const nextItems = res.data.items;
        setNotifications((prev) => (reset ? nextItems : [...prev, ...nextItems]));
        setNotificationPage(res.data.page ?? nextPage);
        setNotificationTotal(res.data.total ?? nextItems.length);
        setUnreadCount(res.data.unreadCount ?? 0);
      }
    } catch {
      // Silent - do not close the popup because of a transient API failure.
    } finally {
      setNotificationLoading(false);
      setNotificationLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, POLL_INTERVAL_MS);

    const handleNotificationChanged = () => {
      fetchUnread();
      if (notificationOpen) {
        loadNotifications(1, true);
      }
    };

    window.addEventListener(NOTIFICATION_CHANGED_EVENT, handleNotificationChanged);
    return () => {
      clearInterval(timer);
      window.removeEventListener(NOTIFICATION_CHANGED_EVENT, handleNotificationChanged);
    };
  }, [fetchUnread, loadNotifications, notificationOpen]);

  useEffect(() => {
    if (notificationOpen) {
      loadNotifications(1, true);
    }
  }, [loadNotifications, notificationOpen]);

  const displayName = user?.fullName ?? 'Người dùng';
  const roleLabel = user?.role === 'admin' ? 'Quản trị viên' : 'Sinh viên';

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  const handleUserMenu: MenuProps['onClick'] = ({ key }) => {
    if (key === 'profile') {
      navigate(user?.role === 'admin' ? '/admin/profile' : '/profile');
    } else if (key === 'logout') {
      logout();
      window.location.href = '/login';
    }
  };

  const hasMoreNotifications = notifications.length < notificationTotal;

  const handleNotificationScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24;

    if (isNearBottom && hasMoreNotifications && !notificationLoading && !notificationLoadingMore) {
      loadNotifications(notificationPage + 1, false);
    }
  };

  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return;

    await notificationService.markRead(notification.id);
    setNotifications((prev) => prev.map((item) => (
      item.id === notification.id ? { ...item, isRead: true } : item
    )));
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const notificationContent = (
    <div style={{ width: 380, maxWidth: 'calc(100vw - 32px)' }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${SLINK_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ lineHeight: 1.35 }}>
          <Text strong style={{ fontSize: 14 }}>Thông báo</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo chưa đọc'}
            </Text>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            size="small"
            type="text"
            icon={<CheckOutlined />}
            onClick={handleMarkAllRead}
            style={{ color: SLINK_COLORS.info }}
          >
            Đã đọc hết
          </Button>
        )}
      </div>

      <div
        onScroll={handleNotificationScroll}
        style={{ maxHeight: 420, overflowY: 'auto' }}
      >
        {notificationLoading ? (
          <div style={{ padding: 16 }}>
            <Skeleton active avatar paragraph={{ rows: 3 }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 28 }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo nào" />
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => {
              const cfg = TYPE_CONFIG[notification.type] ?? { label: notification.type, color: 'default' };

              return (
                <List.Item
                  onClick={() => handleMarkRead(notification)}
                  style={{
                    padding: '12px 16px',
                    cursor: notification.isRead ? 'default' : 'pointer',
                    background: notification.isRead ? '#fff' : 'rgba(191, 4, 4, 0.04)',
                    borderBottom: `1px solid ${SLINK_COLORS.border}`,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(191, 4, 4, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <BellOutlined style={{ color: SLINK_COLORS.primary }} />
                        </div>
                        {!notification.isRead && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: SLINK_COLORS.primary,
                            }}
                          />
                        )}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <Text strong={!notification.isRead} style={{ fontSize: 13, flex: 1 }} ellipsis>
                          {notification.title}
                        </Text>
                        <Tag color={cfg.color} style={{ margin: 0, fontSize: 11, flexShrink: 0 }}>
                          {cfg.label}
                        </Tag>
                      </div>
                    }
                    description={
                      <div style={{ lineHeight: 1.45 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {notification.message}
                        </Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {dayjs(notification.createdAt).format('HH:mm DD/MM/YYYY')}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}

        {notificationLoadingMore && (
          <div style={{ padding: 12, textAlign: 'center' }}>
            <Spin size="small" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Header
      style={{
        background: SLINK_COLORS.background,
        borderBottom: `1px solid ${SLINK_COLORS.border}`,
        padding: '0 24px',
        height: 64,
        lineHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <Text strong style={{ fontSize: 16, color: SLINK_COLORS.textBase }}>
        {title}
      </Text>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Popover
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          trigger="click"
          placement="bottomRight"
          content={notificationContent}
          arrow
          overlayInnerStyle={{ padding: 0, borderRadius: 8, overflow: 'hidden' }}
        >
          <Badge count={unreadCount} showZero={false} overflowCount={99}>
            <div className="slink-icon-btn">
              <BellOutlined style={{ fontSize: 16, color: SLINK_COLORS.textSecondary }} />
            </div>
          </Badge>
        </Popover>

        <div style={{ width: 1, height: 24, background: SLINK_COLORS.border }} />

        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenu }}
          placement="bottomRight"
          arrow
        >
          <div className="slink-user-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Avatar
              size={32}
              src={user?.avatarUrl || undefined}
              icon={<UserOutlined />}
              style={{ backgroundColor: SLINK_COLORS.primary, flexShrink: 0 }}
            />
            <div style={{ lineHeight: 1.3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: SLINK_COLORS.textBase, whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: SLINK_COLORS.textSecondary, whiteSpace: 'nowrap' }}>
                {roleLabel}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
