'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LoanLifecycle } from '@/components/borrower/lifecycle';
import { StatusBadge } from '@/components/ops/status-badge';
import { Panel, PageTitle } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import { getLatestSalarySlip, listMyLoans } from '@/lib/borrower-api';
import { toDateInputValue } from '@/lib/bre-errors';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise } from '@/lib/money';
import type { LoanDto, SalarySlipDto } from '@/types/loan';

/**
 * Incomplete: continue-application CTA (wizard).
 * Complete: account dashboard — loan status + read-only personal details
 * (pattern used by borrower portals / application trackers after submit).
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
        <PageTitle
          title={`Welcome, ${user?.fullName ?? 'borrower'}`}
          subtitle="Complete each step in the rail to submit your loan application."
        />
        <Link
          href={nextHref}
          className="inline-flex rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-hover"
        >
          Continue application
        </Link>
      </Panel>
    );
  }

  const primary = loans[0]!;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-ink">Your account</h2>
        <p className="mt-1 text-sm text-muted">
          Track your loan and review the personal details on file.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Loan details
              </p>
              <p className="mt-1 text-lg font-bold text-ink">{loanRef(primary.id)}</p>
            </div>
            <StatusBadge status={primary.status} />
          </div>

          <dl className="mt-5 space-y-2.5 text-sm">
            <Row label="Principal" value={formatPaise(primary.principalPaise)} />
            <Row label="Tenure" value={`${primary.tenureDays} days`} />
            <Row
              label="Interest rate"
              value={`${primary.interestRateAnnual}% p.a., simple interest`}
            />
            <Row label="Interest" value={formatPaise(primary.interestPaise, true)} />
            <Row
              label="Total repayment"
              value={formatPaise(primary.totalRepaymentPaise, true)}
              strong
            />
            {primary.status === 'DISBURSED' || primary.status === 'CLOSED' ? (
              <>
                <Row label="Paid so far" value={formatPaise(primary.totalPaidPaise, true)} />
                <Row
                  label="Outstanding"
                  value={formatPaise(primary.outstandingPaise, true)}
                />
              </>
            ) : null}
          </dl>

          <div className="mt-6">
            <LoanLifecycle status={primary.status} />
          </div>

          <Link
            href={`/borrower/loans/${primary.id}`}
            className="mt-6 inline-flex text-sm font-semibold text-teal hover:underline"
          >
            View full loan details →
          </Link>

          {loans.length > 1 ? (
            <div className="mt-6 border-t border-border pt-4">
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
              href="/borrower/profile"
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
            <Row
              label="Salary slip"
              value={slip?.originalName ?? '—'}
            />
          </dl>

        </Panel>
      </div>
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
