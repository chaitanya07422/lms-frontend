'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { PageTitle, Panel } from '@/components/ui/panel';
import { loanRef } from '@/lib/loan-ref';
import { formatPaise } from '@/lib/money';
import { listCollectionQueue, type QueueLoan } from '@/lib/ops-api';
import { ApiError } from '@/types/api';

const PAGE_SIZE = 12;

export default function CollectionQueuePage() {
  const [items, setItems] = useState<QueueLoan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paging, setPaging] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  async function fetchPage(cursor: string | undefined, index: number, replaceStack = false) {
    const data = await listCollectionQueue({ cursor, limit: PAGE_SIZE });
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

  const rangeStart = items.length === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const rangeEnd = pageIndex * PAGE_SIZE + items.length;
  const rangeLabel =
    items.length === 0 ? '0–0' : `${rangeStart}–${rangeEnd}`;

  const canNewer = pageIndex > 0;
  const canOlder = hasMore && Boolean(nextCursor);

  return (
    <section>
      <PageTitle title="Loans" />
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      <Panel className="overflow-x-auto p-0">
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
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Loan ref</th>
                <th className="px-4 py-3 font-semibold">Loan ID</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Principal</th>
                <th className="px-4 py-3 font-semibold">Outstanding</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-muted">
                    No collection loans.
                  </td>
                </tr>
              ) : (
                items.map((loan) => {
                  const href = `/dashboard/collection/${loan.id}`;
                  return (
                    <tr
                      key={loan.id}
                      className="border-b border-border last:border-0 hover:bg-accent-soft/40"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={href}
                          className="font-semibold text-accent hover:underline"
                        >
                          {loanRef(loan.id)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={href}
                          className="font-mono text-xs text-ink hover:text-accent hover:underline"
                          title={loan.id}
                        >
                          {loan.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={href} className="font-medium text-ink hover:text-accent">
                          {loan.borrowerName}
                        </Link>
                        {loan.borrowerEmail ? (
                          <p className="text-xs text-muted">{loan.borrowerEmail}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{formatPaise(loan.principalPaise)}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatPaise(loan.outstandingPaise)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={loan.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}
