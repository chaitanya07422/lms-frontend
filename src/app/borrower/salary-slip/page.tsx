'use client';

import { FormEvent, useEffect, useState } from 'react';

import { getLatestSalarySlip, uploadSalarySlip } from '@/lib/borrower-api';
import {
  MAX_SALARY_SLIP_BYTES,
  validateSalarySlipFile,
} from '@/lib/upload-limits';
import { ApiError } from '@/types/api';
import type { SalarySlipDto } from '@/types/loan';

export default function SalarySlipPage() {
  const [file, setFile] = useState<File | null>(null);
  const [latest, setLatest] = useState<SalarySlipDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getLatestSalarySlip()
      .then(setLatest)
      .catch(() => setLatest(null));
  }, []);

  function onFileChange(next: File | null) {
    setSuccess(null);
    if (!next) {
      setFile(null);
      setError(null);
      return;
    }
    // Client-side gate; API also enforces PDF/JPG/PNG ≤ 5 MB.
    const invalid = validateSalarySlipFile(next);
    if (invalid) {
      setFile(null);
      setError(invalid);
      return;
    }
    setFile(next);
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError('Choose a file first');
      return;
    }
    const invalid = validateSalarySlipFile(file);
    if (invalid) {
      setError(invalid);
      setFile(null);
      return;
    }
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const slip = await uploadSalarySlip(file);
      setLatest(slip);
      setSuccess(`Uploaded ${slip.originalName}`);
      setFile(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-ink">Salary slip</h2>
      <p className="mt-1 text-sm text-muted">
        PDF, JPG, or PNG only — max 5 MB (assignment Step 3). Rejected files are not uploaded.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block">File</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
          />
          <span className="mt-1 block text-xs text-muted">
            {file
              ? `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB / max ${(MAX_SALARY_SLIP_BYTES / (1024 * 1024)).toFixed(0)} MB)`
              : 'Click “Choose File”, pick a PDF/JPG/PNG (≤ 5 MB), then press Upload.'}
          </span>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
        {latest ? (
          <div className="rounded-xl bg-accent-soft px-4 py-3 text-sm">
            <p className="font-medium text-ink">Latest upload</p>
            <p className="text-muted">
              {latest.originalName} · {(latest.sizeBytes / 1024).toFixed(1)} KB ·{' '}
              {new Date(latest.createdAt).toLocaleString()}
            </p>
            <p className="mt-1 font-mono text-xs text-foreground">id: {latest.id}</p>
          </div>
        ) : (
          <p className="text-sm text-muted">No salary slip uploaded yet.</p>
        )}
      </div>
    </section>
  );
}
