'use client';

import Link from 'next/link';

import { useAuth } from '@/context/auth-context';
import { modulesForRole } from '@/lib/roles';

export default function DashboardHomePage() {
  const { user } = useAuth();
  const modules = user ? modulesForRole(user.role) : [];

  return (
    <section>
      <h2 className="text-2xl font-semibold">Hello, {user?.fullName}</h2>
      <p className="mt-2 text-sm text-muted">
        Ops modules are scaffolded. Queue UIs and actions come in the next frontend phases.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {modules.map((mod) => (
          <li key={mod}>
            <Link
              href={`/dashboard/${mod}`}
              className="block rounded-xl border border-border bg-card px-4 py-4 text-sm font-medium hover:border-accent"
            >
              Open {mod}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
