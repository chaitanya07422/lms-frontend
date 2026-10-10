'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { PageTitle, Panel } from '@/components/ui/panel';
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
        subtitle="Record borrower payments. Unique UTR required; loan auto-closes at zero balance."
      />
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      <Panel className="overflow-x-auto p-0">
        {loading ? <p className="p-6 text-sm text-muted">Loading…</p> : null}
        {!loading ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Principal</th>
                <th className="px-4 py-3 font-semibold">Outstanding</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-muted">
                    No active collection loans.
                  </td>
                </tr>
              ) : (
                items.map((loan) => (
                  <tr key={loan.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/collection/${loan.id}`}
                        className="font-medium text-ink hover:text-accent"
                      >
                        {loan.borrowerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatPaise(loan.principalPaise)}</td>
                    <td className="px-4 py-3">{formatPaise(loan.outstandingPaise)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={loan.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}
