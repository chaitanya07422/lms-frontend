'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { formatPaise, rupeesToPaise } from '@/lib/money';
import {
  getCollectionLoan,
  recordPayment,
  type PaymentDto,
} from '@/lib/ops-api';
import { ApiError } from '@/types/api';
import type { LoanDto } from '@/types/loan';

export default function CollectionDetailPage() {
  const params = useParams<{ loanId: string }>();
  const [loan, setLoan] = useState<LoanDto | null>(null);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [utr, setUtr] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const data = await getCollectionLoan(params.loanId);
    setLoan(data.loan);
    setPayments(data.payments);
  }, [params.loanId]);

  useEffect(() => {
    void reload().catch((err: unknown) => {
      setError(err instanceof ApiError ? err.message : 'Loan not found');
    });
  }, [reload]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const amountPaise = rupeesToPaise(Number(amountRupees));
      const result = await recordPayment(params.loanId, {
        utr: utr.trim(),
        amountPaise,
        paidAt,
      });
      setLoan(result.loan);
      setPayments((prev) => [result.payment, ...prev]);
      setUtr('');
      setAmountRupees('');
      setSuccess(
        result.loan.status === 'CLOSED'
          ? 'Payment recorded. Loan auto-closed.'
          : 'Payment recorded.',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed');
    } finally {
      setBusy(false);
    }
  }

  if (error && !loan) {
    return (
      <section>
        <p className="text-sm text-red-600">{error}</p>
        <Link
          href="/dashboard/collection"
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

  const canPay = loan.status === 'DISBURSED' && loan.outstandingPaise > 0;

  return (
    <section className="space-y-4">
      <Link href="/dashboard/collection" className="text-sm font-medium text-accent hover:underline">
        ← Collection queue
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">{formatPaise(loan.principalPaise)}</h2>
          <StatusBadge status={loan.status} />
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Total repayment</dt>
            <dd className="font-medium">{formatPaise(loan.totalRepaymentPaise)}</dd>
          </div>
          <div>
            <dt className="text-muted">Paid</dt>
            <dd className="font-medium">{formatPaise(loan.totalPaidPaise)}</dd>
          </div>
          <div>
            <dt className="text-muted">Outstanding</dt>
            <dd className="font-medium">{formatPaise(loan.outstandingPaise)}</dd>
          </div>
        </dl>
      </div>

      {canPay ? (
        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-3">
          {/* UTR must be unique system-wide; full repay auto-closes on the API. */}
          <h3 className="font-semibold text-ink">Record payment</h3>
          <label className="block text-sm">
            <span className="mb-1 block">UTR (unique)</span>
            <input
              required
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Amount (₹)</span>
            <input
              type="number"
              required
              min={1}
              step={1}
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Payment date</span>
            <input
              type="date"
              required
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save payment'}
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-ink">Payment history</h3>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No payments yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg bg-accent-soft/60 px-3 py-2"
              >
                <span>
                  {formatPaise(p.amountPaise)} · UTR {p.utr}
                </span>
                <span className="text-muted">{p.paidAt.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
