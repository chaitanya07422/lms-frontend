import type { BreResult } from '@/types/loan';

export function BreResultPanel({ bre }: { bre: BreResult }) {
  if (bre.passed) {
    return (
      <div className="rounded-lg bg-teal-soft px-4 py-3 text-sm font-medium text-teal">
        You meet the eligibility criteria.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
      <p className="font-semibold">Your application can’t go ahead. These rules failed:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {bre.failures.map((f) => (
          <li key={`${f.rule}-${f.message}`}>{f.message}</li>
        ))}
      </ul>
    </div>
  );
}
