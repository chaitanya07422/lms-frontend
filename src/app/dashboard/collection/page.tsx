'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { PageTitle, Panel } from '@/components/ui/panel';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise } from '@/lib/money';
import { listCollectionQueue, type QueueLoan } from '@/lib/ops-api';
import { ApiError } from '@/types/api';

export default function CollectionQueuePage() {
  const [items, setItems] = useState<QueueLoan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listCollectionQueue()
      .then(setItems)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load queue');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle
        title="Active loans"
        subtitle="Record borrower payments. Unique UTR required; loan auto-closes at zero balance. Click a loan number to open full details."
      />
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      <Panel className="overflow-x-auto p-0">
        {loading ? <p className="p-6 text-sm text-muted">Loading…</p> : null}
        {!loading ? (
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Loan ref</th>
                <th className="px-4 py-3 font-semibold">Loan ID</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Principal</th>
                <th className="px-4 py-3 font-semibold">Outstanding</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-muted">
                    No active collection loans.
                  </td>
                </tr>
              ) : (
                items.map((loan) => {
                  const href = `/dashboard/collection/${loan.id}`;
                  return (
                    <tr
                      key={loan.id}
                      className="border-b border-border last:border-0 hover:bg-accent-soft/40"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={href}
                          className="font-semibold text-accent hover:underline"
                        >
                          {loanRef(loan.id)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={href}
                          className="font-mono text-xs text-ink hover:text-accent hover:underline"
                          title={loan.id}
                        >
                          {loan.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={href} className="font-medium text-ink hover:text-accent">
                          {loan.borrowerName}
                        </Link>
                        {loan.borrowerEmail ? (
                          <p className="text-xs text-muted">{loan.borrowerEmail}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{formatPaise(loan.principalPaise)}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatPaise(loan.outstandingPaise)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={loan.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}
