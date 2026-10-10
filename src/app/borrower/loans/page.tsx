'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { Panel, PageTitle } from '@/components/ui/panel';
import { listMyLoans } from '@/lib/borrower-api';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise } from '@/lib/money';
import { ApiError } from '@/types/api';
import type { LoanDto } from '@/types/loan';

export default function MyLoansPage() {
  const [loans, setLoans] = useState<LoanDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listMyLoans()
      .then(setLoans)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load loans');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (error) {
    return (
      <Panel>
        <p className="text-sm text-danger">{error}</p>
      </Panel>
    );
  }

  if (loans.length === 0) {
    return (
      <Panel className="shadow-sm">
        <PageTitle
          title="Your loans"
          subtitle="No applications yet. Finish the steps to apply."
        />
        <Link
          href="/borrower"
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
                <p className="mt-0.5 text-sm text-muted">
                  {loanRef(loan.id)} · applied{' '}
                  {new Date(loan.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={loan.status} />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
