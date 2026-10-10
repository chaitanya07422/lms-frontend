'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { LoanLifecycle } from '@/components/borrower/lifecycle';
import { StatusBadge } from '@/components/ops/status-badge';
import { Panel } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import { getMyLoan } from '@/lib/borrower-api';
import {
  borrowerStatusHeadline,
  formatLoanDate,
  loanDueDate,
} from '@/lib/loan-due';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise, repaymentProgressPct } from '@/lib/money';
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
        <Link href="/borrower" className="mt-4 inline-block text-sm font-semibold text-teal hover:underline">
          ← Back to account
        </Link>
      </Panel>
    );
  }

  if (!loan) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const due = loanDueDate(loan);
  const showRepayment = loan.status === 'DISBURSED' || loan.status === 'CLOSED';
  const paidPct = repaymentProgressPct(
    loan.totalPaidPaise,
    loan.totalRepaymentPaise,
    loan.outstandingPaise,
    0,
  );

  return (
    <div className="space-y-4">
      <Link
        href="/borrower"
        className="inline-flex text-sm font-semibold text-teal hover:underline"
      >
        ← Back to account
      </Link>

      <Panel className="overflow-hidden shadow-sm !p-0">
        <div className="bg-gradient-to-br from-teal to-accent-deep px-5 py-6 text-white sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {loanRef(loan.id)}
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{borrowerStatusHeadline(loan.status)}</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {formatPaise(
                  showRepayment ? loan.outstandingPaise : loan.principalPaise,
                  true,
                )}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {showRepayment ? 'Outstanding' : 'Principal'}
              </p>
            </div>
            <StatusBadge status={loan.status} />
          </div>
          {showRepayment ? (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/80">
                <span>Paid {formatPaise(loan.totalPaidPaise, true)}</span>
                <span>
                  of {formatPaise(loan.totalRepaymentPaise, true)} · {paidPct}%
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              {due ? (
                <p className="mt-3 text-sm text-white/90">
                  Due by <span className="font-semibold">{formatLoanDate(due)}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <dl className="space-y-2.5 text-sm">
            <Row
              label="Applicant"
              value={`${user?.fullName ?? '—'} · ${loanRef(loan.id)}`}
            />
            <Row label="Loan ID" value={loan.id} />
            {user?.pan ? <Row label="PAN" value={user.pan} /> : null}
            <Row label="Principal" value={formatPaise(loan.principalPaise)} />
            <Row
              label="Interest rate"
              value={`${loan.interestRateAnnual}% p.a., simple interest`}
            />
            <Row label="Tenure" value={`${loan.tenureDays} days`} />
            <Row label="Interest" value={formatPaise(loan.interestPaise, true)} />
            <Row
              label="Total repayment"
              value={formatPaise(loan.totalRepaymentPaise, true)}
              strong
            />
            <Row label="Applied" value={formatLoanDate(loan.appliedAt)} />
            {loan.sanctionedAt ? (
              <Row label="Approved" value={formatLoanDate(loan.sanctionedAt)} />
            ) : null}
            {loan.disbursedAt ? (
              <Row label="Disbursed" value={formatLoanDate(loan.disbursedAt)} />
            ) : null}
            {due ? <Row label="Due date" value={formatLoanDate(due)} /> : null}
            {loan.closedAt ? (
              <Row label="Closed" value={formatLoanDate(loan.closedAt)} />
            ) : null}
          </dl>

          {loan.rejectionReason ? (
            <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              Not approved: {loan.rejectionReason}
            </p>
          ) : null}

          {loan.status === 'DISBURSED' ? (
            <p className="rounded-lg bg-teal-soft px-3 py-2.5 text-sm text-teal">
              Make your bank transfer, then our collection desk posts the UTR. Your
              outstanding balance updates after each payment.
            </p>
          ) : null}

          <LoanLifecycle status={loan.status} />
        </div>
      </Panel>

      <Panel className="shadow-sm">
        <h3 className="font-semibold text-ink">Payment history</h3>
        {payments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No payments recorded yet.
            {loan.status === 'DISBURSED'
              ? ' They will appear here after the collection desk posts a UTR.'
              : ''}
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg bg-teal-soft/60 px-3 py-2.5"
              >
                <span className="font-medium text-ink">
                  {formatPaise(p.amountPaise)} · UTR {p.utr}
                </span>
                <span className="text-muted">{formatLoanDate(p.paidAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/70 pb-2 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`text-right ${strong ? 'font-bold text-accent-deep' : 'font-medium text-ink'}`}
      >
        {value}
      </dd>
    </div>
  );
}
