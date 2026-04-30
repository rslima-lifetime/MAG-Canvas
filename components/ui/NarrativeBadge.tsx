
import React from 'react';
import { PageTheme } from '../../types';
import { Info, AlertCircle, CheckCircle2, MessageSquare, Star, Zap } from 'lucide-react';

interface NarrativeBadgeProps {
  type: string;
  theme: PageTheme;
}

export const NarrativeBadge: React.FC<NarrativeBadgeProps> = ({ type, theme }) => {
  if (!type || type === 'NONE') return null;

  const isBlueTheme = theme === 'BLUE';

  const config: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
    INFO: { label: 'Informação', icon: Info, color: '#0079C2', bgColor: isBlueTheme ? 'bg-blue-500/20' : 'bg-blue-50' },
    WARNING: { label: 'Atenção', icon: AlertCircle, color: '#F59E0B', bgColor: isBlueTheme ? 'bg-amber-500/20' : 'bg-amber-50' },
    SUCCESS: { label: 'Sucesso', icon: CheckCircle2, color: '#10B981', bgColor: isBlueTheme ? 'bg-emerald-500/20' : 'bg-emerald-50' },
    INSIGHT: { label: 'Insight', icon: Zap, color: '#8B5CF6', bgColor: isBlueTheme ? 'bg-violet-500/20' : 'bg-violet-50' },
    CRITICAL: { label: 'Crítico', icon: AlertCircle, color: '#EF4444', bgColor: isBlueTheme ? 'bg-rose-500/20' : 'bg-rose-50' },
    FEATURE: { label: 'Destaque', icon: Star, color: '#F59E0B', bgColor: isBlueTheme ? 'bg-amber-500/20' : 'bg-amber-50' },
  };

  const badge = config[type] || config.INFO;
  const Icon = badge.icon;

  return (
    <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full border border-transparent shadow-sm z-20 ${badge.bgColor}`}>
      <Icon size={10} style={{ color: badge.color }} />
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: badge.color }}>
        {badge.label}
      </span>
    </div>
  );
};
