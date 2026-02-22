
import React from 'react';
import { Target, AlertTriangle, ShieldCheck, Maximize2, Hash, RefreshCcw, Type, Binary } from 'lucide-react';
import { KPIFormat } from '../../types';

interface GaugeEditorProps {
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

export const GaugeEditor: React.FC<GaugeEditorProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Valor Atual</label>
          <input 
            type="number" 
            step="any"
            value={config.value} 
            onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })} 
            className="w-full p-2 border rounded-xl text-[11px] font-black text-[#006098] outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Unidade de Apoio</label>
          <input 
            type="text" 
            placeholder="Ex: kg, pts"
            value={config.unit || ''} 
            onChange={(e) => onUpdate({ unit: e.target.value })} 
            className="w-full p-2 border rounded-xl text-[11px] font-bold outline-none" 
          />
        </div>
      </div>

      <div className="space-y-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
           <Binary size={12} className="text-[#0079C2]" />
           <span className="text-[9px] font-black uppercase text-[#006098] tracking-widest">Formatação dos Dados</span>
        </div>
        
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-gray-400 uppercase">Estilo Numérico</label>
          <select 
            value={config.format || 'DEFAULT'} 
            onChange={(e) => onUpdate({ format: e.target.value as KPIFormat })}
            className="w-full p-2 border rounded-xl text-[10px] font-bold text-[#006098] outline-none bg-white"
          >
            {Object.entries(FORMAT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center justify-between p-1 cursor-pointer hover:bg-white rounded-lg transition-colors group">
          <div className="flex items-center gap-2">
            <Hash size={12} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase">Abreviar (k/mi)</span>
          </div>
          <div 
            onClick={() => onUpdate({ abbreviate: !config.abbreviate })}
            className={`w-8 h-4 rounded-full transition-all relative ${config.abbreviate ? 'bg-[#0079C2]' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.abbreviate ? 'left-4.5' : 'left-0.5'}`} style={{ left: config.abbreviate ? '18px' : '2px' }} />
          </div>
        </label>
      </div>

      <div className="p-3 bg-slate-50 border rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Maximize2 size={12} className="text-[#0079C2]" />
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Escala de Precisão</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-gray-400 uppercase text-center block">Zero da Escala</label>
            <input type="number" step="any" value={config.min} onChange={(e) => onUpdate({ min: parseFloat(e.target.value) || 0 })} className="w-full p-1.5 text-[10px] border rounded text-center font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-gray-400 uppercase text-center block">Topo da Escala</label>
            <input type="number" step="any" value={config.max} onChange={(e) => onUpdate({ max: parseFloat(e.target.value) || 100 })} className="w-full p-1.5 text-[10px] border rounded text-center font-bold" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
           <div className="space-y-1">
             <div className="flex justify-between items-center text-[8px] font-black uppercase mb-1">
                <span className="text-rose-500 flex items-center gap-1"><AlertTriangle size={8} /> Limite de Alerta</span>
                <span className="text-slate-400">{config.lowThreshold}</span>
             </div>
             <input type="range" min={config.min} max={config.highThreshold} step="1" value={config.lowThreshold} onChange={(e) => onUpdate({ lowThreshold: parseInt(e.target.value) })} className="w-full h-1 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500" />
           </div>

           <div className="space-y-1">
             <div className="flex justify-between items-center text-[8px] font-black uppercase mb-1">
                <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck size={8} /> Limite de Sucesso</span>
                <span className="text-slate-400">{config.highThreshold}</span>
             </div>
             <input type="range" min={config.lowThreshold} max={config.max} step="1" value={config.highThreshold} onChange={(e) => onUpdate({ highThreshold: parseInt(e.target.value) })} className="w-full h-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
           </div>
        </div>
      </div>

      <button 
        onClick={() => onUpdate({ invertColors: !config.invertColors })}
        className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all text-[9px] font-black uppercase ${
          config.invertColors 
            ? 'bg-amber-50 border-amber-200 text-amber-600' 
            : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
        }`}
      >
        <RefreshCcw size={12} className={config.invertColors ? 'animate-spin-slow' : ''} />
        Inverter Cores (Menor é Melhor)
      </button>
    </div>
  );
};
