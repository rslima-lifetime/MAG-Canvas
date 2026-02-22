
import React, { useState } from 'react';
import { 
  Trash2, ArrowUp, ArrowDown, Tag, Bold, Italic, Underline, Palette, Copy, Layers, Check, 
  MessageSquare, Eye, EyeOff, ChevronDown, List, Type, BarChart3, TrendingUp, AreaChart as AreaIcon,
  PieChart as PieIcon, Donut, LayoutGrid, Percent, Settings2, ArrowLeftRight, Hash, Target, Minus, Plus
} from 'lucide-react';
import { Block, BlockWidth, TextStyle, ChartType } from '../types';

interface BlockToolbarProps {
  block: Block;
  selectedCount?: number;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
}

const WIDTH_OPTIONS: { label: string, value: BlockWidth, desc: string }[] = [
  { label: '100%', value: 'FULL', desc: 'Largura Total' },
  { label: '75%', value: 'THREE_QUARTERS', desc: '3/4 da Página' },
  { label: '66%', value: 'TWO_THIRDS', desc: '2/3 da Página' },
  { label: '50%', value: 'HALF', desc: 'Metade' },
  { label: '33%', value: 'THIRD', desc: '1/3 (Terço)' },
  { label: '25%', value: 'QUARTER', desc: '1/4 (Quarto)' },
];

const CHART_TYPES: { id: ChartType, label: string, icon: any }[] = [
  { id: 'COLUMN', label: 'Colunas', icon: BarChart3 },
  { id: 'BAR', label: 'Barras', icon: (props: any) => <BarChart3 {...props} className="rotate-90" /> },
  { id: 'LINE', label: 'Linhas', icon: TrendingUp },
  { id: 'AREA', label: 'Área', icon: AreaIcon },
  { id: 'PIE', label: 'Pizza', icon: PieIcon },
  { id: 'DOUGHNUT', label: 'Rosca', icon: Donut },
];

const TEXT_STYLES: { label: string, value: TextStyle }[] = [
  { label: 'Simples', value: 'PLAIN' },
  { label: 'Contexto', value: 'INTRO' },
  { label: 'Insight', value: 'INSIGHT' },
  { label: 'Conclusão', value: 'CONCLUSION' },
  { label: 'Objetivo', value: 'OBJECTIVE' },
  { label: 'Atenção', value: 'ATTENTION' },
  { label: 'Tópicos', value: 'BULLETS' },
  { label: 'Modelo P.A.R', value: 'PAR_MODEL' },
];

const FONT_SIZES = [
  { label: 'Pequeno', value: '1', css: '10px' },
  { label: 'Normal', value: '2', css: '13px' },
  { label: 'Grande', value: '4', css: '18px' },
  { label: 'Extra', value: '6', css: '32px' },
];

const COLORS = [
  { name: 'Padrão', value: 'inherit' },
  { name: 'MAG Azul', value: '#0079C2' },
  { name: 'MAG Escuro', value: '#006098' },
  { name: 'Destaque', value: '#00A7E7' },
  { name: 'Crítico', value: '#EF4444' },
  { name: 'Positivo', value: '#10B981' },
];

