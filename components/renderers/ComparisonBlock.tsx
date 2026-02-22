import React, { useState, useRef, useEffect } from 'react';
import { PageTheme } from '../../types';
import { resolveIconComponent } from '../../utils/icon-library';
import { IconPicker } from '../ui/IconPicker';
import { Trophy, Plus, Trash2, CheckCircle2, ChevronRight, Hash, Edit3, Copy } from 'lucide-react';

interface ComparisonAttribute {
  id: string;
  label: string;
  value: string;
}

interface ComparisonItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  isWinner: boolean;
  attributes: ComparisonAttribute[];
}

interface ComparisonBlockProps {
  items: ComparisonItem[];
  theme?: PageTheme;
  isHighlighted?: boolean;
  activeSubItemIndex?: number | null;
  onActiveBlockChange?: () => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdateItem?: (idx: number, updates: Partial<ComparisonItem>) => void;
  onAddItem?: () => void;
  onRemoveItem?: (idx: number) => void;
  onDuplicateItem?: (idx: number) => void;
  onUpdate?: (updates: any) => void;
}

export const ComparisonBlock: React.FC<ComparisonBlockProps> = ({
  items = [], theme = 'LIGHT', isHighlighted, activeSubItemIndex, onActiveBlockChange, onActiveSubItemChange, onUpdateItem, onAddItem, onRemoveItem, onDuplicateItem, onUpdate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const [showIconPicker, setShowIconPicker] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = (idx: number, field: keyof ComparisonItem, value: any) => {
    onUpdateItem?.(idx, { [field]: value });
  };

  const addAttribute = (idx: number) => {
    const newAttr = { id: `attr-${Date.now()}`, label: 'Característica', value: 'Valor' };
    const newAttrs = [...(items[idx].attributes || []), newAttr];
    handleUpdate(idx, 'attributes', newAttrs);
  };

  const updateAttribute = (itemIdx: number, attrIdx: number, field: keyof ComparisonAttribute, value: string) => {
    const newAttrs = [...items[itemIdx].attributes];
    newAttrs[attrIdx] = { ...newAttrs[attrIdx], [field]: value };
    handleUpdate(itemIdx, 'attributes', newAttrs);
  };

  const removeAttribute = (itemIdx: number, attrIdx: number) => {
    const newAttrs = items[itemIdx].attributes.filter((_, i) => i !== attrIdx);
    handleUpdate(itemIdx, 'attributes', newAttrs);
  };

  const toggleWinner = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (!isHighlighted || !onUpdate) return;
    
    const isCurrentlyWinner = items[idx].isWinner;
    const newItems = items.map((it, i) => ({ 
      ...it, 
      isWinner: i === idx ? !isCurrentlyWinner : false 
    }));
    
    onUpdate({ items: newItems });
  };

  return (
    <div className="w-full flex flex-col gap-4 py-4 relative">
      <div 
        className="grid gap-4 items-stretch"
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      >
        {items.map((item, idx) => {
          const isActive = isHighlighted && activeSubItemIndex === idx;
          const Icon = resolveIconComponent(item.icon);
          const isWinner = item.isWinner;

          return (
            <div 
              key={item.id}
              onClick={(e) => { e.stopPropagation(); onActiveBlockChange?.(); onActiveSubItemChange?.(idx); }}
              className={`relative flex flex-col rounded-3xl border transition-all duration-500 overflow-visible group/card ${
                isWinner 
                  ? 'bg-gradient-to-b from-[#006098] to-[#004a76] border-white/20 shadow-2xl scale-[1.03] z-20 text-white' 
                  : (isActive ? 'bg-white border-[#0079C2] shadow-xl z-10' : (isBlueTheme ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'))
              }`}
            >
              {/* Winner Badge */}
              {isWinner && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-amber-500 text-slate-900 text-[8px] font-black uppercase px-4 py-1 rounded-full shadow-lg border border-white/50 z-30 flex items-center gap-1.5 whitespace-nowrap animate-in fade-in slide-in-from-top-1">
                   <Trophy size={10} fill="currentColor" /> Recomendado
                </div>
              )}

              {/* Header do Card */}
              <div className="p-6 flex flex-col items-center text-center gap-3">
                {/* Ícone */}
                <div className="relative">
                  <div 
                    onClick={(e) => { if(isActive) { e.stopPropagation(); setShowIconPicker(showIconPicker === idx ? null : idx); } }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isWinner 
                        ? 'bg-white/10 text-[#00A7E7] border border-white/20' 
                        : (isActive ? 'bg-blue-50 text-[#0079C2] border border-blue-100' : 'bg-slate-50 text-slate-400')
                    } ${isActive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
                  >
                    <Icon size={28} strokeWidth={1.5} />
                    {isActive && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-slate-100">
                        <Edit3 size={10} className="text-[#0079C2]" />
                      </div>
                    )}
                  </div>

                  {isActive && showIconPicker === idx && (
                    <div ref={pickerRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-[2100] w-72 shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                       <IconPicker selectedIcon={item.icon} onSelect={(newIcon) => { handleUpdate(idx, 'icon', newIcon); setShowIconPicker(null); }} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 w-full">
                  {isActive ? (
                    <input 
                      className={`w-full text-center bg-transparent text-[16px] font-black uppercase tracking-tight outline-none border-b border-dashed border-blue-300 ${isWinner ? 'text-white' : 'text-[#006098]'}`}
                      value={item.title}
                      onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    />
                  ) : (
                    <h4 className={`text-[16px] font-black uppercase tracking-tight leading-none ${isWinner ? 'text-white' : (isBlueTheme ? 'text-white' : 'text-[#006098]')}`}>{item.title}</h4>
                  )}
                  
                  {isActive ? (
                    <textarea 
                      className={`w-full text-center bg-transparent text-[10px] font-medium leading-relaxed outline-none border-none resize-none h-12 italic ${isWinner ? 'text-blue-100' : 'text-slate-500'}`}
                      value={item.description}
                      onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                      placeholder="Breve descrição..."
                    />
                  ) : (
                    <p className={`text-[10px] font-medium leading-relaxed italic ${isWinner ? 'text-blue-100/70' : (isBlueTheme ? 'text-blue-100/50' : 'text-slate-400')}`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de Atributos */}
              <div className={`flex-1 flex flex-col gap-2 p-4 pt-0 transition-all ${isWinner ? 'bg-white/5' : 'bg-slate-50/50'}`}>
                 <div className="flex flex-col gap-1.5">
                    {item.attributes.map((attr, aIdx) => (
                      <div key={attr.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all group/attr ${
                        isWinner ? 'bg-white/10 border-white/10' : 'bg-white border-slate-100 hover:border-blue-100'
                      }`}>
                         <div className="flex flex-col flex-1 min-w-0 pr-2">
                            {isActive ? (
                              <input 
                                className={`bg-transparent outline-none text-[8px] font-black uppercase tracking-widest ${isWinner ? 'text-blue-300' : 'text-slate-400'}`}
                                value={attr.label}
                                onChange={(e) => updateAttribute(idx, aIdx, 'label', e.target.value)}
                                placeholder="Label"
                              />
                            ) : (
                              <span className={`text-[8px] font-black uppercase tracking-widest ${isWinner ? 'text-blue-300' : 'text-slate-400'}`}>{attr.label}</span>
                            )}

                            {isActive ? (
                              <input 
                                className={`bg-transparent outline-none text-[11px] font-bold ${isWinner ? 'text-white' : 'text-slate-700'}`}
                                value={attr.value}
                                onChange={(e) => updateAttribute(idx, aIdx, 'value', e.target.value)}
                                placeholder="Valor"
                              />
                            ) : (
                              <span className={`text-[11px] font-bold truncate ${isWinner ? 'text-white' : 'text-slate-700'}`}>{attr.value}</span>
                            )}
                         </div>
                         
                         {isActive && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); removeAttribute(idx, aIdx); }}
                             className="opacity-0 group-hover/attr:opacity-100 p-1 text-rose-400 hover:text-rose-600 transition-all"
                           >
                             <Trash2 size={12} />
                           </button>
                         )}
                      </div>
                    ))}

                    {isActive && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); addAttribute(idx); }}
                        className={`py-2 rounded-xl border-2 border-dashed flex items-center justify-center gap-1.5 transition-all text-[8px] font-black uppercase ${
                          isWinner ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        <Plus size={12} strokeWidth={3} /> Atributo
                      </button>
                    )}
                 </div>
              </div>

              {/* Botões de Ação do Card */}
              {isHighlighted && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity z-50">
                  <button 
                    onClick={(e) => toggleWinner(e, idx)}
                    className={`w-8 h-8 rounded-full shadow-lg border-2 flex items-center justify-center transition-all ${
                      isWinner ? 'bg-amber-400 border-white text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                    }`}
                    title="Destacar como Recomendado"
                  >
                    <Trophy size={14} fill={isWinner ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDuplicateItem?.(idx); }}
                    className="w-8 h-8 rounded-full bg-[#0079C2] text-white shadow-lg border-2 border-white flex items-center justify-center hover:bg-[#006098] transition-all"
                    title="Duplicar Opção"
                  >
                    <Copy size={12} />
                  </button>
                  {items.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveItem?.(idx); }}
                      className="w-8 h-8 rounded-full bg-rose-500 text-white shadow-lg border-2 border-white flex items-center justify-center hover:bg-rose-600 transition-all"
                      title="Excluir Coluna"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Adicionar Nova Coluna */}
        {isHighlighted && items.length < 4 && (
          <div 
            onClick={(e) => { e.stopPropagation(); onAddItem?.(); }}
            className={`flex flex-col items-center justify-center rounded-3xl border-4 border-dashed transition-all cursor-pointer group/add-col ${
              isBlueTheme ? 'border-white/10 hover:border-white/30 bg-white/5' : 'border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/20'
            }`}
          >
             <div className="w-12 h-12 rounded-full bg-white border border-slate-100 text-[#0079C2] flex items-center justify-center shadow-md transition-transform group-hover/add-col:scale-110">
                <Plus size={24} strokeWidth={3} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">Adicionar Opção</span>
          </div>
        )}
      </div>
    </div>
  );
};