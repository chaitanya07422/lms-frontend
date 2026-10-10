'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import { PrimaryButton } from '@/components/ui/field';
import { Panel, PageTitle } from '@/components/ui/panel';
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
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    void getLatestSalarySlip()
      .then(setLatest)
      .catch(() => setLatest(null));
  }, []);

  function onFileChange(next: File | null) {
    if (!next) {
      setFile(null);
      setError(null);
      return;
    }
    const invalid = validateSalarySlipFile(next);
    if (invalid) {
      setFile(null);
      setError(
        invalid.toLowerCase().includes('type') || invalid.toLowerCase().includes('invalid')
          ? 'Wrong file type. Please upload a PDF, JPG or PNG file.'
          : 'File is too large. The maximum size is 5 MB.',
      );
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
    setBusy(true);
    setError(null);
    try {
      const slip = await uploadSalarySlip(file);
      setLatest(slip);
      setFile(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="max-w-2xl shadow-sm">
      <PageTitle
        title="Upload your salary slip"
        subtitle="Your slip is stored and linked to your application."
      />

      <form className="space-y-4" onSubmit={onSubmit}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFileChange(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`rounded-xl border-2 border-dashed px-6 py-12 text-center ${
            dragOver ? 'border-teal bg-teal-soft' : 'border-border bg-background'
          }`}
        >
          <p className="font-semibold text-ink">Drag and drop your salary slip here</p>
          <p className="mt-1 text-sm text-muted">
            PDF, JPG or PNG. Maximum {(MAX_SALARY_SLIP_BYTES / (1024 * 1024)).toFixed(0)} MB
          </p>
          <label className="mt-5 inline-flex cursor-pointer rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-hover">
            Choose file
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          {file ? (
            <p className="mt-3 text-sm text-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          ) : null}
        </div>

        {latest ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Uploaded file</p>
              <p className="font-semibold text-ink">{latest.originalName}</p>
              <p className="text-muted">{(latest.sizeBytes / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
            <span className="rounded-full bg-teal-soft px-2.5 py-1 text-[11px] font-bold uppercase text-teal">
              Uploaded
            </span>
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          {file ? (
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? 'Uploading…' : 'Upload'}
            </PrimaryButton>
          ) : null}
          {latest ? (
            <Link
              href="/borrower/apply"
              className="rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-hover"
            >
              Continue
            </Link>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}
