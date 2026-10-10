import type { OpsRole, UserRole } from '@/types/user';

export const OPS_ROLES: OpsRole[] = [
  'admin',
  'sales',
  'sanction',
  'disbursement',
  'collection',
];

export function isOpsRole(role: UserRole): role is OpsRole {
  return role !== 'borrower';
}

export function isBorrowerRole(role: UserRole): boolean {
  return role === 'borrower';
}

/** Nav modules for a role — admin gets all four; access is by role, not email. */
export function modulesForRole(role: UserRole): OpsRole[] {
  if (role === 'admin') {
    return ['sales', 'sanction', 'disbursement', 'collection'];
  }
  if (role === 'borrower') {
    return [];
  }
  return [role];
}

export function homePathForRole(role: UserRole): string {
  if (role === 'borrower') {
    return '/borrower';
  }
  if (role === 'admin') {
    return '/dashboard';
  }
  return `/dashboard/${role}`;
}
