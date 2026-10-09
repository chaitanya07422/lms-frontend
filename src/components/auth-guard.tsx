'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { homePathForRole, isBorrowerRole, isOpsRole, modulesForRole } from '@/lib/roles';
import type { OpsRole, UserRole } from '@/types/user';

const OPS_MODULES = new Set<string>(['sales', 'sanction', 'disbursement', 'collection']);

type AuthGuardProps = {
  children: ReactNode;
  /** `borrower` portal, any `ops` role, or a single ops module name */
  allow: 'borrower' | 'ops' | OpsRole;
};

function isAllowed(userRole: UserRole, allow: AuthGuardProps['allow']): boolean {
  if (allow === 'borrower') {
    return isBorrowerRole(userRole);
  }
  if (allow === 'ops') {
    return isOpsRole(userRole);
  }
  if (OPS_MODULES.has(allow)) {
    return modulesForRole(userRole).includes(allow);
  }
  return false;
}

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

    if (!isAllowed(user.role, allow)) {
      router.replace(homePathForRole(user.role));
    }
  }, [allow, isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!isAllowed(user.role, allow)) {
    return null;
  }

  return <>{children}</>;
}
