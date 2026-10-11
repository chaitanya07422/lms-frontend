import posthog from 'posthog-js';

const token = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || '/ingest';

if (token) {
  posthog.init(token, {
    api_host: host,
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST?.trim() || 'https://us.posthog.com',
    // Keep SDK defaults current (PostHog docs).
    defaults: '2026-05-30',
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'identified_only',
  });
}
