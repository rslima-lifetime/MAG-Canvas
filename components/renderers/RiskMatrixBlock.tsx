import React, { useRef, useState, useEffect } from 'react';
import { PageTheme, RiskItem, RiskStatus } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Plus, Trash2, ArrowLeft, ArrowRight, Bold, Italic, Underline, Maximize2, Type, ChevronUp, ChevronDown } from 'lucide-react';

interface RiskMatrixBlockProps {
  items: RiskItem[];
  theme?: PageTheme;
  config?: any;
  isHighlighted?: boolean;
  activeSubItemIndex?: number | null;
  onActiveBlockChange?: () => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdateItem?: (idx: number, updates: Partial<RiskItem>) => void;
  onAddItem?: () => void;
  onRemoveItem?: (idx: number) => void;
  onUpdate?: (updates: any) => void;
}

const STATUS_CONFIG: Record<RiskStatus, { icon: any, label: string, color: string, bg: string, border: string }> = {
  CRITICAL: { icon: AlertCircle, label: 'Crítico', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  ATTENTION: { icon: AlertTriangle, label: 'Atenção', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  CONTROLLED: { icon: CheckCircle2, label: 'Controlado', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
};

const STATUS_ORDER: RiskStatus[] = ['CRITICAL', 'ATTENTION', 'CONTROLLED'];

export const RiskMatrixBlock: React.FC<RiskMatrixBlockProps> = ({
  items = [],
  theme = 'LIGHT',
  // Fix for TypeScript error: casting config to any to allow property access
  config = {} as any,
  isHighlighted,
  activeSubItemIndex,
  onActiveBlockChange,
  onActiveSubItemChange,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onUpdate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Refs para sincronização de conteúdo rico
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const textScale = config.textScale || 'MD';
  const bodyWeight = config.bodyWeight || 'medium';

  useEffect(() => {
    items.forEach((item, idx) => {
      const fields: (keyof RiskItem)[] = ['riskTitle', 'riskDetail', 'mitigationTitle', 'mitigationDetail'];
      fields.forEach(field => {
        const key = `${field}-${idx}`;
        const ref = contentRefs.current[key];
        if (ref && document.activeElement !== ref) {
          const currentHtml = (item as any)[field] || "";
          if (ref.innerHTML !== currentHtml) {
            ref.innerHTML = currentHtml;
          }
        }
      });
    });
  }, [items]);

  const cycleStatus = (e: React.MouseEvent, idx: number) => {
    if (!isHighlighted || !onUpdateItem) return;
    e.stopPropagation();
    const currentStatus = items[idx].status;
    const nextIdx = (STATUS_ORDER.indexOf(currentStatus) + 1) % STATUS_ORDER.length;
    onUpdateItem(idx, { status: STATUS_ORDER[nextIdx] });
  };

  const handleUpdate = (idx: number, field: keyof RiskItem, value: string) => {
    onUpdateItem?.(idx, { [field]: value });
  };

  const handleFormatting = (e: React.MouseEvent, command: string) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand(command, false);
  };

  const handleMoveItem = (idx: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    
    const newItems = [...items];
    [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
    onUpdate?.({ items: newItems });
    onActiveSubItemChange?.(targetIdx);
  };

  const getFontSize = (type: 'title' | 'detail') => {
    const scales: Record<string, { title: string, detail: string }> = {
      SM: { title: 'text-[9px]', detail: 'text-[8.5px]' },
      MD: { title: 'text-[11px]', detail: 'text-[10px]' },
      LG: { title: 'text-[13px]', detail: 'text-[11.5px]' },
    };
    const s = scales[textScale] || scales.MD;
    return type === 'title' ? s.title : s.detail;
  };

  return (
    <div className="w-full flex flex-col gap-2 py-2 relative">
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
      
      <div className={`grid grid-cols-12 gap-4 px-4 py-2 border-b-2 ${isBlueTheme ? 'border-white/10 text-white/40' : 'border-slate-100 text-slate-400'} text-[8px] font-black uppercase tracking-[0.2em]`}>
        <div className="col-span-2">Status</div>
        <div className="col-span-5">Ponto de Atenção / Risco</div>
        <div className="col-span-5">Plano de Ação / Solução</div>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {items.map((item, idx) => {
          const isActive = isHighlighted && activeSubItemIndex === idx;
          const configStatus = STATUS_CONFIG[item.status];
          const Icon = configStatus.icon;

          return (
            <div 
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onActiveBlockChange?.();
                onActiveSubItemChange?.(idx);
              }}
              className={`grid grid-cols-12 gap-4 p-4 rounded-2xl border transition-all relative group ${
                isActive 
                  ? 'bg-white shadow-xl border-[#0079C2] scale-[1.01] z-20' 
                  : (isBlueTheme ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-50 hover:bg-slate-100/50')
              }`}
            >
              <div className="col-span-2 flex items-start pt-1">
                <button 
                  onClick={(e) => cycleStatus(e, idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${
                    isHighlighted ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-sm' : 'cursor-default'
                  } ${isBlueTheme ? 'bg-white/10 border-white/10 text-white' : `${configStatus.bg} ${configStatus.color} ${configStatus.border}`}`}
                >
                  <Icon size={12} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-tight">{configStatus.label}</span>
                </button>
              </div>

              <div className="col-span-5 flex flex-col gap-1.5">
                <div 
                  ref={el => { contentRefs.current[`riskTitle-${idx}`] = el; }}
                  contentEditable={isHighlighted}
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdate(idx, 'riskTitle', e.currentTarget.innerHTML)}
                  onMouseDown={(e) => { if(isHighlighted) e.stopPropagation(); }}
                  className={`${getFontSize('title')} font-black uppercase tracking-tight outline-none leading-tight rounded transition-colors rich-placeholder ${
                    isBlueTheme ? 'text-white' : 'text-[#006098]'
                  } ${isHighlighted ? 'focus:bg-blue-50/50 p-1 -m-1' : ''}`}
                  data-placeholder="Título do Risco..."
                />
                <div 
                  ref={el => { contentRefs.current[`riskDetail-${idx}`] = el; }}
                  contentEditable={isHighlighted}
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdate(idx, 'riskDetail', e.currentTarget.innerHTML)}
                  onMouseDown={(e) => { if(isHighlighted) e.stopPropagation(); }}
                  className={`${getFontSize('detail')} ${bodyWeight === 'bold' ? 'font-bold' : 'font-medium'} leading-relaxed outline-none rounded transition-colors rich-placeholder ${
                    isBlueTheme ? 'text-blue-100/60' : 'text-slate-500'
                  } ${isHighlighted ? 'focus:bg-blue-50/50 p-1 -m-1 border-t border-dashed border-slate-200 mt-1' : ''}`}
                  data-placeholder="Detalhamento do risco..."
                />
              </div>

              <div className="col-span-5 flex flex-col gap-1.5 border-l border-slate-100/50 pl-4">
                <div 
                  ref={el => { contentRefs.current[`mitigationTitle-${idx}`] = el; }}
                  contentEditable={isHighlighted}
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdate(idx, 'mitigationTitle', e.currentTarget.innerHTML)}
                  onMouseDown={(e) => { if(isHighlighted) e.stopPropagation(); }}
                  className={`${getFontSize('title')} font-black uppercase tracking-tight outline-none leading-tight rounded transition-colors rich-placeholder ${
                    isBlueTheme ? 'text-[#00A7E7]' : 'text-emerald-600'
                  } ${isHighlighted ? 'focus:bg-blue-50/50 p-1 -m-1' : ''}`}
                  data-placeholder="Título da Ação..."
                />
                <div 
                  ref={el => { contentRefs.current[`mitigationDetail-${idx}`] = el; }}
                  contentEditable={isHighlighted}
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdate(idx, 'mitigationDetail', e.currentTarget.innerHTML)}
                  onMouseDown={(e) => { if(isHighlighted) e.stopPropagation(); }}
                  className={`${getFontSize('detail')} ${bodyWeight === 'bold' ? 'font-bold' : 'font-medium'} leading-relaxed outline-none rounded transition-colors rich-placeholder ${
                    isBlueTheme ? 'text-blue-100/60' : 'text-slate-500'
                  } ${isHighlighted ? 'focus:bg-blue-50/50 p-1 -m-1 border-t border-dashed border-slate-200 mt-1' : ''}`}
                  data-placeholder="Passo a passo da solução..."
                />
              </div>

              {isActive && onRemoveItem && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveItem(idx); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30 border-2 border-white"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isHighlighted && (
        <button 
          onClick={(e) => { e.stopPropagation(); onAddItem?.(); }}
          className={`mt-3 py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            isBlueTheme 
              ? 'border-white/20 text-blue-200 hover:bg-white/5 hover:border-white/40' 
              : 'border-slate-200 text-slate-400 hover:border-[#0079C2] hover:text-[#0079C2] hover:bg-blue-50'
          }`}
        >
          <Plus size={14} strokeWidth={3} />
          <span>Registrar Novo Risco Estratégico</span>
        </button>
      )}

      {/* BARRA DE FERRAMENTAS FLUTUANTE */}
      {isHighlighted && activeSubItemIndex !== null && activeSubItemIndex !== undefined && (
        <div 
          ref={toolbarRef}
          className="absolute -bottom-12 left-0 z-[350] flex items-center gap-1 bg-white shadow-2xl border border-slate-200 rounded-full p-1.5 animate-in fade-in slide-in-from-top-2 duration-300 no-print"
        >
          <div className="flex items-center bg-slate-50 rounded-full px-1 py-0.5 border border-slate-100 mr-1">
            <button 
              onClick={(e) => { e.stopPropagation(); handleMoveItem(activeSubItemIndex!, 'UP'); }}
              disabled={activeSubItemIndex === 0}
              className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === 0 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
            >
              <ChevronUp size={14} strokeWidth={3} />
            </button>
            <span className="text-[8px] font-black text-slate-300 mx-1 px-1">{activeSubItemIndex + 1}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleMoveItem(activeSubItemIndex!, 'DOWN'); }}
              disabled={activeSubItemIndex === items.length - 1}
              className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === items.length - 1 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
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
              { id: 'SM', label: 'A-', icon: Maximize2 },
              { id: 'MD', label: 'A', icon: Type },
              { id: 'LG', label: 'A+', icon: Maximize2 }
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
            onClick={(e) => { e.stopPropagation(); onRemoveItem?.(activeSubItemIndex!); }}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};