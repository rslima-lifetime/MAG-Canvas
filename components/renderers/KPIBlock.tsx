import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, Target, TrendingUp, Hash, Percent, DollarSign, Clock, Type, Binary, Calendar } from 'lucide-react';
import { PageTheme, KPIFormat, DesignSystem } from '../../types';
import { useFormatter } from '../../hooks/useFormatter';
import { parseNumber } from '../../utils/data-utils';

interface KPIBlockProps {
  label: string;
  current: number;
  prev: number;
  goal?: number;
  format: KPIFormat;
  abbreviate?: boolean;
  trendData?: string;
  subMeasures?: { label: string, value: string }[];
  theme: PageTheme;
  designSystem?: DesignSystem;
  isHighlighted?: boolean;
  isActive?: boolean;
  isCompact?: boolean;
  onUpdate?: (updates: any) => void;
  onFinish?: () => void;
  onClick?: () => void;
  showDelta?: boolean;
  showGoal?: boolean;
  showTrend?: boolean;
  showSubMeasures?: boolean;
}

const FORMATS: { type: KPIFormat, icon: any, label: string, unit?: string, prefix?: string }[] = [
  { type: 'DEFAULT', icon: Type, label: 'Auto' },
  { type: 'INTEGER', icon: Binary, label: '1' },
  { type: 'DECIMAL', icon: Binary, label: '1.0' },
  { type: 'PERCENT', icon: Percent, label: '%', unit: '%' },
  { type: 'CURRENCY', icon: DollarSign, label: 'R$', prefix: 'R$' },
  { type: 'TIME', icon: Clock, label: 'h', unit: 'h' },
  { type: 'DATE', icon: Calendar, label: 'Data' },
];

