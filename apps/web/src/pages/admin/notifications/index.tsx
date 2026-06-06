import { useState } from 'react';
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

const { Title, Text } = Typography;

/* ─── Mock data ─────────────────────────────────────────────── */
interface NtfLog {
  id: string; time: string; event: string; channel: string;
  recipient: string; content: string; tries: number; status: string;
}
interface RetryItem {
  id: string; time: string; event: string; recipient: string;
  email: string; tryNum: string; error: string;
}

const MOCK_LOGS: NtfLog[] = [
  { id: 'NTF-001', time: '20/05 09:14', event: 'Phiếu được duyệt',  channel: 'Email + App', recipient: 'Nguyễn Văn A', content: 'PH-20230520-00142 đc duyệt', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-002', time: '20/05 09:14', event: 'Yêu cầu mới',       channel: 'Trong app',   recipient: 'Admin',         content: 'Sinh viên Nguyễn Văn A tạo phiếu mới', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-003', time: '20/05 08:00', event: 'Nhắc trả sắp hạn',  channel: 'Email + App', recipient: 'Lê Minh C',     content: 'Còn 1 ngày — PH-20230515-00121', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-004', time: '20/05 08:00', event: 'Nhắc trả sắp hạn',  channel: 'Email + App', recipient: 'Phạm Thị D',    content: 'Còn 2 ngày — PH-20230512-05109', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-005', time: '20/05 09:02', event: 'Cảnh báo quá hạn',  channel: 'Email',       recipient: 'Hoàng Minh E',  content: 'PH-20230510-00098 quá hạn 2 ngày', tries: 3, status: 'Thất bại' },
  { id: 'NTF-006', time: '19/05 15:30', event: 'Phiếu bị từ chối',  channel: 'Email + App', recipient: 'Trần Thị B',    content: 'PH-20230519-00143 từ chối', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-007', time: '19/05 15:00', event: 'Bàn giao thiết bị', channel: 'Email',       recipient: 'Phạm Quốc C',   content: 'PH-20230519-00138 đã bàn giao', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-008', time: '19/05 09:00', event: 'Cảnh báo quá hạn',  channel: 'Email + App', recipient: 'Admin',         content: '2 phiếu quá hạn hôm nay', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-009', time: '18/05 11:20', event: 'Xác nhận đã trả',   channel: 'Trong app',   recipient: 'Vũ Thanh F',    content: 'PH-20230518-00130 đã trả', tries: 1, status: 'Đã gửi' },
  { id: 'NTF-010', time: '18/05 08:00', event: 'Nhắc trả sắp hạn',  channel: 'Email + App', recipient: 'Nguyễn Thị G',  content: 'Còn 1 ngày — PH-20230517-00125', tries: 2, status: 'Chờ retry' },
];

const MOCK_RETRY: RetryItem[] = [
  { id: 'QUE-001', time: '20/05 09:02', event: 'Cảnh báo quá hạn',  recipient: 'Hoàng Minh E', email: 'hoangminhe@sv.edu.vn', tryNum: '3/3 lần', error: 'SMTP timeout' },
  { id: 'QUE-002', time: '18/05 08:00', event: 'Nhắc trả sắp hạn',  recipient: 'Nguyễn Thị G', email: 'nguyenthig@sv.edu.vn', tryNum: '2/3 lần', error: 'Invalid SMTP credentials' },
  { id: 'QUE-003', time: '20/05 09:14', event: 'Phiếu được duyệt',  recipient: 'Lê Quang H',   email: 'lequangh@sv.edu.vn',  tryNum: '1/3 lần', error: 'Connection refused' },
];

const EVENT_TYPES = ['Phiếu được duyệt','Phiếu bị từ chối','Nhắc trả sắp hạn','Cảnh báo quá hạn','Bàn giao thiết bị','Xác nhận đã trả'];

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

  /* ── filtered logs ── */
  const filteredLogs = MOCK_LOGS.filter(r => {
    const matchEvent = !eventFilter || r.event === eventFilter;
    const matchSearch = !search ||
      r.recipient.toLowerCase().includes(search.toLowerCase()) ||
      r.event.toLowerCase().includes(search.toLowerCase());
    return matchEvent && matchSearch;
  });

  /* ── columns ── */
  const logColumns: ColumnsType<NtfLog> = [
    { title: 'ID',         dataIndex: 'id',        width: 90, render: v => <Text style={{ color: SLINK_COLORS.primary, fontSize: 12 }}>{v}</Text> },
    { title: 'Thời gian',  dataIndex: 'time',       width: 110, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Sự kiện',    dataIndex: 'event',      width: 160, render: v => <Tag color="geekblue" style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Kênh',       dataIndex: 'channel',    width: 110, render: v => <Tag color={CHANNEL_COLOR[v] ?? 'default'} style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Người nhận', dataIndex: 'recipient',  width: 130, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Nội dung',   dataIndex: 'content',    render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Số lần',     dataIndex: 'tries',      width: 70, align: 'center', render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Trạng thái', dataIndex: 'status',     width: 100, render: v => <Badge status={v === 'Đã gửi' ? 'success' : v === 'Thất bại' ? 'error' : 'warning'} text={<Tag color={STATUS_COLOR[v] ?? 'default'} style={{ margin: 0, fontSize: 11 }}>{v}</Tag>} /> },
  ];

  const retryColumns: ColumnsType<RetryItem> = [
    { title: 'ID',         dataIndex: 'id',        width: 90, render: v => <Text style={{ color: SLINK_COLORS.primary, fontSize: 12 }}>{v}</Text> },
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
      <Button size="small" onClick={() => message.success(`Đã thử lại ${r.id}`)}>Thử lại</Button>
    )},
  ];

  const tabs: { key: 'history'|'retry'|'config'; label: React.ReactNode }[] = [
    { key: 'history', label: <span>Lịch sử gửi <Badge count={MOCK_LOGS.length} style={{ background: '#595959', marginLeft: 4 }} /></span> },
    { key: 'retry',   label: <span>Hàng chờ retry <Badge count={MOCK_RETRY.length} style={{ background: SLINK_COLORS.primary, marginLeft: 4 }} /></span> },
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
                Lịch sử gửi thông báo — <strong>{filteredLogs.length} bản ghi</strong>
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
            />
          </div>
        )}

        {/* ── Tab: Hàng chờ retry ── */}
        {activeTab === 'retry' && (
          <div>
            {MOCK_RETRY.length > 0 && (
              <Alert
                type="warning" showIcon
                message={`${MOCK_RETRY.length} email đang chờ gửi lại — thử tối đa ${maxRetry} lần, cách nhau ${retryInterval} phút`}
                style={{ margin: 16, borderRadius: 6 }}
              />
            )}
            <Table<RetryItem>
              dataSource={MOCK_RETRY} columns={retryColumns} rowKey="id"
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
                      onClick={() => message.success('Đã lưu cấu hình thông báo')}
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
