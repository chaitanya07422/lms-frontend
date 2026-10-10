'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { formatPaise } from '@/lib/money';
import { getLead } from '@/lib/ops-api';
import { ApiError } from '@/types/api';
import type { PublicUser } from '@/types/user';

export default function SalesLeadDetailPage() {
  const params = useParams<{ userId: string }>();
  const [lead, setLead] = useState<PublicUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getLead(params.userId)
      .then(setLead)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Lead not found');
      });
  }, [params.userId]);

  if (error) {
    return (
      <section>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/dashboard/sales" className="mt-4 inline-block text-sm text-accent underline">
          Back to leads
        </Link>
      </section>
    );
  }

  if (!lead) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <section className="space-y-4">
      <Link href="/dashboard/sales" className="text-sm font-medium text-accent hover:underline">
        ← Leads
      </Link>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-ink">{lead.fullName}</h2>
        <p className="text-sm text-muted">{lead.email}</p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Profile</dt>
            <dd className="font-medium">{lead.profileComplete ? 'Complete' : 'Incomplete'}</dd>
          </div>
          <div>
            <dt className="text-muted">PAN</dt>
            <dd className="font-medium">{lead.pan ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Date of birth</dt>
            <dd className="font-medium">
              {lead.dateOfBirth ? lead.dateOfBirth.slice(0, 10) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Monthly salary</dt>
            <dd className="font-medium">
              {lead.monthlySalaryPaise != null ? formatPaise(lead.monthlySalaryPaise) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Employment</dt>
            <dd className="font-medium">{lead.employmentMode ?? '—'}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
