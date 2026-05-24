'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-neutral-100">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <p className="text-sm text-neutral-400">Algo deu errado nesta página.</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
