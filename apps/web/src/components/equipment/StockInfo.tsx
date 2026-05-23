interface Props {
  total: number;
  available: number;
}

export default function StockInfo({ total, available }: Props) {
  return (
    <div>
      <p>Tổng: {total}</p>
      <p>Còn: {available}</p>
    </div>
  );
}
