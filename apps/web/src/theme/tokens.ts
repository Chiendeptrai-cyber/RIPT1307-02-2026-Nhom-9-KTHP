import type { ThemeConfig } from 'antd';

export const SLINK_COLORS = {
  primary: '#BF0404',
  primaryHover: '#a00303',
  info: '#0F88F2',
  success: '#66BF26',
  successLight: '#A4D97E',
  surface: '#F2F2F2',    // nền layout xám nhạt
  background: '#FFFFFF', // nền container trắng
  textBase: '#262626',   // chữ đen xám
  textSecondary: 'rgba(38, 38, 38, 0.65)',
  border: '#E8E8E8',
  shadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
} as const;

export const slinkAntdTheme: ThemeConfig = {
  token: {
    colorPrimary: SLINK_COLORS.primary,
    colorInfo: SLINK_COLORS.info,
    colorSuccess: SLINK_COLORS.success,
    colorLink: SLINK_COLORS.info,
    colorBgLayout: SLINK_COLORS.surface,
    colorBgContainer: SLINK_COLORS.background,
    colorTextBase: SLINK_COLORS.textBase,
    borderRadius: 6,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Menu: {
      itemColor: SLINK_COLORS.textSecondary,
      itemHoverColor: SLINK_COLORS.primary,
      itemSelectedColor: SLINK_COLORS.primary,
      itemHoverBg: 'rgba(191, 4, 4, 0.06)',
      itemSelectedBg: 'rgba(191, 4, 4, 0.08)',
      itemActiveBg: 'rgba(191, 4, 4, 0.08)',
      iconSize: 16,
    },
    Layout: {
      siderBg: SLINK_COLORS.background,
      headerBg: SLINK_COLORS.background,
      bodyBg: SLINK_COLORS.surface,
      triggerBg: SLINK_COLORS.primary,
      triggerColor: '#fff',
    },
    Progress: {
      defaultColor: SLINK_COLORS.info,
    },
    Button: {
      colorPrimary: SLINK_COLORS.primary,
      colorPrimaryHover: SLINK_COLORS.primaryHover,
    },
    Badge: {
      colorPrimary: SLINK_COLORS.primary,
    },
    Card: {
      borderRadius: 8,
      boxShadow: SLINK_COLORS.shadow,
    },
  },
};
