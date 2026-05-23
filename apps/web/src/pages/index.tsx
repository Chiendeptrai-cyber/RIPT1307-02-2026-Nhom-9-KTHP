import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

export default function IndexPage() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (user.role === 'admin') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/equipment';
    }
  }, [user]);

  return null;
}
