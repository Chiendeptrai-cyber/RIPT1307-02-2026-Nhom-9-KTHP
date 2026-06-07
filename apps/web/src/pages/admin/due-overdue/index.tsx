import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  message,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { SLINK_COLORS } from '../../../theme/tokens';
import { idBadgeStyle } from '@/utils/format';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

type TabKey = 'due-soon' | 'overdue';

export default function AdminDueOverduePage() {
  const [allItems, setAllItems] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('due-soon');
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await borrowRequestService.listDueOverdue();
      setAllItems(res.data ?? []);
    } catch {
      messageApi.error('Không thể tải dữ liệu hạn trả');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    load();
  }, [load]);

  // Helper: lấy ngày trả dự kiến (ở cấp phiếu) để tính ngày nhất quán
  const getDueDate = (item: BorrowRequest) =>
    dayjs(item.expectedReturnDate).startOf('day');

  // Split items into due-soon (within 3 days, NOT yet past due) and overdue (past due)
  const today = dayjs().startOf('day');
  const dueSoonItems = allItems.filter((item) => {
    const daysUntilDue = getDueDate(item).diff(today, 'day');
    const isOverdue = (item.status as string) === 'overdue';
    // Chỉ hiện: đang mượn, chưa quá hạn, trong vòng 3 ngày tới (0-3 ngày)
    return !isOverdue && daysUntilDue >= 0 && daysUntilDue <= 3;
  });
  const overdueItems = allItems.filter((item) => {
    const due = getDueDate(item);
    const isOverdue = (item.status as string) === 'overdue';
    // Đã quá hạn: status overdue HOẶC borrowing mà đã qua ngày trả
    return isOverdue || (!isOverdue && due.isBefore(today));
  });

  const displayedItems = activeTab === 'due-soon' ? dueSoonItems : overdueItems;

  const columns: ColumnsType<BorrowRequest> = [
    {
      title: 'Phiếu',
      dataIndex: 'displayCode',
      key: 'displayCode',
      width: 200,
      render: (v: string, r: BorrowRequest) => (
        <span style={idBadgeStyle}>
          {v ?? `#${r.id}`}
        </span>
      ),
    },
    {
      title: 'Sinh viên',
      key: 'student',
      width: 200,
      render: (_: unknown, r: BorrowRequest) => (
        <div>
          <Text style={{ fontSize: 13, display: 'block' }}>{r.userFullName ?? `User #${r.userId}`}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.userEmail}</Text>
        </div>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      ellipsis: true,
      render: (_: unknown, r: BorrowRequest) => (
        <Text style={{ fontSize: 13 }}>{r.equipmentSummary || r.equipmentName || '—'}</Text>
      ),
    },
    {
      title: 'Hạn trả',
      key: 'expectedReturnDate',
      width: 110,
      render: (_: unknown, r: BorrowRequest) => {
        const due = getDueDate(r);
        const isOverdue = due.isBefore(today);
        return (
          <Text
            style={{
              color: isOverdue ? '#CF1322' : '#FA8C16',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {due.format('DD/MM/YYYY')}
          </Text>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => {
        const isOverdue = v === 'overdue';
        return (
          <Tag
            color={isOverdue ? 'volcano' : 'orange'}
            style={{ fontSize: 11 }}
          >
            {isOverdue ? 'Quá hạn' : 'Đang mượn'}
          </Tag>
        );
      },
    },
    {
      title: 'Còn / Trễ',
      key: 'daysDiff',
      width: 90,
      align: 'center',
      render: (_: unknown, r: BorrowRequest) => {
        const due = getDueDate(r);
        const diff = due.diff(today, 'day');
        if (diff >= 0) {
          return (
            <Tag color="orange" style={{ fontSize: 11 }}>
              {diff === 0 ? 'Hôm nay' : `+${diff}N`}
            </Tag>
          );
        }
        return (
          <Tag color="volcano" style={{ fontSize: 11, fontWeight: 700 }}>
            -{Math.abs(diff)}N
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      {/* Header */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            Hạn Trả Thiết Bị
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Theo dõi phiếu sắp đến hạn và quá hạn —{' '}
            <span style={{ color: SLINK_COLORS.textBase }}>
              {dayjs().format('dddd, DD/MM/YYYY')}
            </span>
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Alert summary */}
      {overdueItems.length > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          message={`${overdueItems.length} thiết bị đang quá hạn trả`}
          description="Các sinh viên dưới đây đang giữ thiết bị quá hạn. Hệ thống tự động gửi email cảnh báo hàng ngày."
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* Main Card */}
      <Card
        style={{
          borderRadius: 10,
          border: `1px solid ${SLINK_COLORS.border}`,
          boxShadow: SLINK_COLORS.shadow,
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Tabs */}
        <div style={{ padding: '0 20px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as TabKey)}
            items={[
              {
                key: 'due-soon',
                label: (
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Sắp đến hạn{' '}
                    {dueSoonItems.length > 0 && (
                      <Badge
                        count={dueSoonItems.length}
                        style={{ backgroundColor: '#FA8C16', marginLeft: 4 }}
                      />
                    )}
                  </span>
                ),
              },
              {
                key: 'overdue',
                label: (
                  <span>
                    <ExclamationCircleOutlined style={{ marginRight: 4, color: '#CF1322' }} />
                    <span style={{ color: overdueItems.length > 0 ? '#CF1322' : undefined }}>
                      Quá hạn
                    </span>
                    {overdueItems.length > 0 && (
                      <Badge
                        count={overdueItems.length}
                        style={{ backgroundColor: '#CF1322', marginLeft: 4 }}
                      />
                    )}
                  </span>
                ),
              },
            ]}
            style={{ borderBottom: 'none' }}
          />
        </div>

        {/* Table */}
        {displayedItems.length === 0 && !loading ? (
          <div style={{ padding: 40 }}>
            <Empty
              description={
                activeTab === 'due-soon'
                  ? 'Không có phiếu nào sắp đến hạn trong 3 ngày tới'
                  : 'Không có phiếu nào đang quá hạn'
              }
            />
          </div>
        ) : (
          <Table<BorrowRequest>
            dataSource={displayedItems}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            pagination={{
              pageSize: 15,
              size: 'small',
              showSizeChanger: false,
              showTotal: (total) => <Text style={{ fontSize: 12 }}>{total} mục</Text>,
            }}
            style={{ padding: '0 4px' }}
          />
        )}
      </Card>

      {/* Info footer */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#f6f8fa', borderRadius: 8, fontSize: 12, color: '#666' }}>
        <strong>Lưu ý:</strong> Hệ thống tự động gửi nhắc nhở in-app + email cho sinh viên vào các mốc:
        trước 3 ngày (8:00 sáng), ngày đến hạn (8:00 sáng), và quá hạn 1 ngày (00:00 đêm).
      </div>
    </div>
  );
}
