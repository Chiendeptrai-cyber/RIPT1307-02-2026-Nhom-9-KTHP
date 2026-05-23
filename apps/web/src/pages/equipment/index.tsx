import EquipmentCard from '../../components/equipment/EquipmentCard';
import { useEquipmentList } from '../../hooks/useEquipmentList';

export default function EquipmentListPage() {
  const { items } = useEquipmentList();

  return (
    <div>
      {items.length === 0 ? <p>Không có thiết bị để hiển thị</p> : items.map((item) => <EquipmentCard key={item.id} name={item.name} available={0} />)}
    </div>
  );
}
