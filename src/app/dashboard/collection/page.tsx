'use client';

import { useEffect, useState } from 'react';

import { QueueLoanCard } from '@/components/ops/queue-loan-card';
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
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Collection</h2>
        <p className="mt-1 text-sm text-muted">
          DISBURSED loans — record UTR payments; loan auto-closes when paid in full.
        </p>
      </div>

      {loading ? <p className="text-sm text-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="text-sm text-muted">No active loans in collection.</p>
      ) : null}

      <ul className="space-y-2">
        {items.map((loan) => (
          <li key={loan.id}>
            <QueueLoanCard
              loan={loan}
              href={`/dashboard/collection/${loan.id}`}
              extra={`outstanding ${formatPaise(loan.outstandingPaise)}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
