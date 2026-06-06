import { useCallback, useEffect, useState } from 'react';
import {
  Card, Input, Skeleton, Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { readSystemLogs, type MockSystemLog } from '@/mocks/systemLogStore';
import { SLINK_COLORS } from '@/theme/tokens';

const { Title, Text } = Typography;

const FIELD_LABELS: Record<string, string> = {
  name: 'Tên thiết bị',
  totalQuantity: 'Tổng số lượng',
  availableQuantity: 'Số khả dụng',
  damagedQuantity: 'Số hỏng',
  lostQuantity: 'Số mất',
  status: 'Trạng thái',
  description: 'Mô tả',
  categoryId: 'Danh mục',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động',
  under_maintenance: 'Bảo trì',
  deleted: 'Đã xóa',
};

const fmt = (v?: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—';

export default function EquipmentLogsPage() {
  const [items, setItems] = useState<MockSystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    try {
      let logs = readSystemLogs('equipment');
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
  }, [search]);

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
      title: 'Trường thay đổi', width: 150,
      render: (_, r) => {
        const field = r.details.field as string;
        return <Tag color="blue">{FIELD_LABELS[field] ?? field ?? '—'}</Tag>;
      },
    },
    {
      title: 'Thay đổi', width: 260,
      render: (_, r) => {
        const oldVal = String(r.details.oldValue ?? '—');
        const newVal = String(r.details.newValue ?? '—');
        const field = r.details.field as string;
        const displayOld = field === 'status' ? (STATUS_LABELS[oldVal] ?? oldVal) : oldVal;
        const displayNew = field === 'status' ? (STATUS_LABELS[newVal] ?? newVal) : newVal;
        return (
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12, textDecoration: 'line-through' }}>
              {displayOld}
            </Text>
            <Text style={{ fontSize: 12 }}>→</Text>
            <Text strong style={{ fontSize: 12, color: SLINK_COLORS.primary }}>
              {displayNew}
            </Text>
          </Space>
        );
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
            <Title level={5} style={{ marginBottom: 0 }}>Lịch sử sửa thiết bị</Title>
          </div>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 280, borderRadius: 6 }}
          />
        </div>
        {loading ? (
          <div style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : (
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20, showTotal: (c) => `${c} bản ghi` }}
            scroll={{ x: 1150 }}
          />
        )}
      </Card>
    </div>
  );
}
