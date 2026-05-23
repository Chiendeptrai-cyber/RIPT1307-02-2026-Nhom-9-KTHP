import { Card } from 'antd';

interface Props {
  name: string;
  available: number;
}

export default function EquipmentCard({ name, available }: Props) {
  return (
    <Card title={name} style={{ marginBottom: 16 }}>
      <p>Số lượng sẵn có: {available}</p>
    </Card>
  );
}
