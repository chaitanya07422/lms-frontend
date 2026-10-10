/** Keep in sync with lms-backend/src/config/loan.ts */
export const INTEREST_RATE_ANNUAL = 12;

export const MIN_PRINCIPAL_RUPEES = 50_000;
export const MAX_PRINCIPAL_RUPEES = 500_000;

export const MIN_TENURE_DAYS = 30;
export const MAX_TENURE_DAYS = 365;

export const MIN_MONTHLY_SALARY_RUPEES = 25_000;

export const EMPLOYMENT_MODES = ['Salaried', 'Self-Employed', 'Unemployed'] as const;
export type EmploymentMode = (typeof EMPLOYMENT_MODES)[number];
