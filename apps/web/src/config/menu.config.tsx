import {
  AppstoreOutlined,
  BellOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { ROUTES } from '@/constants/routes.constant';

// Không dùng <Link> ở đây - navigation được xử lý bởi onClick trong AppSidebar
export const studentMenuItems: MenuProps['items'] = [
  {
    key: ROUTES.EQUIPMENT,
    icon: <ToolOutlined />,
    label: 'Thiết bị',
  },
  {
    key: ROUTES.BORROW_HISTORY,
    icon: <FileTextOutlined />,
    label: 'Yêu cầu của tôi',
  },
  {
    key: ROUTES.NOTIFICATIONS,
    icon: <BellOutlined />,
    label: 'Thông báo',
  },
];

export const adminMenuItems: MenuProps['items'] = [
  {
    key: ROUTES.ADMIN_DASHBOARD,
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: ROUTES.ADMIN_REQUESTS,
    icon: <FileTextOutlined />,
    label: 'Yêu cầu mượn',
  },
  {
    key: ROUTES.ADMIN_EQUIPMENT,
    icon: <ToolOutlined />,
    label: 'Thiết bị',
  },
  {
    key: ROUTES.ADMIN_USERS,
    icon: <TeamOutlined />,
    label: 'Người dùng',
  },
  {
    key: ROUTES.ADMIN_REPORTS,
    icon: <AppstoreOutlined />,
    label: 'Báo cáo',
  },
];

export function getMenuSelectedKey(pathname: string, keys: string[]): string {
  const sorted = [...keys].sort((a, b) => b.length - a.length);
  const match = sorted.find((key) => pathname === key || pathname.startsWith(`${key}/`));
  return match ?? pathname;
}

export function getMenuKeys(items: MenuProps['items']): string[] {
  if (!items) return [];
  return items.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('key' in item) || item.key == null) {
      return [];
    }
    return [String(item.key)];
  });
}
