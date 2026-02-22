
import React, { useMemo } from 'react';
import { PageTheme, KPIFormat } from '../../types';
import { useFormatter } from '../../hooks/useFormatter';

interface GaugeBlockProps {
  value: number;
  min: number;
  max: number;
  lowThreshold: number;
  highThreshold: number;
  unit?: string;
  format?: KPIFormat;
  abbreviate?: boolean;
  theme?: PageTheme;
  isHighlighted?: boolean;
  onUpdate?: (updates: any) => void;
  invertColors?: boolean;
}

export const GaugeBlock: React.FC<GaugeBlockProps> = ({
  value = 0, min = 0, max = 100, lowThreshold = 30, highThreshold = 70, 
  unit = '', format = 'DEFAULT', abbreviate = false,
  theme = 'LIGHT', isHighlighted, onUpdate, invertColors = false
}) => {
  const isBlueTheme = theme === 'BLUE';
  const { formatValue } = useFormatter();
  
  const calculateAngle = (val: number) => {
    const range = max - min || 1;
    const percentage = Math.min(Math.max((val - min) / range, 0), 1);
    return -90 + (percentage * 180);
  };

  const needleAngle = calculateAngle(value);
  
  const colors = {
    critical: invertColors ? '#10B981' : '#EF4444',
    warning: '#F59E0B',
    success: invertColors ? '#EF4444' : '#10B981',
    bg: isBlueTheme ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
  };

  const getStatusColor = () => {
    if (invertColors) {
      if (value >= highThreshold) return colors.critical;
      if (value >= lowThreshold) return colors.warning;
      return colors.success;
    }
    if (value >= highThreshold) return colors.success;
    if (value >= lowThreshold) return colors.warning;
    return colors.critical;
  };

  const statusColor = getStatusColor();

  const handleValueChange = (newVal: string) => {
    const textContent = newVal.replace(/<[^>]*>/g, '').trim();
    const clean = textContent.replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    
    if (!isNaN(num)) {
      onUpdate?.({ value: num });
    } else {
      onUpdate?.({ value: value });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const arcLength = 251.32; 

  const ticks = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 20; i++) {
      const angle = -180 + (i * 9);
      const isMajor = i % 5 === 0;
      const length = isMajor ? 10 : 5;
      const rad = (angle * Math.PI) / 180;
      const x1 = 100 + 80 * Math.cos(rad);
      const y1 = 100 + 80 * Math.sin(rad);
      const x2 = 100 + (80 - length) * Math.cos(rad);
      const y2 = 100 + (80 - length) * Math.sin(rad);
      lines.push({ x1, y1, x2, y2, isMajor });
    }
    return lines;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full py-2 relative group/gauge">
      <div className="relative w-full max-w-[260px] aspect-[2/1.3] flex items-end justify-center overflow-visible">
        <svg viewBox="0 0 200 140" className="w-full h-full overflow-visible drop-shadow-sm">
          <defs>
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" />
              <feOffset dx="0" dy="1.5" result="offsetblur" />
              <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor={isBlueTheme ? '#fff' : '#415364'} />
               <stop offset="100%" stopColor={isBlueTheme ? '#00A7E7' : '#006098'} />
            </linearGradient>
          </defs>

          {/* 1. Trilho de Fundo e Performance */}
          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke={colors.bg} 
            strokeWidth="14" 
            strokeLinecap="butt" 
          />
          
          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke={colors.critical} 
            strokeWidth="14" 
            strokeDasharray={`${(lowThreshold - min) / (max - min) * arcLength} ${arcLength}`}
          />

          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke={colors.warning} 
            strokeWidth="14" 
            strokeDashoffset={`-${(lowThreshold - min) / (max - min) * arcLength}`}
            strokeDasharray={`${(highThreshold - lowThreshold) / (max - min) * arcLength} ${arcLength}`}
          />

          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke={colors.success} 
            strokeWidth="14" 
            strokeDashoffset={`-${(highThreshold - min) / (max - min) * arcLength}`}
            strokeDasharray={`${(max - highThreshold) / (max - min) * arcLength} ${arcLength}`}
          />

          {/* 2. Marcadores de Escala */}
          {ticks.map((t, i) => (
            <line 
              key={i} 
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} 
              stroke={isBlueTheme ? 'rgba(255,255,255,0.3)' : '#cbd5e1'} 
              strokeWidth={t.isMajor ? 1.2 : 0.8} 
            />
          ))}

          {/* 3. Display Digital */}
          <foreignObject x="30" y="45" width="140" height="90" className="overflow-visible">
            <div className="w-full h-full flex flex-col items-center justify-start pointer-events-none pt-2">
              <div className="flex items-baseline gap-0.5 pointer-events-auto">
                <span 
                  contentEditable={isHighlighted}
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  onBlur={(e) => handleValueChange(e.currentTarget.innerHTML)}
                  className={`text-4xl font-black tracking-tighter outline-none transition-all px-1.5 rounded-xl whitespace-nowrap overflow-hidden inline-block ${
                    isHighlighted ? 'bg-blue-50/20 hover:bg-blue-50/40 cursor-text ring-1 ring-[#00A7E7]/20 min-w-[30px] text-center focus:bg-white focus:text-[#006098] focus:shadow-xl' : ''
                  } ${isBlueTheme ? 'text-white drop-shadow-md' : 'text-[#006098]'}`}
                >
                  {formatValue(value, format, abbreviate)}
                </span>
                {unit && (
                  <span className={`text-[12px] font-black uppercase opacity-40 ml-1 shrink-0 ${isBlueTheme ? 'text-white' : 'text-slate-500'}`}>
                    {unit}
                  </span>
                )}
              </div>
              
              <div 
                className={`px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] text-white shadow-lg mt-7 border border-white/30 transition-all duration-500 shrink-0`}
                style={{ backgroundColor: statusColor }}
              >
                {value >= highThreshold ? (invertColors ? 'Crítico' : 'Excelente') : (value >= lowThreshold ? 'Regular' : (invertColors ? 'Excelente' : 'Crítico'))}
              </div>
            </div>
          </foreignObject>

          {/* 4. Agulha (Revertida para 2px de espessura na base) */}
          <g transform={`rotate(${needleAngle}, 100, 100)`} filter="url(#gaugeShadow)" className="transition-transform duration-[1500ms] cubic-bezier(0.34, 1.56, 0.64, 1) pointer-events-none">
            <path 
              d="M 98 100 L 100 22 L 102 100 Z" 
              fill="url(#needleGrad)" 
            />
            <circle cx="100" cy="100" r="8" fill={isBlueTheme ? '#004a76' : '#fff'} stroke={isBlueTheme ? '#fff' : '#415364'} strokeWidth="1.5" />
            <circle cx="100" cy="100" r="3" fill={isBlueTheme ? '#00A7E7' : '#0079C2'} />
          </g>

          <text x="18" y="118" textAnchor="middle" fontSize="7" fontWeight="900" className="uppercase tracking-tighter" fill={isBlueTheme ? 'rgba(255,255,255,0.4)' : '#94a3b8'}>{formatValue(min, format, abbreviate)}</text>
          <text x="182" y="118" textAnchor="middle" fontSize="7" fontWeight="900" className="uppercase tracking-tighter" fill={isBlueTheme ? 'rgba(255,255,255,0.4)' : '#94a3b8'}>{formatValue(max, format, abbreviate)}</text>
        </svg>
      </div>
    </div>
  );
};
