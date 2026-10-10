'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STEPS = [
  { href: '/borrower/profile', label: '1. Profile' },
  { href: '/borrower/salary-slip', label: '2. Salary slip' },
  { href: '/borrower/apply', label: '3. Apply' },
  { href: '/borrower/loans', label: '4. My loans' },
] as const;

export function BorrowerStepNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      <Link
        href="/borrower"
        className={`rounded-full px-3 py-1.5 text-sm ${
          pathname === '/borrower'
            ? 'bg-accent text-white'
            : 'bg-card text-foreground ring-1 ring-border hover:bg-accent-soft'
        }`}
      >
        Overview
      </Link>
      {STEPS.map((step) => {
        const active = pathname.startsWith(step.href);
        return (
          <Link
            key={step.href}
            href={step.href}
            className={`rounded-full px-3 py-1.5 text-sm ${
              active
                ? 'bg-accent text-white'
                : 'bg-card text-foreground ring-1 ring-border hover:bg-accent-soft'
            }`}
          >
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
