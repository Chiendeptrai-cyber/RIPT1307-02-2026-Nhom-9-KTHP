import { Modal } from 'antd';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  content: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, content, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} title={title} onOk={onConfirm} onCancel={onCancel}>
      {content}
    </Modal>
  );
}
