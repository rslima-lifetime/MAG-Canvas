import React from 'react';
import { Plus, Trash2, ShieldAlert, Maximize2, Type, Bold, ToggleRight, ToggleLeft } from 'lucide-react';
import { RiskItem, RiskStatus } from '../../types';

interface RiskMatrixEditorProps {
  items: RiskItem[];
  config: any;
  onUpdate: (updates: any) => void;
}

export const RiskMatrixEditor: React.FC<RiskMatrixEditorProps> = ({ 
  items = [], 
  // Fix for TypeScript error: casting config to any to allow property access
  config = {} as any, 
  onUpdate 
}) => {
  const updateItem = (idx: number, updates: Partial<RiskItem>) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], ...updates };
    onUpdate({ items: newItems });
  };

  const addItem = () => {
    const newItem: RiskItem = {
      id: Date.now().toString(),
      status: 'ATTENTION',
      riskTitle: 'Resumo do Risco',
      riskDetail: 'Descreva aqui o detalhamento técnico do ponto de atenção...',
      mitigationTitle: 'Resumo da Solução',
      mitigationDetail: 'Passo a passo das ações que serão tomadas para mitigar o risco.'
    };
    onUpdate({ items: [...items, newItem] });
  };

  const removeItem = (idx: number) => {
    onUpdate({ items: items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
        <ShieldAlert size={20} className="text-[#0079C2] shrink-0" />
        <p className="text-[9px] text-[#006098] font-medium leading-tight uppercase tracking-tight">
          Configure a aparência global da matriz ou edite os textos diretamente no componente.
        </p>
      </div>

      {/* CONFIGURAÇÃO GLOBAL DE ESTILO */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Type size={14} className="text-[#0079C2]" />
          <span className="text-[10px] font-black uppercase text-[#006098] tracking-widest">Estilo e Visibilidade</span>
        </div>

        {/* Escala de Texto */}
        <div className="space-y-2">
          <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
             <Maximize2 size={10} /> Escala de Fonte Global
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'SM', label: 'Pequeno' },
              { id: 'MD', label: 'Padrão' },
              { id: 'LG', label: 'Grande' }
            ].map(scale => (
              <button
                key={scale.id}
                onClick={() => onUpdate({ textScale: scale.id })}
                className={`py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all ${
                  (config.textScale || 'MD') === scale.id 
                    ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Negrito Global */}
        <div className="pt-2 border-t border-slate-200/60">
          <button 
            onClick={() => onUpdate({ bodyWeight: config.bodyWeight === 'bold' ? 'medium' : 'bold' })}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Bold size={12} className={config.bodyWeight === 'bold' ? 'text-[#0079C2]' : 'text-slate-300'} />
              <span className="text-[9px] font-bold text-slate-500 uppercase">Texto Detalhado em Negrito</span>
            </div>
            {config.bodyWeight === 'bold' ? <ToggleRight size={20} className="text-[#00A7E7]" /> : <ToggleLeft size={20} className="text-slate-300" />}
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item, idx) => (
          <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl space-y-4 group hover:border-[#0079C2] transition-colors relative shadow-sm">
            <button 
              onClick={() => removeItem(idx)}
              className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Gravidade</label>
                <div className="flex gap-1">
                  {(['CRITICAL', 'ATTENTION', 'CONTROLLED'] as RiskStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateItem(idx, { status: s })}
                      className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all flex-1 ${
                        item.status === s 
                          ? (s === 'CRITICAL' ? 'bg-rose-500 border-rose-500 text-white' : s === 'ATTENTION' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white')
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {s === 'CRITICAL' ? 'Crítico' : s === 'ATTENTION' ? 'Atenção' : 'OK'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Títulos Rápidos */}
              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
                 <div className="space-y-1">
                   <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Resumo do Risco</label>
                   <input 
                    type="text"
                    value={item.riskTitle.replace(/<[^>]*>/g, '')}
                    onChange={(e) => updateItem(idx, { riskTitle: e.target.value })}
                    className="w-full p-2 text-[10px] font-black border rounded-lg bg-slate-50 outline-none focus:ring-1 focus:ring-blue-200"
                  />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Resumo do Plano</label>
                   <input 
                    type="text"
                    value={item.mitigationTitle.replace(/<[^>]*>/g, '')}
                    onChange={(e) => updateItem(idx, { mitigationTitle: e.target.value })}
                    className="w-full p-2 text-[10px] font-black border rounded-lg bg-slate-50 outline-none focus:ring-1 focus:ring-emerald-200"
                  />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addItem}
        className="w-full py-3 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Adicionar Novo Risco
      </button>
    </div>
  );
};