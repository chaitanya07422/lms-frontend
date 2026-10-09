import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth-guard';
import { BorrowerStepNav } from '@/components/borrower/step-nav';
import { LogoutButton } from '@/components/logout-button';
import { APP_NAME } from '@/lib/config';

export default function BorrowerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allow="borrower">
      <div className="min-h-screen">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {APP_NAME}
              </p>
              <h1 className="text-lg font-semibold text-ink">Borrower portal</h1>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">
          <BorrowerStepNav />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
