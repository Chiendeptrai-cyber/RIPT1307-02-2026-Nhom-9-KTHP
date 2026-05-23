import { Spin } from 'antd';

export default function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: 24 }}>
      <Spin />
    </div>
  );
}
