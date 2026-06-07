import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
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
    icon: <BarChartOutlined />,
    label: 'Dashboard & Thống kê',
  },
  {
    key: ROUTES.ADMIN_REQUESTS,
    icon: <FileTextOutlined />,
    label: 'Yêu cầu mượn',
  },
  {
    key: ROUTES.ADMIN_DUE_OVERDUE,
    icon: <ClockCircleOutlined />,
    label: 'Hạn trả thiết bị',
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
    key: 'system-logs',
    icon: <HistoryOutlined />,
    label: 'Nhật ký hệ thống',
    children: [
      { key: ROUTES.ADMIN_LOGS_APPROVAL, label: 'Lịch sử duyệt phiếu' },
      { key: ROUTES.ADMIN_LOGS_EQUIPMENT, label: 'Lịch sử sửa thiết bị' },
      { key: ROUTES.ADMIN_LOGS_ACCOUNT, label: 'Lịch sử khóa tài khoản' },
      { key: ROUTES.ADMIN_LOGS_STOCK, label: 'Lịch sử cập nhật kho' },
    ],
  },
  {
    key: ROUTES.ADMIN_NOTIFICATIONS,
    icon: <BellOutlined />,
    label: 'Thông báo',
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
    const keys = [String(item.key)];
    if ('children' in item && Array.isArray((item as any).children)) {
      keys.push(...getMenuKeys((item as any).children));
    }
    return keys;
  });
}
