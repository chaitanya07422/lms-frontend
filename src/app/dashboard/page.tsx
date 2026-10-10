'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageTitle, Panel } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import { homePathForRole } from '@/lib/roles';
import { getAdminSummary, type AdminSummary } from '@/lib/ops-api';
import { ApiError } from '@/types/api';

const COUNT_PILL: Record<string, string> = {
  Applied: 'bg-amber-100 text-amber-800',
  Sanctioned: 'bg-sky-100 text-sky-800',
  Disbursed: 'bg-emerald-100 text-emerald-800',
  Closed: 'bg-slate-100 text-slate-700',
  Rejected: 'bg-red-100 text-red-800',
};

export default function DashboardHomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!isAdmin) {
      router.replace(homePathForRole(user.role));
    }
  }, [isAdmin, isLoading, router, user]);

  useEffect(() => {
    if (!isAdmin) return;
    void getAdminSummary()
      .then(setSummary)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load summary');
      });
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-sm text-muted">Opening your desk…</div>
    );
  }

  const counts = summary?.counts;
  const tiles = [
    { label: 'Applied', value: counts?.applied },
    { label: 'Sanctioned', value: counts?.sanctioned },
    { label: 'Disbursed', value: counts?.disbursed },
    { label: 'Closed', value: counts?.closed },
    { label: 'Rejected', value: counts?.rejected },
  ];

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
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-bold text-ink">Recent activity</h3>
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
            {!summary ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted">
                  Loading…
                </td>
              </tr>
            ) : summary.recentActivity.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted">
                  No activity yet.
                </td>
              </tr>
            ) : (
              summary.recentActivity.map((row, i) => (
                <tr key={`${row.loanId}-${row.at}-${i}`} className="border-b border-border last:border-0">
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
