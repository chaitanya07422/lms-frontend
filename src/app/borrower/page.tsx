'use client';

import { useAuth } from '@/context/auth-context';

export default function BorrowerHomePage() {
  const { user } = useAuth();

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold">Welcome, {user?.fullName}</h2>
      <p className="mt-2 text-sm text-muted">
        Profile complete: {user?.profileComplete ? 'Yes' : 'No'}. Application flow UI lands in the
        next phase (profile, salary slip, BRE preview, apply).
      </p>
    </section>
  );
}
