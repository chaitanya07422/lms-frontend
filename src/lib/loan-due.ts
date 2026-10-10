import type { LoanDto } from '@/types/loan';

/** Expected repayment date: disbursement + tenure days (simple-interest product). */
export function loanDueDate(loan: Pick<LoanDto, 'disbursedAt' | 'tenureDays'>): Date | null {
  if (!loan.disbursedAt) return null;
  const due = new Date(loan.disbursedAt);
  due.setUTCDate(due.getUTCDate() + loan.tenureDays);
  return due;
}

export function formatLoanDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Borrower-facing status copy (MNC-style servicing, not ops jargon). */
export function borrowerStatusHeadline(status: string): string {
  switch (status) {
    case 'APPLIED':
      return 'Application under review';
    case 'SANCTIONED':
      return 'Approved — disbursement pending';
    case 'DISBURSED':
      return 'Active loan';
    case 'CLOSED':
      return 'Loan closed';
    case 'REJECTED':
      return 'Application not approved';
    default:
      return status;
  }
}
