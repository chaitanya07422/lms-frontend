'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { WizardShell } from '@/components/borrower/step-rail';
import { BorrowerHeader } from '@/components/shell/app-header';
import { borrowerWizardSteps } from '@/lib/borrower-steps';

export function GuestShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const steps = borrowerWizardSteps({
    authenticated: false,
    profileComplete: false,
    hasSlip: false,
    hasApplied: false,
    pathname,
  });

  return (
    <div className="min-h-screen bg-background">
      <BorrowerHeader guest />
      <WizardShell steps={steps}>{children}</WizardShell>
    </div>
  );
}
