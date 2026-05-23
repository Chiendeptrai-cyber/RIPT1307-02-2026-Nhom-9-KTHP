import { PlusSquareOutlined, ToolOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Tag, Typography } from 'antd';
import { SLINK_COLORS } from '../../theme/tokens';

const { Text } = Typography;

interface Props {
  name: string;
  available: number;
  category?: string;
  id?: number;
}

export default function EquipmentCard({ name, available, category = 'Thiết bị', id }: Props) {
  const isAvailable = available > 0;

  return (
    <Badge.Ribbon
      text={isAvailable ? `Còn ${available}` : 'Hết'}
      color={isAvailable ? SLINK_COLORS.success : '#999'}
    >
      <Card
        hoverable
        style={{
          borderRadius: 8,
          border: `1px solid ${SLINK_COLORS.border}`,
          boxShadow: SLINK_COLORS.shadow,
          height: '100%',
          transition: 'all 0.25s ease',
        }}
        styles={{ body: { padding: 16 } }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'rgba(191, 4, 4, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <ToolOutlined style={{ fontSize: 20, color: SLINK_COLORS.primary }} />
        </div>

        {/* Info */}
        <Text strong style={{ display: 'block', marginBottom: 4, color: SLINK_COLORS.textBase, fontSize: 14 }}>
          {name}
        </Text>
        <Tag color="blue" style={{ marginBottom: 12, borderRadius: 4 }}>
          {category}
        </Tag>

        {/* Action */}
        <Button
          type={isAvailable ? 'primary' : 'default'}
          size="small"
          icon={<PlusSquareOutlined />}
          disabled={!isAvailable}
          href={id ? `/borrow-request/create?equipmentId=${id}` : '/borrow-request/create'}
          block
          style={{
            borderRadius: 6,
            ...(isAvailable
              ? { background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary }
              : {}),
          }}
        >
          {isAvailable ? 'Đăng ký mượn' : 'Không khả dụng'}
        </Button>
      </Card>
    </Badge.Ribbon>
  );
}
