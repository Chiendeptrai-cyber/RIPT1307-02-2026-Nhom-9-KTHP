import dayjs from 'dayjs';

export const formatDate = (d: string | Date) => dayjs(d).format('DD/MM/YYYY');
export const formatDatetime = (d: string | Date) => dayjs(d).format('DD/MM/YYYY HH:mm');
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};
