'use client';

import { FormEvent, useEffect, useState } from 'react';

import { BreResultPanel } from '@/components/borrower/bre-result';
import { useAuth } from '@/context/auth-context';
import { updateProfile } from '@/lib/borrower-api';
import { breFromApiError, toDateInputValue } from '@/lib/bre-errors';
import {
  EMPLOYMENT_MODES,
  MIN_MONTHLY_SALARY_RUPEES,
  type EmploymentMode,
} from '@/lib/loan-limits';
import { paiseToRupees, rupeesToPaise } from '@/lib/money';
import { ApiError } from '@/types/api';
import type { BreResult } from '@/types/loan';

export default function BorrowerProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [pan, setPan] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [salaryRupees, setSalaryRupees] = useState(MIN_MONTHLY_SALARY_RUPEES);
  const [employmentMode, setEmploymentMode] = useState<EmploymentMode>('Salaried');
  const [bre, setBre] = useState<BreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFullName(user.fullName ?? '');
    setPan(user.pan ?? '');
    setDateOfBirth(toDateInputValue(user.dateOfBirth));
    if (user.monthlySalaryPaise != null) {
      setSalaryRupees(paiseToRupees(user.monthlySalaryPaise));
    }
    if (user.employmentMode) {
      setEmploymentMode(user.employmentMode as EmploymentMode);
    }
  }, [user]);

  function body() {
    return {
      fullName: fullName.trim(),
      pan: pan.trim().toUpperCase(),
      dateOfBirth,
      monthlySalaryPaise: rupeesToPaise(salaryRupees),
      employmentMode,
    };
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBre(null);
    setBusy(true);
    try {
      const result = await updateProfile(body());
      setBre(result.bre);
      await refreshUser();
    } catch (err) {
      const fromBre = breFromApiError(err);
      if (fromBre) {
        setBre(fromBre);
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not save profile');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-ink">Profile</h2>
      <p className="mt-1 text-sm text-muted">
        Enter your details. We check age, salary, PAN, and employment when you save.
      </p>

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block">Full name</span>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">PAN</span>
          <input
            required
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            className="w-full rounded-lg border border-border px-3 py-2 uppercase outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Date of birth</span>
          <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Monthly salary (₹)</span>
          <input
            type="number"
            required
            min={0}
            step={1000}
            value={salaryRupees}
            onChange={(e) => setSalaryRupees(Number(e.target.value))}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Employment</span>
          <select
            value={employmentMode}
            onChange={(e) => setEmploymentMode(e.target.value as EmploymentMode)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent"
          >
            {EMPLOYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {bre ? <BreResultPanel bre={bre} /> : null}
      </div>
    </section>
  );
}
