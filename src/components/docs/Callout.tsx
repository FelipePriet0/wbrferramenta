import { AlertCircle, Info, Lightbulb } from 'lucide-react';

type CalloutType = 'info' | 'tip' | 'warning';

const STYLES: Record<CalloutType, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
  info:    { icon: <Info className="h-4 w-4 shrink-0 text-blue-500" />,    bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800'  },
  tip:     { icon: <Lightbulb className="h-4 w-4 shrink-0 text-emerald-500" />, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  warning: { icon: <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />, bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-800' },
};

export function Callout({
  type = 'info',
  children,
}: {
  type?: CalloutType;
  children: React.ReactNode;
}) {
  const s = STYLES[type];
  return (
    <div className={`not-prose my-4 flex gap-3 rounded-lg border px-4 py-3 ${s.bg} ${s.border}`}>
      <span className="mt-0.5">{s.icon}</span>
      <div className={`text-[13px] leading-relaxed ${s.text}`}>{children}</div>
    </div>
  );
}
