'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { formatPaise } from '@/lib/money';
import { disburseLoan, getDisbursementLoan } from '@/lib/ops-api';
import { ApiError } from '@/types/api';
import type { LoanDto } from '@/types/loan';

export default function DisbursementDetailPage() {
  const params = useParams<{ loanId: string }>();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getDisbursementLoan(params.loanId)
      .then(setLoan)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Loan not found');
      });
  }, [params.loanId]);

  async function onDisburse() {
    setBusy(true);
    setError(null);
    try {
      await disburseLoan(params.loanId);
      router.replace('/dashboard/disbursement');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Disburse failed');
    } finally {
      setBusy(false);
    }
  }

  if (error && !loan) {
    return (
      <section>
        <p className="text-sm text-red-600">{error}</p>
        <Link
          href="/dashboard/disbursement"
          className="mt-4 inline-block text-sm text-accent underline"
        >
          Back
        </Link>
      </section>
    );
  }

  if (!loan) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <section className="space-y-4">
      <Link
        href="/dashboard/disbursement"
        className="text-sm font-medium text-accent hover:underline"
      >
        ← Disbursement queue
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">{formatPaise(loan.principalPaise)}</h2>
          <StatusBadge status={loan.status} />
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Tenure</dt>
            <dd className="font-medium">{loan.tenureDays} days</dd>
          </div>
          <div>
            <dt className="text-muted">Total repayment</dt>
            <dd className="font-medium">{formatPaise(loan.totalRepaymentPaise)}</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => void onDisburse()}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? 'Processing…' : 'Mark disbursed → DISBURSED'}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
