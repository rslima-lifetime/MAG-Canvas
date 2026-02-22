import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, Hash, Percent, DollarSign, Clock, Type, Binary, Calendar, TrendingUp, Target } from 'lucide-react';
import { KPIData, KPIFormat, PageTheme, DesignSystem } from '../types';
import { parseNumber } from '../utils/data-utils';
import { useFormatter } from '../hooks/useFormatter';

interface KPI_CardProps extends KPIData {
  className?: string;
  theme?: PageTheme;
  designSystem?: DesignSystem;
  isActive?: boolean;
  isCompact?: boolean;
  onClick?: () => void;
  onUpdate?: (updates: Partial<KPIData>) => void;
  onDuplicate?: () => void;
  onFinish?: () => void;
  isEditable?: boolean;
}

const FORMATS: { type: KPIFormat, icon: any, label: string, unit?: string, prefix?: string }[] = [
  { type: 'DEFAULT', icon: Type, label: 'Auto' },
  { type: 'INTEGER', icon: Binary, label: '1' },
  { type: 'DECIMAL', icon: Binary, label: '1.0' },
  { type: 'PERCENT', icon: Percent, label: '%', unit: '%' },
  { type: 'CURRENCY', icon: DollarSign, label: 'R$', prefix: 'R$' },
  { type: 'TIME', icon: Clock, label: 'h', unit: 'h' },
  { type: 'DATE', icon: Calendar, label: 'd' },
];

