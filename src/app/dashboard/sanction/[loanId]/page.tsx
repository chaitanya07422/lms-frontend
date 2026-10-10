'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { formatPaise } from '@/lib/money';
import {
  approveLoan,
  downloadSalarySlip,
  getSanctionLoan,
  rejectLoan,
} from '@/lib/ops-api';
import { ApiError } from '@/types/api';
import type { LoanDto, SalarySlipDto } from '@/types/loan';
import type { PublicUser } from '@/types/user';

export default function SanctionDetailPage() {
  const params = useParams<{ loanId: string }>();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanDto | null>(null);
  const [borrower, setBorrower] = useState<PublicUser | null>(null);
  const [slip, setSlip] = useState<SalarySlipDto | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getSanctionLoan(params.loanId)
      .then((data) => {
        setLoan(data.loan);
        setBorrower(data.borrower);
        setSlip(data.salarySlip);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Loan not found');
      });
  }, [params.loanId]);

  async function onApprove() {
    setBusy(true);
    setError(null);
    try {
      await approveLoan(params.loanId);
      router.replace('/dashboard/sanction');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Approve failed');
    } finally {
      setBusy(false);
    }
  }

  async function onReject(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await rejectLoan(params.loanId, reason.trim());
      router.replace('/dashboard/sanction');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reject failed');
    } finally {
      setBusy(false);
    }
  }

  if (error && !loan) {
    return (
      <section>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/dashboard/sanction" className="mt-4 inline-block text-sm text-accent underline">
          Back
        </Link>
      </section>
    );
  }

  if (!loan || !borrower) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <section className="space-y-4">
      <Link href="/dashboard/sanction" className="text-sm font-medium text-accent hover:underline">
        ← Sanction queue
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">{borrower.fullName}</h2>
            <p className="text-sm text-muted">{borrower.email}</p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Principal</dt>
            <dd className="font-medium">{formatPaise(loan.principalPaise)}</dd>
          </div>
          <div>
            <dt className="text-muted">Tenure</dt>
            <dd className="font-medium">{loan.tenureDays} days</dd>
          </div>
          <div>
            <dt className="text-muted">Interest</dt>
            <dd className="font-medium">{formatPaise(loan.interestPaise)}</dd>
          </div>
          <div>
            <dt className="text-muted">Total repayment</dt>
            <dd className="font-medium">{formatPaise(loan.totalRepaymentPaise)}</dd>
          </div>
          <div>
            <dt className="text-muted">PAN</dt>
            <dd className="font-medium">{borrower.pan ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Salary</dt>
            <dd className="font-medium">
              {borrower.monthlySalaryPaise != null
                ? formatPaise(borrower.monthlySalaryPaise)
                : '—'}
            </dd>
          </div>
        </dl>

        {slip ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">Salary slip: {slip.originalName}</span>
            <button
              type="button"
              className="font-medium text-accent hover:underline"
              onClick={() => {
                void downloadSalarySlip(slip.id, slip.originalName).catch((err: unknown) => {
                  setError(err instanceof ApiError ? err.message : 'Download failed');
                });
              }}
            >
              Download
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onApprove()}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          Approve → SANCTIONED
        </button>
      </div>

      <form
        onSubmit={onReject}
        className="rounded-2xl border border-border bg-card p-6 space-y-3"
      >
        <h3 className="font-semibold text-ink">Reject</h3>
        <label className="block text-sm">
          <span className="mb-1 block">Reason (min 5 characters)</span>
          <textarea
            required
            minLength={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Reject → REJECTED
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
