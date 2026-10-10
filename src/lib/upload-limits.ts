/** Match assignment PDF Step 3 + lms-backend MAX_UPLOAD_BYTES / MIME rules. */
export const MAX_SALARY_SLIP_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_SALARY_SLIP_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

export const ALLOWED_SALARY_SLIP_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

export function validateSalarySlipFile(file: File): string | null {
  if (file.size > MAX_SALARY_SLIP_BYTES) {
    return 'File exceeds 5 MB limit.';
  }

  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot) : '';

  if (!ALLOWED_SALARY_SLIP_EXT.has(ext)) {
    return 'Invalid file type. Allowed: PDF, JPG, PNG.';
  }

  // Some browsers leave type empty; extension check above still applies.
  if (file.type && !ALLOWED_SALARY_SLIP_MIME.has(file.type)) {
    return 'Invalid file type. Allowed: PDF, JPG, PNG.';
  }

  return null;
}
