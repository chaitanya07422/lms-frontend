'use client';

import type { ReactNode } from 'react';

import { GhostButton, PrimaryButton } from '@/components/ui/field';

export function ConfirmModal({
  title,
  subtitle,
  children,
  confirmLabel,
  onCancel,
  onConfirm,
  busy,
  danger,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-2">
          <GhostButton type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </GhostButton>
          <PrimaryButton
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={danger ? 'bg-danger hover:bg-red-700' : ''}
          >
            {busy ? 'Working…' : confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
