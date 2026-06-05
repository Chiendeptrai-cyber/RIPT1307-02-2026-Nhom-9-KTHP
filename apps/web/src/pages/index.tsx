import { useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useAuthStore } from '../stores/auth.store';

export default function IndexPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/equipment', { replace: true });
    }
  }, [user, navigate]);

  return null;
}
