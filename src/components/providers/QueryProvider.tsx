'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { logError } from '@/lib/errors';

// Single QueryClient per browser tab. Default staleTime keeps recently-fetched
// data fresh long enough that the modal/expanded pages reopen instantly, but
// short enough that background revalidation still catches up.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            onError: (error) => logError('react-query/mutation', error),
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
