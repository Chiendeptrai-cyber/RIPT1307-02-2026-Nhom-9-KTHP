import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from '@umijs/max';
import {
  Alert, Badge, Button, Card, Descriptions, Result, Skeleton, Tag, Typography,
} from 'antd';
import { ArrowLeftOutlined, ToolOutlined } from '@ant-design/icons';
import { equipmentService, type Equipment } from '../../services/equipment.service';
import { SLINK_COLORS } from '../../theme/tokens';

const { Title, Text } = Typography;

const statusConfig: Record<string, { label: string; color: string }> = {
  active:            { label: 'Đang hoạt động', color: 'green' },
  under_maintenance: { label: 'Đang bảo trì',   color: 'orange' },
  deleted:           { label: 'Đã xóa',          color: 'red' },
};

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await equipmentService.getDetail(Number(id));
      if (res.success && res.data) setEquipment(res.data);
      else setError('Không thể tải thông tin thiết bị');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Thiết bị không tồn tại hoặc đã bị xóa');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="404"
          title="Không tìm thấy thiết bị"
          subTitle={error ?? 'Thiết bị này không tồn tại hoặc đã bị xóa'}
          extra={<Button onClick={() => navigate('/equipment')}>Quay lại danh sách</Button>}
        />
      </div>
    );
  }

  const isAvailable = equipment.availableQuantity > 0;
  const cfg = statusConfig[equipment.status] ?? { label: equipment.status, color: 'default' };

  return (
    <div style={{ padding: 24 }}>
      {/* Back */}
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        onClick={() => navigate('/equipment')}
        style={{ marginBottom: 16, padding: 0, color: SLINK_COLORS.textSecondary }}
      >
        Quay lại danh sách
      </Button>

      <Card
        style={{ borderRadius: 8, border: `1px solid ${SLINK_COLORS.border}`, boxShadow: SLINK_COLORS.shadow }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: 'rgba(191,4,4,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ToolOutlined style={{ fontSize: 28, color: SLINK_COLORS.primary }} />
          </div>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ marginBottom: 4 }}>{equipment.name}</Title>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag color={cfg.color}>{cfg.label}</Tag>
              <Badge
                count={equipment.availableQuantity}
                style={{ backgroundColor: isAvailable ? SLINK_COLORS.success : SLINK_COLORS.primary }}
                overflowCount={999}
              />
              <Text type="secondary" style={{ fontSize: 13 }}>chiếc còn sẵn</Text>
            </div>
          </div>
        </div>

        {/* Details */}
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
          <Descriptions.Item label="Tổng số lượng">{equipment.totalQuantity} chiếc</Descriptions.Item>
          <Descriptions.Item label="Còn có thể mượn">
            <Text strong style={{ color: isAvailable ? SLINK_COLORS.success : SLINK_COLORS.primary }}>
              {equipment.availableQuantity} chiếc
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={cfg.color}>{cfg.label}</Tag>
          </Descriptions.Item>
          {equipment.description && (
            <Descriptions.Item label="Mô tả" span={2}>{equipment.description}</Descriptions.Item>
          )}
        </Descriptions>

        {/* Action */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <Button
            type="primary"
            size="large"
            disabled={!isAvailable || equipment.status !== 'active'}
            onClick={() => navigate(`/borrow-request/create?equipmentId=${equipment.id}`)}
            style={{
              background: isAvailable ? SLINK_COLORS.primary : undefined,
              borderColor: isAvailable ? SLINK_COLORS.primary : undefined,
              borderRadius: 6,
            }}
          >
            {isAvailable ? 'Đăng ký mượn thiết bị này' : 'Thiết bị hiện không có sẵn'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
