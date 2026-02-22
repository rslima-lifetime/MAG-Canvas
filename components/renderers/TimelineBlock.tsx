import React, { useRef, useEffect, useState } from 'react';
import { TimelineEvent, PageTheme } from '../../types';
import { Plus, Trash2, ChevronUp, ChevronDown, Bold, Italic, Underline, Maximize2, Type, Eye, EyeOff, Calendar } from 'lucide-react';
import { resolveIconComponent } from '../../utils/icon-library';
import { IconPicker } from '../ui/IconPicker';

interface TimelineBlockProps {
  events: TimelineEvent[];
  config?: any;
  theme?: PageTheme;
  isHighlighted?: boolean;
  activeSubItemIndex?: number | null;
  onActiveBlockChange?: () => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdate?: (updates: any) => void;
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({ 
  events = [], 
  config = {} as any,
  theme = 'LIGHT', 
  isHighlighted, 
  activeSubItemIndex, 
  onActiveBlockChange, 
  onActiveSubItemChange, 
  onUpdate 
}) => {
  const isBlueTheme = theme === 'BLUE';
  const toolbarRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showPickerFor, setShowPickerFor] = useState<number | null>(null);

  const textScale = config.textScale || 'MD';
  const bodyWeight = config.bodyWeight || 'medium';
  const showDescription = config.showDescription !== false;

  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    events.forEach((event, idx) => {
      const ref = contentRefs.current[`desc-${idx}`];
      if (ref && document.activeElement !== ref) {
        const currentHtml = event.description || "";
        if (ref.innerHTML !== currentHtml) {
          ref.innerHTML = currentHtml;
        }
      }
    });
  }, [events, showDescription]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPickerFor(null);
      }
    };
    if (showPickerFor !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPickerFor]);

  const updateEvent = (idx: number, field: string, value: any) => {
    const newEvents = [...events];
    newEvents[idx] = { ...newEvents[idx], [field]: value };
    onUpdate?.({ config: { ...config, events: newEvents } });
  };

  const handleFormatting = (e: React.MouseEvent, command: string) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand(command, false);
  };

  const handleMoveEvent = (idx: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= events.length) return;
    
    const newEvents = [...events];
    [newEvents[idx], newEvents[targetIdx]] = [newEvents[targetIdx], newEvents[idx]];
    onUpdate?.({ config: { ...config, events: newEvents } });
    onActiveSubItemChange?.(targetIdx);
  };

  const addEventAt = (index: number) => {
    const newEvent: TimelineEvent = { 
      year: new Date().getFullYear().toString(), 
      title: 'Novo Marco', 
      description: 'Descrição...', 
      icon: 'Calendar', 
      color: isBlueTheme ? '#00A7E7' : '#0079C2' 
    };
    const newEvents = [...events];
    newEvents.splice(index, 0, newEvent);
    onUpdate?.({ config: { ...config, events: newEvents } });
    onActiveBlockChange?.();
    onActiveSubItemChange?.(index);
  };

  const getFontSize = (type: 'year' | 'title' | 'description') => {
    const scales: Record<string, any> = {
      SM: { year: 'text-[13px]', title: 'text-[9px]', description: 'text-[9px]' },
      MD: { year: 'text-[16px]', title: 'text-[10px]', description: 'text-[10.5px]' },
      LG: { year: 'text-[20px]', title: 'text-[12px]', description: 'text-[13px]' },
    };
    const s = scales[textScale] || scales.MD;
    return s[type];
  };

  const renderContent = (event: TimelineEvent, idx: number, isActive: boolean) => (
    <>
      <span 
        contentEditable={isActive}
        suppressContentEditableWarning
        onBlur={(e) => updateEvent(idx, 'year', e.currentTarget.textContent)}
        className={`${getFontSize('year')} font-black leading-none mb-1 outline-none transition-all px-1 rounded ${
          isBlueTheme ? 'text-white' : 'text-[#415364]'
        }`}
      >
        {event.year}
      </span>
      
      <h4 
        contentEditable={isActive}
        suppressContentEditableWarning
        onBlur={(e) => updateEvent(idx, 'title', e.currentTarget.textContent)}
        className={`${getFontSize('title')} font-black uppercase tracking-widest mb-1 leading-tight outline-none px-1 rounded break-words w-full ${
          isBlueTheme ? 'text-[#00A7E7]' : 'text-[#0079C2]'
        }`}
      >
        {event.title}
      </h4>
      
      {showDescription && (
        <div 
          ref={el => { contentRefs.current[`desc-${idx}`] = el; }}
          contentEditable={isActive}
          suppressContentEditableWarning
          onBlur={(e) => updateEvent(idx, 'description', e.currentTarget.innerHTML)}
          onMouseDown={(e) => { if(isActive) e.stopPropagation(); }}
          className={`${getFontSize('description')} ${bodyWeight === 'bold' ? 'font-bold' : 'font-medium'} leading-relaxed w-full outline-none px-1 rounded break-words whitespace-pre-wrap rich-placeholder ${
            isBlueTheme ? 'text-blue-100/70' : 'text-slate-600'
          }`}
          data-placeholder="Descrição..."
        />
      )}
    </>
  );

  const InsertButton = ({ onClick, className }: { onClick: (e: React.MouseEvent) => void, className?: string }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-lg border flex items-center justify-center transition-all z-30 opacity-0 group-hover/col:opacity-100 hover:scale-125 ${
        isBlueTheme ? 'bg-[#0079C2] border-white text-white' : 'bg-white border-[#0079C2] text-[#0079C2]'
      } ${className}`}
    >
      <Plus size={12} strokeWidth={3} />
    </button>
  );

  return (
    <div className="w-full py-4 relative group/timeline" style={{ minHeight: events.length === 0 ? '160px' : '120px' }}>
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
      
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed border-slate-200 rounded-3xl p-8 opacity-60 hover:opacity-100 transition-all cursor-pointer" onClick={() => addEventAt(0)}>
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
               <Plus size={24} strokeWidth={3} />
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#006098]">Linha do Tempo Vazia</span>
               <span className="text-[8px] font-bold uppercase text-slate-400">Clique para adicionar o primeiro marco</span>
            </div>
        </div>
      ) : (
        <div 
          className="grid w-full relative"
          style={{
            gridTemplateColumns: `repeat(${events.length}, minmax(0, 1fr))`,
            gridTemplateRows: '1fr auto 1fr',
            columnGap: '0px'
          }}
        >
          <div className={`col-span-full row-start-2 self-center h-[2px] w-full rounded-full z-0 ${isBlueTheme ? 'bg-white/20' : 'bg-slate-200'}`} style={{ margin: '0 24px' }} />

          {events.map((event, idx) => {
            const isOdd = idx % 2 !== 0; 
            const isActive = !!(activeSubItemIndex === idx && isHighlighted);
            const Icon = resolveIconComponent(event.icon);
            const eventColor = event.color || (isBlueTheme ? '#00A7E7' : '#0079C2');
            const isPicking = showPickerFor === idx;

            return (
              <React.Fragment key={idx}>
                <div 
                  className="contents group/col"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onActiveBlockChange) onActiveBlockChange();
                    onActiveSubItemChange?.(idx);
                  }}
                >
                  <div 
                    className={`row-start-1 flex flex-col items-center justify-end pb-4 px-1 text-center transition-all duration-300 ${isOdd ? 'invisible pointer-events-none' : ''} ${isActive ? 'scale-105' : 'opacity-90 hover:opacity-100'}`}
                    style={{ gridColumnStart: idx + 1 }}
                  >
                    {renderContent(event, idx, isActive)}
                  </div>

                  <div className="row-start-2 relative flex items-center justify-center h-16 z-10" style={{ gridColumnStart: idx + 1 }}>
                    {idx === 0 && isHighlighted && <InsertButton onClick={() => addEventAt(0)} className="left-[-12px]" />}

                    <div className={`absolute left-1/2 -translate-x-1/2 w-[1px] h-1/2 z-0 ${isBlueTheme ? 'bg-white/20' : 'bg-slate-300'} ${isOdd ? 'top-1/2' : 'bottom-1/2'}`} />

                    <div 
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative bg-white cursor-pointer z-20 ${
                          isActive ? 'shadow-xl scale-110 ring-2 ring-offset-2' : 'shadow-md hover:scale-105'
                        }`}
                        style={isActive ? { '--tw-ring-color': eventColor } as React.CSSProperties : {}}
                        onClick={(e) => { if(isActive) { e.stopPropagation(); setShowPickerFor(isPicking ? null : idx); } }}
                      >
                        <Icon size={20} strokeWidth={1.5} style={{ color: eventColor }} />
                        
                        {isActive && !isPicking && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0079C2] text-white rounded-full flex items-center justify-center shadow-sm border border-white">
                             <Plus size={8} strokeWidth={4} />
                          </div>
                        )}

                        {isActive && isPicking && (
                          <div 
                            ref={pickerRef}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-[2100] w-64 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                            onClick={e => e.stopPropagation()}
                          >
                            <IconPicker selectedIcon={event.icon} onSelect={(newIcon) => { updateEvent(idx, 'icon', newIcon); setShowPickerFor(null); }} />
                          </div>
                        )}
                        
                        {isActive && !isPicking && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); const newEvents = events.filter((_, i) => i !== idx); onUpdate?.({ config: { ...config, events: newEvents } }); onActiveSubItemChange?.(null); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm border border-white"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>

                      {isHighlighted && <InsertButton onClick={() => addEventAt(idx + 1)} className="right-[-12px]" />}
                  </div>

                  <div 
                    className={`row-start-3 flex flex-col items-center justify-start pt-4 px-1 text-center transition-all duration-300 ${!isOdd ? 'invisible pointer-events-none' : ''} ${isActive ? 'scale-105' : 'opacity-90 hover:opacity-100'}`}
                    style={{ gridColumnStart: idx + 1 }}
                  >
                    {renderContent(event, idx, isActive)}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {isHighlighted && activeSubItemIndex !== null && activeSubItemIndex !== undefined && (
        <div 
          ref={toolbarRef}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-[350] flex items-center gap-1 bg-white shadow-2xl border border-slate-200 rounded-full p-1.5 animate-in fade-in slide-in-from-top-2 duration-300 no-print min-w-max"
        >
          <div className="flex items-center bg-slate-50 rounded-full px-1 py-0.5 border border-slate-100 mr-1">
            <button 
              onClick={(e) => { e.stopPropagation(); handleMoveEvent(activeSubItemIndex!, 'UP'); }}
              disabled={activeSubItemIndex === 0}
              className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === 0 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
            >
              <ChevronUp size={14} strokeWidth={3} />
            </button>
            <span className="text-[8px] font-black text-slate-300 mx-1 px-1">{activeSubItemIndex + 1}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleMoveEvent(activeSubItemIndex!, 'DOWN'); }}
              disabled={activeSubItemIndex === events.length - 1}
              className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === events.length - 1 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
            >
              <ChevronDown size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="flex items-center gap-1 pr-1 border-r border-slate-100 mr-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdate?.({ config: { ...config, showDescription: !showDescription } }); }}
              className={`p-1.5 rounded-lg transition-all ${showDescription ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Alternar Descrição"
            >
              {showDescription ? <Eye size={16} /> : <EyeOff size={16} />}
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
                onClick={(e) => { e.stopPropagation(); onUpdate?.({ config: { ...config, textScale: scale.id } }); }}
                className={`px-2 py-1 rounded text-[9px] font-black transition-all ${textScale === scale.id ? 'bg-[#0079C2] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {scale.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-100 mx-1" />

          <button 
            onClick={(e) => { e.stopPropagation(); const newEvents = events.filter((_, i) => i !== activeSubItemIndex); onUpdate?.({ config: { ...config, events: newEvents } }); onActiveSubItemChange?.(null); }}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};