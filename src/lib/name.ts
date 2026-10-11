/** Keep in sync with lms-backend/src/validators/name.ts */
export const FULL_NAME_HINT = 'Letters only (A–Z, a–z)';

/** Strip anything that is not a letter or space while typing. */
export function lettersOnlyName(value: string): string {
  return value.replace(/[^A-Za-z\s]/g, '');
}

export function nameMeetsRules(value: string): boolean {
  return /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value.trim());
}
