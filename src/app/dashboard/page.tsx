'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageTitle, Panel } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import {
  getAdminSummary,
  type AdminActivityRow,
  type AdminSummary,
} from '@/lib/ops-api';
import { homePathForRole } from '@/lib/roles';
import { ApiError } from '@/types/api';

const COUNT_PILL: Record<string, string> = {
  Applied: 'bg-amber-100 text-amber-800',
  Sanctioned: 'bg-sky-100 text-sky-800',
  Disbursed: 'bg-emerald-100 text-emerald-800',
  Closed: 'bg-slate-100 text-slate-700',
  Rejected: 'bg-red-100 text-red-800',
};

const PAGE_SIZE = 12;

export default function DashboardHomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const [counts, setCounts] = useState<AdminSummary['counts'] | null>(null);
  const [activity, setActivity] = useState<AdminActivityRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  /** Cursors used to open each page after the first (for Newer / previous). */
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paging, setPaging] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!isAdmin) {
      router.replace(homePathForRole(user.role));
    }
  }, [isAdmin, isLoading, router, user]);

  async function fetchPage(cursor: string | undefined, index: number, replaceStack = false) {
    const data = await getAdminSummary({ cursor, limit: PAGE_SIZE });
    setCounts(data.counts);
    setActivity(data.recentActivity);
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setPageIndex(index);
    if (replaceStack) {
      setCursorStack([undefined]);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    void fetchPage(undefined, 0, true)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load summary');
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

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
      setError(err instanceof ApiError ? err.message : 'Failed to load activity');
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
      setError(err instanceof ApiError ? err.message : 'Failed to load activity');
    } finally {
      setPaging(false);
    }
  }

  if (!isAdmin) {
    return <div className="text-sm text-muted">Opening your desk…</div>;
  }

  const tiles = [
    { label: 'Applied', value: counts?.applied },
    { label: 'Sanctioned', value: counts?.sanctioned },
    { label: 'Disbursed', value: counts?.disbursed },
    { label: 'Closed', value: counts?.closed },
    { label: 'Rejected', value: counts?.rejected },
  ];

  const rangeStart = activity.length === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const rangeEnd = pageIndex * PAGE_SIZE + activity.length;
  const rangeLabel =
    activity.length === 0 ? '0–0' : `${rangeStart}–${rangeEnd}`;

  const canNewer = pageIndex > 0;
  const canOlder = hasMore && Boolean(nextCursor);

  return (
    <section className="space-y-6">
      <PageTitle title="Overview" subtitle="Loans by status across the whole system." />
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm"
          >
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${COUNT_PILL[tile.label]}`}
            >
              {tile.label}
            </span>
            <p className="mt-3 text-3xl font-bold text-ink">{tile.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <Panel className="overflow-x-auto p-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className="font-bold text-ink">Recent activity</h3>
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Loan</th>
              <th className="px-4 py-3 font-semibold">Applicant</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted">
                  Loading…
                </td>
              </tr>
            ) : activity.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted">
                  No activity yet.
                </td>
              </tr>
            ) : (
              activity.map((row) => (
                <tr key={row.cursor} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{row.loanRef}</td>
                  <td className="px-4 py-3 font-medium">{row.applicantName}</td>
                  <td className="px-4 py-3">{row.event}</td>
                  <td className="px-4 py-3 text-muted">{row.by}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </section>
  );
}
