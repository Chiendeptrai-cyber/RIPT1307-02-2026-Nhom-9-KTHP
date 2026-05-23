import { useEffect, useState } from 'react';

export function useNotifications() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, []);

  return { count };
}
