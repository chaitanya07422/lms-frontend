import { apiRequest } from '@/lib/api';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '@/lib/config';
import { ApiError } from '@/types/api';
import type { LoanDto, SalarySlipDto } from '@/types/loan';
import type { PublicUser, UserRole } from '@/types/user';

export type LeadSummary = {
  id: string;
  email: string;
  fullName: string;
  profileComplete: boolean;
  hasSalarySlip?: boolean;
  progress?: 'SIGNED_UP' | 'DETAILS_DONE' | 'SLIP_UPLOADED';
  createdAt: string;
};

export type AdminSummary = {
  counts: {
    applied: number;
    sanctioned: number;
    disbursed: number;
    closed: number;
    rejected: number;
    leads: number;
  };
  recentActivity: Array<{
    loanId: string;
    loanRef: string;
    applicantName: string;
    event: string;
    by: string;
    at: string;
  }>;
};

export function getAdminSummary(): Promise<AdminSummary> {
  return apiRequest('/ops/admin/summary');
}

export type QueueLoan = LoanDto & {
  borrowerName: string;
  borrowerEmail: string;
  borrowerPan?: string;
};

export type PaymentDto = {
  id: string;
  loanId: string;
  utr: string;
  amountPaise: number;
  paidAt: string;
  recordedBy: string;
  createdAt: string;
};

export function listLeads(page = 1, limit = 20): Promise<{
  items: LeadSummary[];
}> {
  return apiRequest(`/ops/sales/leads?page=${page}&limit=${limit}`);
}

export async function getLead(userId: string): Promise<PublicUser> {
  const data = await apiRequest<{ user: PublicUser }>(`/ops/sales/leads/${userId}`);
  return data.user;
}

export async function listSanctionQueue(): Promise<QueueLoan[]> {
  const data = await apiRequest<{ items: QueueLoan[] }>('/ops/sanction/loans');
  return data.items;
}

export function getSanctionLoan(loanId: string): Promise<{
  loan: LoanDto;
  borrower: PublicUser;
  salarySlip: SalarySlipDto | null;
}> {
  return apiRequest(`/ops/sanction/loans/${loanId}`);
}

export async function approveLoan(loanId: string): Promise<LoanDto> {
  const data = await apiRequest<{ loan: LoanDto }>(`/ops/sanction/loans/${loanId}/approve`, {
    method: 'POST',
    body: {},
  });
  return data.loan;
}

export async function rejectLoan(loanId: string, reason: string): Promise<LoanDto> {
  const data = await apiRequest<{ loan: LoanDto }>(`/ops/sanction/loans/${loanId}/reject`, {
    method: 'POST',
    body: { reason },
  });
  return data.loan;
}

export async function listDisbursementQueue(): Promise<QueueLoan[]> {
  const data = await apiRequest<{ items: QueueLoan[] }>('/ops/disbursement/loans');
  return data.items;
}

export async function getDisbursementLoan(loanId: string): Promise<LoanDto> {
  const data = await apiRequest<{ loan: LoanDto }>(`/ops/disbursement/loans/${loanId}`);
  return data.loan;
}

export async function disburseLoan(loanId: string): Promise<LoanDto> {
  const data = await apiRequest<{ loan: LoanDto }>(
    `/ops/disbursement/loans/${loanId}/disburse`,
    { method: 'POST', body: {} },
  );
  return data.loan;
}

export async function listCollectionQueue(): Promise<QueueLoan[]> {
  const data = await apiRequest<{ items: QueueLoan[] }>('/ops/collection/loans');
  return data.items;
}

export function getCollectionLoan(loanId: string): Promise<{
  loan: QueueLoan;
  payments: PaymentDto[];
}> {
  return apiRequest(`/ops/collection/loans/${loanId}`);
}

export function recordPayment(
  loanId: string,
  body: { utr: string; amountPaise: number; paidAt?: string },
): Promise<{ payment: PaymentDto; loan: LoanDto }> {
  return apiRequest(`/ops/collection/loans/${loanId}/payments`, {
    method: 'POST',
    body,
  });
}

export async function createUserByAdmin(body: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}): Promise<PublicUser> {
  const data = await apiRequest<{ user: PublicUser }>('/ops/admin/users', {
    method: 'POST',
    body,
  });
  return data.user;
}

/** Binary download — not JSON envelope. */
export async function downloadSalarySlip(id: string, filename: string): Promise<void> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}/salary-slips/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'DOWNLOAD_FAILED', 'Could not download salary slip');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
