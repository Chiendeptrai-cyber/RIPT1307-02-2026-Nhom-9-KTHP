export default function AdminRequestDetailPage() {
  const id = window.location.pathname.split('/').pop();

  return (
    <div>
      <h2>Yêu cầu #{id}</h2>
      <p>Chi tiết yêu cầu sẽ xuất hiện tại đây.</p>
    </div>
  );
}
