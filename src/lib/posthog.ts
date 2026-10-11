import posthog from 'posthog-js';

import type { PublicUser } from '@/types/user';

export function isPostHogEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

/** Link analytics to the logged-in user (stable id, not email as distinct id). */
export function identifyUser(user: PublicUser): void {
  if (!isPostHogEnabled()) return;
  posthog.identify(user.id, {
    email: user.email,
    name: user.fullName,
    role: user.role,
  });
}

export function resetPostHog(): void {
  if (!isPostHogEnabled()) return;
  posthog.reset();
}

export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isPostHogEnabled()) return;
  posthog.capture(event, properties);
}
