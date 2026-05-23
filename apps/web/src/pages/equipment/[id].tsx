export default function EquipmentDetailPage() {
  const id = window.location.pathname.split('/').pop();

  return (
    <div>
      <h2>Chi tiết thiết bị #{id}</h2>
      <p>Thông tin chi tiết sẽ được hiển thị tại đây.</p>
    </div>
  );
}
