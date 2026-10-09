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
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
    >
      Log out
    </button>
  );
}
