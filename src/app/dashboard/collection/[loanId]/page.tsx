'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { Field, PrimaryButton, TextInput } from '@/components/ui/field';
import { Panel } from '@/components/ui/panel';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise, rupeesToPaise } from '@/lib/money';
import {
  getCollectionLoan,
  recordPayment,
  type PaymentDto,
  type QueueLoan,
} from '@/lib/ops-api';
import { ApiError } from '@/types/api';
export default function CollectionDetailPage() {
  const params = useParams<{ loanId: string }>();
  const [loan, setLoan] = useState<QueueLoan | null>(null);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [utr, setUtr] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const data = await getCollectionLoan(params.loanId);
    setLoan(data.loan);
    setPayments(data.payments);
  }, [params.loanId]);

  useEffect(() => {
    void reload().catch((err: unknown) => {
      setError(err instanceof ApiError ? err.message : 'Loan not found');
    });
  }, [reload]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await recordPayment(params.loanId, {
        utr: utr.trim(),
        amountPaise: rupeesToPaise(Number(amountRupees)),
        paidAt,
      });
      setLoan((prev) => ({
        ...result.loan,
        borrowerName: prev?.borrowerName ?? 'Borrower',
        borrowerEmail: prev?.borrowerEmail ?? '',
      }));
      setPayments((prev) => [result.payment, ...prev]);
      setUtr('');
      setAmountRupees('');
      setSuccess(
        result.loan.status === 'CLOSED'
          ? 'Payment recorded. Loan auto-closed.'
          : 'Payment recorded.',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed');
    } finally {
      setBusy(false);
    }
  }

  if (error && !loan) {
    return (
      <Panel>
        <p className="text-sm text-danger">{error}</p>
        <Link href="/dashboard/collection" className="mt-4 inline-block text-sm text-accent underline">
          Back
        </Link>
      </Panel>
    );
  }

  if (!loan) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const canPay = loan.status === 'DISBURSED' && loan.outstandingPaise > 0;
  const pct =
    loan.totalRepaymentPaise > 0
      ? Math.min(100, (loan.totalPaidPaise / loan.totalRepaymentPaise) * 100)
      : 0;

  return (
    <section className="space-y-4">
      <Link href="/dashboard/collection" className="text-sm font-medium text-accent hover:underline">
        ← Collection queue
      </Link>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{loan.borrowerName}</h2>
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-ink">{loanRef(loan.id)}</span>
              {' · '}
              {formatPaise(loan.principalPaise)} · {loan.tenureDays} days
            </p>
            <p className="mt-1 font-mono text-xs text-muted">Loan ID: {loan.id}</p>
            {loan.borrowerEmail ? (
              <p className="mt-0.5 text-xs text-muted">{loan.borrowerEmail}</p>
            ) : null}
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Total repayment" value={formatPaise(loan.totalRepaymentPaise, true)} />
          <Stat
            label="Paid so far"
            value={formatPaise(loan.totalPaidPaise, true)}
            valueClass="text-teal"
          />
          <Stat
            label="Outstanding"
            value={formatPaise(loan.outstandingPaise, true)}
            valueClass="text-warn"
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted">Repayment progress</span>
            <span className="font-medium text-ink">{pct.toFixed(1)}% repaid</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-desk" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </Panel>

      {canPay ? (
        <Panel>
          <h3 className="font-semibold text-ink">Record payment</h3>
          <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="UTR number" hint="Must be unique across all payments" className="sm:col-span-3">
              <TextInput required value={utr} onChange={(e) => setUtr(e.target.value)} />
            </Field>
            <Field label="Amount" hint="Cannot exceed the outstanding balance">
              <TextInput
                type="number"
                required
                min={1}
                step={1}
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
              />
            </Field>
            <Field label="Payment date">
              <TextInput
                type="date"
                required
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </Field>
            <div className="flex items-end">
              <PrimaryButton type="submit" disabled={busy} className="w-full">
                {busy ? 'Saving…' : 'Record payment'}
              </PrimaryButton>
            </div>
          </form>
          <p className="mt-3 text-xs text-muted">
            The loan closes automatically when the balance reaches zero.
          </p>
        </Panel>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <Panel className="overflow-x-auto p-0">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-ink">Payment history</h3>
        </div>
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">UTR</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-muted">
                  No payments yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.utr}</td>
                  <td className="px-4 py-3">{formatPaise(p.amountPaise)}</td>
                  <td className="px-4 py-3 text-muted">{p.paidAt.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </section>
  );
}

function Stat({
  label,
  value,
  valueClass = 'text-ink',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
