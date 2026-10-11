export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

/** Product brand — shown in nav, titles, and ops chrome. */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'CreditSea';

/** Short tagline for auth / marketing chrome. */
export const APP_TAGLINE = 'Personal loans, simply done';

export const AUTH_TOKEN_KEY = 'lms_access_token';
