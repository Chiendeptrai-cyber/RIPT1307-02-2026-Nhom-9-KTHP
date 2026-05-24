import { useState } from 'react';
import {
    CheckCircleOutlined,
    EditOutlined,
    IdcardOutlined,
    LockOutlined,
    MailOutlined,
    SaveOutlined,
    SafetyOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    message,
    Row,
    Space,
    Tag,
    Typography,
} from 'antd';
import { useAuthStore } from '@/stores/auth.store';
import { SLINK_COLORS } from '@/theme/tokens';

const { Title, Text } = Typography;

const cardStyle = {
    borderRadius: 8,
    border: `1px solid ${SLINK_COLORS.border}`,
    boxShadow: SLINK_COLORS.shadow,
};

interface ProfileFormValues {
    fullName: string;
    email: string;
}

interface PasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const setAuth = useAuthStore((state) => state.setAuth);
    const token = useAuthStore((state) => state.token);

    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [profileForm] = Form.useForm<ProfileFormValues>();
    const [passwordForm] = Form.useForm<PasswordFormValues>();

    const roleLabel = user?.role === 'admin' ? 'Quản trị viên' : 'Sinh viên';
    const roleColor = user?.role === 'admin' ? 'red' : 'blue';

    const handleEditProfile = () => {
        profileForm.setFieldsValue({
            fullName: user?.fullName ?? '',
            email: user?.email ?? '',
        });
        setEditingProfile(true);
    };

    const handleSaveProfile = async (values: ProfileFormValues) => {
        if (!user) return;
        setSavingProfile(true);
        try {
            // Update auth store with new name/email (localStorage-backed)
            await new Promise((resolve) => setTimeout(resolve, 400)); // simulate async
            setAuth({ ...user, fullName: values.fullName, email: values.email }, token ?? '');
            message.success('Cập nhật thông tin thành công!');
            setEditingProfile(false);
        } catch {
            message.error('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePassword = async (values: PasswordFormValues) => {
        setSavingPassword(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // simulate async
            if (values.newPassword !== values.confirmPassword) {
                message.error('Mật khẩu xác nhận không khớp!');
                return;
            }
            message.success('Đổi mật khẩu thành công!');
            passwordForm.resetFields();
        } catch {
            message.error('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSavingPassword(false);
        }
    };

    // Avatar initials from name
    const initials = (user?.fullName ?? 'U')
        .split(' ')
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase();

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            {/* ── Page heading ── */}
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 4 }}>
                    Thông Tin Cá Nhân
                </Title>
                <Text type="secondary">Xem và cập nhật thông tin tài khoản của bạn</Text>
            </div>

            <Row gutter={[24, 24]}>
                {/* ── LEFT: Avatar card ── */}
                <Col xs={24} md={8}>
                    <Card style={cardStyle}>
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            {/* Avatar with gradient ring */}
                            <div
                                style={{
                                    display: 'inline-block',
                                    padding: 3,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${SLINK_COLORS.primary}, #8B0000)`,
                                    marginBottom: 16,
                                }}
                            >
                                <Avatar
                                    size={96}
                                    style={{
                                        background: '#fff',
                                        color: SLINK_COLORS.primary,
                                        fontSize: 32,
                                        fontWeight: 700,
                                        border: `3px solid ${SLINK_COLORS.background}`,
                                    }}
                                >
                                    {initials}
                                </Avatar>
                            </div>

                            <Title level={5} style={{ marginBottom: 4 }}>
                                {user?.fullName ?? '—'}
                            </Title>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
                                {user?.email ?? '—'}
                            </Text>
                            <Tag
                                color={roleColor}
                                icon={user?.role === 'admin' ? <SafetyOutlined /> : <UserOutlined />}
                                style={{ borderRadius: 20, padding: '2px 12px' }}
                            >
                                {roleLabel}
                            </Tag>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Quick info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <IdcardOutlined style={{ color: SLINK_COLORS.textSecondary, marginTop: 2 }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                        ID tài khoản
                                    </Text>
                                    <Text style={{ fontSize: 13, fontWeight: 500 }}>#{user?.id ?? '—'}</Text>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <MailOutlined style={{ color: SLINK_COLORS.textSecondary, marginTop: 2 }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                        Email
                                    </Text>
                                    <Text
                                        style={{ fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}
                                    >
                                        {user?.email ?? '—'}
                                    </Text>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <CheckCircleOutlined style={{ color: SLINK_COLORS.success, marginTop: 2 }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                        Trạng thái
                                    </Text>
                                    <Tag color="green" style={{ fontSize: 12 }}>
                                        Đang hoạt động
                                    </Tag>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* ── RIGHT: Edit forms ── */}
                <Col xs={24} md={16}>
                    {/* Profile info form */}
                    <Card
                        style={{ ...cardStyle, marginBottom: 24 }}
                        title={
                            <Space>
                                <UserOutlined style={{ color: SLINK_COLORS.primary }} />
                                <span style={{ fontWeight: 600 }}>Thông tin cơ bản</span>
                            </Space>
                        }
                        extra={
                            !editingProfile ? (
                                <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={handleEditProfile}
                                    style={{ borderRadius: 6 }}
                                >
                                    Chỉnh sửa
                                </Button>
                            ) : null
                        }
                    >
                        {!editingProfile ? (
                            // Read-only view
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Họ và tên
                                    </Text>
                                    <div
                                        style={{
                                            marginTop: 4,
                                            padding: '8px 12px',
                                            background: SLINK_COLORS.surface,
                                            borderRadius: 6,
                                            fontSize: 14,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {user?.fullName ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Email
                                    </Text>
                                    <div
                                        style={{
                                            marginTop: 4,
                                            padding: '8px 12px',
                                            background: SLINK_COLORS.surface,
                                            borderRadius: 6,
                                            fontSize: 14,
                                        }}
                                    >
                                        {user?.email ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Vai trò
                                    </Text>
                                    <div style={{ marginTop: 6 }}>
                                        <Tag color={roleColor}>{roleLabel}</Tag>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Edit form
                            <Form
                                form={profileForm}
                                layout="vertical"
                                onFinish={handleSaveProfile}
                            >
                                <Form.Item
                                    name="fullName"
                                    label="Họ và tên"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
                                        placeholder="Nhập họ và tên"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không hợp lệ' },
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
                                        placeholder="Nhập email"
                                    />
                                </Form.Item>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <Button onClick={() => setEditingProfile(false)}>Hủy</Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={savingProfile}
                                        icon={<SaveOutlined />}
                                        style={{ background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary }}
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Card>

                    {/* Change password form */}
                    <Card
                        style={cardStyle}
                        title={
                            <Space>
                                <LockOutlined style={{ color: SLINK_COLORS.primary }} />
                                <span style={{ fontWeight: 600 }}>Đổi mật khẩu</span>
                            </Space>
                        }
                    >
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handleSavePassword}
                        >
                            <Form.Item
                                name="currentPassword"
                                label="Mật khẩu hiện tại"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </Form.Item>
                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
                                    placeholder="Tối thiểu 6 ký tự"
                                />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu mới"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={savingPassword}
                                    icon={<SaveOutlined />}
                                    style={{ background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary }}
                                >
                                    Cập nhật mật khẩu
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
