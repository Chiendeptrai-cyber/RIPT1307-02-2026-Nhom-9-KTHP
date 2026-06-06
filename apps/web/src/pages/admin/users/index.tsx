import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { listUsers, setUserStatus, type UserDto } from '../../../services/user.service';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;

const PAGE_SIZE = 15;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Hoạt động', color: 'green' },
  borrow_blocked: { label: 'Cấm mượn', color: 'orange' },
  locked: { label: 'Bị khóa', color: 'red' },
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [lockingId, setLockingId] = useState<number | null>(null);

  // Dùng ref để debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (nextPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsers({
        page: nextPage,
        pageSize: PAGE_SIZE,
        role: 'student',
        status: statusFilter,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Không thể tải danh sách sinh viên');
      }

      // Lọc thêm phía client nếu có search keyword (API chưa hỗ trợ search)
      const keyword = search.trim().toLowerCase();
      const filtered = keyword
        ? res.data.items.filter(
            (u) =>
              u.fullName.toLowerCase().includes(keyword) ||
              u.email.toLowerCase().includes(keyword),
          )
        : res.data.items;

      setItems(filtered);
      setTotal(keyword ? filtered.length : res.data.total);
      setPage(nextPage);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Không thể tải danh sách sinh viên';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Tải lại khi bộ lọc thay đổi
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      load(1);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [load]);

  const handleToggleLock = (user: UserDto) => {
    const nextStatus = user.status === 'locked' ? 'active' : 'locked';
    const actionLabel = nextStatus === 'locked' ? 'khóa' : 'mở khóa';

    Modal.confirm({
      title: `Xác nhận ${actionLabel} tài khoản`,
      content: (
        <span>
          Bạn có chắc muốn <strong>{actionLabel}</strong> tài khoản của{' '}
          <strong>{user.fullName}</strong>?
        </span>
      ),
      okText: actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1),
      okButtonProps: { danger: nextStatus === 'locked' },
      cancelText: 'Hủy',
      onOk: async () => {
        setLockingId(user.id);
        try {
          const res = await setUserStatus(user.id, nextStatus);
          if (!res.success) throw new Error(res.message);
          message.success(
            nextStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
          );
          load(page);
        } catch (err: any) {
          message.error(
            err?.response?.data?.message ?? err?.message ?? 'Thao tác thất bại',
          );
        } finally {
          setLockingId(null);
        }
      },
    });
  };

  const columns: ColumnsType<UserDto> = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>
            {record.fullName}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value: string) => {
        const cfg = STATUS_CONFIG[value] ?? { label: value, color: 'default' };
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
            loading={lockingId === record.id}
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
        style={{
          borderRadius: 8,
          border: `1px solid ${SLINK_COLORS.border}`,
          boxShadow: SLINK_COLORS.shadow,
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${SLINK_COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TeamOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            <Title level={5} style={{ marginBottom: 0 }}>
              Quản lý sinh viên
            </Title>
            {!loading && (
              <Tag color="blue" style={{ marginLeft: 4 }}>
                {total} tài khoản
              </Tag>
            )}
          </div>

          <Space wrap>
            <Select
              placeholder="Lọc trạng thái"
              allowClear
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
              }}
              style={{ width: 160 }}
              options={Object.entries(STATUS_CONFIG).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
            <Input
              placeholder="Tìm tên hoặc email..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 240, borderRadius: 6 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => load(page)}
              loading={loading}
              style={{ borderRadius: 6 }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Error */}
        {error && (
          <Alert type="error" message={error} style={{ margin: 16 }} showIcon />
        )}

        {/* Table */}
        {loading ? (
          <div style={{ padding: 20 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : (
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'Không có sinh viên nào' }}
          />
        )}

        {/* Pagination */}
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Pagination
            current={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={(p) => load(p)}
            showTotal={(count) => `${count} sinh viên`}
            showSizeChanger={false}
          />
        </div>
      </Card>
    </div>
  );
}
