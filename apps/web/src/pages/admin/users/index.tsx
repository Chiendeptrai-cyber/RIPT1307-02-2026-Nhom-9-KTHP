import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, message, Pagination, Skeleton,
  Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LockOutlined, TeamOutlined, UnlockOutlined } from '@ant-design/icons';
import { http } from '../../../services/http';
import { SLINK_COLORS } from '../../../theme/tokens';
import type { ApiResponse } from '@equipment-mgmt/shared';

const { Title, Text } = Typography;

interface UserRow {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:         { label: 'Hoạt động',    color: 'green' },
  borrow_blocked: { label: 'Cấm mượn',     color: 'orange' },
  locked:         { label: 'Bị khóa',      color: 'red' },
};

export default function AdminUsersPage() {
  const [items,   setItems]   = useState<UserRow[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<ApiResponse<{ items: UserRow[]; total: number }>>(
        '/users',
        { params: { page: p, pageSize: 15, role: 'student' } },
      );
      if (res.data.success && res.data.data) {
        setItems(res.data.data.items);
        setTotal(res.data.data.total);
        setPage(p);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleLock = async (user: UserRow) => {
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    try {
      await http.patch(`/users/${user.id}/status`, { status: newStatus });
      message.success(newStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      load(page);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Không thể cập nhật trạng thái');
    }
  };

  const columns: ColumnsType<UserRow> = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.fullName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s] ?? { label: s, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={record.status === 'locked' ? <UnlockOutlined /> : <LockOutlined />}
            danger={record.status !== 'locked'}
            onClick={() => handleToggleLock(record)}
            style={{ borderRadius: 4 }}
          >
            {record.status === 'locked' ? 'Mở khóa' : 'Khóa TK'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <TeamOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
          <Title level={5} style={{ marginBottom: 0 }}>Quản lý sinh viên</Title>
        </div>

        {error && <Alert type="error" message={error} style={{ margin: 16 }} />}

        {loading ? (
          <div style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : (
          <Table dataSource={items} columns={columns} rowKey="id" pagination={false} />
        )}

        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination current={page} total={total} pageSize={15} onChange={load} showTotal={(t) => `${t} sinh viên`} showSizeChanger={false} />
        </div>
      </Card>
    </div>
  );
}
