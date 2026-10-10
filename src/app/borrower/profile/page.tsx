'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';

import { BreResultPanel } from '@/components/borrower/bre-result';
import { Field, GhostButton, PrimaryButton, TextInput } from '@/components/ui/field';
import { Panel, PageTitle } from '@/components/ui/panel';
import { useAuth } from '@/context/auth-context';
import {
  getLatestSalarySlip,
  listMyLoans,
  updateProfile,
  uploadSalarySlip,
} from '@/lib/borrower-api';
import { breFromApiError, toDateInputValue } from '@/lib/bre-errors';
import {
  EMPLOYMENT_MODES,
  MIN_MONTHLY_SALARY_RUPEES,
  type EmploymentMode,
} from '@/lib/loan-limits';
import { paiseToRupees, rupeesToPaise } from '@/lib/money';
import {
  MAX_SALARY_SLIP_BYTES,
  validateSalarySlipFile,
} from '@/lib/upload-limits';
import { ApiError } from '@/types/api';
import type { BreResult, SalarySlipDto } from '@/types/loan';

export default function BorrowerProfilePage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <BorrowerProfileForm />
    </Suspense>
  );
}

function BorrowerProfileForm() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openInEdit = searchParams.get('edit') === '1';
  const [fullName, setFullName] = useState('');
  const [pan, setPan] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [salaryRupees, setSalaryRupees] = useState<number | ''>(MIN_MONTHLY_SALARY_RUPEES);
  const [employmentMode, setEmploymentMode] = useState<EmploymentMode>('Salaried');
  const [bre, setBre] = useState<BreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  /** True once the borrower has submitted at least one loan — stay on profile when editing. */
  const [hasApplied, setHasApplied] = useState(false);
  /** Set when opened from Account → Edit so we never show wizard Continue. */
  const [fromAccountEdit, setFromAccountEdit] = useState(false);
  const [slip, setSlip] = useState<SalarySlipDto | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipError, setSlipError] = useState<string | null>(null);
  const [slipBusy, setSlipBusy] = useState(false);
  const [slipMsg, setSlipMsg] = useState<string | null>(null);

  function clearEditQuery() {
    if (searchParams.get('edit') === '1') {
      router.replace('/borrower/profile', { scroll: false });
    }
  }

  function loadFromUser() {
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
  }

  useEffect(() => {
    void listMyLoans()
      .then((loans) => setHasApplied(loans.length > 0))
      .catch(() => setHasApplied(false));
    void getLatestSalarySlip()
      .then(setSlip)
      .catch(() => setSlip(null));
  }, []);

  function onSlipFileChange(next: File | null) {
    setSlipMsg(null);
    if (!next) {
      setSlipFile(null);
      setSlipError(null);
      return;
    }
    const invalid = validateSalarySlipFile(next);
    if (invalid) {
      setSlipFile(null);
      setSlipError(
        invalid.toLowerCase().includes('type') || invalid.toLowerCase().includes('invalid')
          ? 'Wrong file type. Please upload a PDF, JPG or PNG file.'
          : 'File is too large. The maximum size is 5 MB.',
      );
      return;
    }
    setSlipFile(next);
    setSlipError(null);
  }

  async function onReplaceSlip(event: FormEvent) {
    event.preventDefault();
    if (!slipFile) {
      setSlipError('Choose a file first');
      return;
    }
    setSlipBusy(true);
    setSlipError(null);
    setSlipMsg(null);
    try {
      const uploaded = await uploadSalarySlip(slipFile);
      setSlip(uploaded);
      setSlipFile(null);
      setSlipMsg('Salary slip replaced.');
    } catch (err) {
      setSlipError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setSlipBusy(false);
    }
  }

  useEffect(() => {
    loadFromUser();
    // First visit with incomplete profile starts in edit mode.
    if (user && !user.profileComplete) {
      setEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when user identity/profile loads
  }, [
    user?.id,
    user?.profileComplete,
    user?.pan,
    user?.dateOfBirth,
    user?.monthlySalaryPaise,
  ]);

  // Account → Edit opens the form once, then drops ?edit=1 so Cancel/Save stay on profile.
  useEffect(() => {
    if (openInEdit && user?.profileComplete) {
      setFromAccountEdit(true);
      setEditing(true);
      clearEditQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openInEdit, user?.profileComplete]);

  const locked = Boolean(user?.profileComplete) && !editing;
  /** After apply / Account edit, never push the wizard “Continue” path from this screen. */
  const accountEditMode = hasApplied || fromAccountEdit;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (locked) return;
    if (salaryRupees === '' || Number.isNaN(salaryRupees)) {
      setError('Enter a monthly salary');
      return;
    }
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
        setEditing(false);
        clearEditQuery();
      }
    } catch (err) {
      const fromBre = breFromApiError(err);
      if (fromBre) setBre(fromBre);
      else setError(err instanceof ApiError ? err.message : 'Could not save profile');
    } finally {
      setBusy(false);
    }
  }

  function onCancelEdit() {
    loadFromUser();
    setError(null);
    setEditing(false);
    clearEditQuery();
  }

  return (
    <div className="space-y-4">
      {user?.profileComplete ? (
        <Link
          href="/borrower"
          className="inline-flex text-sm font-semibold text-teal hover:underline"
        >
          ← Back to account
        </Link>
      ) : null}
    <Panel className="w-full shadow-sm">
      <PageTitle
        title="Personal details"
        subtitle={
          locked
            ? 'Your details are saved. Click Edit below if you need to change them.'
            : accountEditMode
              ? 'Update your details. You will stay on this page after saving.'
              : 'We check your details against our eligibility rules before you continue.'
        }
      />

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name">
            <TextInput
              required
              disabled={locked}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label="PAN" hint="5 letters, 4 digits, 1 letter">
            <TextInput
              required
              disabled={locked}
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
              disabled={locked}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </Field>
          <Field label="Monthly Salary" hint="Minimum ₹25,000">
            <TextInput
              type="number"
              required
              disabled={locked}
              min={MIN_MONTHLY_SALARY_RUPEES}
              step={1000}
              value={salaryRupees}
              onChange={(e) => {
                const raw = e.target.value;
                setSalaryRupees(raw === '' ? '' : Number(raw));
              }}
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Employment Mode</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {EMPLOYMENT_MODES.map((mode) => {
              const selected = employmentMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  disabled={locked}
                  onClick={() => setEmploymentMode(mode)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium disabled:cursor-default disabled:opacity-90 ${
                    selected
                      ? 'border-teal bg-teal-soft text-teal'
                      : 'border-border bg-card text-ink hover:bg-background disabled:hover:bg-card'
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

        {locked ? (
          <div className="flex flex-wrap gap-3 pt-1">
            {accountEditMode ? (
              <GhostButton type="button" onClick={() => setEditing(true)}>
                Edit
              </GhostButton>
            ) : (
              <>
                <Link
                  href="/borrower/salary-slip"
                  className="rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-hover"
                >
                  Continue
                </Link>
                <GhostButton type="button" onClick={() => setEditing(true)}>
                  Edit
                </GhostButton>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 pt-1">
            <PrimaryButton type="submit" disabled={busy} className="bg-teal hover:bg-teal-hover">
              {busy
                ? 'Checking…'
                : user?.profileComplete
                  ? 'Save changes'
                  : 'Continue'}
            </PrimaryButton>
            {user?.profileComplete ? (
              <GhostButton type="button" onClick={onCancelEdit} disabled={busy}>
                Cancel
              </GhostButton>
            ) : null}
          </div>
        )}

        {!locked && bre && !bre.passed ? (
          <p className="text-xs text-muted">Continue unlocks once every rule passes.</p>
        ) : null}
      </form>
    </Panel>

      {/* Replace slip only after apply / Account → Edit. First-time wizard uses /borrower/salary-slip. */}
      {accountEditMode ? (
        <Panel className="w-full shadow-sm">
          <PageTitle
            title="Salary slip"
            subtitle={
              slip
                ? 'Replace the file on record if you need to upload a newer slip.'
                : 'Upload a salary slip (PDF, JPG or PNG, max 5 MB).'
            }
          />

          {slip ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  Current file
                </p>
                <p className="font-semibold text-ink">{slip.originalName}</p>
                <p className="text-muted">
                  {(slip.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <span className="rounded-full bg-teal-soft px-2.5 py-1 text-[11px] font-bold uppercase text-teal">
                On file
              </span>
            </div>
          ) : null}

          <form className="space-y-3" onSubmit={onReplaceSlip}>
            <label className="flex cursor-pointer flex-col items-start gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-5 hover:border-teal">
              <span className="text-sm font-semibold text-ink">
                {slip ? 'Choose a replacement file' : 'Choose a file'}
              </span>
              <span className="text-xs text-muted">
                PDF, JPG or PNG · max {(MAX_SALARY_SLIP_BYTES / (1024 * 1024)).toFixed(0)} MB
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-teal file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                onChange={(e) => onSlipFileChange(e.target.files?.[0] ?? null)}
              />
              {slipFile ? (
                <span className="text-sm text-foreground">
                  Selected: {slipFile.name} ({(slipFile.size / 1024).toFixed(1)} KB)
                </span>
              ) : null}
            </label>

            {slipError ? <p className="text-sm text-danger">{slipError}</p> : null}
            {slipMsg ? <p className="text-sm text-teal">{slipMsg}</p> : null}

            <PrimaryButton
              type="submit"
              disabled={slipBusy || !slipFile}
              className="bg-teal hover:bg-teal-hover"
            >
              {slipBusy ? 'Uploading…' : slip ? 'Replace salary slip' : 'Upload salary slip'}
            </PrimaryButton>
          </form>
        </Panel>
      ) : null}
    </div>
  );
}
