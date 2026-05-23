import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { useLocation, useNavigate } from '@umijs/max';
import { getMenuKeys, getMenuSelectedKey } from '@/config/menu.config';
import { SLINK_COLORS } from '@/theme/tokens';

const { Sider } = Layout;

interface Props {
  items: MenuProps['items'];
  title: string;
}

export default function AppSidebar({ items, title }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const menuKeys = useMemo(() => getMenuKeys(items), [items]);
  const selectedKeys = [getMenuSelectedKey(pathname, menuKeys)];

  return (
    <Sider
      width={240}
      breakpoint="lg"
      collapsedWidth={64}
      collapsible
      theme="light"
      style={{
        background: SLINK_COLORS.background,
        borderRight: `1px solid ${SLINK_COLORS.border}`,
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      {/* Logo & Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '20px 20px',
          borderBottom: `1px solid ${SLINK_COLORS.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${SLINK_COLORS.primary} 0%, #8B0000 100%)`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 800,
            flexShrink: 0,
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(191, 4, 4, 0.35)',
          }}
        >
          PTIT
        </div>
        <div style={{ overflow: 'hidden', lineHeight: 1.3 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: SLINK_COLORS.textBase,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 11, color: SLINK_COLORS.textSecondary, marginTop: 1 }}>
            Slink PTIT
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="light"
        mode="inline"
        items={items}
        selectedKeys={selectedKeys}
        onClick={({ key }) => navigate(key)}
        style={{
          borderInlineEnd: 0,
          padding: '8px 0',
          background: 'transparent',
        }}
      />
    </Sider>
  );
}