export const BlockToolbar: React.FC<BlockToolbarProps> = ({ 
  block, selectedCount = 1, onUpdate, onRemove, onMoveUp, onMoveDown, onDuplicate, onCopy 
}) => {
  const [activeMenu, setActiveMenu] = useState<'WIDTH' | 'STYLE' | 'SIZE' | 'COLOR' | 'CHART_TYPE' | 'CHART_STACK' | 'CHART_VIEW' | null>(null);
  
  const isText = block.type === 'TEXT_BOX';
  const isChart = block.type === 'CHART';
  const isMulti = selectedCount > 1;
  const showTitle = block.config.showTitle !== false;
  const showAnnotation = !!block.config.showAnnotation;

  // Chart specifics
  const isPieType = isChart && (block.config.type === 'PIE' || block.config.type === 'DOUGHNUT');
  const isBarOrColumn = isChart && (block.config.type === 'BAR' || block.config.type === 'COLUMN');
  const stackMode = block.config.stackMode;
  const chartFontSize = block.config.fontSize || 8;
  const CurrentChartIcon = isChart ? (CHART_TYPES.find(t => t.id === block.config.type)?.icon || BarChart3) : BarChart3;

  const updateConfig = (updates: any) => {
    onUpdate({ config: { ...block.config, ...updates } });
  };

  const format = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    setActiveMenu(null);
  };

  const handleChartFontSize = (delta: number) => {
    const newSize = Math.min(Math.max((block.config.fontSize || 8) + delta, 6), 24);
    updateConfig({ fontSize: newSize });
  };

  return (
    <div 
      className="absolute -top-14 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-1 bg-white shadow-2xl border border-gray-200 rounded-full px-3 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 no-print min-w-max"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. SEÇÃO DE GRÁFICO (Se for gráfico) */}
      {isChart && !isMulti && (
        <div className="flex items-center gap-1 pr-1 border-r border-gray-100 mr-1">
          {/* Tipo de Gráfico */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'CHART_TYPE' ? null : 'CHART_TYPE')}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full border transition-all ${activeMenu === 'CHART_TYPE' ? 'bg-blue-50 border-blue-200 text-[#0079C2]' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
              title="Tipo de Gráfico"
            >
              <CurrentChartIcon size={14} />
              <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">{CHART_TYPES.find(t => t.id === block.config.type)?.label}</span>
              <ChevronDown size={10} className="opacity-50" />
            </button>
            {activeMenu === 'CHART_TYPE' && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 grid grid-cols-2 gap-1 min-w-[180px] animate-in zoom-in-95 duration-150 z-[900]">
                {CHART_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { updateConfig({ type: t.id }); setActiveMenu(null); }}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${block.config.type === t.id ? 'bg-[#0079C2] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <t.icon size={14} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Empilhamento (Apenas Barras/Colunas) */}
          {isBarOrColumn && (
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'CHART_STACK' ? null : 'CHART_STACK')}
                className={`p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors ${activeMenu === 'CHART_STACK' ? 'bg-blue-50 text-[#0079C2]' : ''}`}
                title="Empilhamento"
              >
                {stackMode === 'STACKED' ? <Layers size={14} /> : (stackMode === 'PERCENT' ? <Percent size={14} /> : <LayoutGrid size={14} />)}
              </button>
              {activeMenu === 'CHART_STACK' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 min-w-[140px] animate-in zoom-in-95 duration-150 z-[900]">
                  <button onClick={() => { updateConfig({ stackMode: 'GROUPED' }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase ${(!stackMode || stackMode === 'GROUPED') ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2"><LayoutGrid size={12} /> Agrupado</span>
                    {(!stackMode || stackMode === 'GROUPED') && <Check size={10} />}
                  </button>
                  <button onClick={() => { updateConfig({ stackMode: 'STACKED' }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase ${stackMode === 'STACKED' ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2"><Layers size={12} /> Empilhado</span>
                    {stackMode === 'STACKED' && <Check size={10} />}
                  </button>
                  <button onClick={() => { updateConfig({ stackMode: 'PERCENT' }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase ${stackMode === 'PERCENT' ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2"><Percent size={12} /> 100% Prop.</span>
                    {stackMode === 'PERCENT' && <Check size={10} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tamanho da Fonte */}
          <div className="flex items-center gap-0.5 bg-slate-50 rounded-full px-1 py-0.5 border border-slate-100 mx-1">
            <button onClick={() => handleChartFontSize(-1)} className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-[#0079C2]"><Minus size={10} /></button>
            <span className="text-[9px] font-black text-[#006098] w-3 text-center">{chartFontSize}</span>
            <button onClick={() => handleChartFontSize(1)} className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-[#0079C2]"><Plus size={10} /></button>
          </div>

          {/* Opções de Exibição */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'CHART_VIEW' ? null : 'CHART_VIEW')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-full transition-all ${activeMenu === 'CHART_VIEW' ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Opções Visuais"
            >
              <Settings2 size={14} />
              <ChevronDown size={10} className="opacity-50" />
            </button>
            {activeMenu === 'CHART_VIEW' && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex flex-col gap-1 min-w-[180px] animate-in zoom-in-95 duration-150 z-[900]">
                <button onClick={() => updateConfig({ showLabels: !block.config.showLabels })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                      {block.config.showLabels ? <Eye size={12} className="text-[#0079C2]" /> : <EyeOff size={12} className="text-slate-400" />} Rótulos
                   </div>
                   {block.config.showLabels && <Check size={10} className="text-[#0079C2]" />}
                </button>
                <button onClick={() => updateConfig({ showLegend: block.config.showLegend === undefined ? (isPieType ? false : true) : !block.config.showLegend })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                      <List size={12} /> Legenda
                   </div>
                   {(block.config.showLegend !== false) && <Check size={10} className="text-[#0079C2]" />}
                </button>
                <button onClick={() => updateConfig({ showXAxis: !block.config.showXAxis })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                      <ArrowLeftRight size={12} /> Eixo X
                   </div>
                   {block.config.showXAxis && <Check size={10} className="text-[#0079C2]" />}
                </button>
                <button onClick={() => updateConfig({ abbreviateValues: !block.config.abbreviateValues })} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg group">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                      <Hash size={12} /> Abreviar
                   </div>
                   {block.config.abbreviateValues && <Check size={10} className="text-[#0079C2]" />}
                </button>
                {!isPieType && stackMode !== 'PERCENT' && (
                  <div className="pt-2 mt-1 border-t border-slate-100 px-2 py-1 flex items-center justify-between">
                     <button onClick={() => updateConfig({ showGoalLine: !block.config.showGoalLine })} className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600 hover:text-[#0079C2]">
                       <Target size={12} className={block.config.showGoalLine ? "text-amber-500" : "text-slate-400"} /> Meta
                     </button>
                     {block.config.showGoalLine && (
                       <input 
                         type="number" 
                         value={block.config.goalValue}
                         onClick={(e) => e.stopPropagation()}
                         onChange={(e) => updateConfig({ goalValue: parseFloat(e.target.value) || 0 })}
                         className="w-12 p-0.5 text-[9px] font-black text-right border rounded bg-slate-50 outline-none text-[#006098]"
                         placeholder="100"
                       />
                     )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SEÇÃO DE TEXTO (Se for texto) */}
      {!isMulti && isText && (
        <div className="flex items-center gap-0.5 pr-1 border-r border-gray-100 mr-1">
          <button onMouseDown={(e) => { e.preventDefault(); format('bold'); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Negrito"><Bold size={14} /></button>
          <button onMouseDown={(e) => { e.preventDefault(); format('italic'); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Itálico"><Italic size={14} /></button>
          <button onMouseDown={(e) => { e.preventDefault(); format('underline'); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Sublinhado"><Underline size={14} /></button>
          
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === 'SIZE' ? null : 'SIZE')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Tamanho da Fonte"><Type size={14} /></button>
            {activeMenu === 'SIZE' && (
              <div className="absolute top-full mt-2 left-0 bg-white shadow-2xl border border-slate-200 rounded-xl p-1 z-[810] min-w-[100px] flex flex-col animate-in fade-in slide-in-from-top-1">
                {FONT_SIZES.map(s => (
                  <button key={s.value} onMouseDown={(e) => { e.preventDefault(); format('fontSize', s.value); }} className="px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg text-left">{s.label}</button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === 'COLOR' ? null : 'COLOR')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Cor do Texto"><Palette size={14} /></button>
            {activeMenu === 'COLOR' && (
              <div className="absolute top-full mt-2 left-0 bg-white shadow-2xl border border-slate-200 rounded-xl p-2 z-[810] min-w-[120px] grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1">
                {COLORS.map(c => (
                  <button key={c.value} onMouseDown={(e) => { e.preventDefault(); format('foreColor', c.value); }} className="w-6 h-6 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: c.value }} title={c.name} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SEÇÃO GERAL (Título, Largura, Estilo) */}
      {!isMulti && (
        <div className="flex items-center gap-1">
          {/* Título e Comentários (Toggle) */}
          {block.type !== 'SECTION' && (
            <div className="flex items-center gap-0.5">
              <button 
                onClick={() => updateConfig({ showTitle: !showTitle })}
                className={`p-2 rounded-full transition-all ${showTitle ? 'text-slate-400 hover:bg-slate-50' : 'text-rose-500 bg-rose-50'}`}
                title="Exibir Título"
              >
                {showTitle ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button 
                onClick={() => updateConfig({ showAnnotation: !showAnnotation })}
                className={`p-2 rounded-full transition-all ${showAnnotation ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
                title="Comentários"
              >
                <MessageSquare size={14} />
              </button>
            </div>
          )}

          {/* Estilo de Texto (Dropdown) */}
          {isText && (
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'STYLE' ? null : 'STYLE')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase ${activeMenu === 'STYLE' ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {TEXT_STYLES.find(s => s.value === block.config.style)?.label || 'Estilo'}
                <ChevronDown size={10} />
              </button>
              {activeMenu === 'STYLE' && (
                <div className="absolute top-full mt-2 left-0 bg-white shadow-2xl border border-slate-200 rounded-xl p-1 z-[810] min-w-[140px] flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1">
                  {TEXT_STYLES.map((opt) => (
                    <button key={opt.value} onClick={() => { updateConfig({ style: opt.value }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-left text-[10px] font-bold transition-all hover:bg-slate-50 ${block.config.style === opt.value ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-600'}`}>
                      {opt.label}
                      {block.config.style === opt.value && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Largura (Dropdown) */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'WIDTH' ? null : 'WIDTH')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase ${activeMenu === 'WIDTH' ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Layers size={12} />
              {WIDTH_OPTIONS.find(w => w.value === block.width)?.label || '100%'}
              <ChevronDown size={10} />
            </button>
            {activeMenu === 'WIDTH' && (
              <div className="absolute top-full mt-2 left-0 bg-white shadow-2xl border border-slate-200 rounded-xl p-1 z-[810] min-w-[120px] flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1">
                {WIDTH_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { onUpdate({ width: opt.value }); setActiveMenu(null); }} className={`flex items-center justify-between px-3 py-2 rounded-lg text-left text-[10px] font-bold transition-all hover:bg-slate-50 ${block.width === opt.value ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-600'}`}>
                    {opt.label}
                    {block.width === opt.value && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. AÇÕES DE BLOCO */}
      <div className="w-px h-4 bg-gray-100 mx-1" />
      <button onClick={onMoveUp} className="p-2 text-gray-400 hover:text-[#0079C2] hover:bg-gray-100 rounded-full" title="Subir"><ArrowUp size={14} /></button>
      <button onClick={onMoveDown} className="p-2 text-gray-400 hover:text-[#0079C2] hover:bg-gray-100 rounded-full" title="Descer"><ArrowDown size={14} /></button>
      <button onClick={onDuplicate} className="p-2 text-gray-400 hover:text-[#0079C2] hover:bg-blue-50 rounded-full" title="Duplicar"><Copy size={14} /></button>
      <button onClick={onRemove} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full" title="Excluir"><Trash2 size={14} /></button>
    </div>
  );
};
