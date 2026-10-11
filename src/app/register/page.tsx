'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Register is on the combined auth page. */
export default function RegisterRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted">
      Redirecting…
    </div>
  );
}
