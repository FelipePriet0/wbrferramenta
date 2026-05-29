import type { LucideIcon } from 'lucide-react';

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'featured';

type Props = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  tone?: Tone;
  onClick?: () => void;
};

const TONE_BORDER: Record<Tone, string> = {
  neutral:  'border-zinc-200',
  good:     'border-emerald-200',
  warn:     'border-amber-200',
  bad:      'border-red-200',
  featured: 'border-transparent',
};

const TONE_ICON: Record<Tone, string> = {
  neutral:  'text-zinc-400 bg-zinc-100',
  good:     'text-emerald-600 bg-emerald-50',
  warn:     'text-amber-600 bg-amber-50',
  bad:      'text-red-600 bg-red-50',
  featured: 'text-white bg-white/20',
};

const TONE_TITLE: Record<Tone, string> = {
  neutral:  'text-zinc-500',
  good:     'text-zinc-500',
  warn:     'text-zinc-500',
  bad:      'text-zinc-500',
  featured: 'text-white/80',
};

const TONE_VALUE: Record<Tone, string> = {
  neutral:  'text-zinc-900',
  good:     'text-zinc-900',
  warn:     'text-zinc-900',
  bad:      'text-zinc-900',
  featured: 'text-white',
};

const TONE_SUBTITLE: Record<Tone, string> = {
  neutral:  'text-zinc-400',
  good:     'text-zinc-400',
  warn:     'text-zinc-400',
  bad:      'text-zinc-400',
  featured: 'text-white/60',
};

export function KPICard({ title, value, subtitle, icon: Icon, tone = 'neutral', onClick }: Props) {
  const Tag = onClick ? 'button' : 'div';

  const isFeatured = tone === 'featured';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-shadow ${TONE_BORDER[tone]} ${
        isFeatured ? '' : 'bg-white'
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      style={
        isFeatured
          ? {
              background:
                'linear-gradient(135deg, #FF6600 0%, #ffffff 100%)',
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm font-semibold ${TONE_TITLE[tone]}`}>{title}</span>
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${TONE_ICON[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className={`text-3xl font-bold tabular-nums ${TONE_VALUE[tone]}`}>{value}</div>
      {subtitle && <p className={`text-xs ${TONE_SUBTITLE[tone]}`}>{subtitle}</p>}
    </Tag>
  );
}
