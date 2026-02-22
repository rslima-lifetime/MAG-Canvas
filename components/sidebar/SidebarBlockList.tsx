import React, { useEffect, useRef } from 'react';
import { GripVertical, ChevronDown, ChevronUp, History, MessageSquare } from 'lucide-react';
import { Block, BlockWidth, NarrativeBadge, BlockType } from '../../types';
import { KPIEditor } from '../editors/KPIEditor'; 
import { KPIBlockEditor } from '../editors/KPIBlockEditor';
import { TextEditor } from '../editors/TextEditor';
import { ChartEditor } from '../editors/ChartEditor';
import { TableEditor } from '../editors/TableEditor';
import { StepProcessEditor } from '../editors/StepProcessEditor';
import { NineBoxEditor } from '../editors/NineBoxEditor';
import { TimelineEditor } from '../editors/TimelineEditor';
import { InfographicListEditor } from '../editors/InfographicListEditor';
import { ProjectCalendarEditor } from '../editors/ProjectCalendarEditor';
import { SectionEditor } from '../editors/SectionEditor';
import { GaugeEditor } from '../editors/GaugeEditor';
import { RankingListEditor } from '../editors/RankingListEditor';
import { ImageEditor } from '../editors/ImageEditor';
import { ProjectStatusEditor } from '../editors/ProjectStatusEditor';
import { FunnelEditor } from '../editors/FunnelEditor';
import { RiskMatrixEditor } from '../editors/RiskMatrixEditor';
import { KanbanEditor } from '../editors/KanbanEditor';
import { ComparisonEditor } from '../editors/ComparisonEditor';

interface SidebarBlockListProps {
  blocks: Block[];
  activeBlockId: string | null;
  activeSubItemIndex?: number | null;
  onActiveBlockChange: (id: string | null) => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdatePage: (updates: any) => void;
}

const BLOCK_LABELS: Record<string, string> = {
  SECTION: 'Seção',
  TEXT_BOX: 'Texto',
  BIG_NUMBERS: 'Big Numbers',
  KPI: 'Solo KPI',
  INFOGRAPHIC_LIST: 'Destaques',
  CHART: 'Gráfico',
  TABLE: 'Tabela',
  PROJECT_CALENDAR: 'Calendário',
  STEP_PROCESS: 'Fluxo',
  TIMELINE: 'Timeline',
  NINE_BOX: 'NineBox',
  GAUGE: 'Velocímetro',
  RANKING_LIST: 'Ranking',
  IMAGE: 'Imagem',
  PROJECT_STATUS: 'Barra de Progresso',
  FUNNEL: 'Funil de Conversão',
  RISK_MATRIX: 'Matriz de Riscos',
  KANBAN: 'Kanban Board',
  COMPARISON: 'Comparativo'
};

