'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { PrimaryButton } from '@/components/ui/field';
import { PageTitle, Panel } from '@/components/ui/panel';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise } from '@/lib/money';
import {
  disburseLoan,
  listDisbursementQueue,
  type QueueLoan,
} from '@/lib/ops-api';
import { ApiError } from '@/types/api';

const PAGE_SIZE = 12;

export default function DisbursementQueuePage() {
  const [items, setItems] = useState<QueueLoan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paging, setPaging] = useState(false);
  const [target, setTarget] = useState<QueueLoan | null>(null);
  const [busy, setBusy] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  async function fetchPage(cursor: string | undefined, index: number, replaceStack = false) {
    const data = await listDisbursementQueue({ cursor, limit: PAGE_SIZE });
    setItems(data.items);
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setPageIndex(index);
    if (replaceStack) {
      setCursorStack([undefined]);
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    void fetchPage(undefined, 0, true)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load queue');
      })
      .finally(() => setLoading(false));
  }, []);

  async function reloadCurrent() {
    const cursor = cursorStack[pageIndex];
    await fetchPage(cursor, pageIndex);
  }

  async function goNewer() {
    if (pageIndex <= 0 || paging) return;
    const prevIndex = pageIndex - 1;
    const cursor = cursorStack[prevIndex];
    setPaging(true);
    setError(null);
    try {
      await fetchPage(cursor, prevIndex);
      setCursorStack((stack) => stack.slice(0, prevIndex + 1));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load queue');
    } finally {
      setPaging(false);
    }
  }

  async function goOlder() {
    if (!hasMore || !nextCursor || paging) return;
    const nextIndex = pageIndex + 1;
    setPaging(true);
    setError(null);
    try {
      await fetchPage(nextCursor, nextIndex);
      setCursorStack((stack) => {
        const next = stack.slice(0, nextIndex);
        next[nextIndex] = nextCursor;
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load queue');
    } finally {
      setPaging(false);
    }
  }

  async function onConfirm() {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      await disburseLoan(target.id);
      setTarget(null);
      await reloadCurrent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Disburse failed');
    } finally {
      setBusy(false);
    }
  }

  const rangeStart = items.length === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const rangeEnd = pageIndex * PAGE_SIZE + items.length;
  const rangeLabel =
    items.length === 0
      ? '0–0'
      : hasMore
        ? `${rangeStart}–${rangeEnd} of many`
        : `${rangeStart}–${rangeEnd}`;

  const canNewer = pageIndex > 0;
  const canOlder = hasMore && Boolean(nextCursor);

  return (
    <section className="space-y-4">
      <PageTitle title="Sanctioned loans" />
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Panel className="overflow-x-auto p-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className="font-bold text-ink">Queue</h3>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="tabular-nums">{loading || paging ? '…' : rangeLabel}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Newer"
                title="Newer"
                disabled={!canNewer || loading || paging}
                onClick={() => void goNewer()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-ink hover:bg-background disabled:cursor-not-allowed disabled:text-muted/40"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Older"
                title="Older"
                disabled={!canOlder || loading || paging}
                onClick={() => void goOlder()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-ink hover:bg-background disabled:cursor-not-allowed disabled:text-muted/40"
              >
                ›
              </button>
            </div>
          </div>
        </div>
        {loading ? <p className="p-6 text-sm text-muted">Loading…</p> : null}
        {!loading ? (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Loan ref</th>
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
                  <td colSpan={7} className="px-4 py-8 text-muted">
                    No loans awaiting disbursement.
                  </td>
                </tr>
              ) : (
                items.map((loan) => (
                  <tr
                    key={loan.id}
                    className="border-b border-border last:border-0 hover:bg-accent-soft/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/disbursement/${loan.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        {loanRef(loan.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/disbursement/${loan.id}`}
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
          confirmLabel="Confirm disbursement"
          busy={busy}
          onCancel={() => setTarget(null)}
          onConfirm={() => void onConfirm()}
        />
      ) : null}
    </section>
  );
}
