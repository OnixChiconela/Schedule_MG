// src/components/ProtectedRoute.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { clearStorage, getTokenFromStorage, isTokenExpired } from '../api/actions/auth/isTokenExpired';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const token = getTokenFromStorage();

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      clearStorage();
      router.push('/my-space/auth/login');
    }
  }, [token, router]);

  if (!token || isTokenExpired(token)) {
    return null; // Evita renderizar conteúdo protegido
  }

  return <>{children}</>;
};

export default ProtectedRoute;