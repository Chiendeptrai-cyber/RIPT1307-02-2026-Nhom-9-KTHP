import { PlusOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Input, Row, Tag, Typography } from 'antd';
import { useState } from 'react';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import { useEquipmentList } from '../../hooks/useEquipmentList';
import { SLINK_COLORS } from '../../theme/tokens';

const { Title, Text } = Typography;

export default function EquipmentListPage() {
  const { items } = useEquipmentList();
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
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
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: 'rgba(191, 4, 4, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240, borderRadius: 6 }}
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

      {/* Equipment Grid */}
      {filtered.length === 0 ? (
        <Card
          style={{
            borderRadius: 8,
            border: `1px solid ${SLINK_COLORS.border}`,
            boxShadow: SLINK_COLORS.shadow,
          }}
        >
          <Empty
            description={
              <span>
                {search ? (
                  <>Không tìm thấy thiết bị phù hợp với <Tag color="red">{search}</Tag></>
                ) : (
                  'Chưa có thiết bị nào trong hệ thống'
                )}
              </span>
            }
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((item) => (
            <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
              <EquipmentCard name={item.name} available={0} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
