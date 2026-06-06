import dayjs from 'dayjs';
import type { CSSProperties } from 'react';

/** Style cho badge mã ID (EQ-0023, PH-xxx, LOG-xxx …) */
export const idBadgeStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 13,
  color: '#cf1322',
  fontWeight: 700,
  background: '#fff1f0',
  border: '1px solid #ffa39e',
  borderRadius: 6,
  padding: '2px 10px',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
};

export const formatDate = (d: string | Date) => dayjs(d).format('DD/MM/YYYY');
export const formatDatetime = (d: string | Date) => dayjs(d).format('DD/MM/YYYY HH:mm');
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};
