'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';
import { homePathForRole } from '@/lib/roles';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!user) {
      router.replace('/login');
      return;
    }
    router.replace(homePathForRole(user.role));
  }, [isLoading, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
      Redirecting…
    </div>
  );
}
