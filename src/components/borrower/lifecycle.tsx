const STAGES = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SANCTIONED', label: 'Approved' },
  { key: 'DISBURSED', label: 'Money sent' },
  { key: 'CLOSED', label: 'Closed' },
] as const;

export function LoanLifecycle({ status }: { status: string }) {
  if (status === 'REJECTED') {
    return (
      <div className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
        Application not approved — this loan is closed for review.
      </div>
    );
  }

  const current = STAGES.findIndex((s) => s.key === status);

  return (
    <div>
      <h3 className="text-sm font-bold text-ink">Where you are</h3>
      <ol className="mt-3 grid gap-2 sm:grid-cols-4">
        {STAGES.map((stage, index) => {
          let tag = 'Later';
          let style = 'border-border bg-background text-muted';
          if (index < current) {
            tag = 'Done';
            style = 'border-teal/30 bg-teal-soft text-teal';
          } else if (index === current) {
            tag = 'Now';
            style = 'border-teal bg-teal-soft text-teal';
          } else if (index === current + 1) {
            tag = 'Next';
            style = 'border-amber-200 bg-amber-50 text-amber-800';
          }
          return (
            <li key={stage.key} className={`rounded-xl border px-3 py-3 ${style}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider">{tag}</p>
              <p className="mt-1 text-sm font-semibold">{stage.label}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
