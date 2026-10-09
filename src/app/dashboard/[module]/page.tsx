'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/context/auth-context';
import { modulesForRole } from '@/lib/roles';
import type { OpsRole } from '@/types/user';

const OPS_MODULES = new Set(['sales', 'sanction', 'disbursement', 'collection']);

export default function DashboardModulePage() {
  const params = useParams<{ module: string }>();
  const moduleName = params.module;
  const { user } = useAuth();
  const router = useRouter();

  const allowed =
    user && OPS_MODULES.has(moduleName)
      ? modulesForRole(user.role).includes(moduleName as OpsRole)
      : false;

  useEffect(() => {
    if (user && !allowed) {
      router.replace('/dashboard');
    }
  }, [allowed, router, user]);

  if (!OPS_MODULES.has(moduleName)) {
    return <p className="text-sm text-muted">Unknown module.</p>;
  }

  return (
    <AuthGuard allow={[moduleName as OpsRole]}>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold capitalize">{moduleName} module</h2>
        <p className="mt-2 text-sm text-muted">
          Placeholder for the {moduleName} queue and actions. Wired to `/ops/{moduleName}` APIs in
          a later phase.
        </p>
      </section>
    </AuthGuard>
  );
}
