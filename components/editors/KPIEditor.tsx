
import React, { useEffect, useRef } from 'react';
import { Minus, Plus, Target, Hash, TrendingUp, Layout, Trash2, Eye, ToggleLeft, ToggleRight, LayoutGrid } from 'lucide-react';
import { KPIFormat } from '../../types';

interface KPIEditorProps {
  kpis: any[];
  config?: any;
  activeSubItemIndex?: number | null;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdate: (kpis: any[], otherUpdates?: any) => void;
}

const FORMAT_LABELS: Record<KPIFormat, string> = {
  DEFAULT: 'Auto (L)',
  INTEGER: 'Inteiro (1)',
  DECIMAL: 'Decimal (1,00)',
  PERCENT: 'Percentual (%)',
  CURRENCY: 'Moeda (R$)',
  TIME: 'Tempo (h)',
  DATE: 'Data (DD/MM)'
};

export const KPIEditor: React.FC<KPIEditorProps> = ({ kpis = [], config, activeSubItemIndex, onActiveSubItemChange, onUpdate }) => {
  const kpiRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (activeSubItemIndex !== null && activeSubItemIndex !== undefined && kpiRefs.current[activeSubItemIndex]) {
      kpiRefs.current[activeSubItemIndex]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [activeSubItemIndex]);

  const updateKPI = (idx: number, field: string, value: any) => {
    const newKpis = kpis.map((k, i) => i === idx ? { ...k, [field]: value } : k);
    onUpdate(newKpis);
  };

  const updateGridCols = (cols: number) => {
    onUpdate(kpis, { columns: cols });
  };

  const removeKPI = (idx: number) => {
    onUpdate(kpis.filter((_, i) => i !== idx));
    if (activeSubItemIndex === idx) onActiveSubItemChange?.(null);
  };

  const addSubMeasure = (idx: number) => {
    const subMeasures = [...(kpis[idx].subMeasures || []), { label: 'Novo', value: '0' }];
    updateKPI(idx, 'subMeasures', subMeasures);
  };

  const ToggleControl = ({ value, onToggle, label, icon: Icon }: any) => (
    <label className="flex items-center justify-between cursor-pointer group py-1">
      <div className="flex items-center gap-2">
        <Icon size={12} className={value ? 'text-[#0079C2]' : 'text-slate-300'} />
        <span className={`text-[9px] font-bold uppercase transition-colors ${value ? 'text-[#006098]' : 'text-slate-400'}`}>
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
    <div className="space-y-4">
      {/* Configuração de Layout do Grupo */}
      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid size={12} className="text-[#0079C2]" />
          <span className="text-[9px] font-black uppercase text-[#006098] tracking-widest">Configuração da Grade</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase">Colunas por linha</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                onClick={() => updateGridCols(num)}
                className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all border ${
                  (config?.columns || 4) === num 
                    ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {kpis.map((kpi, idx) => {
        const isActive = activeSubItemIndex === idx;
        return (
          <div 
            key={idx} 
            ref={el => { kpiRefs.current[idx] = el; }}
            onClick={() => onActiveSubItemChange?.(idx)}
            className={`p-4 border rounded-2xl relative group transition-all duration-300 cursor-pointer ${
              isActive 
                ? 'bg-white border-[#0079C2] shadow-xl ring-4 ring-blue-500/5' 
                : 'bg-slate-50/50 border-transparent hover:border-slate-200'
            }`}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); removeKPI(idx); }} 
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg hover:scale-110"
            >
              <Trash2 size={10} />
            </button>
            
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-[#006098]' : 'text-slate-400'}`}>
                Indicador #{idx + 1}
              </span>
              {isActive && (
                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-[#0079C2] animate-pulse">
                  <Target size={10} /> Ativo no Preview
                </div>
              )}
            </div>

            <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Rótulo (Label)</label>
                  <input 
                    type="text" 
                    value={kpi.label} 
                    onChange={(e) => updateKPI(idx, 'label', e.target.value)} 
                    className="w-full p-2 text-[11px] font-black text-[#006098] border rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-200 uppercase" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Valor Atual</label>
                    <input 
                      type="number" step="any" value={kpi.current} 
                      onChange={(e) => updateKPI(idx, 'current', parseFloat(e.target.value) || 0)} 
                      className="w-full p-2 text-[11px] border rounded-xl font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Formato</label>
                    <select 
                      value={kpi.format || 'DEFAULT'} 
                      onChange={(e) => updateKPI(idx, 'format', e.target.value as KPIFormat)}
                      className="w-full p-2 text-[10px] border rounded-xl bg-white font-bold text-[#006098] outline-none"
                    >
                      {Object.entries(FORMAT_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={11} className="text-[#0079C2]" />
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Recursos do Card</span>
                </div>
                <ToggleControl label="Variação (Anterior)" value={kpi.showDelta !== false} onToggle={(v: any) => updateKPI(idx, 'showDelta', v)} icon={TrendingUp} />
                <ToggleControl label="Meta e Barra %" value={kpi.showGoal !== false} onToggle={(v: any) => updateKPI(idx, 'showGoal', v)} icon={Target} />
                <ToggleControl label="Sub-medidas" value={kpi.showSubMeasures !== false} onToggle={(v: any) => updateKPI(idx, 'showSubMeasures', v)} icon={Layout} />
              </div>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {kpi.showDelta !== false && (
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Valor do Período Anterior</label>
                    <input 
                      type="number" step="any" value={kpi.prev} 
                      onChange={(e) => updateKPI(idx, 'prev', parseFloat(e.target.value) || 0)} 
                      className="w-full p-2 text-[11px] border rounded-xl bg-white"
                    />
                  </div>
                )}
                
                {kpi.showGoal !== false && (
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1"><Target size={10} className="text-[#0079C2]" /> Meta (Goal)</label>
                    <input 
                      type="number" step="any" value={kpi.goal || ''} 
                      onChange={(e) => updateKPI(idx, 'goal', parseFloat(e.target.value) || 0)} 
                      className="w-full p-2 text-[11px] border rounded-xl bg-white font-black text-[#006098]"
                      placeholder="Ex: 1000"
                    />
                  </div>
                )}
              </div>

              {kpi.showSubMeasures !== false && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Sub-medidas</label>
                    <button onClick={() => addSubMeasure(idx)} className="text-[#0079C2] hover:bg-blue-50 p-1 rounded-lg transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(kpi.subMeasures || []).map((sm: any, smIdx: number) => (
                      <div key={smIdx} className="flex items-center gap-2 group/sm">
                        <input 
                          value={sm.label} 
                          onChange={(e) => {
                            const newSubs = [...kpi.subMeasures];
                            newSubs[smIdx].label = e.target.value;
                            updateKPI(idx, 'subMeasures', newSubs);
                          }}
                          placeholder="Label"
                          className="flex-1 p-1.5 text-[9px] border rounded-lg"
                        />
                        <input 
                          value={sm.value} 
                          onChange={(e) => {
                            const newSubs = [...kpi.subMeasures];
                            newSubs[smIdx].value = e.target.value;
                            updateKPI(idx, 'subMeasures', newSubs);
                          }}
                          placeholder="Valor"
                          className="w-16 p-1.5 text-[9px] border rounded-lg font-black text-[#006098]"
                        />
                        <button 
                          onClick={() => {
                            const newSubs = kpi.subMeasures.filter((_: any, i: number) => i !== smIdx);
                            updateKPI(idx, 'subMeasures', newSubs);
                          }}
                          className="text-rose-400 p-1"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2 border-t border-slate-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={kpi.abbreviate} onChange={e => updateKPI(idx, 'abbreviate', e.target.checked)} className="rounded text-[#0079C2]" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Abreviar (k/mi)</span>
                </label>
              </div>
            </div>
          </div>
        );
      })}
      
      <button 
        onClick={() => {
          const newKpis = [...kpis, { label: "Novo Indicador", current: 0, prev: 0, format: 'DEFAULT', abbreviate: false, trendData: '', goal: 0, subMeasures: [], showDelta: true, showGoal: true, showTrend: true, showSubMeasures: true }];
          onUpdate(newKpis);
          onActiveSubItemChange?.(newKpis.length - 1);
        }}
        className="w-full py-4 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-2xl hover:bg-blue-50 flex items-center justify-center gap-2 group transition-all"
      >
        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
        Adicionar Indicador ao Grupo
      </button>
    </div>
  );
};
