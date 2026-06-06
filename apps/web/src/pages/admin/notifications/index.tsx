import { useState, useEffect } from 'react';
import {
  Alert, Badge, Button, Card, Col, Divider, Form, Input, InputNumber,
  message, Modal, Row, Select, Space, Switch, Table, Tag, TimePicker, Tooltip, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BellOutlined, CheckOutlined, ExclamationCircleOutlined,
  MailOutlined, ReloadOutlined, SendOutlined, SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { SLINK_COLORS } from '../../../theme/tokens';
import { notificationService } from '../../../services/notification.service';
import { idBadgeStyle } from '@/utils/format';

const { Title, Text } = Typography;

/* ─── Mock data ─────────────────────────────────────────────── */
interface NtfLog {
  id: string; time: string; event: string; channel: string;
  recipient: string; content: string; tries: number; status: string;
}
interface RetryItem {
  id: string; time: string; event: string; recipient: string;
  email: string; tryNum: string; error: string; realId: number;
}

const EVENT_TYPES = ['Yêu cầu mới', 'Đã duyệt', 'Từ chối', 'Bàn giao', 'Đã trả', 'Nhắc nhở', 'Quá hạn', 'Hệ thống'];

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  new_request:        { label: 'Yêu cầu mới',   color: 'blue' },
  approved:           { label: 'Đã duyệt',       color: 'green' },
  rejected:           { label: 'Từ chối',        color: 'red' },
  checkout_confirmed: { label: 'Bàn giao',       color: 'purple' },
  return_confirmed:   { label: 'Đã trả',         color: 'cyan' },
  due_reminder:       { label: 'Nhắc nhở',       color: 'orange' },
  overdue_alert:      { label: 'Quá hạn',        color: 'volcano' },
  manual:             { label: 'Hệ thống',       color: 'blue' },
};

const CHANNEL_COLOR: Record<string,string> = {
  'Email + App': 'purple', 'Email': 'blue', 'Trong app': 'green',
};
const STATUS_COLOR: Record<string,string> = {
  'Đã gửi': 'green', 'Thất bại': 'red', 'Chờ retry': 'orange',
};

