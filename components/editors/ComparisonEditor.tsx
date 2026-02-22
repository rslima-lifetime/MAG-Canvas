import React from 'react';
import { Plus, Trash2, Trophy, Hash, Star, Layout, Edit3 } from 'lucide-react';

interface ComparisonEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export const ComparisonEditor: React.FC<ComparisonEditorProps> = ({ config, onUpdate }) => {
  const items = config.items || [];

  const updateItem = (idx: number, updates: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], ...updates };
    onUpdate({ items: newItems });
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: 'Nova Opção',
      description: '',
      icon: 'Circle',
      isWinner: false,
      attributes: []
    };
    onUpdate({ items: [...items, newItem] });
  };

  const removeItem = (idx: number) => {
    onUpdate({ items: items.filter((_item: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
        <Layout size={20} className="text-[#0079C2] shrink-0" />
        <p className="text-[10px] text-[#006098] font-medium leading-tight">
          Utilize o comparativo para confrontar opções, cenários ou planos. Você pode marcar uma opção como <strong>Recomendada</strong> para destaque visual automático.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item: any, idx: number) => (
          <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm group relative hover:border-[#0079C2] transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">Coluna #{idx + 1}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const newItems = items.map((it: any, i: number) => ({ ...it, isWinner: i === idx ? !it.isWinner : false }));
                    onUpdate({ items: newItems });
                  }}
                  className={`p-1.5 rounded-lg transition-all ${item.isWinner ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:text-amber-500'}`}
                  title="Marcar como Recomendado"
                >
                  <Trophy size={14} />
                </button>
                <button onClick={() => removeItem(idx)} className="p-1.5 bg-slate-50 text-slate-300 hover:text-rose-500 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Título da Opção</label>
                <input 
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  className="w-full p-2 text-[11px] font-black text-[#006098] uppercase border rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-gray-400 uppercase">Resumo / Descrição</label>
                <textarea 
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className="w-full p-2 text-[10px] border rounded-xl italic leading-relaxed h-16"
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                 <span>Atributos</span>
                 <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{item.attributes.length}</span>
              </label>
              <p className="text-[8px] text-slate-400 italic">Dica: Adicione e edite atributos diretamente no preview para melhor precisão visual.</p>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addItem}
        disabled={items.length >= 4}
        className="w-full py-4 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
      >
        <Plus size={16} strokeWidth={3} /> Adicionar Nova Coluna
      </button>
    </div>
  );
};