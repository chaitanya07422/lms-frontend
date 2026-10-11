'use client';

import Link from 'next/link';

export type StepState = 'done' | 'current' | 'upcoming';

export type WizardStep = {
  key: string;
  label: string;
  href?: string;
  state: StepState;
};

const STATE_LABEL: Record<StepState, string> = {
  done: 'Done',
  current: 'In progress',
  upcoming: 'Upcoming',
};

/** Horizontal application stepper. */
export function ProgressStepper({ steps }: { steps: WizardStep[] }) {
  return (
    <nav className="w-full px-4 pt-6 pb-2 sm:px-6 lg:px-8">
      <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {steps.map((step, index) => {
          const line =
            step.state === 'done'
              ? 'bg-teal'
              : step.state === 'current'
                ? 'bg-teal'
                : 'bg-border';
          const title =
            step.state === 'current'
              ? 'text-teal'
              : step.state === 'upcoming'
                ? 'text-ink'
                : 'text-ink';
          const body = (
            <>
              <span className={`mb-2 block h-1 w-full rounded-full ${line}`} />
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Step {index + 1} · {STATE_LABEL[step.state]}
              </span>
              <span className={`mt-0.5 block text-sm font-bold ${title}`}>{step.label}</span>
            </>
          );

          if (step.href && step.state !== 'upcoming') {
            return (
              <li key={step.key}>
                <Link href={step.href} className="block">
                  {body}
                </Link>
              </li>
            );
          }

          return <li key={step.key}>{body}</li>;
        })}
      </ol>
    </nav>
  );
}

export function WizardShell({
  steps,
  children,
  showSteps = true,
}: {
  steps: WizardStep[];
  children: React.ReactNode;
  showSteps?: boolean;
}) {
  return (
    <div className="w-full px-4 pb-12 sm:px-6 lg:px-8">
      {showSteps ? <ProgressStepper steps={steps} /> : null}
      <div className={showSteps ? 'mt-8 min-w-0' : 'mt-8 min-w-0 pt-2'}>{children}</div>
    </div>
  );
}
