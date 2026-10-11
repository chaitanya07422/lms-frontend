import type { ReactNode } from 'react';
import Link from 'next/link';

import { APP_NAME, APP_TAGLINE } from '@/lib/config';
import {
  INTEREST_RATE_ANNUAL,
  MAX_PRINCIPAL_RUPEES,
  MAX_TENURE_DAYS,
  MIN_MONTHLY_SALARY_RUPEES,
  MIN_PRINCIPAL_RUPEES,
  MIN_TENURE_DAYS,
} from '@/lib/loan-limits';
import { formatPaise, rupeesToPaise } from '@/lib/money';

const EXAMPLE_PRINCIPAL_RUPEES = 250_000;
const EXAMPLE_TENURE_DAYS = 180;

function exampleQuote() {
  const principalPaise = rupeesToPaise(EXAMPLE_PRINCIPAL_RUPEES);
  const interestPaise = Math.round(
    (principalPaise * INTEREST_RATE_ANNUAL * EXAMPLE_TENURE_DAYS) / (365 * 100),
  );
  return {
    interestPaise,
    totalPaise: principalPaise + interestPaise,
  };
}

/** Split auth layout — marketing panel + form (login / register). */
export function GuestShell({ children }: { children: ReactNode }) {
  const example = exampleQuote();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative flex flex-1 flex-col justify-between bg-navy px-6 py-8 text-white sm:px-10 lg:max-w-[52%] lg:px-12 lg:py-10">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            {APP_NAME}
          </Link>

          <h1 className="mt-10 max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:mt-14 lg:text-[2.75rem] lg:leading-[1.15]">
            {APP_TAGLINE}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            Borrow from {formatPaise(rupeesToPaise(MIN_PRINCIPAL_RUPEES))} to{' '}
            {formatPaise(rupeesToPaise(MAX_PRINCIPAL_RUPEES))} for {MIN_TENURE_DAYS}–{MAX_TENURE_DAYS}{' '}
            days at a fixed {INTEREST_RATE_ANNUAL}% p.a. simple interest.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat value={`${INTEREST_RATE_ANNUAL}% p.a.`} label="Fixed, simple interest" />
            <Stat
              value={formatPaise(rupeesToPaise(MAX_PRINCIPAL_RUPEES))}
              label="Up to"
            />
            <Stat value={`${MAX_TENURE_DAYS} days`} label="Longest tenure" />
          </div>

          <div className="mt-6 rounded-2xl bg-white p-4 text-ink sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Example</p>
            <p className="mt-1 text-sm font-semibold text-ink sm:text-base">
              {formatPaise(rupeesToPaise(EXAMPLE_PRINCIPAL_RUPEES))} for {EXAMPLE_TENURE_DAYS} days
            </p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Interest</dt>
                <dd className="font-medium tabular-nums">
                  {formatPaise(example.interestPaise, true)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-1.5">
                <dt className="font-medium text-ink">Total repayment</dt>
                <dd className="font-bold tabular-nums text-teal">
                  {formatPaise(example.totalPaise, true)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="mt-10 text-xs text-white/55 sm:text-sm">
          Age 23 to 50 · Salary from {formatPaise(rupeesToPaise(MIN_MONTHLY_SALARY_RUPEES))} a
          month · PAN required
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-3 sm:px-3 sm:py-3.5">
      <p className="text-sm font-bold tabular-nums text-teal sm:text-base">{value}</p>
      <p className="mt-1 text-[10px] leading-snug text-white/65 sm:text-xs">{label}</p>
    </div>
  );
}
