/** Keep in sync with lms-backend/src/validators/password.ts */
export const PASSWORD_RULES_HINT =
  'At least 8 characters, with uppercase, lowercase, number, and special character';

export function passwordMeetsRules(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
