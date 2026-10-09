'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth-guard';
import { LogoutButton } from '@/components/logout-button';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/config';
import { modulesForRole } from '@/lib/roles';

const LABELS: Record<string, string> = {
  sales: 'Sales',
  sanction: 'Sanction',
  disbursement: 'Disbursement',
  collection: 'Collection',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const modules = user ? modulesForRole(user.role) : [];

  return (
    <AuthGuard allow="ops">
      <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
        <aside className="border-b border-border bg-card md:border-b-0 md:border-r">
          <div className="px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{APP_NAME}</p>
            <h1 className="text-lg font-semibold">Operations</h1>
            <p className="mt-1 text-xs text-muted">{user?.role}</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
            <Link
              href="/dashboard"
              className={`rounded-md px-3 py-2 text-sm ${
                pathname === '/dashboard'
                  ? 'bg-accent-soft text-accent'
                  : 'text-foreground hover:bg-accent-soft/60'
              }`}
            >
              Overview
            </Link>
            {modules.map((mod) => {
              const href = `/dashboard/${mod}`;
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={mod}
                  href={href}
                  className={`rounded-md px-3 py-2 text-sm ${
                    active
                      ? 'bg-accent-soft text-accent'
                      : 'text-foreground hover:bg-accent-soft/60'
                  }`}
                >
                  {LABELS[mod] ?? mod}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border px-4 py-4">
            <LogoutButton />
          </div>
        </aside>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
