'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/auth-context';
import { createUserByAdmin } from '@/lib/ops-api';
import { ApiError } from '@/types/api';
import { USER_ROLES, type UserRole } from '@/types/user';

export default function AdminCreateUserPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('sales');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [isLoading, router, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createUserByAdmin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      setSuccess(`Created ${created.email} as ${created.role}.`);
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create user');
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || user?.role !== 'admin') {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <section className="max-w-lg space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Create user</h2>
        <p className="mt-1 text-sm text-muted">
          Admin-only. Assigned role controls module access after login (not the email address).
        </p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block">Full name</span>
          <input
            required
            minLength={2}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create user'}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
    </section>
  );
}
