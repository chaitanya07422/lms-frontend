'use client';

import { FormEvent, useState } from 'react';

import { Field, PrimaryButton, TextInput } from '@/components/ui/field';
import { Panel } from '@/components/ui/panel';
import { createUserByAdmin } from '@/lib/ops-api';
import { ApiError } from '@/types/api';
import type { OpsRole } from '@/types/user';

const STAFF_ROLES: OpsRole[] = [
  'admin',
  'sales',
  'sanction',
  'disbursement',
  'collection',
];

const ROLE_META: Record<
  OpsRole,
  { title: string; blurb: string; desk: string; accent: string }
> = {
  admin: {
    title: 'Admin',
    blurb: 'Full console — overview, all desks, and user creation.',
    desk: 'Admin Console',
    accent: 'border-navy bg-[#eef2ff] text-navy',
  },
  sales: {
    title: 'Sales',
    blurb: 'View borrower leads and application progress.',
    desk: 'Sales Desk',
    accent: 'border-violet-300 bg-violet-50 text-violet-900',
  },
  sanction: {
    title: 'Sanction',
    blurb: 'Approve or reject applied loans.',
    desk: 'Sanction Desk',
    accent: 'border-sky-300 bg-sky-50 text-sky-900',
  },
  disbursement: {
    title: 'Disbursement',
    blurb: 'Mark sanctioned loans as disbursed.',
    desk: 'Disbursement Desk',
    accent: 'border-teal/40 bg-teal-soft text-teal',
  },
  collection: {
    title: 'Collection',
    blurb: 'Record UTR payments and close repaid loans.',
    desk: 'Collection Desk',
    accent: 'border-orange-300 bg-orange-50 text-orange-900',
  },
};

export default function AdminCreateUserPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<OpsRole>('sales');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setSuccess(`Created ${created.fullName} (${created.email}) as ${created.role}.`);
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('sales');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create user');
    } finally {
      setBusy(false);
    }
  }

  const selected = ROLE_META[role];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Admin</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Users</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Create staff accounts. Borrowers sign up themselves from the login page.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Selected role</p>
          <p className="mt-0.5 font-semibold text-ink">{selected.title}</p>
          <p className="text-xs text-muted">{selected.desk}</p>
        </div>
      </div>

      <Panel className="shadow-sm">
        <h3 className="text-base font-bold text-ink">Create user</h3>
        <p className="mt-1 text-sm text-muted">
          Password must be at least 8 characters. Share credentials securely after create.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <TextInput
                required
                minLength={2}
                placeholder="Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
            <Field label="Email">
              <TextInput
                type="email"
                required
                placeholder="priya@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Password" hint="Minimum 8 characters">
            <TextInput
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Role</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {STAFF_ROLES.map((r) => {
                const meta = ROLE_META[r];
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? `${meta.accent} ring-2 ring-navy/20`
                        : 'border-border bg-card text-ink hover:border-navy/30 hover:bg-background'
                    }`}
                  >
                    <p className="text-sm font-bold">{meta.title}</p>
                    <p className="mt-1 text-xs leading-snug opacity-80">{meta.blurb}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded-lg bg-success-soft px-3 py-2.5 text-sm text-success">
              {success}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create user'}
            </PrimaryButton>
            <p className="text-xs text-muted">
              They can sign in at the login page with this email and password.
            </p>
          </div>
        </form>
      </Panel>
    </section>
  );
}
