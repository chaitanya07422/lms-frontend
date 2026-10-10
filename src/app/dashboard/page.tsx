'use client';

import Link from 'next/link';

import { useAuth } from '@/context/auth-context';
import { modulesForRole } from '@/lib/roles';

const BLURBS: Record<string, string> = {
  sales: 'Leads — registered borrowers without an active application',
  sanction: 'APPLIED loans — approve or reject',
  disbursement: 'SANCTIONED loans — mark disbursed',
  collection: 'DISBURSED loans — record UTR payments',
};

export default function DashboardHomePage() {
  const { user } = useAuth();
  const modules = user ? modulesForRole(user.role) : [];

  return (
    <section>
      <h2 className="text-2xl font-semibold text-ink">Hello, {user?.fullName}</h2>
      <p className="mt-2 text-sm text-muted">
        You only see modules for your role. Admin sees all four plus user creation.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {modules.map((mod) => (
          <li key={mod}>
            <Link
              href={`/dashboard/${mod}`}
              className="block rounded-xl border border-border bg-card px-4 py-4 hover:border-accent"
            >
              <p className="text-sm font-medium capitalize text-ink">{mod}</p>
              <p className="mt-1 text-sm text-muted">{BLURBS[mod]}</p>
            </Link>
          </li>
        ))}
        {user?.role === 'admin' ? (
          <li>
            <Link
              href="/dashboard/admin/users"
              className="block rounded-xl border border-border bg-card px-4 py-4 hover:border-accent"
            >
              <p className="text-sm font-medium text-ink">Create user</p>
              <p className="mt-1 text-sm text-muted">Provision any role with an email + password</p>
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
