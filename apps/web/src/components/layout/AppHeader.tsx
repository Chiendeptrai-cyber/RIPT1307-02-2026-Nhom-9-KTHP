import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Layout, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from '@umijs/max';
import { useAuthStore } from '@/stores/auth.store';
import { SLINK_COLORS } from '@/theme/tokens';

const { Header } = Layout;
const { Text } = Typography;

interface Props {
  title: string;
}

export default function AppHeader({ title }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

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
      {/* Page Title */}
      <Text strong style={{ fontSize: 16, color: SLINK_COLORS.textBase }}>
        {title}
      </Text>

      {/* Right Actions */}
      <Space size={8} align="center">
        {/* Notification Bell */}
        <Badge count={0} showZero={false}>
          <div
            className="slink-icon-btn"
            onClick={() => navigate('/notifications')}
          >
            <BellOutlined style={{ fontSize: 16, color: SLINK_COLORS.textSecondary }} />
          </div>
        </Badge>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: SLINK_COLORS.border }} />

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenu }}
          placement="bottomRight"
          arrow
        >
          <div className="slink-user-btn">
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ backgroundColor: SLINK_COLORS.primary }}
            />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: SLINK_COLORS.textBase }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: SLINK_COLORS.textSecondary }}>
                {roleLabel}
              </div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
}