/* ─── Main component ─────────────────────────────────────────── */
export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'history'|'retry'|'config'>('history');
  const [eventFilter, setEventFilter] = useState<string|undefined>();
  const [search, setSearch] = useState('');
  const [sendModal, setSendModal] = useState(false);
  const [logs, setLogs] = useState<NtfLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [retryQueue, setRetryQueue] = useState<RetryItem[]>([]);
  const [sendForm] = Form.useForm();

  // Config state
  const [reminderHour, setReminderHour] = useState(dayjs('08:00', 'HH:mm'));
  const [overdueHour, setOverdueHour]   = useState(dayjs('09:00', 'HH:mm'));
  const [scanDays, setScanDays]         = useState(3);
  const [sendToAdmin, setSendToAdmin]   = useState(true);
  const [chApproved, setChApproved]     = useState(true);
  const [chRejected, setChRejected]     = useState(true);
  const [chHandover, setChHandover]     = useState(true);
  const [maxRetry, setMaxRetry]         = useState(3);
  const [retryInterval, setRetryInterval] = useState(5);
  const [alertCron, setAlertCron]       = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.listAll({ page: 1, pageSize: 100 });
      if (res.success && res.data) {
        const mapped = res.data.items.map((n: any) => ({
          id: `NTF-${n.id}`,
          time: dayjs(n.createdAt).format('DD/MM HH:mm'),
          event: TYPE_CONFIG[n.type]?.label || n.type,
          channel: 'Trong app',
          recipient: n.recipient || `User ${n.userId}`,
          content: `${n.title} - ${n.message}`.substring(0, 100),
          tries: 1,
          status: 'Đã gửi'
        }));
        setLogs(mapped);
        setTotalLogs(res.data.total);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await notificationService.getSettings();
      if (res.success && res.data && res.data.reminderHour) {
        const s = res.data;
        if (s.reminderHour) setReminderHour(dayjs(s.reminderHour, 'HH:mm'));
        if (s.overdueHour) setOverdueHour(dayjs(s.overdueHour, 'HH:mm'));
        if (s.scanDays !== undefined) setScanDays(s.scanDays);
        if (s.sendToAdmin !== undefined) setSendToAdmin(s.sendToAdmin);
        if (s.chApproved !== undefined) setChApproved(s.chApproved);
        if (s.chRejected !== undefined) setChRejected(s.chRejected);
        if (s.chHandover !== undefined) setChHandover(s.chHandover);
        if (s.maxRetry !== undefined) setMaxRetry(s.maxRetry);
        if (s.retryInterval !== undefined) setRetryInterval(s.retryInterval);
        if (s.alertCron !== undefined) setAlertCron(s.alertCron);
      }
    } catch (e) {}
  };

  const fetchRetryQueue = async () => {
    try {
      const res = await notificationService.getRetryQueue();
      if (res.success) {
        setRetryQueue(res.data.map((item: any) => ({
          id: item.id,
          time: dayjs(item.time).format('DD/MM HH:mm'),
          event: TYPE_CONFIG[item.event]?.label || item.event,
          recipient: item.recipient,
          email: item.email,
          tryNum: item.tryNum,
          error: item.error || 'N/A',
          realId: item.realId
        })));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLogs();
    fetchSettings();
    fetchRetryQueue();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await notificationService.updateSettings({
        reminderHour: reminderHour.format('HH:mm'),
        overdueHour: overdueHour.format('HH:mm'),
        scanDays,
        sendToAdmin,
        chApproved,
        chRejected,
        chHandover,
        maxRetry,
        retryInterval,
        alertCron,
      });
      message.success('Đã lưu cấu hình thông báo');
    } catch (e) {
      message.error('Lưu cấu hình thất bại');
    }
  };

  /* ── filtered logs ── */
  const filteredLogs = logs.filter(r => {
    const matchEvent = !eventFilter || r.event === eventFilter;
    const matchSearch = !search ||
      r.recipient.toLowerCase().includes(search.toLowerCase()) ||
      r.event.toLowerCase().includes(search.toLowerCase());
    return matchEvent && matchSearch;
  });

  /* ── columns ── */
  const logColumns: ColumnsType<NtfLog> = [
    { title: 'ID',         dataIndex: 'id',        width: 90, render: v => <span style={idBadgeStyle}>{v}</span> },
    { title: 'Thời gian',  dataIndex: 'time',       width: 110, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Sự kiện',    dataIndex: 'event',      width: 160, render: v => <Tag color="geekblue" style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Kênh',       dataIndex: 'channel',    width: 110, render: v => <Tag color={CHANNEL_COLOR[v] ?? 'default'} style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Người nhận', dataIndex: 'recipient',  width: 130, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Nội dung',   dataIndex: 'content',    render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Số lần',     dataIndex: 'tries',      width: 70, align: 'center', render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Trạng thái', dataIndex: 'status',     width: 100, render: v => <Badge status={v === 'Đã gửi' ? 'success' : v === 'Thất bại' ? 'error' : 'warning'} text={<Tag color={STATUS_COLOR[v] ?? 'default'} style={{ margin: 0, fontSize: 11 }}>{v}</Tag>} /> },
  ];

  const retryColumns: ColumnsType<RetryItem> = [
    { title: 'ID',         dataIndex: 'id',        width: 90, render: v => <span style={idBadgeStyle}>{v}</span> },
    { title: 'Thời gian',  dataIndex: 'time',       width: 110, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Sự kiện',    dataIndex: 'event',      width: 160, render: v => <Tag color="geekblue" style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Người nhận', dataIndex: 'recipient',  width: 130, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Email',      dataIndex: 'email',      render: v => <Text style={{ fontSize: 12, color: SLINK_COLORS.info }}>{v}</Text> },
    { title: 'Lần thứ',   dataIndex: 'tryNum',     width: 90, render: (v, r) => {
      const parts = v.split('/');
      const cur = Number(parts[0]); const max = Number(parts[1]);
      const pct = cur / max;
      return <span style={{ fontSize: 12 }}><Text style={{ color: pct >= 1 ? '#ff4d4f' : pct >= 0.6 ? '#fa8c16' : '#52c41a' }}>{v}</Text></span>;
    }},
    { title: 'Lỗi',        dataIndex: 'error',      render: v => <Text style={{ fontSize: 12, color: '#ff4d4f' }}>{v}</Text> },
    { title: 'Thao tác',   key: 'action', width: 90, render: (_, r) => (
      <Button size="small" onClick={async () => {
        try {
          await notificationService.retryEmail(r.realId);
          message.success(`Đã đưa ${r.id} vào tiến trình thử lại`);
          fetchRetryQueue();
        } catch (e) {
          message.error('Thử lại thất bại');
        }
      }}>Thử lại</Button>
    )},
  ];

  const tabs: { key: 'history'|'retry'|'config'; label: React.ReactNode }[] = [
    { key: 'history', label: <span>Lịch sử gửi <Badge count={totalLogs} style={{ background: '#595959', marginLeft: 4 }} /></span> },
    { key: 'retry',   label: <span>Hàng chờ retry <Badge count={retryQueue.length} style={{ background: SLINK_COLORS.primary, marginLeft: 4 }} /></span> },
    { key: 'config',  label: 'Cấu hình' },
  ];

  return (
    <div style={{ padding: 24, background: SLINK_COLORS.surface, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BellOutlined style={{ fontSize: 22, color: SLINK_COLORS.primary }} />
          <Title level={4} style={{ margin: 0 }}>Quản lý thông báo</Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => message.success('Đã làm mới')}>Làm mới</Button>
          <Button
            type="primary" icon={<SendOutlined />}
            style={{ background: SLINK_COLORS.primary }}
            onClick={() => setSendModal(true)}
          >
            Gửi thông báo thủ công
          </Button>
        </Space>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: SLINK_COLORS.shadow, border: `1px solid ${SLINK_COLORS.border}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${SLINK_COLORS.border}`, padding: '0 20px' }}>
          {tabs.map(t => (
            <div
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '12px 20px', cursor: 'pointer', fontSize: 14,
                borderBottom: activeTab === t.key ? `2px solid ${SLINK_COLORS.primary}` : '2px solid transparent',
                color: activeTab === t.key ? SLINK_COLORS.primary : '#595959',
                fontWeight: activeTab === t.key ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* ── Tab: Lịch sử gửi ── */}
        {activeTab === 'history' && (
          <div>
            <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${SLINK_COLORS.border}` }}>
              <Text style={{ color: '#595959', borderLeft: `3px solid ${SLINK_COLORS.primary}`, paddingLeft: 8 }}>
                Lịch sử gửi thông báo — <strong>{totalLogs} bản ghi</strong>
              </Text>
              <Space>
                <Select
                  allowClear placeholder="Tất cả" style={{ width: 200 }}
                  onChange={setEventFilter}
                  options={[
                    ...EVENT_TYPES.map(e => ({ value: e, label: e })),
                    { value: 'OK', label: 'OK' },
                    { value: 'Thất bại', label: 'Thất bại' },
                    { value: 'Chờ retry', label: 'Chờ retry' },
                  ]}
                />
                <Input.Search
                  placeholder="Tìm người nhận / sự kiện..."
                  style={{ width: 240 }} allowClear
                  onChange={e => setSearch(e.target.value)}
                />
              </Space>
            </div>
            <Table<NtfLog>
              dataSource={filteredLogs} columns={logColumns} rowKey="id"
              size="small" pagination={{ pageSize: 10, showTotal: c => `${c} bản ghi` }}
              style={{ padding: '0 4px' }}
              loading={loading}
            />
          </div>
        )}

        {/* ── Tab: Hàng chờ retry ── */}
        {activeTab === 'retry' && (
          <div>
            {retryQueue.length > 0 && (
              <Alert
                type="warning" showIcon
                message={`${retryQueue.length} email đang chờ gửi lại — thử tối đa ${maxRetry} lần, cách nhau ${retryInterval} phút`}
                style={{ margin: 16, borderRadius: 6 }}
              />
            )}
            <Table<RetryItem>
              dataSource={retryQueue} columns={retryColumns} rowKey="id"
              size="small" pagination={false}
              style={{ padding: '0 4px 16px' }}
            />
          </div>
        )}

        {/* ── Tab: Cấu hình ── */}
        {activeTab === 'config' && (
          <div style={{ padding: 24 }}>
            <Row gutter={24}>
              {/* Cron: Nhắc trả */}
              <Col span={12}>
                <Card size="small" title={<><SettingOutlined /> Cron job — Nhắc trả (C1–C3)</>}
                  style={{ marginBottom: 16, borderColor: SLINK_COLORS.border }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                    Chạy hàng ngày để quét phiếu sắp đến hạn và gửi email nhắc nhở
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div><Text strong style={{ fontSize: 13 }}>Giờ chạy</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Chạy mỗi ngày vào lúc</Text></div>
                    <TimePicker value={reminderHour} onChange={v => v && setReminderHour(v)} format="HH:mm" style={{ width: 100 }} />
                  </div>
                  <Divider style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div><Text strong style={{ fontSize: 13 }}>Quét trước hạn</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Nhắc khi còn ≤ N ngày</Text></div>
                    <InputNumber min={1} max={7} value={scanDays} onChange={v => v && setScanDays(v)} addonAfter="ngày" style={{ width: 110 }} />
                  </div>
                  <Divider style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>Trạng thái</Text>
                    <Badge status="success" text={<Text style={{ color: '#52c41a', fontSize: 12 }}>Chạy lần cuối hôm nay {reminderHour.format('HH:mm')}</Text>} />
                  </div>
                </Card>
              </Col>

              {/* Cron: Cảnh báo quá hạn */}
              <Col span={12}>
                <Card size="small" title={<><ExclamationCircleOutlined /> Cron job — Cảnh báo quá hạn (C4–C6)</>}
                  style={{ marginBottom: 16, borderColor: SLINK_COLORS.border }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                    Tự động chuyển phiếu sang Quá hạn và gửi cảnh báo đến sinh viên và admin
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div><Text strong style={{ fontSize: 13 }}>Giờ chạy</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Chạy mỗi ngày vào lúc</Text></div>
                    <TimePicker value={overdueHour} onChange={v => v && setOverdueHour(v)} format="HH:mm" style={{ width: 100 }} />
                  </div>
                  <Divider style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div><Text strong style={{ fontSize: 13 }}>Gửi cho Admin</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Danh sách quá hạn tổng hợp</Text></div>
                    <Switch checked={sendToAdmin} onChange={setSendToAdmin} />
                  </div>
                  <Divider style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>Trạng thái</Text>
                    <Badge status="success" text={<Text style={{ color: '#52c41a', fontSize: 12 }}>Chạy lần cuối hôm nay {overdueHour.format('HH:mm')}</Text>} />
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={24}>
              {/* Kênh thông báo */}
              <Col span={12}>
                <Card size="small" title={<><MailOutlined /> Kênh thông báo theo sự kiện</>}
                  style={{ borderColor: SLINK_COLORS.border }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                    Bật/tắt email cho từng loại sự kiện. Thông báo trong app <strong>không thể tắt</strong> với sự kiện quá hạn
                  </Text>
                  {[
                    { key: 'approved', label: 'Phiếu được duyệt',   sub: 'Email xác nhận gửi sinh viên', val: chApproved, set: setChApproved, disabled: false },
                    { key: 'rejected', label: 'Phiếu bị từ chối',   sub: 'Email kèm lý do từ chối',      val: chRejected, set: setChRejected, disabled: false },
                    { key: 'handover', label: 'Bàn giao thiết bị',  sub: 'Email xác nhận + hạn trả',     val: chHandover, set: setChHandover, disabled: false },
                    { key: 'overdue',  label: 'Cảnh báo quá hạn',   sub: '⚠ Không thể tắt',              val: true,       set: () => {},        disabled: true },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${SLINK_COLORS.border}` }}>
                      <div>
                        <Text strong style={{ fontSize: 13 }}>{item.label}</Text><br />
                        <Text type={item.disabled ? 'danger' : 'secondary'} style={{ fontSize: 11 }}>{item.sub}</Text>
                      </div>
                      <Switch checked={item.val} onChange={item.set} disabled={item.disabled} />
                    </div>
                  ))}
                </Card>
              </Col>

              {/* Retry config */}
              <Col span={12}>
                <Card size="small" title={<><ReloadOutlined /> Cấu hình retry email</>}
                  style={{ borderColor: SLINK_COLORS.border }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                    Khi SMTP lỗi, hệ thống đưa vào hàng chờ và thử lại tự động
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${SLINK_COLORS.border}` }}>
                    <div><Text strong style={{ fontSize: 13 }}>Số lần thử lại tối đa</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Sau đó đánh thất bại Thất bại</Text></div>
                    <InputNumber min={1} max={10} value={maxRetry} onChange={v => v && setMaxRetry(v)} addonAfter="lần" style={{ width: 100 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${SLINK_COLORS.border}` }}>
                    <div><Text strong style={{ fontSize: 13 }}>Khoảng cách mỗi lần thử</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Tính từ lần thử trước</Text></div>
                    <InputNumber min={1} max={60} value={retryInterval} onChange={v => v && setRetryInterval(v)} addonAfter="phút" style={{ width: 110 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                    <div><Text strong style={{ fontSize: 13 }}>Cảnh báo sự cố cron</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Gửi email cho admin khi cron thất bại</Text></div>
                    <Switch checked={alertCron} onChange={setAlertCron} />
                  </div>

                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Button
                      type="primary" style={{ background: SLINK_COLORS.primary }}
                      onClick={handleSaveSettings}
                    >
                      Lưu cấu hình
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Modal: Gửi thông báo thủ công */}
      <Modal
        open={sendModal} title={<><SendOutlined /> Gửi thông báo thủ công</>}
        okText="Gửi ngay" cancelText="Hủy"
        onOk={() => sendForm.submit()}
        onCancel={() => { setSendModal(false); sendForm.resetFields(); }}
        destroyOnClose
      >
        <Form form={sendForm} layout="vertical"
          onFinish={async (values) => {
            try {
              const res = await notificationService.send({
                target: values.target,
                title: values.title,
                content: values.content,
              });
              message.success(res.message ?? `Đã gửi thông báo thành công`);
              setSendModal(false); sendForm.resetFields();
              fetchLogs();
            } catch (e: any) {
              message.error(e?.response?.data?.message ?? 'Gửi thông báo thất bại');
            }
          }}
        >
          <Form.Item name="target" label="Đối tượng nhận" rules={[{ required: true }]}>
            <Select options={[
              { value: 'all_students', label: 'Tất cả sinh viên' },
              { value: 'overdue', label: 'Sinh viên quá hạn' },
              { value: 'admin', label: 'Admin' },
            ]} placeholder="Chọn đối tượng" />
          </Form.Item>
          <Form.Item name="channel" label="Kênh gửi" rules={[{ required: true }]}>
            <Select options={[
              { value: 'app', label: 'Trong app' },
              { value: 'email', label: 'Email' },
              { value: 'both', label: 'Email + App' },
            ]} placeholder="Chọn kênh" />
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
            <Input placeholder="Tiêu đề thông báo..." maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}>
            <Input.TextArea rows={4} placeholder="Nội dung thông báo..." maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
