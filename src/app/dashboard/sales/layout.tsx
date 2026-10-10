import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth-guard';

export default function SalesLayout({ children }: { children: ReactNode }) {
  return <AuthGuard allow="sales">{children}</AuthGuard>;
}
