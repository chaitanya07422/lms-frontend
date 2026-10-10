'use client';

import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { PrimaryButton } from '@/components/ui/field';
import { PageTitle, Panel } from '@/components/ui/panel';
import { formatPaise } from '@/lib/money';
import {
  disburseLoan,
  listDisbursementQueue,
  type QueueLoan,
} from '@/lib/ops-api';
import { ApiError } from '@/types/api';

export default function DisbursementQueuePage() {
  const [items, setItems] = useState<QueueLoan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<QueueLoan | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    setItems(await listDisbursementQueue());
  }

  useEffect(() => {
    void reload()
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load queue');
      })
      .finally(() => setLoading(false));
  }, []);

  async function onConfirm() {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      await disburseLoan(target.id);
      setTarget(null);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Disburse failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <PageTitle
        title="Sanctioned loans"
        subtitle="Mark a loan as disbursed once the funds are released."
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Panel className="overflow-x-auto p-0 shadow-sm">
        {loading ? <p className="p-6 text-sm text-muted">Loading…</p> : null}
        {!loading ? (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">PAN</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Tenure</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-muted">
                    No loans awaiting disbursement.
                  </td>
                </tr>
              ) : (
                items.map((loan) => (
                  <tr key={loan.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold text-ink">{loan.borrowerName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{loan.borrowerPan ?? '—'}</td>
                    <td className="px-4 py-3">{formatPaise(loan.principalPaise)}</td>
                    <td className="px-4 py-3">{loan.tenureDays} days</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PrimaryButton
                        type="button"
                        className="bg-teal px-3 py-1.5 text-xs hover:bg-teal-hover"
                        onClick={() => setTarget(loan)}
                      >
                        Mark disbursed
                      </PrimaryButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}
      </Panel>

      {target ? (
        <ConfirmModal
          title="Confirm disbursement"
          subtitle={`${target.borrowerName} · ${formatPaise(target.principalPaise)} · ${target.tenureDays} days`}
          confirmLabel="Confirm disbursement"
          busy={busy}
          onCancel={() => setTarget(null)}
          onConfirm={() => void onConfirm()}
        >
          <p className="text-sm text-muted">
            This loan moves to DISBURSED and into Collection.
          </p>
        </ConfirmModal>
      ) : null}
    </section>
  );
}
