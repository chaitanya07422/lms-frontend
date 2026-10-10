'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/config';
import { initials } from '@/lib/loan-ref';

/** Borrower / guest header — white bar, teal brand. */
export function BorrowerHeader({
  userName,
  guest,
}: {
  userName?: string;
  guest?: boolean;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <header className="border-b border-border bg-card">
      <div className="flex w-full items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-teal">
          {APP_NAME}
        </Link>
        {!guest && userName ? (
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-muted">{userName}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              {initials(userName)}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-background"
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/** Ops desk header — solid colored bar per role (PDF). */
export function DeskHeader({
  deskLabel,
  roleLabel,
  tabs,
  onLogout,
}: {
  deskLabel: string;
  roleLabel: string;
  tabs?: ReactNode;
  onLogout: () => void;
}) {
  return (
    <header className="bg-desk text-desk-fg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="text-base font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <span className="h-4 w-px bg-white/40" />
          <span className="truncate text-sm font-medium text-white/90">{deskLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/90">{roleLabel}</span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-white/70 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </div>
      {tabs ? (
        <div className="mx-auto max-w-6xl px-4 pb-0">
          <div className="flex flex-wrap gap-5 border-t border-white/15 pt-2">{tabs}</div>
        </div>
      ) : null}
    </header>
  );
}
