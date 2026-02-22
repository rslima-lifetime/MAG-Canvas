import React, { useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, TrendingUp, ChevronRight, Plus, Trash2, Circle, ChevronUp, ChevronDown, Bold, Italic, Underline } from 'lucide-react';
import { PageTheme } from '../../types';

interface Step {
  label: string;
  value: string;
  subtext?: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'INFO' | 'TREND' | 'NONE';
}

interface StepProcessBlockProps {
  steps: Step[];
  config?: any;
  isEditable?: boolean;
  theme?: PageTheme;
  activeSubItemIndex?: number | null;
  onActiveBlockChange?: () => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdateStep?: (idx: number, updates: Partial<Step>) => void;
  onAddStep?: (idx: number) => void;
  onRemoveStep?: (idx: number) => void;
  onUpdate?: (updates: any) => void;
}

const STATUS_ORDER = ['NONE', 'SUCCESS', 'WARNING', 'CRITICAL', 'INFO', 'TREND'] as const;

export const StepProcessBlock: React.FC<StepProcessBlockProps> = ({ 
  steps = [], 
  config = {} as any,
  isEditable = false, 
  theme = 'LIGHT', 
  activeSubItemIndex, 
  onActiveBlockChange, 
  onActiveSubItemChange, 
  onUpdateStep, 
  onAddStep, 
  onRemoveStep,
  onUpdate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const textScale = config.textScale || 'MD';
  const bodyWeight = config.bodyWeight || 'medium';

  useEffect(() => {
    steps.forEach((step, idx) => {
      const ref = contentRefs.current[`subtext-${idx}`];
      if (ref && document.activeElement !== ref) {
        const currentHtml = step.subtext || "";
        if (ref.innerHTML !== currentHtml) {
          ref.innerHTML = currentHtml;
        }
      }
    });
  }, [steps]);

  const handleTextUpdate = (idx: number, field: keyof Step, value: string) => {
    if (onUpdateStep) {
      onUpdateStep(idx, { [field]: value });
    }
  };

  const handleFormatting = (e: React.MouseEvent, command: string) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand(command, false);
  };

  const handleMoveStep = (idx: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    
    const newSteps = [...steps];
    [newSteps[idx], newSteps[targetIdx]] = [newSteps[targetIdx], newSteps[idx]];
    onUpdate?.({ steps: newSteps });
    onActiveSubItemChange?.(targetIdx);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS': return { color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', icon: CheckCircle2 };
      case 'WARNING': return { color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-200', icon: AlertTriangle };
      case 'CRITICAL': return { color: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', icon: AlertCircle };
      case 'INFO': return { color: 'text-[#00A7E7]', bg: 'bg-[#0079C2]', border: 'border-[#0079C2]', icon: Info };
      case 'TREND': return { color: 'text-slate-500', bg: 'bg-slate-500', border: 'border-slate-500', icon: TrendingUp };
      default: return { color: 'text-slate-300', bg: 'bg-slate-300', border: 'border-slate-300', icon: Circle };
    }
  };

  const getFontSize = (type: 'value' | 'label' | 'subtext') => {
    const scales: Record<string, any> = {
      SM: { value: 'text-[16px]', label: 'text-[9px]', subtext: 'text-[9px]' },
      MD: { value: 'text-[20px]', label: 'text-[10px]', subtext: 'text-[10px]' },
      LG: { value: 'text-[24px]', label: 'text-[12px]', subtext: 'text-[12px]' },
    };
    const s = scales[textScale] || scales.MD;
    return s[type];
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="w-full py-6 flex items-start justify-center relative px-2 overflow-visible min-h-[160px]">
      <style>{`
        .rich-placeholder:empty::before {
          content: attr(data-placeholder);
          color: ${isBlueTheme ? 'rgba(255,255,255,0.3)' : '#cbd5e1'};
          font-style: italic;
          font-weight: 400;
          pointer-events: none;
          display: block;
        }
      `}</style>

      {/* Linha de fundo conectora */}
      <div className={`absolute top-[34px] left-10 right-10 h-[2px] rounded-full z-0 ${isBlueTheme ? 'bg-white/10' : 'bg-slate-200'}`} />
      
      <div className="flex items-start w-full justify-between max-w-full">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const isActive = activeSubItemIndex === idx && isEditable;
          const statusConfig = getStatusConfig(step.status || 'NONE');
          const StatusIcon = statusConfig.icon;
          const showArrow = !isLast;

          return (
            <React.Fragment key={idx}>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onActiveBlockChange) onActiveBlockChange();
                  if (onActiveSubItemChange) onActiveSubItemChange(idx);
                }}
                className="flex flex-col items-center flex-1 min-w-0 relative z-10 group px-1 transition-all duration-300"
              >
                {isEditable && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveStep?.(idx); }}
                    className="absolute -top-4 right-1/2 translate-x-1/2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-[100] hover:scale-110 shadow-md"
                  >
                    <Trash2 size={10} strokeWidth={3} />
                  </button>
                )}

                <div className={`relative mb-3 transition-all duration-300 ${isActive ? 'scale-105' : 'hover:scale-105'}`}>
                  <div 
                    className={`min-w-[80px] min-h-[56px] px-4 py-2 rounded-2xl flex flex-col items-center justify-center border shadow-lg transition-all relative overflow-visible h-auto ${
                      isBlueTheme 
                        ? (isActive ? 'bg-[#006098] border-white ring-4 ring-white/10' : 'bg-[#004a76] border-white/20') 
                        : (isActive ? 'bg-white border-[#0079C2] ring-4 ring-blue-50' : 'bg-white border-slate-100')
                    }`}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!onUpdateStep) return;
                        const currentStatus = steps[idx].status || 'NONE';
                        const nextIndex = (STATUS_ORDER.indexOf(currentStatus as any) + 1) % STATUS_ORDER.length;
                        onUpdateStep(idx, { status: STATUS_ORDER[nextIndex] });
                      }}
                      className={`absolute -top-2 -right-2 p-0.5 rounded-full transition-transform hover:scale-125 bg-white shadow-md border ${statusConfig.color} ${statusConfig.border} z-20`}
                    >
                      <StatusIcon size={14} strokeWidth={3} />
                    </button>

                    <span 
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextUpdate(idx, 'value', e.currentTarget.textContent || '')}
                      onPaste={handlePaste}
                      className={`${getFontSize('value')} font-black tracking-tighter leading-none outline-none min-w-[20px] text-center z-10 whitespace-nowrap px-1 ${
                        isBlueTheme ? 'text-white' : 'text-[#006098]'
                      }`}
                    >
                      {step.value}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center w-full">
                  <h4 
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextUpdate(idx, 'label', e.currentTarget.textContent || '')}
                    onPaste={handlePaste}
                    className={`${getFontSize('label')} font-black uppercase tracking-wider text-center outline-none min-w-[60px] leading-tight mb-1 py-0.5 rounded ${
                      isBlueTheme ? 'text-[#00A7E7]' : 'text-[#006098]'
                    }`}
                  >
                    {step.label}
                  </h4>
                  
                  <div 
                    ref={el => { contentRefs.current[`subtext-${idx}`] = el; }}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextUpdate(idx, 'subtext', e.currentTarget.innerHTML || '')}
                    onMouseDown={(e) => { if(isEditable) e.stopPropagation(); }}
                    className={`${getFontSize('subtext')} ${bodyWeight === 'bold' ? 'font-bold' : 'font-medium'} text-center leading-snug italic max-w-[140px] outline-none min-w-[40px] py-0.5 rounded rich-placeholder ${
                      isBlueTheme ? 'text-blue-100/70' : 'text-slate-500'
                    }`}
                    data-placeholder="Descrição..."
                  />
                </div>
              </div>

              {/* SETA COMO ELEMENTO IRMÃO (FLUXO NATURAL) */}
              {showArrow && (
                <div className="h-[56px] flex items-center justify-center shrink-0 w-8 z-10 relative">
                  <ChevronRight size={20} strokeWidth={3} className={`${isBlueTheme ? 'text-white/20' : 'text-slate-300'}`} />
                  
                  {isEditable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAddStep?.(idx + 1); }}
                        className="w-5 h-5 rounded-full bg-white border border-blue-200 text-[#0079C2] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all hover:scale-125 hover:bg-[#0079C2] hover:text-white z-50"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {isEditable && (
          <div className="flex flex-col items-center flex-1 min-w-[80px] relative z-10 group px-1 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer"
               onClick={(e) => { e.stopPropagation(); onAddStep?.(steps.length); }}
          >
            <div className="relative mb-3">
              <div className={`min-w-[80px] min-h-[56px] px-4 py-2 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all relative ${
                 isBlueTheme ? 'border-white/30 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-400'
              }`}>
                 <Plus size={24} strokeWidth={3} />
              </div>
            </div>
            <div className="flex flex-col items-center w-full">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Adicionar</h4>
            </div>
          </div>
        )}
      </div>

      {isEditable && activeSubItemIndex !== null && activeSubItemIndex !== undefined && (
        <div 
          ref={toolbarRef}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-[350] flex items-center gap-1 bg-white shadow-2xl border border-slate-200 rounded-full p-1.5 animate-in fade-in slide-in-from-top-2 duration-300 no-print"
        >
          <div className="flex items-center bg-slate-50 rounded-full px-1 py-0.5 border border-slate-100 mr-1">
            <button 
              onClick={(e) => { e.stopPropagation(); handleMoveStep(activeSubItemIndex!, 'UP'); }}
              disabled={activeSubItemIndex === 0}
              className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === 0 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
            >
              <ChevronUp size={14} strokeWidth={3} />
            </button>
            <span className="text-[8px] font-black text-slate-300 mx-1 px-1">{activeSubItemIndex + 1}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleMoveStep(activeSubItemIndex!, 'DOWN'); }}
              disabled={activeSubItemIndex === steps.length - 1}
              className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === steps.length - 1 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
            >
              <ChevronDown size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="flex items-center gap-0.5 pr-1 border-r border-slate-100 mr-1">
            <button onMouseDown={(e) => handleFormatting(e, 'bold')} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors" title="Negrito"><Bold size={14} /></button>
            <button onMouseDown={(e) => handleFormatting(e, 'italic')} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors" title="Itálico"><Italic size={14} /></button>
            <button onMouseDown={(e) => handleFormatting(e, 'underline')} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors" title="Sublinhado"><Underline size={14} /></button>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'SM', label: 'A-' },
              { id: 'MD', label: 'A' },
              { id: 'LG', label: 'A+' }
            ].map(scale => (
              <button 
                key={scale.id}
                onClick={(e) => { e.stopPropagation(); onUpdate?.({ textScale: scale.id }); }}
                className={`px-2 py-1 rounded text-[9px] font-black transition-all ${textScale === scale.id ? 'bg-[#0079C2] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {scale.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-100 mx-1" />

          <button 
            onClick={(e) => { e.stopPropagation(); onRemoveStep?.(activeSubItemIndex!); }}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};