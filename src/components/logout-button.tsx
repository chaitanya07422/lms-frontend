'use client';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/auth-context';

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        logout();
        router.replace('/login');
      }}
      className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent-soft"
    >
      Log out
    </button>
  );
}