const KPI_Card: React.FC<KPI_CardProps> = ({ 
  label, current = 0, prev = 0, format = 'DEFAULT', theme = 'LIGHT', designSystem = 'STANDARD', className = "",
  isActive = false, isCompact = false, onClick, onUpdate, onDuplicate, onFinish, isEditable = false,
  abbreviate = false, goal, subMeasures = [],
  showDelta = true, showGoal = true, showSubMeasures = true
}) => {
  const isBlueTheme = theme === 'BLUE';
  const isFuture = designSystem === 'FUTURE';
  const { formatValue } = useFormatter();
  
  const [localCurrent, setLocalCurrent] = useState<string>((current ?? 0).toString());
  const [localPrev, setLocalPrev] = useState<string>((prev ?? 0).toString());
  const [localGoal, setLocalGoal] = useState<string>(goal?.toString() || "");

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

  const handleSubMeasureUpdate = (idx: number, field: string, value: string) => {
    if (!onUpdate) return;
    const newSubs = [...subMeasures];
    newSubs[idx] = { ...newSubs[idx], [field]: value };
    onUpdate({ subMeasures: newSubs });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      if (onFinish) onFinish();
    }
  };
  
  const cardStyle = useMemo(() => {
    if (isFuture) {
      return isActive 
        ? (isBlueTheme ? 'bg-white/25 border-white ring-4 ring-white/10' : 'bg-white border-[#00A7E7] shadow-xl')
        : (isBlueTheme ? 'bg-white/5 border-white/5 backdrop-blur-sm' : 'bg-white border-slate-50 hover:bg-slate-50/50');
    }
    return isActive 
        ? (isBlueTheme ? 'bg-white/20 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] z-20 scale-[1.02]' : 'bg-white border-[#00A7E7] shadow-[0_4px_20px_rgba(0,167,231,0.15)] z-20 scale-[1.02]') 
        : (isBlueTheme ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-white border-slate-100 hover:border-slate-200');
  }, [isActive, isFuture, isBlueTheme]);

  const inputBaseStyle = isBlueTheme 
    ? 'bg-white/10 text-white border-white/20 focus:bg-white/20 focus:border-white shadow-inner placeholder-white/30' 
    : 'bg-slate-50 text-[#006098] border-slate-200 focus:bg-white focus:border-[#0079C2] shadow-inner placeholder-slate-400';

  const currentFormatInfo = FORMATS.find(f => f.type === format);
  const pClass = isCompact ? 'p-2.5' : 'p-4';

  return (
    <div 
      onClick={(e) => {
        if (isEditable && onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={`rounded-2xl flex flex-col transition-all border group relative h-auto min-h-fit overflow-visible ${
      isEditable ? 'cursor-pointer' : ''
    } ${cardStyle} ${className}`}
    >
      {isActive && isEditable && (
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
          <div className="w-[1px] h-4 bg-slate-100 mx-1" />
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}
            className="w-7 h-7 flex flex-col items-center justify-center rounded-full transition-all text-[#0079C2] hover:bg-blue-50"
          >
            <TrendingUp size={12} strokeWidth={3} className="rotate-90" />
            <span className="text-[6px] font-black uppercase">Dup</span>
          </button>
        </div>
      )}

      <div className={`flex-1 relative flex flex-col ${pClass}`}>
        <div className="flex justify-between items-start mb-1 z-10 w-full overflow-hidden">
          {isActive && isEditable ? (
            <input 
              type="text"
              value={label}
              onChange={(e) => handleUpdate('label', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`w-full text-[9px] font-black uppercase tracking-widest outline-none border rounded px-2 py-0.5 ${inputBaseStyle}`}
              placeholder="LABEL"
            />
          ) : (
            <span className={`font-black uppercase tracking-widest truncate leading-none ${
              isBlueTheme ? 'text-blue-100/60' : 'text-slate-400'
            } ${isCompact ? 'text-[7px]' : 'text-[9px]'}`} title={label}>
              {label}
            </span>
          )}
          {!isActive && (
            <Hash size={isCompact ? 10 : 12} className={isBlueTheme ? 'text-blue-300/30' : 'text-blue-100'} />
          )}
        </div>
        
        <div className={`flex flex-col items-start z-10 w-full ${isCompact ? 'mb-2' : 'mb-4'}`}>
          {isActive && isEditable ? (
            <div className="flex flex-col gap-1 w-full">
              <div className="relative flex items-center w-full">
                 {currentFormatInfo?.prefix && !isCompact && <span className="absolute left-2 text-[12px] font-black text-slate-400 pointer-events-none">{currentFormatInfo.prefix}</span>}
                 <input 
                  type="text"
                  value={localCurrent}
                  onChange={(e) => handleValueChange('current', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={handleKeyDown}
                  className={`w-full font-black tracking-tighter outline-none border rounded py-0.5 ${inputBaseStyle} ${isCompact ? 'text-[18px] px-1' : 'text-[26px] ' + (currentFormatInfo?.prefix ? 'pl-8' : 'px-2')} ${currentFormatInfo?.unit && !isCompact ? 'pr-6' : ''}`}
                 />
                 {currentFormatInfo?.unit && !isCompact && <span className="absolute right-2 text-[14px] font-black text-[#00A7E7] pointer-events-none">{currentFormatInfo.unit}</span>}
              </div>
            </div>
          ) : (
            <>
              <span className={`font-black tracking-tighter leading-none whitespace-nowrap ${
                isBlueTheme ? 'text-white' : 'text-[#006098]'
              } ${isCompact ? 'text-[18px]' : 'text-[26px]'} ${isFuture ? 'text-shadow-sm' : ''}`}>
                {formatValue(current ?? 0, format as KPIFormat, abbreviate)}
              </span>
              
              {showDelta && (
                <div className={`flex items-center gap-1 mt-1 font-bold tracking-tight whitespace-nowrap ${isCompact ? 'text-[8px]' : 'text-[10px]'} ${
                  isZero 
                  ? (isBlueTheme ? 'text-blue-300/60' : 'text-slate-400') 
                  : (isPositive 
                      ? (isBlueTheme ? 'text-emerald-300' : 'text-emerald-600') 
                      : (isBlueTheme ? 'text-rose-300' : 'text-rose-600'))
                }`}>
                  {isZero ? <MinusIcon size={isCompact ? 10 : 12} strokeWidth={3} /> : (isPositive ? <ArrowUpIcon size={isCompact ? 10 : 12} strokeWidth={3} /> : <ArrowDownIcon size={isCompact ? 10 : 12} strokeWidth={3} />)}
                  <span>{Math.abs(delta).toFixed(isCompact ? 0 : 1)}%</span>
                  <span className={`font-medium ${isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'} ml-1`}>vs. anterior</span>
                </div>
              )}
            </>
          )}
        </div>

        {showGoal && goal !== undefined && (
          <div className={`z-10 w-full ${isCompact ? 'mt-auto mb-1' : 'mt-auto mb-2'}`}>
            {!isCompact && (
              <div className="flex justify-between items-center mb-1 text-[7px] font-black uppercase tracking-tighter">
                 {isActive && isEditable ? (
                   <div className="flex items-center gap-1.5 w-full">
                      <span className={isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}>META:</span>
                      <input 
                        type="text" 
                        value={localGoal}
                        onChange={(e) => handleValueChange('goal', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-16 text-[8px] font-black border rounded px-1.5 py-0.5 ${inputBaseStyle}`}
                      />
                   </div>
                 ) : (
                   <>
                     <span className={isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}>Meta: {formatValue(goal, format, abbreviate)}</span>
                     <span className={isBlueTheme ? 'text-[#00A7E7]' : 'text-[#0079C2]'}>{attainment.toFixed(0)}%</span>
                   </>
                 )}
              </div>
            )}
            <div className={`${isCompact ? 'h-1' : 'h-1.5'} w-full rounded-full overflow-hidden ${isBlueTheme ? 'bg-white/10' : 'bg-slate-100'}`}>
              <div 
                className={`h-full transition-all duration-700 ${attainment >= 100 ? 'bg-emerald-500' : (attainment >= 85 ? 'bg-amber-400' : 'bg-[#0079C2]')}`} 
                style={{ width: `${Math.min(attainment, 100)}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      {showSubMeasures && subMeasures.length > 0 && !isCompact && (
        <div className={`mt-0 z-20 w-full px-4 py-3 rounded-b-xl border-t ${
          isBlueTheme 
            ? 'bg-[#004a76] border-white/10' 
            : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {subMeasures.map((sm, i) => (
              <div key={i} className="flex flex-col min-w-0">
                {isActive && isEditable ? (
                  <>
                    <input 
                      value={sm.label}
                      onChange={(e) => handleSubMeasureUpdate(i, 'label', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[6px] font-black uppercase bg-transparent outline-none border-b border-transparent focus:border-blue-300 mb-0.5 w-full"
                      placeholder="Label"
                    />
                    <input 
                      value={sm.value}
                      onChange={(e) => handleSubMeasureUpdate(i, 'value', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-300 w-full"
                      placeholder="Valor"
                    />
                  </>
                ) : (
                  <>
                    <span className={`text-[7px] font-black uppercase tracking-tighter opacity-60 truncate whitespace-nowrap ${isBlueTheme ? 'text-blue-100' : 'text-slate-500'}`} title={sm.label}>{sm.label}</span>
                    <span className={`text-[10px] font-bold leading-tight truncate whitespace-nowrap ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`} title={sm.value}>{sm.value}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KPI_Card;