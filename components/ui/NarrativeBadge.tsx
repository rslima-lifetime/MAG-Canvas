
import React from 'react';
import { NarrativeBadge as NarrativeBadgeType, PageTheme } from '../../types';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, TrendingUp } from 'lucide-react';

interface NarrativeBadgeProps {
  type: NarrativeBadgeType;
  theme: PageTheme;
}

export const NarrativeBadge: React.FC<NarrativeBadgeProps> = ({ type, theme }) => {
  if (!type || type === 'NONE') return null;
  const isBlueTheme = theme === 'BLUE';

  const configs = {
    SUCCESS: { icon: CheckCircle2, color: isBlueTheme ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'Positivo' },
    WARNING: { icon: AlertTriangle, color: isBlueTheme ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200', text: 'Atenção' },
    CRITICAL: { icon: AlertCircle, color: isBlueTheme ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-700 border-rose-200', text: 'Crítico' },
    INFO: { icon: Info, color: isBlueTheme ? 'bg-blue-500/20 text-blue-200 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200', text: 'Info' },
    TREND: { icon: TrendingUp, color: isBlueTheme ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' : 'bg-slate-100 text-slate-700 border-slate-200', text: 'Tendência' },
  };

  const config = configs[type as keyof typeof configs];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest absolute top-2 right-2 z-10 ${config.color} backdrop-blur-sm`}>
      <Icon size={8} strokeWidth={3} />
      {config.text}
    </div>
  );
};
