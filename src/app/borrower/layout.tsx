'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { WizardShell } from '@/components/borrower/step-rail';
import { AuthGuard } from '@/components/auth-guard';
import { BorrowerHeader } from '@/components/shell/app-header';
import { useAuth } from '@/context/auth-context';
import { getLatestSalarySlip, listMyLoans } from '@/lib/borrower-api';
import { borrowerWizardSteps } from '@/lib/borrower-steps';

export default function BorrowerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [hasSlip, setHasSlip] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    void getLatestSalarySlip()
      .then((s) => setHasSlip(Boolean(s)))
      .catch(() => setHasSlip(false));
    void listMyLoans()
      .then((loans) =>
        setHasApplied(
          loans.some((l) =>
            ['APPLIED', 'SANCTIONED', 'DISBURSED', 'CLOSED', 'REJECTED'].includes(l.status),
          ),
        ),
      )
      .catch(() => setHasApplied(false));
  }, [pathname]);

  const steps = borrowerWizardSteps({
    authenticated: Boolean(user),
    profileComplete: Boolean(user?.profileComplete),
    hasSlip,
    hasApplied,
    pathname,
  });

  return (
    <AuthGuard allow="borrower">
      <div className="min-h-screen bg-background">
        <BorrowerHeader userName={user?.fullName} />
        <WizardShell steps={steps}>{children}</WizardShell>
      </div>
    </AuthGuard>
  );
}
