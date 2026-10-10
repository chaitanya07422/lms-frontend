import type { BreResult } from '@/types/loan';

export function BreResultPanel({ bre }: { bre: BreResult }) {
  if (bre.passed) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        You meet the criteria.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      You do not meet the requirements.
    </div>
  );
}
