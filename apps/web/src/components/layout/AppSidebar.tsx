import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState, useEffect, useRef } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
  const siderRef = useRef<HTMLDivElement>(null);

  const menuKeys = useMemo(() => getMenuKeys(items), [items]);
  const selectedKeys = [getMenuSelectedKey(pathname, menuKeys)];

  // Ép ant-layout-sider-children thành flex column bằng JS
  // vì Ant Design v5 hash CSS specificity quá cao không override được
  useEffect(() => {
    if (!siderRef.current) return;
    const children = siderRef.current.querySelector(
      '.ant-layout-sider-children'
    ) as HTMLElement | null;
    if (!children) return;
    children.style.display = 'flex';
    children.style.flexDirection = 'column';
    children.style.height = '100%';
    children.style.overflow = 'hidden';
  }, []);

  return (
    <div ref={siderRef} style={{ display: 'contents' }}>
      <Sider
        width={240}
        collapsedWidth={64}
        collapsed={collapsed}
        trigger={null}
        theme="light"
        style={{
          background: SLINK_COLORS.background,
          borderRight: `1px solid ${SLINK_COLORS.border}`,
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
            flexShrink: 0,
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

          {!collapsed && (
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
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Menu
            theme="light"
            mode="inline"
            items={items}
            selectedKeys={selectedKeys}
            inlineCollapsed={collapsed}
            onClick={({ key }) => navigate(key)}
            style={{
              borderInlineEnd: 0,
              padding: '8px 0',
              background: 'transparent',
            }}
          />
        </div>

        {/* Custom trigger — dưới cùng, bên phải khi mở / giữa khi thu */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            height: 48,
            flexShrink: 0,
            borderTop: `1px solid ${SLINK_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            paddingRight: collapsed ? 0 : 24,
            cursor: 'pointer',
            background: '#fff',
            color: 'rgba(38, 38, 38, 0.65)',
            fontSize: 16,
            transition: 'background 0.2s, color 0.2s',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fafafa';
            e.currentTarget.style.color = SLINK_COLORS.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.color = 'rgba(38, 38, 38, 0.65)';
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 16 }}>
            {collapsed ? (
              <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z" />
              </svg>
            ) : (
              <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L276.1 483.4a31.96 31.96 0 000 50.4l435 348.8c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" />
              </svg>
            )}
          </span>
        </div>
      </Sider>
    </div>
  );
}