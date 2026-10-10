'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LoanLifecycle } from '@/components/borrower/lifecycle';
import { StatusBadge } from '@/components/ops/status-badge';
import { Panel } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import { getLatestSalarySlip, listMyLoans } from '@/lib/borrower-api';
import { toDateInputValue } from '@/lib/bre-errors';
import {
  borrowerStatusHeadline,
  formatLoanDate,
  loanDueDate,
} from '@/lib/loan-due';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise, repaymentProgressPct } from '@/lib/money';
import type { LoanDto, SalarySlipDto } from '@/types/loan';

/**
 * Incomplete: continue-application CTA (wizard).
 * Complete: account dashboard — amount due, progress, personal details.
 */
export default function BorrowerHomePage() {
  const { user } = useAuth();
  const [slip, setSlip] = useState<SalarySlipDto | null>(null);
  const [loans, setLoans] = useState<LoanDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      getLatestSalarySlip().catch(() => null),
      listMyLoans().catch(() => [] as LoanDto[]),
    ])
      .then(([nextSlip, nextLoans]) => {
        setSlip(nextSlip);
        setLoans(nextLoans);
      })
      .finally(() => setLoading(false));
  }, []);

  const applicationComplete = Boolean(
    user?.profileComplete && slip && loans.length > 0,
  );

  const nextHref = !user?.profileComplete
    ? '/borrower/profile'
    : !slip
      ? '/borrower/salary-slip'
      : '/borrower/apply';

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!applicationComplete) {
    return (
      <Panel className="shadow-sm">
        <h2 className="text-2xl font-bold text-ink">
          Welcome, {user?.fullName ?? 'borrower'}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Complete each step in the rail to submit your loan application.
        </p>
        <Link
          href={nextHref}
          className="mt-5 inline-flex rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-hover"
        >
          Continue application
        </Link>
      </Panel>
    );
  }

  const primary = loans[0]!;
  const due = loanDueDate(primary);
  const paidPct = repaymentProgressPct(
    primary.totalPaidPaise,
    primary.totalRepaymentPaise,
    primary.outstandingPaise,
    0,
  );
  const showRepayment =
    primary.status === 'DISBURSED' || primary.status === 'CLOSED';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-teal">
          Hi, {user?.fullName?.split(' ')[0] ?? 'there'}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-ink">
          {borrowerStatusHeadline(primary.status)}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {loanRef(primary.id)} · track repayment and keep your profile up to date.
        </p>
      </div>

      <Panel className="overflow-hidden shadow-sm !p-0">
        <div className="bg-gradient-to-br from-teal to-accent-deep px-5 py-6 text-white sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {showRepayment ? 'Amount outstanding' : 'Loan amount'}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatPaise(
                  showRepayment ? primary.outstandingPaise : primary.principalPaise,
                  true,
                )}
              </p>
            </div>
            <StatusBadge status={primary.status} />
          </div>
          {showRepayment ? (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/80">
                <span>Paid {formatPaise(primary.totalPaidPaise, true)}</span>
                <span>{paidPct}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              {due && primary.status === 'DISBURSED' ? (
                <p className="mt-3 text-sm text-white/90">
                  Due by <span className="font-semibold">{formatLoanDate(due)}</span>
                  {' · '}
                  {primary.tenureDays} days from disbursement
                </p>
              ) : null}
              {primary.status === 'CLOSED' && primary.closedAt ? (
                <p className="mt-3 text-sm text-white/90">
                  Closed on {formatLoanDate(primary.closedAt)}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/85">
              {primary.status === 'APPLIED'
                ? 'Our team is reviewing your application.'
                : primary.status === 'SANCTIONED'
                  ? 'Approved. Funds will be marked disbursed by our desk next.'
                  : primary.status === 'REJECTED'
                    ? 'See loan details for the reason.'
                    : null}
            </p>
          )}
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Principal" value={formatPaise(primary.principalPaise)} />
            <Row label="Tenure" value={`${primary.tenureDays} days`} />
            <Row
              label="Interest"
              value={`${primary.interestRateAnnual}% p.a. · ${formatPaise(primary.interestPaise, true)}`}
            />
            <Row
              label="Total repayment"
              value={formatPaise(primary.totalRepaymentPaise, true)}
              strong
            />
            {primary.disbursedAt ? (
              <Row label="Disbursed" value={formatLoanDate(primary.disbursedAt)} />
            ) : (
              <Row label="Applied" value={formatLoanDate(primary.appliedAt)} />
            )}
            {due ? <Row label="Due date" value={formatLoanDate(due)} /> : null}
          </dl>

          {primary.status === 'DISBURSED' ? (
            <p className="rounded-lg bg-teal-soft px-3 py-2.5 text-sm text-teal">
              Repayments are recorded by our collection desk against your UTR. Outstanding
              updates here once a payment is posted.
            </p>
          ) : null}

          <LoanLifecycle status={primary.status} />

          <Link
            href={`/borrower/loans/${primary.id}`}
            className="inline-flex text-sm font-semibold text-teal hover:underline"
          >
            View full loan details →
          </Link>

          {loans.length > 1 ? (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Other loans
              </p>
              <ul className="mt-2 space-y-2">
                {loans.slice(1).map((loan) => (
                  <li key={loan.id}>
                    <Link
                      href={`/borrower/loans/${loan.id}`}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:border-teal"
                    >
                      <span>
                        {formatPaise(loan.principalPaise)} · {loanRef(loan.id)}
                      </span>
                      <StatusBadge status={loan.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel className="shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Personal details
            </p>
            <p className="mt-1 text-lg font-bold text-ink">{user?.fullName}</p>
          </div>
          <Link
            href="/borrower/profile?edit=1"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-background"
          >
            Edit
          </Link>
        </div>

        <dl className="mt-5 space-y-2.5 text-sm">
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="PAN" value={user?.pan ?? '—'} />
          <Row
            label="Date of birth"
            value={
              user?.dateOfBirth
                ? new Date(toDateInputValue(user.dateOfBirth)).toLocaleDateString(
                    'en-GB',
                    { day: '2-digit', month: 'short', year: 'numeric' },
                  )
                : '—'
            }
          />
          <Row
            label="Monthly salary"
            value={
              user?.monthlySalaryPaise != null
                ? formatPaise(user.monthlySalaryPaise)
                : '—'
            }
          />
          <Row
            label="Employment"
            value={
              user?.employmentMode === 'Self-Employed'
                ? 'Self-employed'
                : (user?.employmentMode ?? '—')
            }
          />
          <Row label="Salary slip" value={slip?.originalName ?? '—'} />
        </dl>
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
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${strong ? 'font-bold text-ink' : 'font-medium text-ink'}`}>
        {value}
      </dd>
    </div>
  );
}
