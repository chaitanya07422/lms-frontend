'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { getLatestSalarySlip, listMyLoans } from '@/lib/borrower-api';
import { formatPaise } from '@/lib/money';
import type { LoanDto, SalarySlipDto } from '@/types/loan';

export default function BorrowerHomePage() {
  const { user } = useAuth();
  const [slip, setSlip] = useState<SalarySlipDto | null>(null);
  const [loans, setLoans] = useState<LoanDto[]>([]);

  useEffect(() => {
    void getLatestSalarySlip().then(setSlip).catch(() => setSlip(null));
    void listMyLoans()
      .then(setLoans)
      .catch(() => setLoans([]));
  }, []);

  const steps = [
    {
      title: 'Profile',
      done: Boolean(user?.profileComplete),
      href: '/borrower/profile',
      hint: 'Age 23–50, salary ≥ ₹25,000, valid PAN, not Unemployed',
    },
    {
      title: 'Salary slip',
      done: Boolean(slip),
      href: '/borrower/salary-slip',
      hint: slip ? slip.originalName : 'Upload PDF or image (max 5 MB)',
    },
    {
      title: 'Apply for loan',
      done: loans.some((l) => ['APPLIED', 'SANCTIONED', 'DISBURSED'].includes(l.status)),
      href: '/borrower/apply',
      hint: '₹50,000–₹5,00,000 · 30–365 days · 12% p.a. simple interest',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-ink">Welcome, {user?.fullName}</h2>
        <p className="mt-2 text-sm text-muted">
          Complete the steps below to apply. We check eligibility when you save your profile.
        </p>
      </section>

      <ul className="grid gap-3 sm:grid-cols-3">
        {steps.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="block h-full rounded-2xl border border-border bg-card p-4 hover:border-accent"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {step.done ? 'Done' : 'Next'}
              </p>
              <h3 className="mt-1 font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.hint}</p>
            </Link>
          </li>
        ))}
      </ul>

      {loans[0] ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-ink">Latest loan</h3>
            <Link href="/borrower/loans" className="text-sm font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          <p className="mt-2 text-sm text-muted">
            {formatPaise(loans[0].principalPaise)} · {loans[0].tenureDays} days ·{' '}
            <span className="font-medium text-foreground">{loans[0].status}</span>
          </p>
        </section>
      ) : null}
    </div>
  );
}
