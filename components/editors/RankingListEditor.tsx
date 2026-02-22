
import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Crown, Medal, Award, Star, GripVertical, List, Image as ImageIcon } from 'lucide-react';
import { RankingItem } from '../../types';
import { IconPicker } from '../ui/IconPicker';
import { resolveIconComponent } from '../../utils/icon-library';

interface RankingListEditorProps {
  items: RankingItem[];
  config: any;
  onUpdate: (updates: any) => void;
}

export const RankingListEditor: React.FC<RankingListEditorProps> = ({ 
  items = [], config, onUpdate 
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const updateItem = (idx: number, updates: Partial<RankingItem>) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], ...updates };
    onUpdate({ items: newItems });
  };

  const addItem = () => {
    const newItem: RankingItem = {
      id: Date.now().toString(),
      label: 'Novo Item',
      value: 0,
      formattedValue: '0',
      description: 'Cargo / Detalhe'
    };
    onUpdate({ items: [...items, newItem] });
  };

  const removeItem = (idx: number) => {
    onUpdate({ items: items.filter((_, i) => i !== idx) });
  };

  const moveItem = (idx: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && idx === 0) || (direction === 'DOWN' && idx === items.length - 1)) return;
    const newItems = [...items];
    const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    onUpdate({ items: newItems });
  };

  const CurrentHeroIcon = config.heroIcon ? resolveIconComponent(config.heroIcon) : Trophy;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Configuração do Hero Icon */}
      <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Award size={12} className="text-[#00A7E7]" />
            Ícone de Destaque (Hero)
          </label>
          {config.heroIcon && (
            <button onClick={() => onUpdate({ heroIcon: null })} className="text-[8px] text-rose-500 font-bold hover:underline">Remover</button>
          )}
        </div>
        
        <button 
          onClick={() => setShowIconPicker(!showIconPicker)}
          className="w-full p-2 bg-white border rounded-lg flex items-center justify-between hover:border-[#0079C2] transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.heroIcon ? 'bg-[#0079C2] text-white' : 'bg-slate-100 text-slate-300'}`}>
              <CurrentHeroIcon size={16} />
            </div>
            <div className="flex flex-col items-start">
               <span className="text-[10px] font-bold text-slate-600 uppercase">
                 {config.heroIcon || "Sem Ícone"}
               </span>
               <span className="text-[8px] text-slate-400">Exibido ao lado do ranking</span>
            </div>
          </div>
          <span className="text-[9px] font-black text-[#0079C2] uppercase">
            {showIconPicker ? 'Fechar' : 'Alterar'}
          </span>
        </button>

        {showIconPicker && (
          <div className="mt-2 relative z-50">
            <IconPicker 
              selectedIcon={config.heroIcon || ''} 
              onSelect={(icon) => { onUpdate({ heroIcon: icon }); setShowIconPicker(false); }} 
            />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
           <span className="text-[9px] font-bold text-slate-500 uppercase">Barra de Progresso (Fundo)</span>
           <button 
             onClick={() => onUpdate({ showBar: config.showBar !== false ? false : true })}
             className={`w-8 h-4 rounded-full transition-all relative ${config.showBar !== false ? 'bg-[#0079C2]' : 'bg-slate-300'}`}
           >
             <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.showBar !== false ? 'left-4.5' : 'left-0.5'}`} />
           </button>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-2">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
          <List size={10} /> Itens do Ranking
        </label>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={item.id} className="group p-2 bg-white border border-slate-100 rounded-xl flex flex-col gap-2 hover:border-blue-200 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => moveItem(idx, 'UP')} className="text-slate-300 hover:text-[#0079C2]"><GripVertical size={10} /></button>
                </div>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${idx < 3 ? 'bg-[#0079C2] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {idx + 1}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input 
                    type="text" 
                    value={item.label} 
                    onChange={(e) => updateItem(idx, { label: e.target.value })}
                    className="w-full text-[10px] font-bold border-b border-transparent focus:border-blue-200 outline-none text-[#006098]"
                    placeholder="Nome / Rótulo"
                  />
                  <input 
                    type="text" 
                    value={item.description || ''} 
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    className="w-full text-[9px] text-slate-500 border-b border-slate-50 focus:border-blue-200 outline-none"
                    placeholder="Cargo / Subtítulo"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={item.formattedValue || ''} 
                      onChange={(e) => updateItem(idx, { formattedValue: e.target.value })}
                      className="w-1/2 text-[9px] bg-slate-50 rounded px-1 text-slate-600 outline-none"
                      placeholder="Texto (ex: R$ 1k)"
                    />
                    <input 
                      type="number" 
                      value={item.value} 
                      onChange={(e) => updateItem(idx, { value: parseFloat(e.target.value) || 0 })}
                      className="w-1/2 text-[9px] bg-slate-50 rounded px-1 text-slate-400 outline-none"
                      placeholder="Valor Num."
                    />
                  </div>
                </div>

                <button onClick={() => removeItem(idx)} className="text-slate-200 hover:text-rose-500 p-1 transition-colors self-start">
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Input de Imagem */}
              <div className="flex items-center gap-2 pl-8 border-t border-slate-50 pt-1">
                 <ImageIcon size={10} className="text-slate-300" />
                 <input 
                    type="text" 
                    value={item.image || ''} 
                    onChange={(e) => updateItem(idx, { image: e.target.value })}
                    className="flex-1 text-[9px] bg-transparent border-none outline-none text-slate-500 placeholder-slate-300 focus:text-blue-600"
                    placeholder="URL da foto (ex: https://site.com/foto.jpg)"
                 />
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addItem}
          className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase hover:bg-blue-50 hover:text-[#0079C2] hover:border-blue-200 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={12} /> Adicionar Posição
        </button>
      </div>
    </div>
  );
};
