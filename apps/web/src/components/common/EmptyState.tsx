import { Empty } from 'antd';

interface Props {
  description?: string;
}

export default function EmptyState({ description }: Props) {
  return <Empty description={description ?? 'Không có dữ liệu'} />;
}
