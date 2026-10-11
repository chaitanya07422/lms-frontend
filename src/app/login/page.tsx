'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { GuestShell } from '@/components/auth/guest-shell';
import { Field, TextInput, PrimaryButton } from '@/components/ui/field';
import { Panel } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';
import { FULL_NAME_HINT, lettersOnlyName, nameMeetsRules } from '@/lib/name';
import { PASSWORD_RULES_HINT, passwordMeetsRules } from '@/lib/password';
import { homePathForRole } from '@/lib/roles';
import { ApiError } from '@/types/api';

export default function LoginPage() {
  const { login, register, user, isLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regBusy, setRegBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(homePathForRole(user.role));
    }
  }, [isLoading, router, user]);

  async function onRegister(event: FormEvent) {
    event.preventDefault();
    setRegError(null);
    if (!nameMeetsRules(regName)) {
      setRegError(FULL_NAME_HINT);
      return;
    }
    if (!passwordMeetsRules(regPassword)) {
      setRegError(PASSWORD_RULES_HINT);
      return;
    }
    setRegBusy(true);
    try {
      const nextUser = await register(regEmail.trim(), regPassword, regName.trim());
      router.replace(homePathForRole(nextUser.role));
    } catch (err) {
      setRegError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setRegBusy(false);
    }
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError(null);
    setLoginBusy(true);
    try {
      const nextUser = await login(email.trim(), password);
      router.replace(homePathForRole(nextUser.role));
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoginBusy(false);
    }
  }

  return (
    <GuestShell>
      <div className="mx-auto w-full max-w-md">
        {mode === 'login' ? (
          <Panel className="shadow-sm">
            <h1 className="text-2xl font-bold text-ink">Log in to {APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted">{APP_TAGLINE}</p>
            <form className="mt-7 space-y-4" onSubmit={onLogin}>
              <Field label="Email">
                <TextInput
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Password">
                <TextInput
                  type="password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Field>
              {loginError ? <p className="text-sm text-danger">{loginError}</p> : null}
              <PrimaryButton type="submit" disabled={loginBusy} className="w-full">
                {loginBusy ? 'Logging in…' : 'Log in'}
              </PrimaryButton>
            </form>
            <p className="mt-5 text-center text-sm text-muted">
              New borrower?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLoginError(null);
                }}
                className="font-semibold text-teal hover:underline"
              >
                Create new account
              </button>
            </p>
          </Panel>
        ) : (
          <Panel className="shadow-sm">
            <h1 className="text-2xl font-bold text-ink">Join {APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted">
              Create an account to apply for a personal loan.
            </p>
            <form className="mt-7 space-y-4" onSubmit={onRegister}>
              <Field label="Full name" hint={FULL_NAME_HINT}>
                <TextInput
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={regName}
                  onChange={(e) => setRegName(lettersOnlyName(e.target.value))}
                  autoComplete="name"
                  pattern="[A-Za-z]+( [A-Za-z]+)*"
                  title={FULL_NAME_HINT}
                />
              </Field>
              <Field label="Email">
                <TextInput
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Password" hint={PASSWORD_RULES_HINT}>
                <TextInput
                  type="password"
                  required
                  minLength={8}
                  placeholder="e.g. Password123!"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              {regError ? <p className="text-sm text-danger">{regError}</p> : null}
              <PrimaryButton type="submit" disabled={regBusy} className="w-full">
                {regBusy ? 'Creating…' : 'Create account'}
              </PrimaryButton>
            </form>
            <p className="mt-5 text-center text-sm text-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setRegError(null);
                }}
                className="font-semibold text-teal hover:underline"
              >
                Log in
              </button>
            </p>
          </Panel>
        )}
      </div>
    </GuestShell>
  );
}
