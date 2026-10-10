'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { Panel, PageTitle } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import { getLatestSalarySlip, listMyLoans } from '@/lib/borrower-api';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise } from '@/lib/money';
import type { LoanDto, SalarySlipDto } from '@/types/loan';

export default function BorrowerHomePage() {
  const { user } = useAuth();
  const [slip, setSlip] = useState<SalarySlipDto | null>(null);
  const [loans, setLoans] = useState<LoanDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      getLatestSalarySlip().catch(() => null),
      listMyLoans().catch(() => [] as LoanDto[]),
    ])
      .then(([nextSlip, nextLoans]) => {
        setSlip(nextSlip);
        setLoans(nextLoans);
      })
      .finally(() => setLoading(false));
  }, []);

  const applicationComplete = Boolean(
    user?.profileComplete && slip && loans.length > 0,
  );

  const nextHref = !user?.profileComplete
    ? '/borrower/profile'
    : !slip
      ? '/borrower/salary-slip'
      : '/borrower/apply';

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!applicationComplete) {
    return (
      <Panel className="shadow-sm">
        <PageTitle
          title={`Welcome, ${user?.fullName ?? 'borrower'}`}
          subtitle="Complete each step in the rail to submit your loan application."
        />
        <Link
          href={nextHref}
          className="inline-flex rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-hover"
        >
          Continue application
        </Link>
      </Panel>
    );
  }

  return (
    <Panel className="shadow-sm">
      <PageTitle title="Your loans" subtitle="Open a loan to see status, summary, and lifecycle." />
      <ul className="space-y-3">
        {loans.map((loan) => (
          <li key={loan.id}>
            <Link
              href={`/borrower/loans/${loan.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 hover:border-teal"
            >
              <div>
                <p className="font-semibold text-ink">
                  {formatPaise(loan.principalPaise)} · {loan.tenureDays} days
                </p>
                <p className="mt-0.5 text-sm text-muted">{loanRef(loan.id)}</p>
              </div>
              <StatusBadge status={loan.status} />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
