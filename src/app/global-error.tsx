'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="pt-BR">
      <body className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <p className="text-sm text-neutral-400">Algo inesperado aconteceu.</p>
          <button
            onClick={reset}
            className="px-4 py-2 text-sm rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
