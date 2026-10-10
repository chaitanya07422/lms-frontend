'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import {
  DangerOutlineButton,
  Field,
  GhostButton,
  PrimaryButton,
  TextArea,
} from '@/components/ui/field';
import { PageTitle, Panel } from '@/components/ui/panel';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise } from '@/lib/money';
import {
  approveLoan,
  listSanctionQueue,
  rejectLoan,
  type QueueLoan,
} from '@/lib/ops-api';
import { ApiError } from '@/types/api';

export default function SanctionQueuePage() {
  const [items, setItems] = useState<QueueLoan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<QueueLoan | null>(null);
  const [reason, setReason] = useState('');

  async function reload() {
    setItems(await listSanctionQueue());
  }

  useEffect(() => {
    void reload()
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load queue');
      })
      .finally(() => setLoading(false));
  }, []);

  async function onApprove(loan: QueueLoan) {
    setBusyId(loan.id);
    setError(null);
    try {
      await approveLoan(loan.id);
      if (rejectTarget?.id === loan.id) setRejectTarget(null);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Approve failed');
    } finally {
      setBusyId(null);
    }
  }

  async function onConfirmReject() {
    if (!rejectTarget || !reason.trim()) return;
    setBusyId(rejectTarget.id);
    setError(null);
    try {
      await rejectLoan(rejectTarget.id, reason.trim());
      setRejectTarget(null);
      setReason('');
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reject failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-5">
      <PageTitle
        title="Applied loans"
        subtitle="Review each application and approve it or reject it with a reason. Click a loan ref for full details."
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Panel className="overflow-x-auto p-0 shadow-sm">
        {loading ? <p className="p-6 text-sm text-muted">Loading…</p> : null}
        {!loading ? (
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Loan ref</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">PAN</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Tenure</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-muted">
                    No loans awaiting sanction.
                  </td>
                </tr>
              ) : (
                items.map((loan) => (
                  <tr
                    key={loan.id}
                    className={`border-b border-border last:border-0 hover:bg-accent-soft/30 ${
                      rejectTarget?.id === loan.id ? 'bg-danger-soft/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/sanction/${loan.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        {loanRef(loan.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/sanction/${loan.id}`}
                        className="font-semibold text-ink hover:text-accent hover:underline"
                      >
                        {loan.borrowerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{loan.borrowerPan ?? '—'}</td>
                    <td className="px-4 py-3">{formatPaise(loan.principalPaise)}</td>
                    <td className="px-4 py-3">{loan.tenureDays} days</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <PrimaryButton
                          type="button"
                          disabled={busyId === loan.id}
                          onClick={() => void onApprove(loan)}
                          className="bg-teal px-3 py-1.5 text-xs hover:bg-teal-hover"
                        >
                          Approve
                        </PrimaryButton>
                        <DangerOutlineButton
                          type="button"
                          disabled={busyId === loan.id}
                          onClick={() => {
                            setRejectTarget(loan);
                            setReason('');
                          }}
                          className="px-3 py-1.5 text-xs"
                        >
                          Reject
                        </DangerOutlineButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}
      </Panel>

      {rejectTarget ? (
        <Panel className="shadow-sm">
          <h3 className="text-lg font-bold text-ink">Reject loan</h3>
          <p className="mt-1 text-sm text-muted">
            {rejectTarget.borrowerName} · {formatPaise(rejectTarget.principalPaise)} ·{' '}
            {rejectTarget.tenureDays} days
          </p>
          <div className="mt-4">
            <Field
              label="Reason for rejection"
              hint="Required. The reason is saved with the loan."
            >
              <TextArea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => setRejectTarget(null)}>
              Cancel
            </GhostButton>
            <PrimaryButton
              type="button"
              disabled={!reason.trim() || busyId === rejectTarget.id}
              onClick={() => void onConfirmReject()}
              className="bg-danger hover:bg-red-700"
            >
              Confirm rejection
            </PrimaryButton>
          </div>
        </Panel>
      ) : null}
    </section>
  );
}
