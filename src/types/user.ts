export const USER_ROLES = [
  'admin',
  'sales',
  'sanction',
  'disbursement',
  'collection',
  'borrower',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type OpsRole = Exclude<UserRole, 'borrower'>;

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  profileComplete: boolean;
  pan?: string;
  dateOfBirth?: string;
  monthlySalaryPaise?: number;
  employmentMode?: string;
}

export interface AuthPayload {
  user: PublicUser;
  token: string;
}
