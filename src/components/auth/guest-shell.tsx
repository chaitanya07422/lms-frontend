import type { ReactNode } from 'react';

import { BorrowerHeader } from '@/components/shell/app-header';

/** Login / register chrome — no application stepper until after login. */
export function GuestShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <BorrowerHeader guest />
      <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}
