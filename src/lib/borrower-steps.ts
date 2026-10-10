import type { WizardStep } from '@/components/borrower/step-rail';

type Key = 'account' | 'profile' | 'salary' | 'apply';

const ORDER: Key[] = ['account', 'profile', 'salary', 'apply'];

const LABELS: Record<Key, string> = {
  account: 'Account',
  profile: 'Personal details',
  salary: 'Salary slip',
  apply: 'Loan & apply',
};

export function borrowerWizardSteps(opts: {
  authenticated: boolean;
  profileComplete: boolean;
  hasSlip: boolean;
  hasApplied: boolean;
  pathname: string;
}): WizardStep[] {
  const { authenticated, profileComplete, hasSlip, hasApplied, pathname } = opts;

  const done: Record<Key, boolean> = {
    account: authenticated,
    profile: profileComplete,
    salary: hasSlip,
    apply: hasApplied,
  };

  const href: Record<Key, string | undefined> = {
    account: authenticated ? '/borrower' : '/register',
    profile: authenticated ? '/borrower/profile' : undefined,
    salary: authenticated ? '/borrower/salary-slip' : undefined,
    apply: authenticated ? '/borrower/apply' : undefined,
  };

  let pathKey: Key | null = null;
  if (pathname.startsWith('/register') || pathname.startsWith('/login')) pathKey = 'account';
  else if (pathname.startsWith('/borrower/profile')) pathKey = 'profile';
  else if (pathname.startsWith('/borrower/salary-slip')) pathKey = 'salary';
  else if (
    pathname.startsWith('/borrower/apply') ||
    pathname.startsWith('/borrower/loans')
  ) {
    pathKey = 'apply';
  }

  const firstOpen = ORDER.find((k) => !done[k]) ?? 'apply';

  return ORDER.map((key) => {
    let state: WizardStep['state'];
    if (done[key]) {
      state = 'done';
    } else if (pathKey === key || (!pathKey && key === firstOpen) || key === firstOpen) {
      // Highlight the active path step, else the first incomplete step
      state =
        pathKey != null
          ? pathKey === key
            ? 'current'
            : key === firstOpen
              ? 'current'
              : 'upcoming'
          : key === firstOpen
            ? 'current'
            : 'upcoming';
    } else {
      state = 'upcoming';
    }

    // Collapse to a single current: prefer pathKey when incomplete
    if (!done[key]) {
      const preferred = pathKey && !done[pathKey] ? pathKey : firstOpen;
      state = key === preferred ? 'current' : 'upcoming';
    }

    return {
      key,
      label: LABELS[key],
      href: href[key],
      state,
    };
  });
}
