import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth-guard';

export default function SanctionLayout({ children }: { children: ReactNode }) {
  return <AuthGuard allow="sanction">{children}</AuthGuard>;
}
