'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getMyLoan } from '@/lib/borrower-api';
import { formatPaise } from '@/lib/money';
import { ApiError } from '@/types/api';
import type { LoanDto } from '@/types/loan';

type PaymentRow = {
  id: string;
  utr: string;
  amountPaise: number;
  paidAt: string;
};

export default function LoanDetailPage() {
  const params = useParams<{ loanId: string }>();
  const [loan, setLoan] = useState<LoanDto | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getMyLoan(params.loanId)
      .then((data) => {
        setLoan(data.loan);
        setPayments(data.payments);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load loan');
      });
  }, [params.loanId]);

  if (error) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/borrower/loans" className="mt-4 inline-block text-sm text-accent underline">
          Back to loans
        </Link>
      </section>
    );
  }

  if (!loan) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <section className="space-y-4">
      <Link href="/borrower/loans" className="text-sm font-medium text-accent hover:underline">
        ← My loans
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">{formatPaise(loan.principalPaise)}</h2>
            <p className="text-sm text-muted">{loan.tenureDays} days · {loan.interestRateAnnual}% p.a.</p>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-deep">
            {loan.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Interest</dt>
            <dd className="font-medium">{formatPaise(loan.interestPaise)}</dd>
          </div>
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

        {loan.rejectionReason ? (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            Rejected: {loan.rejectionReason}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-ink">Payments</h3>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No payments recorded yet.</p>
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
                <span className="text-muted">{new Date(p.paidAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
