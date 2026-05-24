import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = { title: 'Entrar — Mznet' };

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-zinc-900">
          <p className="text-sm text-zinc-400">Carregando…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
