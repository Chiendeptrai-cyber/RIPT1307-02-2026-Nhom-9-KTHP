import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Card, Input, Select, Skeleton, Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowDownOutlined, ArrowUpOutlined, EditOutlined,
  HistoryOutlined, SearchOutlined, SwapOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { SystemLogAction } from '@equipment-mgmt/shared';
import { readSystemLogs, type MockSystemLog } from '@/mocks/systemLogStore';
import { SLINK_COLORS } from '@/theme/tokens';

const { Title, Text } = Typography;

const OPERATION_CONFIG: Record<string, { label: string; color: string; icon: ReactNode }> = {
  [SystemLogAction.STOCK_IMPORT]: {
    label: 'Nhập thêm', color: 'green', icon: <ArrowDownOutlined />,
  },
  [SystemLogAction.STOCK_MARK_DAMAGED]: {
    label: 'Ghi nhận hỏng', color: 'orange', icon: <WarningOutlined />,
  },
  [SystemLogAction.STOCK_MARK_LOST]: {
    label: 'Ghi nhận mất', color: 'red', icon: <WarningOutlined />,
  },
  [SystemLogAction.STOCK_ADJUSTMENT]: {
    label: 'Điều chỉnh trực tiếp', color: 'blue', icon: <EditOutlined />,
  },
  [SystemLogAction.STOCK_STATUS_CHANGE]: {
    label: 'Chuyển trạng thái', color: 'purple', icon: <SwapOutlined />,
  },
};

const fmt = (v?: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—';

export default function StockLogsPage() {
  const [items, setItems] = useState<MockSystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [opFilter, setOpFilter] = useState<string | undefined>();

  const load = useCallback(() => {
    setLoading(true);
    try {
      let logs = readSystemLogs('stock');
      if (opFilter) logs = logs.filter((l) => l.action === opFilter);
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        logs = logs.filter(
          (l) =>
            l.code.toLowerCase().includes(kw) ||
            l.targetLabel.toLowerCase().includes(kw) ||
            l.adminName.toLowerCase().includes(kw) ||
            (l.details.equipmentName as string)?.toLowerCase().includes(kw),
        );
      }
      setItems(logs);
    } finally {
      setLoading(false);
    }
  }, [search, opFilter]);

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
      title: 'Mã thiết bị', width: 110,
      render: (_, r) => (
        <Text code style={{ fontSize: 12, fontWeight: 600 }}>
          {(r.details.equipmentCode as string) ?? '—'}
        </Text>
      ),
    },
    {
      title: 'Tên thiết bị', width: 200,
      render: (_, r) => (
        <Text style={{ fontSize: 13 }}>
          {(r.details.equipmentName as string) ?? '—'}
        </Text>
      ),
    },
    {
      title: 'Loại thao tác', width: 180,
      render: (_, r) => {
        const cfg = OPERATION_CONFIG[r.action];
        if (!cfg) return <Tag>{r.details.operationLabel as string ?? r.action}</Tag>;
        return <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thay đổi', width: 200,
      render: (_, r) => {
        const qtyChange = r.details.quantityChange as string | undefined;
        const oldAvail = r.details.oldAvailable as string | undefined;
        const newAvail = r.details.newAvailable as string | undefined;
        if (qtyChange && oldAvail && newAvail) {
          const isPositive = qtyChange.startsWith('+');
          return (
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>{oldAvail}</Text>
              <Text style={{ fontSize: 12 }}>→</Text>
              <Text strong style={{ fontSize: 12, color: isPositive ? '#389e0d' : '#cf1322' }}>
                {newAvail}
              </Text>
              <Tag
                color={isPositive ? 'green' : 'red'}
                style={{ fontSize: 11, marginLeft: 4 }}
              >
                {qtyChange}
              </Tag>
            </Space>
          );
        }
        const oldStatus = r.details.oldStatus as string | undefined;
        const newStatus = r.details.newStatus as string | undefined;
        if (oldStatus && newStatus) {
          return (
            <Space size={4}>
              <Tag>{oldStatus}</Tag>
              <Text style={{ fontSize: 12 }}>→</Text>
              <Tag color="blue">{newStatus}</Tag>
            </Space>
          );
        }
        return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
      },
    },
  ];

  const filterOptions = Object.entries(OPERATION_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  }));

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
            <Title level={5} style={{ marginBottom: 0 }}>Lịch sử cập nhật kho</Title>
          </div>
          <Space wrap>
            <Select
              placeholder="Tất cả"
              allowClear
              value={opFilter}
              onChange={setOpFilter}
              style={{ width: 200 }}
              options={filterOptions}
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
            scroll={{ x: 1120 }}
          />
        )}
      </Card>
    </div>
  );
}
