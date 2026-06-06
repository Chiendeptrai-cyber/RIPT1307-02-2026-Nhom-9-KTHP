import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Card, Input, Select, Skeleton, Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  HistoryOutlined, LockOutlined, SearchOutlined, UnlockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { SystemLogAction } from '@equipment-mgmt/shared';
import { readSystemLogs, type MockSystemLog } from '@/mocks/systemLogStore';
import { SLINK_COLORS } from '@/theme/tokens';

const { Title, Text } = Typography;

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: ReactNode }> = {
  [SystemLogAction.LOCK_ACCOUNT]: {
    label: 'Khóa',
    color: 'red',
    icon: <LockOutlined />,
  },
  [SystemLogAction.UNLOCK_ACCOUNT]: {
    label: 'Mở khóa',
    color: 'green',
    icon: <UnlockOutlined />,
  },
};

const fmt = (v?: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—';

export default function AccountLogsPage() {
  const [items, setItems] = useState<MockSystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>();

  const load = useCallback(() => {
    setLoading(true);
    try {
      let logs = readSystemLogs('account');
      if (actionFilter) logs = logs.filter((l) => l.action === actionFilter);
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        logs = logs.filter(
          (l) =>
            l.code.toLowerCase().includes(kw) ||
            l.targetLabel.toLowerCase().includes(kw) ||
            l.adminName.toLowerCase().includes(kw),
        );
      }
      setItems(logs);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnsType<MockSystemLog> = [
    {
      title: 'ID Log', dataIndex: 'code', width: 120,
      render: (code: string) => (
        <Text code style={{ fontSize: 12, color: SLINK_COLORS.primary, fontWeight: 600 }}>{code}</Text>
      ),
    },
    {
      title: 'Thời gian', dataIndex: 'timestamp', width: 160,
      render: fmt,
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Admin thực hiện', dataIndex: 'adminName', width: 150,
      render: (name: string) => (
        <Space>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: SLINK_COLORS.primary, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>{name.charAt(0).toUpperCase()}</div>
          <Text style={{ fontSize: 13 }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Sinh viên bị tác động', dataIndex: 'targetLabel', width: 180,
      render: (label: string) => <Text strong style={{ fontSize: 13 }}>{label}</Text>,
    },
    {
      title: 'Hành động', dataIndex: 'action', width: 130,
      render: (action: string) => {
        const cfg = ACTION_CONFIG[action];
        return cfg ? <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag> : <Tag>{action}</Tag>;
      },
    },
    {
      title: 'Lý do', width: 280,
      render: (_, r) => {
        const reason = r.details.reason as string | undefined;
        return reason ? (
          <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>{reason}</Text>
        ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HistoryOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <Title level={5} style={{ marginBottom: 0 }}>Lịch sử khóa tài khoản</Title>
          </div>
          <Space wrap>
            <Select
              placeholder="Tất cả"
              allowClear
              value={actionFilter}
              onChange={setActionFilter}
              style={{ width: 160 }}
              options={[
                { value: SystemLogAction.LOCK_ACCOUNT, label: 'Khóa' },
                { value: SystemLogAction.UNLOCK_ACCOUNT, label: 'Mở khóa' },
              ]}
            />
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 240, borderRadius: 6 }}
            />
          </Space>
        </div>
        {loading ? (
          <div style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : (
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20, showTotal: (c) => `${c} bản ghi` }}
            scroll={{ x: 1020 }}
          />
        )}
      </Card>
    </div>
  );
}
