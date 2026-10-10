export type LoanStatus =
  | 'APPLIED'
  | 'SANCTIONED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'CLOSED';

export interface LoanQuote {
  interestPaise: number;
  totalRepaymentPaise: number;
  interestRateAnnual: number;
}

export interface LoanDto {
  id: string;
  borrowerId: string;
  salarySlipId: string;
  status: LoanStatus | string;
  principalPaise: number;
  tenureDays: number;
  interestRateAnnual: number;
  interestPaise: number;
  totalRepaymentPaise: number;
  totalPaidPaise: number;
  outstandingPaise: number;
  rejectionReason?: string;
  appliedAt: string;
  sanctionedAt?: string;
  rejectedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalarySlipDto {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface BreFailure {
  rule: string;
  message: string;
}

export interface BreResult {
  passed: boolean;
  failures: BreFailure[];
}

export interface ProfileInput {
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalaryPaise: number;
  employmentMode: 'Salaried' | 'Self-Employed' | 'Unemployed';
}
