export default function AdminEquipmentStockPage() {
  const id = window.location.pathname.split('/').slice(-2, -1)[0];

  return (
    <div>
      <h2>Quản lý tồn kho thiết bị #{id}</h2>
      <p>Thông tin tồn kho sẽ hiển thị tại đây.</p>
    </div>
  );
}
