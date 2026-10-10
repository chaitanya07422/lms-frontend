'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
      <div>
        <h2 className="text-2xl font-semibold text-ink">Sales — leads</h2>
        <p className="mt-1 text-sm text-muted">
          Borrowers who registered but have no active loan application.
        </p>
      </div>

      {loading ? <p className="text-sm text-muted">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="text-sm text-muted">No open leads right now.</p>
      ) : null}

      <ul className="space-y-2">
        {items.map((lead) => (
          <li key={lead.id}>
            <Link
              href={`/dashboard/sales/${lead.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 hover:border-accent"
            >
              <div>
                <p className="font-medium text-ink">{lead.fullName}</p>
                <p className="text-sm text-muted">{lead.email}</p>
              </div>
              <span className="text-xs font-medium text-accent">
                {lead.profileComplete ? 'Profile complete' : 'Profile incomplete'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
