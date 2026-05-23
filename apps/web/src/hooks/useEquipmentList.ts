import { useEffect, useState } from 'react';

export function useEquipmentList() {
  const [items, setItems] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    setItems([]);
  }, []);

  return { items };
}
