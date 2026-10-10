'use client';

import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ops/status-badge';
import { PageTitle, Panel } from '@/components/ui/panel';
import { listLeads, type LeadSummary } from '@/lib/ops-api';
import { ApiError } from '@/types/api';

export default function SalesLeadsPage() {
  const [items, setItems] = useState<LeadSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listLeads()
      .then((data) => setItems(data.items))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load leads');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-4">
      <PageTitle
        title="Leads"
        subtitle="Registered users who have not applied for a loan yet."
      />

      <div className="rounded-lg bg-accent-soft px-4 py-3 text-sm font-medium text-accent-deep">
        This list is read-only. Sales has no loan actions.
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Panel className="overflow-x-auto p-0 shadow-sm">
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
                  <tr key={lead.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold text-ink">{lead.fullName}</td>
                    <td className="px-4 py-3 text-ink">{lead.email}</td>
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
