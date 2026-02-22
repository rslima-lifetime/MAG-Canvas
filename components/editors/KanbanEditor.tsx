
import React, { useState } from 'react';
import { Plus, Trash2, Layout, User, Tag, Palette, ArrowRight, ArrowLeft, Users, UserPlus, X, Check, Copy, Clock, ListTodo, Square, CheckSquare } from 'lucide-react';
import { KanbanColumn, KanbanCard, ChecklistItem } from '../../types';

interface KanbanEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

const PRESET_COLORS = ['#64748b', '#0079C2', '#00A7E7', '#10B981', '#F59E0B', '#EF4444', '#7C3AED'];
const TAG_COLORS_PALETTE = [
  { label: 'Azul', hex: '#0079C2' },
  { label: 'Azul Claro', hex: '#00A7E7' },
  { label: 'Verde', hex: '#059669' },
  { label: 'Amarelo', hex: '#D97706' },
  { label: 'Vermelho', hex: '#E11D48' },
  { label: 'Cinza', hex: '#475569' },
  { label: 'Roxo', hex: '#9333EA' }
];

export const KanbanEditor: React.FC<KanbanEditorProps> = ({ config, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'COLUMNS' | 'CARDS' | 'TEAM'>('CARDS');
  const [newMemberName, setNewMemberName] = useState('');
  const [tagInputs, setTagInputs] = useState<{ [cardId: string]: string }>({});
  const [checkInputs, setCheckInputs] = useState<{ [cardId: string]: string }>({});

  const columns: KanbanColumn[] = config.columns || [];
  const cards: KanbanCard[] = config.cards || [];
  const members: string[] = config.members || [];
  const tagColors: Record<string, string> = config.tagColors || {};

  const uniqueTags = Array.from(new Set(cards.flatMap((c: KanbanCard) => c.tags || []))).sort() as string[];

  const addColumn = () => {
    const newCol: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: 'Nova Coluna',
      color: PRESET_COLORS[columns.length % PRESET_COLORS.length]
    };
    onUpdate({ columns: [...columns, newCol] });
  };

  const updateCard = (id: string, updates: Partial<KanbanCard>) => {
    onUpdate({ cards: cards.map((c: KanbanCard) => c.id === id ? { ...c, ...updates } : c) });
  };

  const removeCard = (id: string) => {
    onUpdate({ cards: cards.filter((c: KanbanCard) => c.id !== id) });
  };

  const duplicateCard = (id: string) => {
    const originalIdx = cards.findIndex((c: KanbanCard) => c.id === id);
    if (originalIdx === -1) return;
    
    const original = cards[originalIdx];
    const newCard: KanbanCard = {
      ...JSON.parse(JSON.stringify(original)),
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    const newCards = [...cards];
    newCards.splice(originalIdx + 1, 0, newCard);
    onUpdate({ cards: newCards });
  };

  const addTag = (cardId: string) => {
    const val = tagInputs[cardId]?.trim();
    if (!val) return;
    const card = cards.find((c: KanbanCard) => c.id === cardId);
    if (!card) return;
    const currentTags = card.tags || [];
    if (currentTags.includes(val)) {
      setTagInputs(prev => ({ ...prev, [cardId]: '' }));
      return;
    }
    updateCard(cardId, { tags: [...currentTags, val] });
    setTagInputs(prev => ({ ...prev, [cardId]: '' }));
  };

  const removeTag = (cardId: string, tag: string) => {
    const card = cards.find((c: KanbanCard) => c.id === cardId);
    if (!card) return;
    updateCard(cardId, { tags: (card.tags || []).filter(t => t !== tag) });
  };

  const addCheckItem = (cardId: string) => {
    const val = checkInputs[cardId]?.trim();
    if (!val) return;
    const card = cards.find((c: KanbanCard) => c.id === cardId);
    if (!card) return;
    
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: val,
      completed: false
    };
    
    updateCard(cardId, { checklist: [...(card.checklist || []), newItem] });
    setCheckInputs(prev => ({ ...prev, [cardId]: '' }));
  };

  const removeCheckItem = (cardId: string, itemId: string) => {
    const card = cards.find((c: KanbanCard) => c.id === cardId);
    if (!card) return;
    updateCard(cardId, { checklist: (card.checklist || []).filter(i => i.id !== itemId) });
  };

  const toggleCheckItem = (cardId: string, itemId: string) => {
    const card = cards.find((c: KanbanCard) => c.id === cardId);
    if (!card) return;
    updateCard(cardId, { 
      checklist: (card.checklist || []).map(i => i.id === itemId ? { ...i, completed: !i.completed } : i) 
    });
  };

  const setTagColor = (tag: string, colorHex: string) => {
    onUpdate({ tagColors: { ...tagColors, [tag]: colorHex } });
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    if (members.includes(newMemberName.trim())) {
      alert("Este membro já existe na lista.");
      return;
    }
    onUpdate({ members: [...members, newMemberName.trim()] });
    setNewMemberName('');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
        <button 
          onClick={() => setActiveTab('CARDS')}
          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'CARDS' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400'}`}
        >
          Cards ({cards.length})
        </button>
        <button 
          onClick={() => setActiveTab('COLUMNS')}
          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'COLUMNS' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400'}`}
        >
          Colunas
        </button>
        <button 
          onClick={() => setActiveTab('TEAM')}
          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'TEAM' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400'}`}
        >
          Equipe & Tags
        </button>
      </div>

      {activeTab === 'TEAM' && (
        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
           <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Users size={12} /> Gestão da Equipe
              </label>
              <div className="flex gap-2">
                 <input 
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMember()}
                    placeholder="Nome do integrante..."
                    className="flex-1 p-2 text-[10px] border rounded-lg outline-none focus:ring-2 focus:ring-[#00A7E7]/20"
                 />
                 <button 
                    onClick={addMember}
                    className="px-3 bg-[#0079C2] text-white rounded-lg hover:bg-[#006098]"
                 >
                    <Plus size={16} strokeWidth={3} />
                 </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar p-1">
                 {members.map((m: string) => (
                   <div key={m} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border rounded-lg group">
                      <span className="text-[9px] font-bold text-slate-600">{m}</span>
                      <button onClick={() => onUpdate({ members: members.filter((x: string) => x !== m) })} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100">
                        <X size={10} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Tag size={12} /> Paleta de Etiquetas
              </label>
              <div className="space-y-2">
                {uniqueTags.length > 0 ? (
                  uniqueTags.map(tag => (
                    <div key={tag} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 group">
                       <span className="text-[10px] font-black text-slate-600 uppercase truncate max-w-[100px]">{tag}</span>
                       <div className="flex gap-1">
                          {TAG_COLORS_PALETTE.map(c => (
                            <button 
                              key={c.hex}
                              onClick={() => setTagColor(tag, c.hex)}
                              className={`w-4 h-4 rounded-full border border-white transition-all ${tagColors[tag] === c.hex || (!tagColors[tag] && c.hex === '#0079C2') ? 'ring-2 ring-blue-400 scale-110' : 'opacity-40 hover:opacity-100'}`}
                              style={{ backgroundColor: c.hex }}
                              title={c.label}
                           />
                          ))}
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 bg-slate-50 border border-dashed rounded-xl">
                     <p className="text-[8px] font-bold text-slate-400 uppercase">Nenhuma tag criada nos cards</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'COLUMNS' && (
        <div className="space-y-3 animate-in slide-in-from-right-2 duration-300">
          {columns.map((col: KanbanColumn, idx: number) => (
            <div key={col.id} className="p-3 bg-slate-50 border rounded-xl space-y-2 group">
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={col.color}
                  onChange={(e) => {
                    const newCols = [...columns];
                    newCols[idx].color = e.target.value;
                    onUpdate({ columns: newCols });
                  }}
                  className="w-6 h-6 rounded-lg border-none bg-transparent cursor-pointer"
                />
                <input 
                  type="text" 
                  value={col.title}
                  onChange={(e) => {
                    const newCols = [...columns];
                    newCols[idx].title = e.target.value;
                    onUpdate({ columns: newCols });
                  }}
                  className="flex-1 bg-transparent text-[11px] font-bold text-[#006098] border-b border-transparent focus:border-blue-300 outline-none"
                />
                <button 
                  onClick={() => onUpdate({ 
                    columns: columns.filter((_: any, i: number) => i !== idx),
                    cards: cards.filter((c: any) => c.columnId !== col.id)
                  })}
                  className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={addColumn}
            className="w-full py-2 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Nova Coluna
          </button>
        </div>
      )}

      {activeTab === 'CARDS' && (
        <div className="space-y-3 animate-in slide-in-from-left-2 duration-300">
          {cards.map((card: KanbanCard) => (
            <div key={card.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm group">
              <div className="flex justify-between items-start">
                <div className="flex gap-1 items-center">
                  <select 
                    value={card.columnId}
                    onChange={(e) => updateCard(card.id, { columnId: e.target.value })}
                    className="text-[9px] font-black uppercase text-[#0079C2] bg-blue-50 px-2 py-1 rounded outline-none"
                  >
                    {columns.map((col: any) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1 items-center">
                  <button onClick={() => duplicateCard(card.id)} className="text-slate-300 hover:text-blue-500" title="Duplicar">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => removeCard(card.id)} className="text-slate-300 hover:text-rose-500" title="Excluir">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  value={card.title}
                  onChange={(e) => updateCard(card.id, { title: e.target.value })}
                  placeholder="Título da Tarefa"
                  className="w-full text-[12px] font-black text-[#006098] outline-none border-b border-slate-100 focus:border-blue-400 uppercase"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase text-slate-400">Responsável</label>
                    <select 
                      value={card.owner || ''} 
                      onChange={(e) => updateCard(card.id, { owner: e.target.value })}
                      className="w-full p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold outline-none"
                    >
                      <option value="">Não atribuído</option>
                      {members.map((m: string) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase text-slate-400">Prioridade</label>
                    <select 
                      value={card.priority}
                      onChange={(e) => updateCard(card.id, { priority: e.target.value as any })}
                      className="w-full p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold"
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <Clock size={8} /> Prazo / Entrega
                  </label>
                  <input 
                    type="date" 
                    value={card.date || ''} 
                    onChange={(e) => updateCard(card.id, { date: e.target.value })}
                    className="w-full p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold outline-none focus:border-blue-400"
                  />
                </div>

                {/* Checklist Editor */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                     <label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1">
                        <ListTodo size={10} /> Checklist
                     </label>
                   </div>
                   
                   <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                     {card.checklist?.map((item, i) => (
                       <div key={item.id} className="flex items-center gap-2 group/item">
                         <button 
                           onClick={() => toggleCheckItem(card.id, item.id)}
                           className={`transition-colors ${item.completed ? 'text-emerald-500' : 'text-slate-300'}`}
                         >
                           {item.completed ? <CheckSquare size={14} /> : <Square size={14} />}
                         </button>
                         <input 
                           type="text" 
                           value={item.text}
                           onChange={(e) => {
                             const newChecklist = (card.checklist || []).map(it => it.id === item.id ? { ...it, text: e.target.value } : it);
                             updateCard(card.id, { checklist: newChecklist });
                           }}
                           className={`flex-1 text-[10px] outline-none bg-transparent border-b border-transparent focus:border-blue-200 ${item.completed ? 'text-slate-400 line-through italic' : 'text-slate-600 font-medium'}`}
                         />
                         <button 
                           onClick={() => removeCheckItem(card.id, item.id)}
                           className="text-rose-300 opacity-0 group-hover/item:opacity-100 hover:text-rose-500 p-0.5"
                         >
                           <Trash2 size={12} />
                         </button>
                       </div>
                     ))}
                   </div>
                   
                   <div className="flex items-center gap-2 mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                     <Plus size={10} className="text-[#0079C2]" />
                     <input 
                       value={checkInputs[card.id] || ''} 
                       onChange={(e) => setCheckInputs(prev => ({ ...prev, [card.id]: e.target.value }))}
                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCheckItem(card.id))}
                       className="bg-transparent text-[10px] outline-none w-full font-bold text-[#006098]"
                       placeholder="Novo item do checklist..."
                     />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[7px] font-black uppercase text-slate-400">Tags</label>
                   <div className="flex flex-wrap gap-1 mb-2">
                      {card.tags?.map((t, ti) => {
                        const colorHex = tagColors[t] || '#0079C2';
                        return (
                          <span key={ti} className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded border" style={{ backgroundColor: colorHex + '10', color: colorHex, borderColor: colorHex + '30' }}>
                            {t}
                            <button onClick={() => removeTag(card.id, t)} className="hover:opacity-50"><X size={8} /></button>
                          </span>
                        );
                      })}
                   </div>
                   <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <Tag size={10} className="text-slate-400" />
                      <input 
                        value={tagInputs[card.id] || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.endsWith(',')) {
                            setTagInputs(prev => ({ ...prev, [card.id]: val.slice(0, -1) }));
                            addTag(card.id);
                          } else {
                            setTagInputs(prev => ({ ...prev, [card.id]: val }));
                          }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(card.id))}
                        className="bg-transparent text-[9px] outline-none w-full"
                        placeholder="Adicionar tags (separadas por vírgula)"
                      />
                   </div>
                </div>
              </div>
            </div>
          ))}

          {columns.length > 0 && (
            <button 
              onClick={() => onUpdate({ cards: [...cards, { id: `card-${Date.now()}`, columnId: columns[0].id, title: 'Nova Tarefa', priority: 'MEDIUM', tags: [], owner: '', date: new Date().toISOString().split('T')[0], checklist: [] }] })}
              className="w-full py-3 bg-[#0079C2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#006098] transition-all shadow-lg"
            >
              <Plus size={16} /> Adicionar Novo Cartão
            </button>
          )}
        </div>
      )}
    </div>
  );
};
