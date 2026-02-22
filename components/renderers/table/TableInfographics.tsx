
import React from 'react';
import { InfographicMode, PageTheme, DensityLevel } from '../../../types';

interface TableInfographicsProps {
  mode: InfographicMode;
  value: number;
  maxValue: number;
  goalValue: number;
  theme: PageTheme;
  density: DensityLevel;
  accentColor?: string;
  midColor?: string;
}

export const TableInfographics: React.FC<TableInfographicsProps> = ({
  mode,
  value,
  maxValue,
  goalValue,
  theme,
  density,
  accentColor = '#00A7E7',
  midColor = '#0079C2'
}) => {
  const isBlueTheme = theme === 'BLUE';
  const goalPercent = (value / (goalValue || 100)) * 100;
  const maxSafe = maxValue || 1;
  const paddingVal = typeof density === 'number' ? density : 10;

  switch (mode) {
    case 'SPARKBAR':
      const barHeight = paddingVal <= 4 ? 'h-0.5' : paddingVal <= 10 ? 'h-1' : 'h-2';
      return (
        <div className={`w-full rounded-full overflow-hidden mt-1 ${isBlueTheme ? 'bg-white/5' : 'bg-slate-100'} ${barHeight}`}>
          <div className="h-full transition-all" style={{ width: `${Math.min((value / maxSafe) * 100, 100)}%`, background: `linear-gradient(to right, ${accentColor}, ${midColor})` }} />
        </div>
      );

    case 'GOAL':
      const goalColor = goalPercent >= 100 ? '#10B981' : (goalPercent >= 85 ? '#F59E0B' : '#EF4444');
      const trackHeight = paddingVal <= 8 ? 'h-0.5' : 'h-1';
      return (
        <div className={`flex flex-col items-center w-full max-w-[60px] mt-1`}>
          <div className={`w-full rounded-full overflow-hidden ${trackHeight} ${isBlueTheme ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div className={`h-full transition-all`} style={{ width: `${Math.min(goalPercent, 100)}%`, backgroundColor: goalColor }} />
          </div>
          <span className={`font-black ${paddingVal <= 6 ? 'text-[6px]' : 'text-[8px]'} mt-0.5 ${goalPercent >= 100 ? 'text-emerald-400' : (isBlueTheme ? 'text-blue-200/40' : 'text-slate-400')}`}>
            {goalPercent.toFixed(0)}%
          </span>
        </div>
      );

    case 'HEATMAP':
      const opacity = 0.1 + ((value / maxSafe) * 0.5);
      return <div className="absolute inset-0 z-0 transition-opacity" style={{ opacity, backgroundColor: midColor }} />;

    case 'STATUS':
      const dotColor = goalPercent >= 100 ? '#10B981' : (goalPercent >= 85 ? '#F59E0B' : '#EF4444');
      const dotSize = paddingVal <= 6 ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5';
      return <div className={`${dotSize} rounded-full mr-2 border border-white/50 shadow-sm shrink-0`} style={{backgroundColor: dotColor}} />;

    default:
      return null;
  }
};
