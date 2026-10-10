'use client';

import { FormEvent, useState } from 'react';

import { Field, PrimaryButton, TextInput, TextSelect } from '@/components/ui/field';
import { PageTitle, Panel } from '@/components/ui/panel';
import { createUserByAdmin } from '@/lib/ops-api';
import { ApiError } from '@/types/api';
import { USER_ROLES, type UserRole } from '@/types/user';

export default function AdminCreateUserPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('sales');
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

  return (
    <section className="max-w-lg">
      <PageTitle
        title="Create user"
        subtitle="Admin-only. Assigned role controls module access after login."
      />
      <Panel className="shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name">
            <TextInput
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Role">
            <TextSelect value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </TextSelect>
          </Field>
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create user'}
          </PrimaryButton>
        </form>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-success">{success}</p> : null}
      </Panel>
    </section>
  );
}
