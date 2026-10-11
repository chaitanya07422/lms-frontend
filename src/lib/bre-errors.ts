import { ApiError } from '@/types/api';
import type { BreFailure, BreResult } from '@/types/loan';

export function breFromApiError(err: unknown): BreResult | null {
  if (!(err instanceof ApiError) || !err.details?.length) {
    return null;
  }

  const failures: BreFailure[] = [];
  for (const item of err.details) {
    if (
      item &&
      typeof item === 'object' &&
      'rule' in item &&
      'message' in item &&
      typeof (item as BreFailure).rule === 'string' &&
      typeof (item as BreFailure).message === 'string'
    ) {
      failures.push(item as BreFailure);
    }
  }

  if (failures.length === 0) {
    return null;
  }

  return { passed: false, failures };
}

export function toDateInputValue(isoOrDate: string | undefined): string {
  if (!isoOrDate) {
    return '';
  }
  return isoOrDate.slice(0, 10);
}

/** Message for a single BRE rule, if present. */
export function breFieldError(
  bre: BreResult | null | undefined,
  rule: string,
): string | undefined {
  if (!bre || bre.passed) return undefined;
  return bre.failures.find((f) => f.rule === rule)?.message;
}
