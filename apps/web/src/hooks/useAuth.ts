import { useMemo } from 'react';
import { useAuthStore } from '../stores/auth.store';
import type { AuthUser } from '../stores/auth.store';

interface UseAuthReturn {
  user: AuthUser | null;
  isAdmin: boolean;
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return useMemo(() => ({ user, isAdmin: isAdmin() }), [user, isAdmin]);
}
