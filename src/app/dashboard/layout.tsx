'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth-guard';
import { DeskHeader } from '@/components/shell/app-header';
import { useAuth } from '@/context/auth-context';
import { modulesForRole } from '@/lib/roles';

const DESK: Record<string, string> = {
  admin: 'Admin Console',
  sales: 'Sales Desk',
  sanction: 'Sanction Desk',
  disbursement: 'Disbursement Desk',
  collection: 'Collection Desk',
};

const LABELS: Record<string, string> = {
  sales: 'Sales',
  sanction: 'Sanction',
  disbursement: 'Disbursement',
  collection: 'Collection',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const modules = user ? modulesForRole(user.role) : [];
  const deskKey = user?.role === 'admin' ? 'admin' : user?.role ?? 'admin';
  const deskLabel = user ? DESK[user.role] ?? 'Operations' : 'Operations';
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  const tabs =
    user?.role === 'admin' ? (
      <>
        <AdminTab href="/dashboard" label="Overview" active={pathname === '/dashboard'} />
        {modules.map((mod) => (
          <AdminTab
            key={mod}
            href={`/dashboard/${mod}`}
            label={LABELS[mod] ?? mod}
            active={pathname.startsWith(`/dashboard/${mod}`)}
          />
        ))}
        <AdminTab
          href="/dashboard/admin/users"
          label="Users"
          active={pathname.startsWith('/dashboard/admin')}
        />
      </>
    ) : null;

  return (
    <AuthGuard allow="ops">
      <div className="min-h-screen bg-background" data-desk={deskKey}>
        <DeskHeader
          deskLabel={deskLabel}
          roleLabel={roleLabel}
          tabs={tabs}
          onLogout={() => {
            logout();
            router.replace('/login');
          }}
        />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}

function AdminTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`pb-2 text-sm font-medium ${
        active
          ? 'border-b-2 border-white text-white'
          : 'border-b-2 border-transparent text-white/70 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