export const KPIBlock: React.FC<KPIBlockProps> = ({
  label, current = 0, prev = 0, goal, format, abbreviate = false, trendData = "", subMeasures = [], theme, designSystem = 'STANDARD', isHighlighted, isActive, isCompact = false, onUpdate, onFinish, onClick,
  showDelta = true, showGoal = true, showTrend = true, showSubMeasures = true
}) => {
  const isBlueTheme = theme === 'BLUE';
  const isFuture = designSystem === 'FUTURE';
  const { formatValue } = useFormatter();
  
  const [localCurrent, setLocalCurrent] = useState<string>((current ?? 0).toString());
  const [localPrev, setLocalPrev] = useState<string>((prev ?? 0).toString());
  const [localGoal, setLocalGoal] = useState<string>(goal?.toString() || "");

  // Gera um ID único para o gradiente SVG
  const gradientId = useMemo(() => `trend-grad-${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    if (isActive) {
      setLocalCurrent((current ?? 0).toString().replace('.', ','));
      setLocalPrev((prev ?? 0).toString().replace('.', ','));
      setLocalGoal(goal?.toString().replace('.', ',') || "");
    }
  }, [isActive, current, prev, goal]);

  const delta = (prev ?? 0) === 0 ? 0 : (((current ?? 0) - (prev ?? 0)) / (prev ?? 0)) * 100;
  const isPositive = delta > 0;
  const isZero = delta === 0;

  const attainment = goal ? ((current ?? 0) / goal) * 100 : 0;

  const chartPoints = useMemo(() => {
    const safeTrend = String(trendData || "");
    if (!safeTrend || !showTrend) return [];
    return safeTrend.split(',').map((v, i) => ({ val: parseFloat(v.trim()) || 0, id: i }));
  }, [trendData, showTrend]);

  const accentColor = isBlueTheme || isFuture ? (isFuture ? '#fff' : '#00A7E7') : '#0079C2';

  const handleValueChange = (field: 'current' | 'prev' | 'goal', value: string) => {
    if (field === 'current') setLocalCurrent(value);
    if (field === 'prev') setLocalPrev(value);
    if (field === 'goal') setLocalGoal(value);
    
    const numValue = parseNumber(value);
    if (onUpdate) onUpdate({ [field]: numValue });
  };

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) onUpdate({ [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      if (onFinish) onFinish();
    }
  };

  const inputBaseStyle = isBlueTheme 
    ? 'bg-white/10 text-white border-white/20 focus:bg-white/20 focus:border-white shadow-inner placeholder-white/30' 
    : 'bg-slate-50 text-[#006098] border-slate-200 focus:bg-white focus:border-[#0079C2] shadow-inner placeholder-slate-400';

  const currentFormatInfo = FORMATS.find(f => f.type === format);
  const paddingClass = isCompact ? 'px-2 pt-2' : 'px-4 pt-4';

  return (
    <div 
      onClick={(e) => {
        if (isHighlighted && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`flex flex-col h-full rounded-2xl border transition-all relative overflow-hidden select-none ${
        isFuture 
          ? (isBlueTheme ? 'bg-white/5 border-white/10' : 'bg-white border-[#00A7E7] shadow-sm') 
          : (isBlueTheme ? 'bg-white/10 border-white/10' : 'bg-white border-slate-100 shadow-sm')
      } ${isHighlighted ? 'ring-2 ring-[#00A7E7]/30 shadow-lg pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
    >
      
      {/* TOOLBAR FLUTUANTE */}
      {isActive && isHighlighted && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white shadow-2xl border border-slate-200 rounded-full p-1 z-[350] no-print min-w-max animate-in fade-in slide-in-from-bottom-2 duration-200">
          {FORMATS.map(f => {
            const FIcon = f.icon;
            const isSel = format === f.type;
            return (
              <button
                key={f.type}
                onClick={(e) => { e.stopPropagation(); handleUpdate('format', f.type); }}
                className={`w-7 h-7 flex flex-col items-center justify-center rounded-full transition-all ${isSel ? 'bg-[#0079C2] text-white' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <FIcon size={10} strokeWidth={3} />
                <span className="text-[6px] font-black uppercase">{f.label}</span>
              </button>
            )
          })}
          <div className="w-[1px] h-4 bg-slate-100 mx-1" />
          <button
            onClick={(e) => { e.stopPropagation(); handleUpdate('abbreviate', !abbreviate); }}
            className={`w-7 h-7 flex flex-col items-center justify-center rounded-full transition-all ${abbreviate ? 'bg-amber-50 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Hash size={12} strokeWidth={3} />
            <span className="text-[6px] font-black uppercase">k/mi</span>
          </button>
        </div>
      )}

      {/* --- CONTEÚDO SUPERIOR: LABEL, VALOR, VARIAÇÃO --- */}
      <div className={`flex flex-col ${paddingClass}`}>
        {/* Título */}
        <div className="flex justify-between items-start mb-1 relative z-20">
          {isActive && isHighlighted ? (
            <input 
              type="text"
              value={label}
              onChange={(e) => handleUpdate('label', e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`w-full text-[9px] font-black uppercase tracking-widest outline-none border rounded px-2 py-0.5 ${inputBaseStyle}`}
              placeholder="KPI LABEL"
            />
          ) : (
            <span className={`text-[9px] font-black uppercase tracking-widest truncate ${isBlueTheme ? 'text-blue-200/60' : 'text-slate-400'} ${isCompact ? 'text-[8px]' : ''}`}>
              {label || 'Título KPI'}
            </span>
          )}
          {!isActive && <Target size={isCompact ? 9 : 11} className={isBlueTheme ? 'text-blue-300/30' : 'text-slate-200'} />}
        </div>

        {/* Valor e Delta */}
        <div className={`flex items-baseline gap-2 relative z-20`}>
          {isActive && isHighlighted ? (
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex items-center w-full">
                  {currentFormatInfo?.prefix && !isCompact && <span className="absolute left-2 text-[10px] font-black text-slate-400 pointer-events-none">{currentFormatInfo.prefix}</span>}
                  <input 
                    type="text"
                    value={localCurrent}
                    onChange={(e) => handleValueChange('current', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full font-black tracking-tighter outline-none border rounded py-0.5 ${inputBaseStyle} ${isCompact ? 'text-[16px] px-1' : 'text-[24px] ' + (currentFormatInfo?.prefix ? 'pl-7' : 'px-2')} ${currentFormatInfo?.unit && !isCompact ? 'pr-5' : ''}`}
                  />
              </div>
            </div>
          ) : (
            <>
              <span className={`font-black tracking-tighter leading-none ${isBlueTheme ? 'text-white' : 'text-[#006098]'} ${isCompact ? 'text-[18px]' : 'text-[26px]'}`}>
                {formatValue(current ?? 0, format, abbreviate)}
              </span>
              {showDelta && (
                <div className={`flex items-center gap-0.5 font-black px-1.5 py-0.5 rounded-full ${isCompact ? 'text-[6px]' : 'text-[8px]'} ${
                  isZero ? 'text-slate-400 bg-slate-100' : (isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50')
                }`}>
                  {isZero ? <MinusIcon size={isCompact ? 5 : 7} /> : (isPositive ? <ArrowUpIcon size={isCompact ? 5 : 7} /> : <ArrowDownIcon size={isCompact ? 5 : 7} />)}
                  {Math.abs(delta).toFixed(isCompact ? 0 : 1)}%
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- META --- */}
      {showGoal && goal !== undefined && (
        <div className={`relative z-20 px-4 mt-3`}> 
          {!isCompact && (
            <div className="flex justify-between items-center mb-0.5 text-[7px] font-black uppercase tracking-tighter">
              {isActive && isHighlighted ? (
                <div className="flex items-center gap-1 w-full">
                  <span className={isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}>Meta:</span>
                  <input 
                    type="text"
                    value={localGoal}
                    onChange={(e) => handleValueChange('goal', e.target.value)}
                    className={`w-full text-[7px] font-black border rounded py-0.5 ${inputBaseStyle} px-1`}
                  />
                </div>
              ) : (
                <>
                  <span className={isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}>Meta</span>
                  <span className={isBlueTheme ? 'text-[#00A7E7]' : 'text-[#0079C2]'}>{attainment.toFixed(0)}%</span>
                </>
              )}
            </div>
          )}
          <div className={`${isCompact ? 'h-0.5' : 'h-1'} w-full rounded-full overflow-hidden ${isBlueTheme ? 'bg-white/10' : 'bg-slate-100'}`}>
            <div 
              className={`h-full transition-all duration-700 ${attainment >= 100 ? 'bg-emerald-500' : (attainment >= 85 ? 'bg-amber-400' : 'bg-[#0079C2]')}`} 
              style={{ width: `${Math.min(attainment, 100)}%` }} 
            />
          </div>
        </div>
      )}

      {/* --- RODAPÉ: SUBMEDIDAS + GRÁFICO --- */}
      <div className="flex flex-col justify-end w-full flex-1 mt-auto">
        {showSubMeasures && subMeasures.length > 0 && !isCompact && (
          <div className={`grid grid-cols-2 gap-x-2 gap-y-1 mb-1 px-4 z-10 pt-2 ${showTrend ? 'pb-2' : 'pb-4'}`}>
            {subMeasures.map((sm, i) => (
              <div key={i} className="flex flex-col">
                <span className={`text-[6.5px] font-black uppercase tracking-tighter opacity-50 ${isBlueTheme ? 'text-white' : 'text-slate-500'}`}>{sm.label}</span>
                <span className={`text-[9px] font-bold ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>{sm.value}</span>
              </div>
            ))}
          </div>
        )}

        {showTrend && chartPoints.length > 0 && (
          <div className={`w-full ${isCompact ? 'h-8' : 'h-10'} z-0`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints} margin={{ top: 5, left: 0, right: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke={accentColor} 
                  strokeWidth={isCompact ? 2 : 2.5} 
                  fillOpacity={1} 
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};