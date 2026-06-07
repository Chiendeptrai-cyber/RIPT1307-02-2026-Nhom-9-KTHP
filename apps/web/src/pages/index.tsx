import { useEffect, useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useAuthStore } from '../stores/auth.store';
import { getMe } from '../services/auth.service';

export default function IndexPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Nếu không có user hoặc token trong store → thẳng trang login
    if (!user || !token) {
      navigate('/login', { replace: true });
      return;
    }

    // Có token trong store → verify với server để chắc chắn token còn hợp lệ
    getMe()
      .then((res) => {
        if (res.success && res.data) {
          // Token hợp lệ → redirect theo role
          if (res.data.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/equipment', { replace: true });
          }
        } else {
          // Server trả về nhưng không hợp lệ
          logout();
          navigate('/login', { replace: true });
        }
      })
      .catch(() => {
        // Token hết hạn hoặc lỗi → xóa store và về login
        logout();
        navigate('/login', { replace: true });
      })
      .finally(() => setChecking(false));
  }, []); // chỉ chạy 1 lần khi mount

  // Hiển thị trống trong khi đang kiểm tra
  if (checking) return null;

  return null;
}