export const SidebarBlockList: React.FC<SidebarBlockListProps> = ({
  blocks, activeBlockId, activeSubItemIndex, onActiveBlockChange, onActiveSubItemChange, onUpdatePage
}) => {
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeBlockId && blockRefs.current[activeBlockId]) {
      const timeout = setTimeout(() => {
        blockRefs.current[activeBlockId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [activeBlockId]);

  const updateBlockConfig = (blockId: string, updates: any) => {
    onUpdatePage({
      blocks: blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
    });
  };

  return (
    <div className="p-4 space-y-3 animate-in slide-in-from-top-1 duration-200">
      {blocks.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed rounded-2xl border-slate-200">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum bloco inserido</p>
        </div>
      ) : (
        blocks.map((block) => {
          const isExpanded = activeBlockId === block.id;
          return (
            <div 
              key={block.id} 
              ref={el => { blockRefs.current[block.id] = el; }}
              id={`sidebar-block-${block.id}`} 
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-[#0079C2] shadow-lg bg-white ring-4 ring-blue-500/5' : 'bg-white/50 border-transparent hover:border-slate-200'}`}
            >
              <div onClick={() => onActiveBlockChange(isExpanded ? null : block.id)} className={`p-4 flex justify-between items-center cursor-pointer select-none ${isExpanded ? 'bg-blue-50/30 border-b border-blue-100' : ''}`}>
                <div className="flex items-center gap-3 truncate">
                  <GripVertical size={14} className="text-slate-300" />
                  <div className="flex flex-col truncate">
                    <span className="text-[8px] font-black text-[#00A7E7] uppercase tracking-tighter">
                      {BLOCK_LABELS[block.type] || block.type.replace('_', ' ')}
                    </span>
                    <span className={`text-[11px] font-bold truncate ${isExpanded ? 'text-[#006098]' : 'text-slate-600'}`}>{block.title || 'Sem título'}</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={14} className="text-[#0079C2]" /> : <ChevronDown size={14} className="text-slate-300" />}
              </div>
              {isExpanded && (
                <div className="p-5 space-y-5 bg-white animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Largura</label>
                      <select 
                        value={block.width} 
                        onChange={(e) => updateBlockConfig(block.id, { width: e.target.value as BlockWidth })} 
                        className="w-full p-2 text-[10px] font-bold border rounded-xl bg-slate-50 outline-none"
                      >
                        <option value="FULL">100% (Total)</option>
                        <option value="THREE_QUARTERS">75% (Três Quartos)</option>
                        <option value="HALF">50% (Meio)</option>
                        <option value="THIRD">33% (Terço)</option>
                        <option value="QUARTER">25% (Quarto)</option>
                      </select>
                    </div>
                    <div className="space-y-1"><label className="text-[9px] font-bold text-gray-400 uppercase">Título da Seção</label><input type="text" value={block.title} onChange={(e) => updateBlockConfig(block.id, { title: e.target.value })} className="w-full p-2 text-[11px] font-bold border rounded-xl outline-none" /></div>
                  </div>
                  
                  {block.type !== 'SECTION' && (
                    <div className="space-y-1"><label className="text-[9px] font-bold text-gray-400 uppercase">Indicador Narrativo (Badge)</label><select value={block.config.narrativeBadge || 'NONE'} onChange={(e) => updateBlockConfig(block.id, { config: { ...block.config, narrativeBadge: e.target.value as NarrativeBadge } })} className="w-full p-2 text-[10px] font-bold border rounded-xl bg-white"><option value="NONE">Sem Indicador</option><option value="SUCCESS">Sucesso (Verde)</option><option value="WARNING">Atenção (Laranja)</option><option value="CRITICAL">Crítico (Vermelho)</option><option value="INFO">Informação (Azul)</option><option value="TREND">Tendência (Cinza)</option></select></div>
                  )}

                  <div className="pt-2 border-t">
                    {block.type === 'SECTION' && <SectionEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'BIG_NUMBERS' && <KPIEditor kpis={block.config.kpis} config={block.config} activeSubItemIndex={activeSubItemIndex} onActiveSubItemChange={onActiveSubItemChange} onUpdate={(kpis, other) => updateBlockConfig(block.id, { config: { ...block.config, kpis, ...other }})} />}
                    {block.type === 'KPI' && <KPIBlockEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'GAUGE' && <GaugeEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'RANKING_LIST' && <RankingListEditor items={block.config.items} config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'CHART' && <ChartEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'TEXT_BOX' && <TextEditor content={block.config.content} style={block.config.style} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'TABLE' && <TableEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'STEP_PROCESS' && <StepProcessEditor steps={block.config.steps} config={block.config} activeSubItemIndex={activeSubItemIndex} onActiveSubItemChange={onActiveSubItemChange} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'TIMELINE' && <TimelineEditor events={block.config.events} config={block.config} activeSubItemIndex={activeSubItemIndex} onActiveSubItemChange={onActiveSubItemChange} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'NINE_BOX' && <NineBoxEditor data={block.config.data} onUpdate={(data) => updateBlockConfig(block.id, { config: { ...block.config, data }})} />}
                    {block.type === 'INFOGRAPHIC_LIST' && <InfographicListEditor items={block.config.items} config={block.config} activeSubItemIndex={activeSubItemIndex} onActiveSubItemChange={onActiveSubItemChange} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'PROJECT_CALENDAR' && <ProjectCalendarEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'IMAGE' && <ImageEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'PROJECT_STATUS' && <ProjectStatusEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'FUNNEL' && <FunnelEditor config={block.config} activeSubItemIndex={activeSubItemIndex} onActiveSubItemChange={onActiveSubItemChange} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'RISK_MATRIX' && <RiskMatrixEditor items={block.config.items} config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'KANBAN' && <KanbanEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                    {block.type === 'COMPARISON' && <ComparisonEditor config={block.config} onUpdate={(updates) => updateBlockConfig(block.id, { config: { ...block.config, ...updates }})} />}
                  </div>
                  
                  {block.type !== 'SECTION' && (
                    <div className="space-y-1 pt-4 border-t border-slate-100">
                      <label className="text-[9px] font-bold text-[#00A7E7] uppercase flex items-center gap-2">
                        <MessageSquare size={10} /> Comentários
                      </label>
                      <textarea 
                        value={block.config.annotation || ''} 
                        onChange={(e) => updateBlockConfig(block.id, { config: { ...block.config, annotation: e.target.value } })} 
                        className="w-full p-3 text-[10px] border rounded-xl h-24 leading-relaxed italic bg-slate-50 outline-none focus:bg-white transition-all" 
                        placeholder="Adicione um comentário ou anotação para este bloco..." 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};