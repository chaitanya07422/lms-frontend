import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth-guard';

export default function CollectionLayout({ children }: { children: ReactNode }) {
  return <AuthGuard allow="collection">{children}</AuthGuard>;
}
