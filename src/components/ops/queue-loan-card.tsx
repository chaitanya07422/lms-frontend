import Link from 'next/link';

import { StatusBadge } from '@/components/ops/status-badge';
import { formatPaise } from '@/lib/money';
import type { QueueLoan } from '@/lib/ops-api';

export function QueueLoanCard({
  loan,
  href,
  extra,
}: {
  loan: QueueLoan;
  href: string;
  extra?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-accent"
    >
      <div>
        <p className="font-medium text-ink">{loan.borrowerName}</p>
        <p className="text-sm text-muted">
          {loan.borrowerEmail} · {formatPaise(loan.principalPaise)} · {loan.tenureDays} days
          {extra ? ` · ${extra}` : ''}
        </p>
      </div>
      <StatusBadge status={loan.status} />
    </Link>
  );
}
