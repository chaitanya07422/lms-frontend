export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-deep">
      {status}
    </span>
  );
}
