const STYLES: Record<string, string> = {
  APPLIED: 'bg-orange-100 text-orange-800',
  SANCTIONED: 'bg-sky-100 text-sky-800',
  DISBURSED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-100 text-slate-700',
  REJECTED: 'bg-red-100 text-red-800',
  SIGNED_UP: 'bg-slate-100 text-slate-700',
  DETAILS_DONE: 'bg-violet-100 text-violet-800',
  SLIP_UPLOADED: 'bg-violet-100 text-violet-800',
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        STYLES[status] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {label}
    </span>
  );
}
