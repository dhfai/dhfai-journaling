"use client";

import { ReactNode } from 'react';
import { useAuthGuard } from '@/hooks/use-auth-guard';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback = <div className="min-h-screen flex items-center justify-center bg-[#525e6f]">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>,
  redirectTo = '/get-started'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthGuard(redirectTo);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
