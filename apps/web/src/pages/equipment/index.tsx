import {
  PlusOutlined,
  SearchOutlined,
  ToolOutlined,
  ReloadOutlined,
  PictureOutlined,
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
  Select,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useEquipmentList } from '../../hooks/useEquipmentList';
import { equipmentService } from '../../services/equipment.service';
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
      styles={{ body: { padding: 0 } }}
    >
      {/* Image thumbnail */}
      <div style={{ height: 120, background: '#f5f5f5', borderRadius: '8px 8px 0 0', overflow: 'hidden', position: 'relative' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb' }}>
            <PictureOutlined style={{ fontSize: 32 }} />
            <span style={{ fontSize: 11, marginTop: 4 }}>Chưa có ảnh</span>
          </div>
        )}
        <span style={{
          position: 'absolute', top: 6, right: 6,
          fontFamily: 'monospace', fontWeight: 600,
          color: SLINK_COLORS.primary, fontSize: '10px',
          background: 'rgba(255,255,255,0.9)',
          padding: '1px 6px', borderRadius: 3,
          border: '1px solid rgba(191, 4, 4, 0.12)',
        }}>
          EQ-{String(item.id).padStart(4, '0')}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Text strong style={{ fontSize: 13, color: SLINK_COLORS.textBase, lineHeight: 1.4 }}>
          {item.name}
        </Text>
        {item.categoryName && (
          <Tag color="cyan" style={{ margin: 0, fontSize: '10px', borderRadius: 4, width: 'fit-content' }}>
            {item.categoryName}
          </Tag>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTop: `1px dashed ${SLINK_COLORS.border}` }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Còn: <strong style={{ color: isAvailable ? SLINK_COLORS.success : SLINK_COLORS.primary }}>
              {item.availableQuantity}/{item.totalQuantity}
            </strong>
          </Text>
          <Tag color={isAvailable ? 'green' : 'red'} style={{ margin: 0, fontSize: 10 }}>
            {isAvailable ? 'Có sẵn' : 'Hết'}
          </Tag>
        </div>
      </div>
    </Card>
  );
}

export default function EquipmentListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout>>();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const { items, total, page, loading, error, refetch } = useEquipmentList({
    search: debouncedSearch,
    categoryId: selectedCategory,
    pageSize: 20,
  });

  useEffect(() => {
    equipmentService.listCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
      });
  }, []);

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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Select
              placeholder="Tất cả danh mục"
              allowClear
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              style={{ width: 180 }}
              options={[
                { value: undefined, label: 'Tất cả danh mục' },
                ...categories.map((c) => ({ value: c.id, label: c.name }))
              ]}
              dropdownMatchSelectWidth={false}
            />
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
              onClick={() => navigate('/borrow-request/create')}
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
