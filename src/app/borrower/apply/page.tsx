'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { BreResultPanel } from '@/components/borrower/bre-result';
import { PrimaryButton } from '@/components/ui/field';
import { Panel, PageTitle } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import {
  applyLoan,
  getLatestSalarySlip,
  previewLoan,
} from '@/lib/borrower-api';
import { breFromApiError } from '@/lib/bre-errors';
import {
  INTEREST_RATE_ANNUAL,
  MAX_PRINCIPAL_RUPEES,
  MAX_TENURE_DAYS,
  MIN_PRINCIPAL_RUPEES,
  MIN_TENURE_DAYS,
} from '@/lib/loan-limits';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise, rupeesToPaise } from '@/lib/money';
import { ApiError } from '@/types/api';
import type { BreResult, LoanDto, LoanQuote, SalarySlipDto } from '@/types/loan';

type Phase = 'form' | 'reviewing' | 'success';

export default function ApplyLoanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [principalRupees, setPrincipalRupees] = useState(250_000);
  const [tenureDays, setTenureDays] = useState(180);
  const [quote, setQuote] = useState<LoanQuote | null>(null);
  const [slip, setSlip] = useState<SalarySlipDto | null>(null);
  const [bre, setBre] = useState<BreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [submittedLoan, setSubmittedLoan] = useState<LoanDto | null>(null);

  useEffect(() => {
    void getLatestSalarySlip()
      .then(setSlip)
      .catch(() => setSlip(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void previewLoan(rupeesToPaise(principalRupees), tenureDays)
        .then((q) => {
          if (!cancelled) setQuote(q);
        })
        .catch(() => {
          if (!cancelled) setQuote(null);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [principalRupees, tenureDays]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBre(null);
    if (!user?.profileComplete || !slip) {
      setError('Complete profile and salary slip before applying.');
      return;
    }
    setBusy(true);
    setPhase('reviewing');
    try {
      const loan = await applyLoan(rupeesToPaise(principalRupees), tenureDays, slip.id);
      setSubmittedLoan(loan);
      // Keep the reviewing beat visible briefly even if the API is fast.
      await new Promise((r) => window.setTimeout(r, 1400));
      setPhase('success');
      await new Promise((r) => window.setTimeout(r, 1800));
      router.push(`/borrower/loans/${loan.id}`);
    } catch (err) {
      setPhase('form');
      setBre(breFromApiError(err));
      setError(err instanceof ApiError ? err.message : 'Application failed');
      setBusy(false);
    }
  }

  if (phase === 'reviewing' || phase === 'success') {
    return (
      <Panel className="mx-auto max-w-md shadow-sm">
        <div className="flex flex-col items-center px-2 py-10 text-center">
          {phase === 'reviewing' ? (
            <>
              <span
                className="h-12 w-12 animate-spin rounded-full border-[3px] border-teal-soft border-t-teal"
                aria-hidden
              />
              <h2 className="mt-6 text-xl font-bold text-ink">Reviewing your application</h2>
              <p className="mt-2 text-sm text-muted">
                Checking your details and preparing your loan for approval…
              </p>
            </>
          ) : (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-soft text-2xl font-bold text-teal">
                ✓
              </span>
              <h2 className="mt-6 text-xl font-bold text-ink">
                Congratulations{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
              </h2>
              <p className="mt-2 text-sm text-muted">
                Your loan application has been submitted
                {submittedLoan ? (
                  <>
                    {' '}
                    as{' '}
                    <span className="font-semibold text-ink">
                      {loanRef(submittedLoan.id)}
                    </span>
                  </>
                ) : null}
                . Taking you to your loan…
              </p>
            </>
          )}
        </div>
      </Panel>
    );
  }

  return (
    <div>
      <PageTitle
        title="Choose your loan"
        subtitle="Move the sliders and the summary updates as you go."
      />

      {!user?.profileComplete || !slip ? (
        <p className="mb-4 rounded-lg bg-warn-soft px-4 py-3 text-sm text-warn">
          {!user?.profileComplete ? (
            <>
              Finish{' '}
              <Link href="/borrower/profile" className="font-semibold underline">
                personal details
              </Link>{' '}
              first.
            </>
          ) : (
            <>
              <Link href="/borrower/salary-slip" className="font-semibold underline">
                Upload a salary slip
              </Link>{' '}
              before applying.
            </>
          )}
        </p>
      ) : null}

      <form className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={onSubmit}>
        <Panel className="shadow-sm">
          <label className="block">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-ink">Loan Amount</span>
              <span className="text-2xl font-bold text-teal">
                ₹{principalRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={MIN_PRINCIPAL_RUPEES}
              max={MAX_PRINCIPAL_RUPEES}
              step={5000}
              value={principalRupees}
              onChange={(e) => setPrincipalRupees(Number(e.target.value))}
              className="mt-4 w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>₹{MIN_PRINCIPAL_RUPEES.toLocaleString('en-IN')}</span>
              <span>₹{MAX_PRINCIPAL_RUPEES.toLocaleString('en-IN')}</span>
            </div>
          </label>

          <label className="mt-8 block">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-ink">Tenure</span>
              <span className="text-2xl font-bold text-teal">{tenureDays} days</span>
            </div>
            <input
              type="range"
              min={MIN_TENURE_DAYS}
              max={MAX_TENURE_DAYS}
              step={1}
              value={tenureDays}
              onChange={(e) => setTenureDays(Number(e.target.value))}
              className="mt-4 w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>{MIN_TENURE_DAYS} days</span>
              <span>{MAX_TENURE_DAYS} days</span>
            </div>
          </label>

          <div className="mt-8 rounded-lg bg-background px-4 py-3 text-sm text-muted">
            Fixed {INTEREST_RATE_ANNUAL}% p.a., simple interest.
          </div>
        </Panel>

        <Panel className="shadow-sm">
          <h3 className="text-base font-bold text-ink">Loan summary</h3>
          {quote ? (
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Principal" value={formatPaise(rupeesToPaise(principalRupees))} />
              <Row label="Interest rate" value={`${INTEREST_RATE_ANNUAL}% p.a.`} />
              <Row label="Tenure" value={`${tenureDays} days`} />
              <Row label="Interest" value={formatPaise(quote.interestPaise, true)} />
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted">Total repayment</p>
                <p className="mt-1 text-2xl font-bold text-ink">
                  {formatPaise(quote.totalRepaymentPaise, true)}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Interest = P × {INTEREST_RATE_ANNUAL} × days / (365 × 100)
                </p>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted">Loading quote…</p>
          )}

          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          {bre ? (
            <div className="mt-4">
              <BreResultPanel bre={bre} />
            </div>
          ) : null}

          <PrimaryButton
            type="submit"
            disabled={busy || !user?.profileComplete || !slip}
            className="mt-6 w-full bg-teal hover:bg-teal-hover"
          >
            {busy ? 'Submitting…' : 'Apply for loan'}
          </PrimaryButton>
        </Panel>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}
