'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { listMyLoans } from '@/lib/borrower-api';
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

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-ink">My loans</h2>
      <p className="mt-1 text-sm text-muted">Newest first. Open a loan for payment summary.</p>

      {loading ? <p className="mt-6 text-sm text-muted">Loading…</p> : null}
      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      {!loading && !error && loans.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No applications yet.{' '}
          <Link href="/borrower/apply" className="font-medium text-accent underline">
            Apply now
          </Link>
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {loans.map((loan) => (
          <li key={loan.id}>
            <Link
              href={`/borrower/loans/${loan.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 hover:border-accent"
            >
              <div>
                <p className="font-medium text-ink">{formatPaise(loan.principalPaise)}</p>
                <p className="text-sm text-muted">
                  {loan.tenureDays} days · applied {new Date(loan.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-deep">
                {loan.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
