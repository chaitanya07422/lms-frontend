'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { homePathForRole, isBorrowerRole, isOpsRole } from '@/lib/roles';
import type { UserRole } from '@/types/user';

type AuthGuardProps = {
  children: ReactNode;
  allow: 'borrower' | 'ops' | UserRole[];
};

export function AuthGuard({ children, allow }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (allow === 'borrower' && !isBorrowerRole(user.role)) {
      router.replace(homePathForRole(user.role));
      return;
    }

    if (allow === 'ops' && !isOpsRole(user.role)) {
      router.replace(homePathForRole(user.role));
      return;
    }

    if (Array.isArray(allow) && !allow.includes(user.role) && user.role !== 'admin') {
      router.replace(homePathForRole(user.role));
    }
  }, [allow, isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (allow === 'borrower' && !isBorrowerRole(user.role)) {
    return null;
  }

  if (allow === 'ops' && !isOpsRole(user.role)) {
    return null;
  }

  if (Array.isArray(allow) && !allow.includes(user.role) && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
