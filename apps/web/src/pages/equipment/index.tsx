import {
  PlusOutlined,
  SearchOutlined,
  ToolOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Pagination,
  Row,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useEquipmentList } from '../../hooks/useEquipmentList';
import { SLINK_COLORS } from '../../theme/tokens';

const { Title, Text } = Typography;

function EquipmentCard({ item }: { item: any }) {
  const navigate = useNavigate();
  const isAvailable = item.availableQuantity > 0;

  return (
    <Card
      hoverable
      onClick={() => navigate(`/equipment/${item.id}`)}
      style={{
        borderRadius: 8,
        border: `1px solid ${SLINK_COLORS.border}`,
        boxShadow: SLINK_COLORS.shadow,
        height: '100%',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'rgba(191, 4, 4, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}
        >
          <ToolOutlined style={{ fontSize: 20, color: SLINK_COLORS.primary }} />
        </div>
        <Text strong style={{ fontSize: 14, color: SLINK_COLORS.textBase, lineHeight: 1.4 }}>
          {item.name}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Còn lại: <strong style={{ color: isAvailable ? SLINK_COLORS.success : SLINK_COLORS.primary }}>
              {item.availableQuantity}/{item.totalQuantity}
            </strong>
          </Text>
          <Tag color={isAvailable ? 'green' : 'red'} style={{ margin: 0, fontSize: 11 }}>
            {isAvailable ? 'Có sẵn' : 'Hết'}
          </Tag>
        </div>
      </div>
    </Card>
  );
}

export default function EquipmentListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout>>();

  const { items, total, page, loading, error, refetch } = useEquipmentList({
    search: debouncedSearch,
    pageSize: 20,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    const t = setTimeout(() => setDebouncedSearch(val), 400);
    setSearchTimer(t);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header Card */}
      <Card
        style={{
          borderRadius: 8,
          border: `1px solid ${SLINK_COLORS.border}`,
          boxShadow: SLINK_COLORS.shadow,
          marginBottom: 16,
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(191, 4, 4, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ToolOutlined style={{ fontSize: 18, color: SLINK_COLORS.primary }} />
            </div>
            <div>
              <Title level={5} style={{ marginBottom: 0, color: SLINK_COLORS.textBase }}>
                Danh sách thiết bị
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Tìm kiếm và đăng ký mượn thiết bị
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              placeholder="Tìm kiếm thiết bị..."
              prefix={<SearchOutlined style={{ color: SLINK_COLORS.textSecondary }} />}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ width: 240, borderRadius: 6 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch(page)}
              style={{ borderRadius: 6 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              href="/borrow-request/create"
              style={{ background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary, borderRadius: 6 }}
            >
              Tạo yêu cầu
            </Button>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* Content */}
      <Card
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
        styles={{ body: { padding: 20 } }}
      >
        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Col key={i} xs={24} sm={12} lg={8} xl={6}>
                <Skeleton.Button active block style={{ height: 100, borderRadius: 8 }} />
              </Col>
            ))}
          </Row>
        ) : items.length === 0 ? (
          <Empty
            description={
              debouncedSearch
                ? `Không tìm thấy thiết bị nào khớp với "${debouncedSearch}"`
                : 'Chưa có thiết bị nào trong hệ thống'
            }
          />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {items.map((item) => (
                <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
                  <EquipmentCard item={item} />
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={page}
                total={total}
                pageSize={20}
                onChange={(p) => refetch(p)}
                showTotal={(t) => `${t} thiết bị`}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
