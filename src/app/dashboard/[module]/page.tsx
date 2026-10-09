'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';
import { modulesForRole } from '@/lib/roles';
import type { OpsRole } from '@/types/user';

const OPS_MODULES = new Set(['sales', 'sanction', 'disbursement', 'collection']);

export default function DashboardModulePage() {
  const params = useParams<{ module: string }>();
  const moduleName = params.module;
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isKnownModule = OPS_MODULES.has(moduleName);
  const allowed =
    !!user && isKnownModule
      ? modulesForRole(user.role).includes(moduleName as OpsRole)
      : false;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!user) {
      return;
    }
    if (!isKnownModule || !allowed) {
      router.replace('/dashboard');
    }
  }, [allowed, isKnownModule, isLoading, router, user]);

  if (!isKnownModule || !allowed) {
    return (
      <div className="text-sm text-muted">
        {isLoading ? 'Loading…' : 'Redirecting…'}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold capitalize">{moduleName} module</h2>
      <p className="mt-2 text-sm text-muted">
        Placeholder for the {moduleName} queue and actions. Wired to `/ops/{moduleName}` APIs in a
        later phase.
      </p>
    </section>
  );
}
