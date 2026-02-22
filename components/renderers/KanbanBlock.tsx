
import React, { useState, useRef, useEffect } from 'react';
import { PageTheme, KanbanColumn, KanbanCard, ChecklistItem } from '../../types';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, User, Clock, Tag, Plus, Trash2, Check, X, Palette, Copy, ListTodo, Square, CheckSquare } from 'lucide-react';

interface KanbanBlockProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  members?: string[];
  tagColors?: Record<string, string>;
  theme?: PageTheme;
  isHighlighted?: boolean;
  onUpdate?: (updates: any) => void;
}

const PRIORITY_COLORS = {
  HIGH: 'bg-rose-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-emerald-500'
};

const PRIORITY_LABELS = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa'
};

const TAG_PALETTE = [
  { label: 'MAG Azul', bg: 'bg-blue-50', text: 'text-[#0079C2]', border: 'border-blue-100', hex: '#0079C2' },
  { label: 'Urgente', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', hex: '#E11D48' },
  { label: 'Alerta', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', hex: '#D97706' },
  { label: 'Sucesso', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', hex: '#059669' },
  { label: 'Neutro', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', hex: '#475569' },
  { label: 'Destaque', bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', hex: '#2563EB' },
  { label: 'Roxo', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', hex: '#9333EA' }
];

const PRIORITY_ORDER: ('LOW' | 'MEDIUM' | 'HIGH')[] = ['LOW', 'MEDIUM', 'HIGH'];

export const KanbanBlock: React.FC<KanbanBlockProps> = ({
  columns = [],
  cards = [],
  members = [],
  tagColors = {},
  theme = 'LIGHT',
  isHighlighted,
  onUpdate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const [activeOwnerPicker, setActiveOwnerPicker] = useState<string | null>(null);
  const [activeTagPicker, setActiveTagPicker] = useState<{ cardId: string, tagName: string } | null>(null);
  const [tagInputValue, setTagInputValue] = useState<{ [cardId: string]: string }>({});
  const [checkInputValue, setCheckInputValue] = useState<{ [cardId: string]: string }>({});
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setActiveOwnerPicker(null);
        setActiveTagPicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moveCardHorizontal = (cardId: string, direction: 'LEFT' | 'RIGHT') => {
    if (!onUpdate) return;
    const cardIdx = cards.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;
    
    const card = cards[cardIdx];
    const columnIdx = columns.findIndex(col => col.id === card.columnId);
    const targetColumnIdx = direction === 'LEFT' ? columnIdx - 1 : columnIdx + 1;
    
    if (targetColumnIdx >= 0 && targetColumnIdx < columns.length) {
      const newCards = [...cards];
      newCards[cardIdx] = { ...card, columnId: columns[targetColumnIdx].id };
      onUpdate({ cards: newCards });
    }
  };

  const moveCardVertical = (cardId: string, direction: 'UP' | 'DOWN') => {
    if (!onUpdate) return;
    const cardIdx = cards.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const columnId = cards[cardIdx].columnId;
    const sameColIndices = cards
      .map((c, i) => (c.columnId === columnId ? i : -1))
      .filter(i => i !== -1);

    const relativeIdx = sameColIndices.indexOf(cardIdx);
    const targetRelativeIdx = direction === 'UP' ? relativeIdx - 1 : relativeIdx + 1;

    if (targetRelativeIdx >= 0 && targetRelativeIdx < sameColIndices.length) {
      const targetGlobalIdx = sameColIndices[targetRelativeIdx];
      const newCards = [...cards];
      [newCards[cardIdx], newCards[targetGlobalIdx]] = [newCards[targetGlobalIdx], newCards[cardIdx]];
      onUpdate({ cards: newCards });
    }
  };

  const deleteCard = (cardId: string) => {
    if (!onUpdate) return;
    const newCards = cards.filter(c => c.id !== cardId);
    onUpdate({ cards: newCards });
  };

  const duplicateCard = (cardId: string) => {
    if (!onUpdate) return;
    const originalCardIdx = cards.findIndex(c => c.id === cardId);
    if (originalCardIdx === -1) return;

    const originalCard = cards[originalCardIdx];
    const newCard: KanbanCard = {
      ...JSON.parse(JSON.stringify(originalCard)),
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    const newCards = [...cards];
    newCards.splice(originalCardIdx + 1, 0, newCard);
    onUpdate({ cards: newCards });
  };

  const addCardAt = (columnId: string, indexInColumn: number) => {
    if (!onUpdate) return;
    
    const newCard: KanbanCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      columnId,
      title: 'Nova Tarefa',
      description: '',
      priority: 'MEDIUM',
      tags: [],
      owner: '',
      date: new Date().toISOString().split('T')[0],
      checklist: []
    };

    const sameColIndices = cards
      .map((c, i) => (c.columnId === columnId ? i : -1))
      .filter(i => i !== -1);

    let globalInsertIdx;
    if (indexInColumn === 0) {
      globalInsertIdx = sameColIndices.length > 0 ? sameColIndices[0] : cards.length;
    } else if (indexInColumn >= sameColIndices.length) {
      globalInsertIdx = sameColIndices.length > 0 ? sameColIndices[sameColIndices.length - 1] + 1 : cards.length;
    } else {
      globalInsertIdx = sameColIndices[indexInColumn];
    }

    const newCards = [...cards];
    newCards.splice(globalInsertIdx, 0, newCard);
    onUpdate({ cards: newCards });
  };

  const updateCardField = (cardId: string, field: keyof KanbanCard, value: any) => {
    if (!onUpdate) return;
    const newCards = cards.map(c => {
      if (c.id === cardId) {
        return { ...c, [field]: value };
      }
      return c;
    });
    onUpdate({ cards: newCards });
  };

  const updateTagColor = (tagName: string, colorHex: string) => {
    if (!onUpdate) return;
    onUpdate({ tagColors: { ...tagColors, [tagName]: colorHex } });
    setActiveTagPicker(null);
  };

  const addTag = (cardId: string) => {
    const value = tagInputValue[cardId]?.trim();
    if (!value) return;

    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const currentTags = card.tags || [];
    if (currentTags.includes(value)) {
      setTagInputValue(prev => ({ ...prev, [cardId]: '' }));
      return;
    }

    updateCardField(cardId, 'tags', [...currentTags, value]);
    setTagInputValue(prev => ({ ...prev, [cardId]: '' }));
  };

  const removeTag = (cardId: string, tagToRemove: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const newTags = (card.tags || []).filter(t => t !== tagToRemove);
    updateCardField(cardId, 'tags', newTags);
  };

  const addChecklistItem = (cardId: string) => {
    const value = checkInputValue[cardId]?.trim();
    if (!value) return;

    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const currentChecklist = card.checklist || [];
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: value,
      completed: false
    };

    updateCardField(cardId, 'checklist', [...currentChecklist, newItem]);
    setCheckInputValue(prev => ({ ...prev, [cardId]: '' }));
  };

  const toggleChecklistItem = (cardId: string, itemId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const newChecklist = (card.checklist || []).map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateCardField(cardId, 'checklist', newChecklist);
  };

  const removeChecklistItem = (cardId: string, itemId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const newChecklist = (card.checklist || []).filter(item => item.id !== itemId);
    updateCardField(cardId, 'checklist', newChecklist);
  };

  const cyclePriority = (cardId: string) => {
    if (!onUpdate || !isHighlighted) return;
    const cardIdx = cards.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const currentPriority = cards[cardIdx].priority;
    const nextPriority = PRIORITY_ORDER[(PRIORITY_ORDER.indexOf(currentPriority) + 1) % PRIORITY_ORDER.length];
    
    const newCards = [...cards];
    newCards[cardIdx] = { ...cards[cardIdx], priority: nextPriority };
    onUpdate({ cards: newCards });
  };

  const getTagStyle = (tagName: string) => {
    const colorHex = tagColors[tagName];
    if (!colorHex) return TAG_PALETTE[0];
    return TAG_PALETTE.find(p => p.hex === colorHex) || { ...TAG_PALETTE[0], hex: colorHex };
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'Sem data';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}`;
    }
    return dateStr;
  };

  return (
    <div className="w-full flex gap-3 overflow-x-auto no-scrollbar py-2 min-h-[300px]">
      {columns.map((col) => {
        const columnCards = cards.filter(c => c.columnId === col.id);
        
        return (
          <div key={col.id} className="flex-1 min-w-[200px] flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-100' : 'text-slate-600'}`}>
                  {col.title}
                </h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isBlueTheme ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {columnCards.length}
                </span>
              </div>
            </div>

            <div className={`flex-1 flex flex-col p-2 rounded-xl border-2 border-dashed transition-colors ${isBlueTheme ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
              
              {isHighlighted && (
                <button 
                  onClick={() => addCardAt(col.id, 0)}
                  className="w-full py-1.5 mb-2 rounded-lg border border-dashed border-slate-200 text-slate-300 hover:text-[#0079C2] hover:border-[#0079C2] hover:bg-white transition-all flex items-center justify-center group/add"
                >
                  <Plus size={14} className="group-hover/add:rotate-90 transition-transform" />
                </button>
              )}

              {columnCards.map((card, cardIdx) => {
                const totalCheck = card.checklist?.length || 0;
                const completedCheck = card.checklist?.filter(i => i.completed).length || 0;
                
                return (
                  <React.Fragment key={card.id}>
                    <div 
                      className={`group relative p-3 rounded-xl border shadow-sm transition-all duration-300 animate-in fade-in zoom-in-95 ${
                        isBlueTheme 
                          ? 'bg-slate-800 border-white/10 text-white hover:border-white/30' 
                          : 'bg-white border-slate-100 text-slate-700 hover:border-blue-200 hover:shadow-md'
                      }`}
                    >
                      {isHighlighted && (
                        <div className="absolute -top-2 -right-2 flex gap-1 z-[100] opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation(); 
                              duplicateCard(card.id); 
                            }}
                            className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-125 active:scale-95 border-2 border-white cursor-pointer"
                            title="Duplicar Card"
                          >
                            <Copy size={11} strokeWidth={3} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation(); 
                              deleteCard(card.id); 
                            }}
                            className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-125 active:scale-95 border-2 border-white cursor-pointer"
                            title="Excluir Card"
                          >
                            <Trash2 size={11} strokeWidth={3} />
                          </button>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {card.tags?.map((t, ti) => {
                          const style = getTagStyle(t);
                          const isPicking = activeTagPicker?.cardId === card.id && activeTagPicker?.tagName === t;
                          
                          return (
                            <div key={ti} className="relative">
                              <span 
                                onClick={(e) => { if(isHighlighted) { e.stopPropagation(); setActiveTagPicker(isPicking ? null : { cardId: card.id, tagName: t }); } }}
                                className={`group/tag text-[7px] font-black uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all ${style.bg} ${style.text} ${style.border} ${isHighlighted ? 'cursor-pointer hover:brightness-95' : ''}`}
                              >
                                {t}
                                {isHighlighted && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); removeTag(card.id, t); }}
                                    className="hover:opacity-50"
                                  >
                                    <X size={8} strokeWidth={3} />
                                  </button>
                                )}
                              </span>

                              {isHighlighted && isPicking && (
                                <div ref={pickerRef} className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-[110] p-1 flex gap-1 animate-in fade-in slide-in-from-top-1 duration-200 min-w-max">
                                   {TAG_PALETTE.map(p => (
                                     <button 
                                        key={p.hex}
                                        onClick={(e) => { e.stopPropagation(); updateTagColor(t, p.hex); }}
                                        className={`w-4 h-4 rounded-full border border-slate-100 hover:scale-125 transition-transform ${tagColors[t] === p.hex ? 'ring-2 ring-blue-400 ring-offset-1 scale-110' : ''}`}
                                        style={{ backgroundColor: p.hex }}
                                        title={p.label}
                                     />
                                   ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {isHighlighted && (
                          <div className="relative flex-1 min-w-[60px]">
                            <input 
                              type="text"
                              value={tagInputValue[card.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.endsWith(',')) {
                                  setTagInputValue(prev => ({ ...prev, [card.id]: val.slice(0, -1) }));
                                  addTag(card.id);
                                } else {
                                  setTagInputValue(prev => ({ ...prev, [card.id]: val }));
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag(card.id);
                                }
                                if (e.key === 'Backspace' && !tagInputValue[card.id] && card.tags?.length) {
                                  removeTag(card.id, card.tags[card.tags.length - 1]);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="+ tag..."
                              className="w-full bg-transparent text-[7px] font-black uppercase tracking-tight outline-none border-b border-blue-100/50 focus:border-blue-300 placeholder-slate-300"
                            />
                          </div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); cyclePriority(card.id); }}
                          disabled={!isHighlighted}
                          className={`w-2 h-2 rounded-full transition-all shrink-0 ml-auto ${PRIORITY_COLORS[card.priority]} ${isHighlighted ? 'cursor-pointer hover:scale-150 ring-offset-2 ring-blue-400/20 hover:ring-2' : ''}`} 
                          title={`Prioridade: ${PRIORITY_LABELS[card.priority]}`}
                        />
                      </div>

                      {/* Título */}
                      {isHighlighted ? (
                        <input 
                          className="w-full bg-transparent text-[11px] font-black uppercase tracking-tight outline-none border-b border-transparent focus:border-blue-300 mb-1"
                          value={card.title}
                          onChange={(e) => updateCardField(card.id, 'title', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h5 className="text-[11px] font-black uppercase tracking-tight leading-tight mb-1">{card.title}</h5>
                      )}

                      {/* Descrição */}
                      {isHighlighted ? (
                        <textarea 
                          className="w-full bg-transparent text-[9px] leading-snug outline-none border-b border-transparent focus:border-blue-300 resize-none h-12"
                          value={card.description}
                          onChange={(e) => updateCardField(card.id, 'description', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Adicione uma descrição..."
                        />
                      ) : (
                        card.description && <p className="text-[9px] leading-snug opacity-60 line-clamp-3 mb-2">{card.description}</p>
                      )}

                      {/* Checklist */}
                      {(totalCheck > 0 || isHighlighted) && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-1 text-[7px] font-black uppercase text-slate-400">
                                <ListTodo size={8} /> 
                                <span>Checklist</span>
                             </div>
                             {totalCheck > 0 && (
                               <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${completedCheck === totalCheck ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                 {completedCheck}/{totalCheck}
                               </span>
                             )}
                          </div>
                          
                          <div className="space-y-0.5">
                            {card.checklist?.map((item) => (
                              <div key={item.id} className="flex items-center gap-1.5 group/check">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleChecklistItem(card.id, item.id); }}
                                  className={`shrink-0 transition-colors ${item.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-400'}`}
                                >
                                  {item.completed ? <CheckSquare size={10} strokeWidth={3} /> : <Square size={10} strokeWidth={3} />}
                                </button>
                                
                                {isHighlighted ? (
                                  <input 
                                    className={`flex-1 bg-transparent text-[9px] outline-none border-b border-transparent focus:border-blue-200 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-600 font-medium'}`}
                                    value={item.text}
                                    onChange={(e) => {
                                      const newCheck = (card.checklist || []).map(i => i.id === item.id ? { ...i, text: e.target.value } : i);
                                      updateCardField(card.id, 'checklist', newCheck);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span className={`text-[9px] ${item.completed ? 'text-slate-400 line-through italic' : 'text-slate-600 font-medium'}`}>
                                    {item.text}
                                  </span>
                                )}

                                {isHighlighted && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); removeChecklistItem(card.id, item.id); }}
                                    className="opacity-0 group-hover/check:opacity-100 p-0.5 text-rose-300 hover:text-rose-500 transition-all"
                                  >
                                    <X size={8} strokeWidth={3} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {isHighlighted && (
                            <div className="pt-1">
                               <input 
                                 type="text"
                                 value={checkInputValue[card.id] || ''}
                                 onChange={(e) => setCheckInputValue(prev => ({ ...prev, [card.id]: e.target.value }))}
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addChecklistItem(card.id);
                                    }
                                 }}
                                 onClick={(e) => e.stopPropagation()}
                                 placeholder="+ Novo item..."
                                 className="w-full bg-transparent text-[8px] font-bold outline-none border-b border-blue-100/50 focus:border-blue-300 placeholder-slate-300"
                               />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 opacity-80">
                        <div className="flex items-center gap-1.5 min-w-0 relative">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border shrink-0 ${isBlueTheme ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                            {card.owner ? card.owner.charAt(0).toUpperCase() : <User size={10} />}
                          </div>
                          
                          {isHighlighted ? (
                            <div className="relative">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveOwnerPicker(activeOwnerPicker === card.id ? null : card.id); }}
                                className={`text-[8px] font-bold outline-none border-b border-dashed transition-colors truncate max-w-[80px] ${card.owner ? 'border-blue-200 text-[#0079C2]' : 'border-slate-200 text-slate-400'}`}
                              >
                                {card.owner || 'Selecionar...'}
                              </button>
                              
                              {activeOwnerPicker === card.id && (
                                <div ref={pickerRef} className="absolute bottom-full mb-2 left-0 w-40 bg-white border border-slate-200 rounded-xl shadow-2xl z-[120] p-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                  <div className="p-1.5 border-b border-slate-50 mb-1">
                                     <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Responsáveis</span>
                                  </div>
                                  <div className="max-h-32 overflow-y-auto no-scrollbar">
                                    {members.length > 0 ? (
                                      members.map(m => (
                                        <button 
                                          key={m}
                                          onClick={(e) => { e.stopPropagation(); updateCardField(card.id, 'owner', m); setActiveOwnerPicker(null); }}
                                          className="w-full flex items-center justify-between p-1.5 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-[#0079C2] transition-colors"
                                        >
                                          <span className="truncate">{m}</span>
                                          {card.owner === m && <Check size={10} strokeWidth={4} />}
                                        </button>
                                      ))
                                    ) : (
                                      <p className="text-[7px] p-2 italic text-slate-400">Nenhum membro cadastrado</p>
                                    )}
                                  </div>
                                  <div className="p-1 mt-1 border-t border-slate-50">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); updateCardField(card.id, 'owner', ''); setActiveOwnerPicker(null); }}
                                        className="w-full text-[7px] font-black uppercase text-rose-500 hover:bg-rose-50 p-1 rounded"
                                     >
                                        Remover
                                     </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[8px] font-bold truncate">{card.owner || '—'}</span>
                          )}
                        </div>
                        
                        {isHighlighted ? (
                          <div className="relative group/date">
                            <label className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all cursor-pointer bg-[#0079C2] text-white border-[#006098] hover:bg-[#006098] shadow-md hover:shadow-lg active:scale-95`}>
                              <Clock size={10} strokeWidth={3} className="shrink-0" />
                              <span className="text-[9px] font-black uppercase leading-none drop-shadow-sm">{formatDisplayDate(card.date)}</span>
                              <input 
                                type="date"
                                value={card.date || ''}
                                onChange={(e) => updateCardField(card.id, 'date', e.target.value)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    (e.target as any).showPicker();
                                  } catch(err) {
                                    // Fallback: o navegador focará o campo
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </label>
                          </div>
                        ) : (
                          card.date && (
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border shrink-0 ${
                              isBlueTheme ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              <Clock size={10} className="opacity-50" /> 
                              <span className="text-[9px] font-black uppercase leading-none">{formatDisplayDate(card.date)}</span>
                            </div>
                          )
                        )}
                      </div>

                      {isHighlighted && (
                        <>
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                            <button onClick={(e) => { e.stopPropagation(); moveCardHorizontal(card.id, 'RIGHT'); }} className="w-5 h-5 rounded-full bg-[#0079C2] text-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95"><ChevronRight size={12} strokeWidth={3} /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveCardHorizontal(card.id, 'LEFT'); }} className="w-5 h-5 rounded-full bg-slate-400 text-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95"><ChevronLeft size={12} strokeWidth={3} /></button>
                          </div>
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                            <button onClick={(e) => { e.stopPropagation(); moveCardVertical(card.id, 'UP'); }} className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 shadow-md flex items-center justify-center hover:text-[#0079C2] hover:border-[#0079C2] hover:scale-110 active:scale-95"><ChevronUp size={12} strokeWidth={3} /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveCardVertical(card.id, 'DOWN'); }} className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 shadow-md flex items-center justify-center hover:text-[#0079C2] hover:border-[#0079C2] hover:scale-110 active:scale-95"><ChevronDown size={12} strokeWidth={3} /></button>
                          </div>
                        </>
                      )}
                    </div>

                    {isHighlighted && (
                      <div className="relative h-2 group/gap">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/gap:opacity-100 transition-opacity">
                           <div className="w-full h-px bg-[#00A7E7] border-t border-dashed border-[#00A7E7]" />
                           <button 
                             onClick={() => addCardAt(col.id, cardIdx + 1)}
                             className="absolute w-5 h-5 rounded-full bg-[#0079C2] text-white flex items-center justify-center shadow-lg hover:scale-125 transition-transform"
                           >
                             <Plus size={12} strokeWidth={3} />
                           </button>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              
              {isHighlighted && columnCards.length > 0 && (
                <button 
                  onClick={() => addCardAt(col.id, columnCards.length)}
                  className="w-full py-1.5 mt-1 rounded-lg border border-dashed border-slate-200 text-slate-300 hover:text-[#0079C2] hover:border-[#0079C2] hover:bg-white transition-all flex items-center justify-center group/add"
                >
                  <Plus size={14} className="group-hover/add:rotate-90 transition-transform" />
                </button>
              )}

              {columnCards.length === 0 && (
                <div 
                  className="flex-1 flex flex-col items-center justify-center py-10 cursor-pointer group/empty"
                  onClick={() => isHighlighted && addCardAt(col.id, 0)}
                >
                   <Tag size={24} strokeWidth={1} className="opacity-20 group-hover/empty:opacity-40 transition-opacity" />
                   <span className="text-[8px] font-black uppercase mt-2 opacity-20 group-hover/empty:opacity-40">Vazio</span>
                   {isHighlighted && <Plus size={16} className="mt-2 text-[#0079C2] opacity-0 group-hover/empty:opacity-100 transition-all scale-75 group-hover/empty:scale-100" />}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
