const STAGES = ['APPLIED', 'SANCTIONED', 'DISBURSED', 'CLOSED'] as const;

export function LoanLifecycle({ status }: { status: string }) {
  if (status === 'REJECTED') {
    return (
      <div className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
        Application rejected — lifecycle stopped.
      </div>
    );
  }

  const current = STAGES.indexOf(status as (typeof STAGES)[number]);

  return (
    <div>
      <h3 className="text-sm font-bold text-ink">Loan lifecycle</h3>
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
            <li key={stage} className={`rounded-xl border px-3 py-3 ${style}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider">{tag}</p>
              <p className="mt-1 text-sm font-semibold capitalize">{stage.toLowerCase()}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
