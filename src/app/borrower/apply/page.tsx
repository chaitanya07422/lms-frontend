'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { BreResultPanel } from '@/components/borrower/bre-result';
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
import { formatPaise, rupeesToPaise } from '@/lib/money';
import { ApiError } from '@/types/api';
import type { BreResult, LoanQuote, SalarySlipDto } from '@/types/loan';

export default function ApplyLoanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [principalRupees, setPrincipalRupees] = useState(MIN_PRINCIPAL_RUPEES);
  const [tenureDays, setTenureDays] = useState(90);
  const [quote, setQuote] = useState<LoanQuote | null>(null);
  const [slip, setSlip] = useState<SalarySlipDto | null>(null);
  const [bre, setBre] = useState<BreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    void getLatestSalarySlip()
      .then(setSlip)
      .catch(() => setSlip(null));
  }, []);

  // Debounce live quote so slider drags don't spam /loans/preview.
  useEffect(() => {
    let cancelled = false;
    setQuoting(true);
    const timer = window.setTimeout(() => {
      void previewLoan(rupeesToPaise(principalRupees), tenureDays)
        .then((q) => {
          if (!cancelled) {
            setQuote(q);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setQuote(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setQuoting(false);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [principalRupees, tenureDays]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBre(null);

    if (!user?.profileComplete) {
      setError('Complete your profile before applying.');
      return;
    }
    if (!slip) {
      setError('Upload a salary slip before applying.');
      return;
    }

    setBusy(true);
    try {
      const loan = await applyLoan(rupeesToPaise(principalRupees), tenureDays, slip.id);
      router.push(`/borrower/loans/${loan.id}`);
    } catch (err) {
      setBre(breFromApiError(err));
      setError(err instanceof ApiError ? err.message : 'Application failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-ink">Apply for a loan</h2>
      <p className="mt-1 text-sm text-muted">
        Live quote from the server at {INTEREST_RATE_ANNUAL}% p.a. simple interest.
      </p>

      {!user?.profileComplete ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Profile incomplete.{' '}
          <Link href="/borrower/profile" className="font-medium text-accent underline">
            Finish profile
          </Link>
        </p>
      ) : null}

      {!slip ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No salary slip yet.{' '}
          <Link href="/borrower/salary-slip" className="font-medium text-accent underline">
            Upload one
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Using slip: <span className="font-medium text-foreground">{slip.originalName}</span>
        </p>
      )}

      <form className="mt-6 space-y-6" onSubmit={onSubmit}>
        <label className="block text-sm">
          <div className="mb-2 flex justify-between">
            <span>Principal</span>
            <span className="font-medium text-ink">
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
            className="w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>₹{MIN_PRINCIPAL_RUPEES.toLocaleString('en-IN')}</span>
            <span>₹{MAX_PRINCIPAL_RUPEES.toLocaleString('en-IN')}</span>
          </div>
        </label>

        <label className="block text-sm">
          <div className="mb-2 flex justify-between">
            <span>Tenure</span>
            <span className="font-medium text-ink">{tenureDays} days</span>
          </div>
          <input
            type="range"
            min={MIN_TENURE_DAYS}
            max={MAX_TENURE_DAYS}
            step={1}
            value={tenureDays}
            onChange={(e) => setTenureDays(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>{MIN_TENURE_DAYS} days</span>
            <span>{MAX_TENURE_DAYS} days</span>
          </div>
        </label>

        <div className="rounded-xl bg-accent-soft px-4 py-4 text-sm">
          <p className="font-medium text-ink">Live quote {quoting ? '…' : ''}</p>
          {quote ? (
            <dl className="mt-2 grid gap-1 sm:grid-cols-3">
              <div>
                <dt className="text-muted">Interest</dt>
                <dd className="font-semibold">{formatPaise(quote.interestPaise)}</dd>
              </div>
              <div>
                <dt className="text-muted">Total repayment</dt>
                <dd className="font-semibold">{formatPaise(quote.totalRepaymentPaise)}</dd>
              </div>
              <div>
                <dt className="text-muted">Rate</dt>
                <dd className="font-semibold">{quote.interestRateAnnual}% p.a.</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-muted">Adjust sliders to load a quote.</p>
          )}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {bre ? <BreResultPanel bre={bre} /> : null}

        <button
          type="submit"
          disabled={busy || !user?.profileComplete || !slip}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
    </section>
  );
}
