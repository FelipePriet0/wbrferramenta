'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { homeForRole } from '@/lib/redirectByRole';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { MagicCard } from '@/components/ui/magic-card';
import { WELCOME_CONFETTI_KEY } from '@/components/effects/welcome-confetti';
import { cn } from '@/lib/utils';

function GlassInputWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/50 backdrop-blur-sm transition-all focus-within:border-emerald-500 focus-within:bg-white/50">
      {children}
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn, role, loading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // "Session expired" notice when redirected with ?from=expired
  useEffect(() => {
    if (params.get('from') === 'expired') {
      setNotice('Sessão expirou, faça login de novo.');
    }
  }, [params]);

  // If already logged in, redirect to the role's home page.
  useEffect(() => {
    if (!loading && user && role) {
      router.replace(homeForRole(role));
    }
  }, [loading, user, role, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) {
      const msg = signInError.message || '';
      if (/invalid|password|credentials/i.test(msg)) {
        setError('Email ou senha inválidos.');
      } else if (/network|fetch/i.test(msg)) {
        setError('Sem conexão. Tente novamente.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
      setSubmitting(false);
      return;
    }
    // Mark this as a fresh login so WelcomeConfetti fires once on the first
    // authenticated page the user lands on (consumed on read).
    try {
      window.sessionStorage.setItem(WELCOME_CONFETTI_KEY, '1');
    } catch {
      // sessionStorage disabled — silently skip; non-blocking.
    }
    // The effect above handles the redirect via homeForRole.
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-zinc-900 md:flex-row-reverse">
      {/* Coluna direita — formulário */}
      <section className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <MagicCard
            mode="orb"
            glowFrom="#6ee7b7"
            glowTo="#ffffff"
            glowSize={600}
            glowBlur={80}
            glowOpacity={0.55}
            className="rounded-3xl"
          >
            <div className="flex flex-col gap-6 rounded-3xl bg-zinc-900/85 p-8 ring-1 ring-white/10 backdrop-blur-md">
            <h1 className="animate-element animate-delay-100 text-3xl font-extrabold leading-tight text-white md:text-4xl">
              Seja Bem-Vindo
            </h1>
            <p className="animate-element animate-delay-200 text-zinc-300">
              Acesse sua conta e continue sua jornada
            </p>

            {notice ? (
              <div className="animate-element animate-delay-200 rounded-2xl border border-amber-300/40 bg-amber-100/10 px-4 py-3 text-sm text-amber-200">
                {notice}
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                  E-mail
                </label>
                <GlassInputWrapper>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    disabled={submitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu E-mail"
                    className="w-full rounded-2xl bg-white p-4 text-sm text-black placeholder:text-black/60 focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-zinc-300" htmlFor="password">
                  Senha
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      disabled={submitting}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full rounded-2xl bg-white p-4 pr-12 text-sm text-black placeholder:text-black/60 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-black transition-colors hover:text-black/70" />
                      ) : (
                        <Eye className="h-5 w-5 text-black transition-colors hover:text-black/70" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {error ? (
                <div className="animate-element rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || !email || !password}
                className="animate-element animate-delay-500 w-full rounded-2xl bg-emerald-600 py-4 font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
            </div>
          </MagicCard>
        </div>
      </section>

      {/* Coluna esquerda — hero visual (escondido no mobile) */}
      <section className="relative hidden flex-1 p-4 md:block">
        <div className="animate-slide-right animate-delay-300 absolute inset-4 overflow-hidden rounded-3xl bg-cover bg-center shadow-lg shadow-white/10 transition-shadow duration-300 hover:shadow-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-zinc-900 to-emerald-600">
            <AnimatedGridPattern
              numSquares={30}
              maxOpacity={0.15}
              duration={3}
              repeatDelay={1}
              className={cn(
                'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12',
                'text-emerald-300/60 fill-emerald-300/30 stroke-emerald-300/30',
              )}
              style={{
                WebkitMaskImage:
                  'radial-gradient(500px circle at center, white, transparent)',
                maskImage:
                  'radial-gradient(500px circle at center, white, transparent)',
              }}
            />

            <div className="absolute inset-0">
              <div className="absolute left-0 top-0 h-96 w-96 animate-pulse rounded-full bg-emerald-500 opacity-20 blur-3xl" />
              <div
                className="absolute bottom-0 right-0 h-96 w-96 animate-pulse rounded-full bg-zinc-800 opacity-20 blur-3xl"
                style={{ animationDelay: '1s' }}
              />
            </div>

            <div className="relative z-10 flex h-full items-center justify-center">
              <Image
                src="/mznet-logo.png"
                alt="Mznet"
                width={480}
                height={600}
                priority
                className="h-auto w-[min(70%,360px)] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
