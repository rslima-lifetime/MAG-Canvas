
import React from 'react';
import { Target, TrendingUp, Plus, Trash2, Hash, ToggleLeft, ToggleRight, Eye, Layout, Type, Binary } from 'lucide-react';
import { KPIFormat } from '../../types';

interface KPIBlockEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

const FORMAT_LABELS: Record<KPIFormat, string> = {
  DEFAULT: 'Padrão (L)',
  INTEGER: 'Inteiro (1)',
  DECIMAL: 'Decimal (0,00)',
  PERCENT: 'Percentual (%)',
  CURRENCY: 'Moeda (R$)',
  TIME: 'Tempo (h)',
  DATE: 'Data (DD/MM/AAAA)'
};

export const KPIBlockEditor: React.FC<KPIBlockEditorProps> = ({ config, onUpdate }) => {
  const updateSubMeasure = (idx: number, field: string, val: string) => {
    const newSubs = [...(config.subMeasures || [])];
    newSubs[idx] = { ...newSubs[idx], [field]: val };
    onUpdate({ subMeasures: newSubs });
  };

  const addSubMeasure = () => {
    onUpdate({ subMeasures: [...(config.subMeasures || []), { label: 'Nova', value: '0' }] });
  };

  const removeSubMeasure = (idx: number) => {
    onUpdate({ subMeasures: (config.subMeasures || []).filter((_: any, i: number) => i !== idx) });
  };

  const Toggle = ({ value, onToggle, label, icon: Icon }: any) => (
    <label className="flex items-center justify-between cursor-pointer group py-1">
      <div className="flex items-center gap-2">
        <Icon size={12} className={value ? 'text-[#0079C2]' : 'text-slate-300'} />
        <span className={`text-[10px] font-bold uppercase transition-colors ${value ? 'text-[#006098]' : 'text-slate-400 group-hover:text-slate-500'}`}>
          {label}
        </span>
      </div>
      <div 
        onClick={(e) => { e.stopPropagation(); onToggle(!value); }}
        className={`transition-colors ${value ? 'text-[#00A7E7]' : 'text-slate-300'}`}
      >
        {value ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
      </div>
    </label>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Nome do Indicador Principal */}
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
          <Type size={10} className="text-[#0079C2]" /> Nome do Indicador (Rótulo Interno)
        </label>
        <input 
          type="text" 
          value={config.label || ''} 
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full p-2.5 border rounded-xl text-[11px] font-black text-[#006098] uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Ex: Taxa de Conversão"
        />
      </div>

      {/* Seção de Formatação */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <Binary size={10} className="text-[#0079C2]" /> Formato do Valor
          </label>
          <select 
            value={config.format || 'DEFAULT'} 
            onChange={(e) => onUpdate({ format: e.target.value as KPIFormat })}
            className="w-full p-2.5 border rounded-xl text-[11px] font-bold text-[#006098] outline-none bg-white"
          >
            {Object.entries(FORMAT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Abreviar (k/mi)</label>
          <button 
            onClick={() => onUpdate({ abbreviate: !config.abbreviate })}
            className={`w-10 h-6 rounded-full transition-all relative ${config.abbreviate ? 'bg-[#0079C2]' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.abbreviate ? 'left-5' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Seção de Visibilidade */}
      <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Eye size={12} className="text-[#0079C2]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visibilidade e Recursos</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <Toggle 
            label="Variação (Delta)" 
            value={config.showDelta !== false} 
            onToggle={(v: boolean) => onUpdate({ showDelta: v })}
            icon={TrendingUp}
          />
          <Toggle 
            label="Meta e Atingimento" 
            value={config.showGoal !== false} 
            onToggle={(v: boolean) => onUpdate({ showGoal: v })}
            icon={Target}
          />
          <Toggle 
            label="Gráfico de Tendência" 
            value={config.showTrend !== false} 
            onToggle={(v: boolean) => onUpdate({ showTrend: v })}
            icon={TrendingUp}
          />
          <Toggle 
            label="Sub-medidas" 
            value={config.showSubMeasures !== false} 
            onToggle={(v: boolean) => onUpdate({ showSubMeasures: v })}
            icon={Layout}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Valor Atual</label>
          <input 
            type="number" 
            step="any"
            value={config.current || 0} 
            onChange={(e) => onUpdate({ current: parseFloat(e.target.value) })}
            className="w-full p-2 border rounded-xl text-[11px] font-bold"
          />
        </div>
        {(config.showDelta !== false) && (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">V. Anterior (Variação)</label>
            <input 
              type="number" 
              step="any"
              value={config.prev || 0} 
              onChange={(e) => onUpdate({ prev: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded-xl text-[11px]"
            />
          </div>
        )}
      </div>

      {(config.showGoal !== false) && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <Target size={10} className="text-[#0079C2]" /> Valor da Meta (Goal)
          </label>
          <input 
            type="number" 
            step="any"
            value={config.goal || 0} 
            onChange={(e) => onUpdate({ goal: parseFloat(e.target.value) })}
            className="w-full p-2 border rounded-xl text-[11px] font-black text-[#006098]"
          />
        </div>
      )}

      {(config.showTrend !== false) && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <TrendingUp size={10} className="text-[#00A7E7]" /> Dados da Tendência (CSV)
          </label>
          <input 
            type="text" 
            placeholder="Ex: 10, 15, 12, 18, 20"
            value={config.trendData || ''} 
            onChange={(e) => onUpdate({ trendData: e.target.value })}
            className="w-full p-2 border rounded-xl text-[10px] font-mono"
          />
        </div>
      )}

      {(config.showSubMeasures !== false) && (
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Sub-medidas</label>
            <button onClick={addSubMeasure} className="text-[#0079C2] hover:bg-blue-50 p-1 rounded transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            {(config.subMeasures || []).map((sm: any, i: number) => (
              <div key={i} className="flex items-center gap-2 group">
                <input 
                  type="text" 
                  value={sm.label} 
                  onChange={(e) => updateSubMeasure(i, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1 p-1.5 text-[9px] border rounded"
                />
                <input 
                  type="text" 
                  value={sm.value} 
                  onChange={(e) => updateSubMeasure(i, 'value', e.target.value)}
                  placeholder="Valor"
                  className="w-16 p-1.5 text-[9px] border rounded font-bold"
                />
                <button onClick={() => removeSubMeasure(i)} className="text-rose-400 opacity-0 group-hover:opacity-100 p-1">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
