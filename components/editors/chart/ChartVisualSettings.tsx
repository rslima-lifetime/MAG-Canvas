
import React from 'react';
import { Eye, EyeOff, Hash, ArrowLeftRight, Target, MoveVertical, Tag, Layers, BarChart3, Maximize } from 'lucide-react';
import { LabelContent } from '../../../types';

interface ChartVisualSettingsProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export const ChartVisualSettings: React.FC<ChartVisualSettingsProps> = ({ config, onUpdate }) => {
  const isPieType = config.type === 'PIE' || config.type === 'DOUGHNUT';
  const isBarOrColumn = config.type === 'BAR' || config.type === 'COLUMN';
  const currentFontSize = config.fontSize || 8;
  const currentXMargin = config.xAxisMargin || 0;
  const currentHeight = config.chartHeight || 300;

  return (
    <div className="space-y-4">
      {/* Seletor de Empilhamento (Apenas Barras/Colunas) */}
      {isBarOrColumn && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
            <Layers size={10} className="text-[#0079C2]" /> Modo de Exibição
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button 
              onClick={() => onUpdate({ stackMode: 'GROUPED' })}
              className={`py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all ${(!config.stackMode || config.stackMode === 'GROUPED') ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
            >
              Agrupado
            </button>
            <button 
              onClick={() => onUpdate({ stackMode: 'STACKED' })}
              className={`py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all ${config.stackMode === 'STACKED' ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
            >
              Empilhado
            </button>
            <button 
              onClick={() => onUpdate({ stackMode: 'PERCENT' })}
              className={`py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all ${config.stackMode === 'PERCENT' ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
            >
              100% (Prop.)
            </button>
          </div>
        </div>
      )}

      {/* Botões de Toggle (Grid) */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-inner">
        <button 
          onClick={() => onUpdate({ showLabels: !config.showLabels })}
          className={`flex flex-col items-center justify-center gap-1 p-1 rounded-lg border transition-all ${!!config.showLabels ? 'bg-white border-[#0079C2] text-[#0079C2] shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100'}`}
          title="Exibir rótulos nos dados"
        >
          {!!config.showLabels ? <Eye size={12} /> : <EyeOff size={12} />}
          <span className="text-[7px] font-black uppercase leading-tight">Rótulos</span>
        </button>
        <button 
          onClick={() => onUpdate({ showLegend: config.showLegend === undefined ? (isPieType ? false : true) : !config.showLegend })}
          className={`flex flex-col items-center justify-center gap-1 p-1 rounded-lg border transition-all ${config.showLegend !== false ? 'bg-white border-[#0079C2] text-[#0079C2] shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100'}`}
          title="Exibir legenda das séries"
        >
          {(config.showLegend !== false) ? <Eye size={12} /> : <EyeOff size={12} />}
          <span className="text-[7px] font-black uppercase leading-tight">Legenda</span>
        </button>
        <button 
          onClick={() => onUpdate({ showXAxis: config.showXAxis === undefined ? true : !config.showXAxis })}
          className={`flex flex-col items-center justify-center gap-1 p-1 rounded-lg border transition-all ${config.showXAxis !== false ? 'bg-white border-[#0079C2] text-[#0079C2] shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100'}`}
          title="Exibir eixo X (Categorias)"
        >
          {config.showXAxis !== false ? <ArrowLeftRight size={12} /> : <EyeOff size={12} />}
          <span className="text-[7px] font-black uppercase leading-tight">Eixo X</span>
        </button>
        <button 
          onClick={() => onUpdate({ abbreviateValues: !config.abbreviateValues })}
          className={`flex flex-col items-center justify-center gap-1 p-1 rounded-lg border transition-all ${config.abbreviateValues ? 'bg-white border-[#0079C2] text-[#0079C2] shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100'}`}
          title="Abreviar valores (ex: 1.5k)"
        >
          <Hash size={12} />
          <span className="text-[7px] font-black uppercase leading-tight">Abrev</span>
        </button>
        
        {/* Botão de Linha de Meta */}
        {!isPieType && config.stackMode !== 'PERCENT' && (
          <button 
            onClick={() => onUpdate({ showGoalLine: !config.showGoalLine })}
            className={`col-span-4 flex items-center justify-between gap-2 px-3 py-1.5 mt-1 rounded-lg border transition-all ${config.showGoalLine ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100'}`}
            title="Adicionar Linha de Meta"
          >
            <div className="flex items-center gap-2">
              <Target size={12} />
              <span className="text-[8px] font-black uppercase leading-tight">Linha de Meta</span>
            </div>
            {config.showGoalLine ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        )}
      </div>

      {/* Input de Valor da Meta (Condicional) */}
      {!isPieType && config.showGoalLine && config.stackMode !== 'PERCENT' && (
        <div className="animate-in fade-in slide-in-from-top-1 -mt-2 p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
              Valor da Meta
            </label>
            <input 
              type="number" 
              step="any"
              value={config.goalValue || 0} 
              onChange={(e) => onUpdate({ goalValue: parseFloat(e.target.value) })}
              className="w-full p-1.5 text-[10px] font-black border rounded bg-white text-[#006098] outline-none focus:ring-1 focus:ring-amber-200"
              placeholder="Ex: 100"
            />
          </div>
        </div>
      )}

      {/* Sliders: Altura, Fonte e Margem */}
      <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        
        {/* Altura do Gráfico (Densidade) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
            <div className="flex items-center gap-1">
              <Maximize size={10} className="text-[#0079C2] rotate-90" />
              <span>Altura (Densidade)</span>
            </div>
            <span className="text-[#0079C2] font-black">{currentHeight}px</span>
          </div>
          <div className="px-1">
            <input 
              type="range" 
              min="150" 
              max="600" 
              step="10" 
              value={currentHeight} 
              onChange={(e) => onUpdate({ chartHeight: parseInt(e.target.value) })} 
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A7E7] hover:accent-[#0079C2] transition-all" 
            />
          </div>
        </div>

        {/* Fonte */}
        <div className="space-y-1 border-t border-slate-200 pt-3">
          <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
            <div className="flex items-center gap-1">
              <MoveVertical size={10} className="text-[#0079C2]" />
              <span>Tamanho da Fonte</span>
            </div>
            <span className="text-[#0079C2] font-black">{currentFontSize}px</span>
          </div>
          <div className="px-1">
            <input 
              type="range" 
              min="6" 
              max="16" 
              step="1" 
              value={currentFontSize} 
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })} 
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A7E7] hover:accent-[#0079C2] transition-all" 
            />
          </div>
        </div>

        {/* Margem Eixo X / Y (Categorias) */}
        {!isPieType && (
          <div className="space-y-1 border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
              <div className="flex items-center gap-1">
                <ArrowLeftRight size={10} className="text-[#0079C2] rotate-90" />
                <span>Distância Rótulo Eixo</span>
              </div>
              <span className="text-[#0079C2] font-black">+{currentXMargin}px</span>
            </div>
            <div className="px-1">
              <input 
                type="range" 
                min="0" 
                max="60" 
                step="5" 
                value={currentXMargin} 
                onChange={(e) => onUpdate({ xAxisMargin: parseInt(e.target.value) })} 
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A7E7] hover:accent-[#0079C2] transition-all" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Tipo de Rótulo */}
      <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1"><Tag size={10} /> Conteúdo do Rótulo</label>
        <select 
          value={config.labelContent || (isPieType ? 'LABEL_VALUE' : 'VALUE')} 
          onChange={(e) => onUpdate({ labelContent: e.target.value as LabelContent })} 
          className="w-full p-1.5 text-[10px] border rounded bg-white text-[#006098] outline-none shadow-sm font-bold"
        >
          <option value="VALUE">Apenas Valor</option>
          <option value="PERCENT">Apenas Percentual</option>
          <option value="LABEL_VALUE">Rótulo + Valor</option>
          <option value="LABEL_PERCENT">Rótulo + Percentual</option>
          <option value="ALL">Completo (Rótulo + Valor + %)</option>
        </select>
      </div>
    </div>
  );
};
