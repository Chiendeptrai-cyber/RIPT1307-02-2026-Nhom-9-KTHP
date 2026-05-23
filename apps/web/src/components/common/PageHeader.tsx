import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export default function PageHeader({ title, subtitle, extra }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
      {extra ? <div>{extra}</div> : null}
    </div>
  );
}
