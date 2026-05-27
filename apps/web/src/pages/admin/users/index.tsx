import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
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
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  OFFLINE_STORAGE_KEYS,
  nextId,
  paginate,
  readCollection,
  writeCollection,
  type MockUser,
} from '../../../mocks/offlineStorage';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;

type UserRow = MockUser;

interface UserFormValues {
  fullName: string;
  email: string;
  status: string;
}

const PAGE_SIZE = 15;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Hoạt động', color: 'green' },
  borrow_blocked: { label: 'Cấm mượn', color: 'orange' },
  locked: { label: 'Bị khóa', color: 'red' },
};

function readUsers() {
  return readCollection<UserRow>(OFFLINE_STORAGE_KEYS.users)
    .filter((user) => user.role === 'student')
    .sort((a, b) => a.id - b.id);
}

function writeUsers(users: UserRow[]) {
  writeCollection(OFFLINE_STORAGE_KEYS.users, users);
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<UserRow | null>(null);
  const [form] = Form.useForm<UserFormValues>();

  const load = useCallback((nextPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const keyword = search.trim().toLowerCase();
      const users = readUsers().filter((user) => {
        const matchesSearch = !keyword
          || user.fullName.toLowerCase().includes(keyword)
          || user.email.toLowerCase().includes(keyword);
        const matchesStatus = !status || user.status === status;
        return matchesSearch && matchesStatus;
      });
      const paged = paginate(users, nextPage, PAGE_SIZE);
      setItems(paged.items);
      setTotal(paged.total);
      setPage(paged.page);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load(1);
  }, [load]);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldValue('status', 'active');
    setModalOpen(true);
  };

  const openEdit = (record: UserRow) => {
    setEditRecord(record);
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (values: UserFormValues) => {
    const users = readCollection<UserRow>(OFFLINE_STORAGE_KEYS.users);
    const email = values.email.trim().toLowerCase();
    const duplicate = users.some((user) => user.email.toLowerCase() === email && user.id !== editRecord?.id);

    if (duplicate) {
      message.error('Email sinh viên đã tồn tại');
      return;
    }

    if (editRecord) {
      writeUsers(users.map((user) => (
        user.id === editRecord.id
          ? { ...user, ...values, email }
          : user
      )));
      message.success('Cập nhật sinh viên thành công');
    } else {
      writeUsers([
        ...users,
        {
          id: nextId(users),
          fullName: values.fullName,
          email,
          role: 'student',
          status: values.status,
          createdAt: new Date().toISOString(),
        },
      ]);
      message.success('Thêm sinh viên thành công');
    }

    setModalOpen(false);
    load(page);
  };

  const handleToggleLock = (user: UserRow) => {
    const nextStatus = user.status === 'locked' ? 'active' : 'locked';
    writeUsers(readCollection<UserRow>(OFFLINE_STORAGE_KEYS.users).map((item) => (
      item.id === user.id ? { ...item, status: nextStatus } : item
    )));
    message.success(nextStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    load(page);
  };

  const handleDelete = (user: UserRow) => {
    Modal.confirm({
      title: 'Xóa sinh viên',
      content: `Bạn có chắc chắn muốn xóa "${user.fullName}"?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        writeUsers(readCollection<UserRow>(OFFLINE_STORAGE_KEYS.users).filter((item) => item.id !== user.id));
        message.success('Xóa sinh viên thành công');
        load(page);
      },
    });
  };

  const columns: ColumnsType<UserRow> = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.fullName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
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
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            style={{ borderRadius: 4 }}
          >
            Sửa
          </Button>
          <Button
            size="small"
            icon={record.status === 'locked' ? <UnlockOutlined /> : <LockOutlined />}
            danger={record.status !== 'locked'}
            onClick={() => handleToggleLock(record)}
            style={{ borderRadius: 4 }}
          >
            {record.status === 'locked' ? 'Mở khóa' : 'Khóa TK'}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ borderRadius: 4 }}
          >
            Xóa
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
            <Title level={5} style={{ marginBottom: 0 }}>Quản lý sinh viên</Title>
          </div>
          <Space wrap>
            <Select
              placeholder="Lọc trạng thái"
              allowClear
              value={status}
              onChange={setStatus}
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
              onChange={(event) => setSearch(event.target.value)}
              allowClear
              style={{ width: 240, borderRadius: 6 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              style={{ background: SLINK_COLORS.primary, borderRadius: 6 }}
            >
              Thêm sinh viên
            </Button>
          </Space>
        </div>

        {error && <Alert type="error" message={error} style={{ margin: 16 }} />}

        {loading ? (
          <div style={{ padding: 20 }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <Table dataSource={items} columns={columns} rowKey="id" pagination={false} />
        )}

        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={load}
            showTotal={(count) => `${count} sinh viên`}
            showSizeChanger={false}
          />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editRecord ? 'Cập nhật sinh viên' : 'Thêm sinh viên'}
        okText={editRecord ? 'Lưu thay đổi' : 'Thêm mới'}
        cancelText="Hủy"
        onOk={() => form.submit()}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên sinh viên' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn An" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email sinh viên' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="student@ptit.edu.vn" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="active"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select
              options={Object.entries(STATUS_CONFIG).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
