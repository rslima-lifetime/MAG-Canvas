
import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, TrendingUp, AreaChart as AreaIcon, 
  PieChart as PieIcon, Donut, Eye, EyeOff, List, 
  ArrowLeftRight, Target, Hash, Type, Minus, Plus,
  LayoutGrid, Layers, Percent, Settings2, ChevronDown, Check
} from 'lucide-react';
import { ChartType } from '../../../types';

interface ChartToolbarProps {
  type: ChartType;
  stackMode?: 'GROUPED' | 'STACKED' | 'PERCENT';
  fontSize: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showXAxis?: boolean;
  showGoalLine?: boolean;
  goalValue?: number;
  abbreviate?: boolean;
  onUpdateConfig: (updates: any) => void;
  finalShowLegend: boolean;
  isPieType: boolean;
  isBarOrColumn: boolean;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  type, stackMode, fontSize, showLabels, showLegend, showXAxis, showGoalLine, goalValue, abbreviate,
  onUpdateConfig, finalShowLegend, isPieType, isBarOrColumn
}) => {
  const [activeMenu, setActiveMenu] = useState<'TYPE' | 'STACK' | 'VIEW' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateFontSize = (newSize: number) => {
    const capped = Math.min(Math.max(newSize, 6), 24);
    onUpdateConfig({ fontSize: capped });
  };

  const CHART_TYPES: { id: ChartType, label: string, icon: any }[] = [
    { id: 'COLUMN', label: 'Colunas', icon: BarChart3 },
    { id: 'BAR', label: 'Barras', icon: (props: any) => <BarChart3 {...props} className="rotate-90" /> },
    { id: 'LINE', label: 'Linhas', icon: TrendingUp },
    { id: 'AREA', label: 'Área', icon: AreaIcon },
    { id: 'PIE', label: 'Pizza', icon: PieIcon },
    { id: 'DOUGHNUT', label: 'Rosca', icon: Donut },
  ];

  const CurrentTypeIcon = CHART_TYPES.find(t => t.id === type)?.icon || BarChart3;

  return (
    <div 
      ref={menuRef}
      className="absolute -top-12 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-2 bg-white shadow-[0_4px_20px_-5px_rgba(0,0,0,0.15)] border border-slate-200 rounded-full px-2 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-max"
      onClick={(e) => e.stopPropagation()}
    >
       {/* 1. SELETOR DE TIPO (DROPDOWN) */}
       <div className="relative">
         <button 
            onClick={() => setActiveMenu(activeMenu === 'TYPE' ? null : 'TYPE')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${activeMenu === 'TYPE' ? 'bg-blue-50 border-blue-200 text-[#0079C2]' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
         >
            <CurrentTypeIcon size={14} />
            <span className="text-[10px] font-black uppercase tracking-tight">{CHART_TYPES.find(t => t.id === type)?.label}</span>
            <ChevronDown size={10} strokeWidth={3} className="opacity-50" />
         </button>

         {activeMenu === 'TYPE' && (
           <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 grid grid-cols-2 gap-1 min-w-[180px] animate-in zoom-in-95 duration-150 z-[900]">
              {CHART_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { onUpdateConfig({ type: t.id }); setActiveMenu(null); }}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${type === t.id ? 'bg-[#0079C2] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
           </div>
         )}
       </div>

       <div className="w-px h-4 bg-slate-200" />

       {/* 2. SELETOR DE EMPILHAMENTO (Apenas Barras/Colunas) */}
       {isBarOrColumn && (
         <>
           <div className="relative">
             <button 
                onClick={() => setActiveMenu(activeMenu === 'STACK' ? null : 'STACK')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${activeMenu === 'STACK' ? 'bg-blue-50 border-blue-200 text-[#0079C2]' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
             >
                {stackMode === 'STACKED' ? <Layers size={14} /> : (stackMode === 'PERCENT' ? <Percent size={14} /> : <LayoutGrid size={14} />)}
                <ChevronDown size={10} strokeWidth={3} className="opacity-50" />
             </button>

             {activeMenu === 'STACK' && (
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 min-w-[140px] animate-in zoom-in-95 duration-150 z-[900]">
                  <button onClick={() => { onUpdateConfig({ stackMode: 'GROUPED' }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase ${(!stackMode || stackMode === 'GROUPED') ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2"><LayoutGrid size={12} /> Agrupado</span>
                    {(!stackMode || stackMode === 'GROUPED') && <Check size={10} />}
                  </button>
                  <button onClick={() => { onUpdateConfig({ stackMode: 'STACKED' }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase ${stackMode === 'STACKED' ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2"><Layers size={12} /> Empilhado</span>
                    {stackMode === 'STACKED' && <Check size={10} />}
                  </button>
                  <button onClick={() => { onUpdateConfig({ stackMode: 'PERCENT' }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase ${stackMode === 'PERCENT' ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2"><Percent size={12} /> 100% Prop.</span>
                    {stackMode === 'PERCENT' && <Check size={10} />}
                  </button>
               </div>
             )}
           </div>
           <div className="w-px h-4 bg-slate-200" />
         </>
       )}

       {/* 3. TAMANHO DA FONTE (CONTROLE DIRETO) */}
       <div className="flex items-center gap-1 bg-slate-50 rounded-full px-1.5 py-0.5 border border-slate-100">
         <button onClick={() => handleUpdateFontSize(fontSize - 1)} className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-[#0079C2] transition-colors"><Minus size={10} strokeWidth={3} /></button>
         <span className="text-[9px] font-black text-[#006098] w-4 text-center">{fontSize}</span>
         <button onClick={() => handleUpdateFontSize(fontSize + 1)} className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-[#0079C2] transition-colors"><Plus size={10} strokeWidth={3} /></button>
       </div>

       <div className="w-px h-4 bg-slate-200" />

       {/* 4. OPÇÕES DE EXIBIÇÃO (MENU) */}
       <div className="relative">
         <button 
            onClick={() => setActiveMenu(activeMenu === 'VIEW' ? null : 'VIEW')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${activeMenu === 'VIEW' ? 'bg-blue-50 border-blue-200 text-[#0079C2]' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
            title="Opções de Visualização"
         >
            <Settings2 size={14} />
            <span className="text-[10px] font-black uppercase tracking-tight">Opções</span>
            <ChevronDown size={10} strokeWidth={3} className="opacity-50" />
         </button>

         {activeMenu === 'VIEW' && (
           <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex flex-col gap-1 min-w-[200px] animate-in zoom-in-95 duration-150 z-[900]">
              
              <button onClick={() => onUpdateConfig({ showLabels: !showLabels })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                    {showLabels ? <Eye size={12} className="text-[#0079C2]" /> : <EyeOff size={12} className="text-slate-400" />}
                    Rótulos de Valor
                 </div>
                 {showLabels && <Check size={10} className="text-[#0079C2]" />}
              </button>

              <button onClick={() => onUpdateConfig({ showLegend: finalShowLegend === false ? true : !showLegend })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                    <List size={12} className={finalShowLegend ? "text-[#0079C2]" : "text-slate-400"} />
                    Legenda
                 </div>
                 {finalShowLegend && <Check size={10} className="text-[#0079C2]" />}
              </button>

              <button onClick={() => onUpdateConfig({ showXAxis: !showXAxis })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                    <ArrowLeftRight size={12} className={showXAxis ? "text-[#0079C2]" : "text-slate-400"} />
                    Eixo X (Categorias)
                 </div>
                 {showXAxis && <Check size={10} className="text-[#0079C2]" />}
              </button>

              <button onClick={() => onUpdateConfig({ abbreviateValues: !abbreviate })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                    <Hash size={12} className={abbreviate ? "text-[#0079C2]" : "text-slate-400"} />
                    Abreviar (K / Mi)
                 </div>
                 {abbreviate && <Check size={10} className="text-[#0079C2]" />}
              </button>

              {!isPieType && stackMode !== 'PERCENT' && (
                <div className="pt-2 mt-1 border-t border-slate-100">
                   <div className="flex items-center justify-between px-2 py-1">
                      <button onClick={() => onUpdateConfig({ showGoalLine: !showGoalLine })} className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600 hover:text-[#0079C2]">
                         <Target size={12} className={showGoalLine ? "text-amber-500" : "text-slate-400"} />
                         Linha de Meta
                      </button>
                      {showGoalLine && (
                        <input 
                          type="number" 
                          value={goalValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateConfig({ goalValue: parseFloat(e.target.value) || 0 })}
                          className="w-16 p-1 text-[9px] font-black text-right border rounded bg-slate-50 focus:bg-white outline-none text-[#006098]"
                          placeholder="Valor"
                        />
                      )}
                   </div>
                </div>
              )}
           </div>
         )}
       </div>
    </div>
  );
};
