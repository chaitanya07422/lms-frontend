'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { PageTitle, Panel } from '@/components/ui/panel';
import { listLeads, type LeadSummary } from '@/lib/ops-api';
import { ApiError } from '@/types/api';

const PAGE_SIZE = 12;

export default function SalesLeadsPage() {
  const [items, setItems] = useState<LeadSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paging, setPaging] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  async function fetchPage(cursor: string | undefined, index: number, replaceStack = false) {
    const data = await listLeads({ cursor, limit: PAGE_SIZE });
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
        setError(err instanceof ApiError ? err.message : 'Failed to load leads');
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
      setError(err instanceof ApiError ? err.message : 'Failed to load leads');
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
      setError(err instanceof ApiError ? err.message : 'Failed to load leads');
    } finally {
      setPaging(false);
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
      <PageTitle
        title="Leads"
        subtitle="Registered users who have not applied for a loan yet. Click a name to open details."
      />

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
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-muted">
                    No open leads right now.
                  </td>
                </tr>
              ) : (
                items.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border last:border-0 hover:bg-accent-soft/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/sales/${lead.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        {lead.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/sales/${lead.id}`}
                        className="text-ink hover:text-accent hover:underline"
                      >
                        {lead.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={
                          lead.progress ??
                          (lead.profileComplete ? 'DETAILS_DONE' : 'SIGNED_UP')
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}
