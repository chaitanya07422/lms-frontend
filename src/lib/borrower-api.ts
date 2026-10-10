import { apiRequest } from '@/lib/api';
import type { PublicUser } from '@/types/user';
import type {
  BreResult,
  LoanDto,
  LoanQuote,
  ProfileInput,
  SalarySlipDto,
} from '@/types/loan';

export function updateProfile(
  body: ProfileInput,
): Promise<{ user: PublicUser; bre: BreResult }> {
  return apiRequest('/borrowers/me/profile', { method: 'PUT', body });
}

export function checkBre(body?: Partial<ProfileInput>): Promise<BreResult> {
  return apiRequest('/borrowers/me/bre/check', {
    method: 'POST',
    body: body ?? {},
  });
}

export function uploadSalarySlip(file: File): Promise<SalarySlipDto> {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest('/borrowers/me/salary-slip', {
    method: 'POST',
    formData,
  });
}

export function getLatestSalarySlip(): Promise<SalarySlipDto | null> {
  return apiRequest('/borrowers/me/salary-slip/latest');
}

export function previewLoan(
  principalPaise: number,
  tenureDays: number,
): Promise<LoanQuote> {
  return apiRequest('/loans/preview', {
    method: 'POST',
    body: { principalPaise, tenureDays },
  });
}

export function applyLoan(
  principalPaise: number,
  tenureDays: number,
  salarySlipId: string,
): Promise<LoanDto> {
  return apiRequest('/loans/apply', {
    method: 'POST',
    body: { principalPaise, tenureDays, salarySlipId },
  });
}

export async function listMyLoans(): Promise<LoanDto[]> {
  const data = await apiRequest<{ items: LoanDto[] }>('/loans/me');
  return data.items;
}

export function getMyLoan(loanId: string): Promise<{
  loan: LoanDto;
  payments: Array<{
    id: string;
    utr: string;
    amountPaise: number;
    paidAt: string;
    createdAt: string;
  }>;
}> {
  return apiRequest(`/loans/me/${loanId}`);
}
