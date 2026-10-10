'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { LoanLifecycle } from '@/components/borrower/lifecycle';
import { StatusBadge } from '@/components/ops/status-badge';
import { Panel } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import { getMyLoan } from '@/lib/borrower-api';
import { loanRef } from '@/lib/loan-ref';
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
  const { user } = useAuth();
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
      <Panel>
        <p className="text-sm text-danger">{error}</p>
        <Link href="/borrower/loans" className="mt-4 inline-block text-sm text-accent underline">
          Back to loans
        </Link>
      </Panel>
    );
  }

  if (!loan) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <Panel>
        <p className="text-sm font-medium text-success">
          Your loan application has been submitted.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Reference number
            </p>
            <p className="text-lg font-semibold text-ink">{loanRef(loan.id)}</p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Applicant</dt>
            <dd className="font-medium">
              {user?.fullName}
              {user?.pan ? ` · ${user.pan}` : ''}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Principal</dt>
            <dd className="font-medium">{formatPaise(loan.principalPaise)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Interest rate</dt>
            <dd className="font-medium">{loan.interestRateAnnual}% p.a., simple interest</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Tenure</dt>
            <dd className="font-medium">{loan.tenureDays} days</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Interest</dt>
            <dd className="font-medium">{formatPaise(loan.interestPaise, true)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2">
            <dt className="font-semibold text-ink">Total repayment</dt>
            <dd className="font-bold text-accent-deep">
              {formatPaise(loan.totalRepaymentPaise, true)}
            </dd>
          </div>
        </dl>

        {loan.rejectionReason ? (
          <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
            Rejected: {loan.rejectionReason}
          </p>
        ) : null}

        <div className="mt-8">
          <LoanLifecycle status={loan.status} />
        </div>
      </Panel>

      {payments.length > 0 ? (
        <Panel>
          <h3 className="font-semibold text-ink">Payments</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg bg-accent-soft/60 px-3 py-2"
              >
                <span>
                  {formatPaise(p.amountPaise)} · UTR {p.utr}
                </span>
                <span className="text-muted">{new Date(p.paidAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
