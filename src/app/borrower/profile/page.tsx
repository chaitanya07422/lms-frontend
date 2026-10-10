'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { BreResultPanel } from '@/components/borrower/bre-result';
import { Field, PrimaryButton, TextInput } from '@/components/ui/field';
import { Panel, PageTitle } from '@/components/ui/panel';
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
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [pan, setPan] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [salaryRupees, setSalaryRupees] = useState(MIN_MONTHLY_SALARY_RUPEES);
  const [employmentMode, setEmploymentMode] = useState<EmploymentMode>('Salaried');
  const [bre, setBre] = useState<BreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? '');
    setPan(user.pan ?? '');
    setDateOfBirth(toDateInputValue(user.dateOfBirth));
    if (user.monthlySalaryPaise != null) {
      setSalaryRupees(paiseToRupees(user.monthlySalaryPaise));
    }
    if (user.employmentMode) {
      setEmploymentMode(user.employmentMode as EmploymentMode);
    }
    if (user.profileComplete) {
      setBre({ passed: true, failures: [] });
    }
  }, [user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBre(null);
    setBusy(true);
    try {
      const result = await updateProfile({
        fullName: fullName.trim(),
        pan: pan.trim().toUpperCase(),
        dateOfBirth,
        monthlySalaryPaise: rupeesToPaise(salaryRupees),
        employmentMode,
      });
      setBre(result.bre);
      await refreshUser();
      if (result.bre.passed) {
        router.push('/borrower/salary-slip');
      }
    } catch (err) {
      const fromBre = breFromApiError(err);
      if (fromBre) setBre(fromBre);
      else setError(err instanceof ApiError ? err.message : 'Could not save profile');
    } finally {
      setBusy(false);
    }
  }

  const canContinue = Boolean(bre?.passed || user?.profileComplete);

  return (
    <Panel className="max-w-xl shadow-sm">
      <PageTitle
        title="Personal details"
        subtitle="We check your details against our eligibility rules before you continue."
      />

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Full Name">
          <TextInput required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="PAN" hint="5 letters, 4 digits, 1 letter">
          <TextInput
            required
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            className="uppercase"
          />
        </Field>
        <Field label="Date of Birth" hint="Age must be 23 to 50">
          <TextInput
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </Field>
        <Field label="Monthly Salary" hint="Minimum ₹25,000">
          <TextInput
            type="number"
            required
            min={0}
            step={1000}
            value={salaryRupees}
            onChange={(e) => setSalaryRupees(Number(e.target.value))}
          />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Employment Mode</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {EMPLOYMENT_MODES.map((mode) => {
              const selected = employmentMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEmploymentMode(mode)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium ${
                    selected
                      ? 'border-teal bg-teal-soft text-teal'
                      : 'border-border bg-card text-ink hover:bg-background'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-teal' : 'border-border'
                    }`}
                  >
                    {selected ? <span className="h-2 w-2 rounded-full bg-teal" /> : null}
                  </span>
                  {mode === 'Self-Employed' ? 'Self-employed' : mode}
                </button>
              );
            })}
          </div>
        </div>

        {bre ? <BreResultPanel bre={bre} /> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <PrimaryButton
          type="submit"
          disabled={busy || (Boolean(bre) && !bre?.passed && !canContinue && busy)}
          className="bg-teal hover:bg-teal-hover"
        >
          {busy ? 'Checking…' : 'Continue'}
        </PrimaryButton>
        {!canContinue && bre && !bre.passed ? (
          <p className="text-xs text-muted">Continue unlocks once every rule passes.</p>
        ) : null}
      </form>
    </Panel>
  );
}
