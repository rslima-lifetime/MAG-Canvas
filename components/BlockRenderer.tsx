
import React from 'react';
import { Block, PageTheme, DesignSystem, DocumentFormat, RiskStatus } from '../types';
import KPI_Card from './KPI_Card'; 
import { KPIBlock } from './renderers/KPIBlock';
import { ChartBlock } from './renderers/ChartBlock';
import { TextBlock } from './renderers/TextBlock';
import { DataGridTable } from './renderers/DataGridTable';
import { StepProcessBlock } from './renderers/StepProcessBlock';
import { NineBoxBlock } from './renderers/NineBoxBlock';
import { TimelineBlock } from './renderers/TimelineBlock';
import { InfographicListBlock } from './renderers/InfographicListBlock';
import { ProjectCalendarBlock } from './renderers/ProjectCalendarBlock';
import { SectionBlock } from './renderers/SectionBlock';
import { GaugeBlock } from './renderers/GaugeBlock';
import { RankingListBlock } from './renderers/RankingListBlock';
import { ImageBlock } from './renderers/ImageBlock';
import { ProjectStatusBlock } from './renderers/ProjectStatusBlock';
import { FunnelBlock } from './renderers/FunnelBlock';
import { RiskMatrixBlock } from './renderers/RiskMatrixBlock';
import { KanbanBlock } from './renderers/KanbanBlock';
import { ComparisonBlock } from './renderers/ComparisonBlock';
import { MessageSquareQuote } from 'lucide-react';
import { NarrativeBadge } from './ui/NarrativeBadge';
import { SectionHeader } from './ui/SectionHeader';

interface BlockRendererProps {
  block: Block;
  isHighlighted?: boolean;
  theme: PageTheme;
  designSystem?: DesignSystem;
  layoutFormat?: DocumentFormat;
  activeSubItemIndex?: number | null;
  onActiveBlockChange?: (id: string | null) => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdate?: (updates: any) => void;
}

const GRID_COLS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6'
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  block, isHighlighted, theme, designSystem = 'STANDARD', layoutFormat = 'REPORT', activeSubItemIndex, onActiveBlockChange, onActiveSubItemChange, onUpdate 
}) => {
  const isBlueTheme = theme === 'BLUE';
  const isSection = block.type === 'SECTION';
  const showAnnotation = !!block.config.showAnnotation;

  const handleAnnotationBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    const html = e.currentTarget.innerHTML;
    const finalValue = (html === '<br>' || html === '<div><br></div>' || !e.currentTarget.textContent?.trim()) ? "" : html;
    onUpdate?.({ config: { ...block.config, annotation: finalValue } });
  };

  const handleAnnotationPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const showPasteBadge = isHighlighted && (block.type === 'TABLE' || block.type === 'CHART');

  return (
    <div 
      id={`block-render-${block.id}`}
      tabIndex={isHighlighted ? 0 : -1}
      className={`${isSection ? 'px-0 py-0' : 'p-2'} flex flex-col h-full relative transition-all outline-none ${isHighlighted ? 'overflow-visible ring-0' : 'overflow-hidden'} ${block.type === 'TEXT_BOX' || isSection ? 'min-h-0' : 'min-h-[100px]'}`}
    >
      <style>{`
        .annotation-placeholder:empty::before {
          content: attr(data-placeholder);
          color: ${isBlueTheme ? 'rgba(255,255,255,0.3)' : '#cbd5e1'};
          font-style: italic;
          font-weight: 400;
          pointer-events: none;
          display: block;
        }
      `}</style>

      {!isSection && <NarrativeBadge type={block.config.narrativeBadge || 'NONE'} theme={theme} />}
      
      {!isSection && (
        <SectionHeader 
          title={block.title}
          isHighlighted={!!isHighlighted}
          theme={theme}
          designSystem={designSystem}
          wrapText={block.config.wrapText}
          showTitle={block.config.showTitle !== false}
          showPasteBadge={showPasteBadge}
          onUpdateTitle={(newTitle) => onUpdate?.({ title: newTitle })}
          onToggleVisibility={(show) => onUpdate?.({ config: { ...block.config, showTitle: show } })}
        />
      )}

      <div className={`w-full flex-1 flex flex-col min-w-0 ${!block.title && !isSection ? 'mt-0' : ''}`}>
        {block.type === 'SECTION' && (
          <SectionBlock 
            title={block.title}
            subtitle={block.config.subtitle}
            config={block.config}
            theme={theme}
            designSystem={designSystem}
            isHighlighted={isHighlighted}
            onUpdateTitle={(t) => onUpdate?.({ title: t })}
            onUpdateSubtitle={(s) => onUpdate?.({ config: { ...block.config, subtitle: s } })}
            onUpdateConfig={(c) => onUpdate?.({ config: { ...block.config, ...c } })}
          />
        )}

        {block.type === 'BIG_NUMBERS' && (
          <div className={`grid gap-2 kpi-grid-print ${GRID_COLS_MAP[block.config.columns || 4] || 'grid-cols-4'}`}>
            {block.config.kpis?.map((kpi: any, i: number) => (
              <KPI_Card 
                key={i} 
                {...kpi} 
                theme={theme}
                designSystem={designSystem}
                isActive={activeSubItemIndex === i}
                isEditable={isHighlighted}
                isCompact={(block.config.columns || 4) >= 5}
                onClick={() => {
                  onActiveBlockChange?.(block.id);
                  onActiveSubItemChange?.(i);
                }}
                onFinish={() => onActiveSubItemChange?.(null)}
                onUpdate={(updates) => {
                  const newKpis = [...block.config.kpis];
                  newKpis[i] = { ...newKpis[i], ...updates };
                  onUpdate?.({ config: { ...block.config, kpis: newKpis } });
                }}
                onDuplicate={() => {
                  const newKpis = [...block.config.kpis];
                  newKpis.splice(i + 1, 0, { ...newKpis[i] });
                  onUpdate?.({ config: { ...block.config, kpis: newKpis } });
                  onActiveSubItemChange?.(i + 1);
                }}
              />
            ))}
          </div>
        )}

        {block.type === 'KPI' && (
          <KPIBlock 
            {...(block.config as any)}
            theme={theme}
            designSystem={designSystem}
            isHighlighted={isHighlighted}
            isActive={isHighlighted && activeSubItemIndex === -1}
            onUpdate={(updates) => onUpdate?.({ config: { ...block.config, ...updates } })}
            onFinish={() => onActiveSubItemChange?.(null)}
            onClick={() => {
              onActiveBlockChange?.(block.id);
              onActiveSubItemChange?.(-1);
            }}
            showDelta={block.config.showDelta}
            showGoal={block.config.showGoal}
            showTrend={block.config.showTrend}
            showSubMeasures={block.config.showSubMeasures}
          />
        )}

        {block.type === 'GAUGE' && (
           <GaugeBlock 
             {...(block.config as any)}
             theme={theme}
             isHighlighted={isHighlighted}
             onUpdate={(updates) => onUpdate?.({ config: { ...block.config, ...updates } })}
           />
        )}

        {block.type === 'RANKING_LIST' && (
           <RankingListBlock 
             items={block.config.items || []}
             heroIcon={block.config.heroIcon}
             showBar={block.config.showBar !== false}
             theme={theme}
             designSystem={designSystem}
             isHighlighted={isHighlighted}
             activeSubItemIndex={activeSubItemIndex}
             onActiveBlockChange={() => onActiveBlockChange?.(block.id)}
             onActiveSubItemChange={onActiveSubItemChange}
             onUpdateItem={(idx, updates) => {
                const newItems = [...(block.config.items || [])];
                newItems[idx] = { ...newItems[idx], ...updates };
                onUpdate?.({ config: { ...block.config, items: newItems } });
             }}
             onRemoveItem={(idx) => {
                const newItems = (block.config.items || []).filter((_: any, i: number) => i !== idx);
                onUpdate?.({ config: { ...block.config, items: newItems } });
                onActiveSubItemChange?.(null);
             }}
           />
        )}

        {block.type === 'CHART' && (
          <ChartBlock 
            data={block.config.data} 
            type={block.config.type}
            stackMode={block.config.stackMode}
            fontSize={block.config.fontSize}
            xAxisMargin={block.config.xAxisMargin}
            chartHeight={block.config.chartHeight}
            abbreviate={block.config.abbreviateValues}
            labelPosition={block.config.labelPosition}
            showLabels={block.config.showLabels}
            showLegend={block.config.showLegend}
            showXAxis={block.config.showXAxis !== false}
            showYAxis={block.config.showYAxis}
            labelContent={block.config.labelContent}
            showGoalLine={block.config.showGoalLine}
            goalValue={block.config.goalValue}
            theme={theme}
            designSystem={designSystem}
            layoutFormat={layoutFormat}
            isHighlighted={isHighlighted}
            onUpdateData={(newData) => onUpdate?.({ config: { ...block.config, data: newData } })}
            onUpdateConfig={(configUpdates) => onUpdate?.({ config: { ...block.config, ...configUpdates } })}
          />
        )}

        {block.type === 'TEXT_BOX' && (
           <TextBlock 
             content={block.config.content} 
             style={block.config.style} 
             isEditable={isHighlighted}
             theme={theme}
             designSystem={designSystem}
             onContentChange={(newContent) => onUpdate?.({ config: { ...block.config, content: newContent } })}
           />
        )}

        {block.type === 'TABLE' && (
          <DataGridTable 
            {...(block.config as any)} 
            isHighlighted={isHighlighted}
            theme={theme}
            designSystem={designSystem}
            onUpdateConfig={(configUpdates) => onUpdate?.({ config: { ...block.config, ...configUpdates } })}
            onActivate={() => onActiveBlockChange?.(block.id)}
          />
        )}

        {block.type === 'STEP_PROCESS' && (
          <StepProcessBlock 
            steps={block.config.steps || []} 
            config={block.config}
            isEditable={isHighlighted} 
            theme={theme}
            activeSubItemIndex={activeSubItemIndex}
            onActiveBlockChange={() => onActiveBlockChange?.(block.id)}
            onActiveSubItemChange={onActiveSubItemChange}
            onUpdateStep={(idx, updates) => {
              const newSteps = [...(block.config.steps || [])];
              newSteps[idx] = { ...newSteps[idx], ...updates };
              onUpdate?.({ config: { ...block.config, steps: newSteps } });
            }}
            onAddStep={(idx) => {
              const newSteps = [...(block.config.steps || [])];
              newSteps.splice(idx, 0, { label: 'Nova Etapa', value: '0', subtext: 'Descrição', status: 'NONE' });
              onUpdate?.({ config: { ...block.config, steps: newSteps } });
            }}
            onRemoveStep={(idx) => {
              const newSteps = (block.config.steps || []).filter((_: any, i: number) => i !== idx);
              onUpdate?.({ config: { ...block.config, steps: newSteps } });
              onActiveSubItemChange?.(null);
            }}
            onUpdate={(u) => onUpdate?.({ config: { ...block.config, ...u } })}
          />
        )}

        {block.type === 'NINE_BOX' && (
          <NineBoxBlock 
            data={block.config.data || []}
            isEditable={isHighlighted}
            theme={theme}
            onUpdateBox={(idx, updates) => {
              const newData = [...(block.config.data || [])];
              newData[idx] = { ...newData[idx], ...updates };
              onUpdate?.({ config: { ...block.config, data: newData } });
            }}
          />
        )}

        {block.type === 'TIMELINE' && (
          <TimelineBlock 
            events={block.config.events || []}
            config={block.config}
            theme={theme}
            isHighlighted={isHighlighted}
            activeSubItemIndex={activeSubItemIndex}
            onActiveBlockChange={() => onActiveBlockChange?.(block.id)}
            onActiveSubItemChange={onActiveSubItemChange}
            onUpdate={(u) => onUpdate?.({ config: { ...block.config, ...u.config } })}
          />
        )}

        {block.type === 'INFOGRAPHIC_LIST' && (
          <InfographicListBlock 
            items={block.config.items || []}
            layout={block.config.layout || 'GRID'}
            config={block.config}
            theme={theme}
            isHighlighted={isHighlighted}
            activeSubItemIndex={activeSubItemIndex}
            onActiveBlockChange={() => onActiveBlockChange?.(block.id)}
            onActiveSubItemChange={onActiveSubItemChange}
            onUpdateItem={(idx, updates) => {
              const newItems = [...(block.config.items || [])];
              newItems[idx] = { ...newItems[idx], ...updates };
              onUpdate?.({ config: { ...block.config, items: newItems } });
            }}
            onUpdateLayout={(newLayout) => {
              onUpdate?.({ config: { ...block.config, layout: newLayout } });
            }}
            onReorderItem={(oldIdx, newIdx) => {
              const newItems = [...(block.config.items || [])];
              [newItems[oldIdx], newItems[newIdx]] = [newItems[newIdx], newItems[oldIdx]];
              onUpdate?.({ config: { ...block.config, items: newItems } });
              onActiveSubItemChange?.(newIdx);
            }}
            onRemoveItem={(idx) => {
              const newItems = (block.config.items || []).filter((_: any, i: number) => i !== idx);
              onUpdate?.({ config: { ...block.config, items: newItems } });
              onActiveSubItemChange?.(null);
            }}
            onAddItem={() => {
              const newItems = [...(block.config.items || [])];
              const newItem = { 
                id: Date.now().toString(), 
                title: 'Novo Pilar', 
                description: 'Insira o conteúdo estratégico aqui.', 
                icon: 'Target', 
                tag: 'Status',
                itemWidth: '50'
              };
              onUpdate?.({ config: { ...block.config, items: [...newItems, newItem] } });
              onActiveSubItemChange?.(newItems.length);
            }}
            onUpdate={(updates) => onUpdate?.({ config: { ...block.config, ...updates } })}
          />
        )}

        {block.type === 'PROJECT_CALENDAR' && (
          <ProjectCalendarBlock 
            currentMonth={block.config.currentMonth}
            viewMode={block.config.viewMode || 'MONTH'}
            daysData={block.config.daysData || {}}
            rowHeight={block.config.rowHeight}
            priorityLabels={block.config.priorityLabels}
            showLegend={block.config.showLegend}
            showPriorityTags={block.config.showPriorityTags}
            theme={theme}
            isHighlighted={isHighlighted}
            onUpdateConfig={(updates) => onUpdate?.({ config: { ...block.config, ...updates } })}
          />
        )}

        {block.type === 'IMAGE' && (
          <ImageBlock 
            imageUrl={block.config.imageUrl}
            caption={block.config.caption}
            fit={block.config.fit}
            height={block.config.height}
            theme={theme}
            isHighlighted={isHighlighted}
            onUpdate={(updates) => onUpdate?.({ config: { ...block.config, ...updates } })}
          />
        )}

        {block.type === 'PROJECT_STATUS' && (
          <ProjectStatusBlock 
            projectTitle={block.config.projectTitle || "Novo Projeto"}
            description={block.config.description || ""}
            progress={block.config.progress || 0}
            status={block.config.status || 'ON_TRACK'}
            milestones={block.config.milestones || []}
            theme={theme}
            isHighlighted={isHighlighted}
            onUpdate={(updates) => onUpdate?.({ config: { ...block.config, ...updates } })}
          />
        )}

        {block.type === 'FUNNEL' && (
          <FunnelBlock 
            stages={block.config.stages || []}
            sliceHeight={block.config.sliceHeight}
            theme={theme}
            isHighlighted={isHighlighted}
            activeSubItemIndex={activeSubItemIndex}
            onActiveBlockChange={() => onActiveBlockChange?.(block.id)}
            onActiveSubItemChange={onActiveSubItemChange}
            onUpdateStage={(idx, updates) => {
              const newStages = [...(block.config.stages || [])];
              newStages[idx] = { ...newStages[idx], ...updates };
              onUpdate?.({ config: { ...block.config, stages: newStages } });
            }}
            onAddStage={() => {
              const newStages = [...(block.config.stages || [])];
              const newStage = {
                id: Date.now().toString(),
                label: 'Nova Etapa',
                value: 100,
                color: '#0079C2'
              };
              onUpdate?.({ config: { ...block.config, stages: [...newStages, newStage] } });
              onActiveSubItemChange?.(newStages.length);
            }}
            onRemoveStage={(idx) => {
              const newStages = (block.config.stages || []).filter((_: any, i: number) => i !== idx);
              onUpdate?.({ config: { ...block.config, stages: newStages } });
              onActiveSubItemChange?.(null);
            }}
          />
        )}

        {block.type === 'RISK_MATRIX' && (
          <RiskMatrixBlock 
            items={block.config.items || []}
            config={block.config}
            theme={theme}
            isHighlighted={isHighlighted}
            activeSubItemIndex={activeSubItemIndex}
            onActiveBlockChange={() => onActiveBlockChange?.(block.id)}
            onActiveSubItemChange={onActiveSubItemChange}
            onUpdateItem={(idx, updates) => {
              const newItems = [...(block.config.items || [])];
              newItems[idx] = { ...newItems[idx], ...updates };
              onUpdate?.({ config: { ...block.config, items: newItems } });
            }}
            onAddItem={() => {
              const newItems = [...(block.config.items || [])];
              const newItem = {
                id: Date.now().toString(),
                status: 'ATTENTION' as RiskStatus,
                riskTitle: 'Novo Risco Estratégico',
                riskDetail: 'Detalhamento do risco...',
                mitigationTitle: 'Novo Plano de Ação',
                mitigationDetail: 'Passo a passo da mitigação...'
              };
              onUpdate?.({ config: { ...block.config, items: [...newItems, newItem] } });
              onActiveSubItemChange?.(newItems.length);
            }}
            onRemoveItem={(idx) => {
              const newItems = (block.config.items || []).filter((_: any, i: number) => i !== idx);
              onUpdate?.({ config: { ...block.config, items: newItems } });
              onActiveSubItemChange?.(null);
            }}
            onUpdate={(u) => onUpdate?.({ config: { ...block.config, ...u } })}
          />
        )}

        {block.type === 'KANBAN' && (
          <KanbanBlock 
            columns={block.config.columns || []}
            cards={block.config.cards || []}
            members={block.config.members || []}
            tagColors={block.config.tagColors || {}}
            theme={theme}
            isHighlighted={isHighlighted}
            onUpdate={(updates) => onUpdate?.({ config: { ...block.config, ...updates } })}
          />
        )}

        {block.type === 'COMPARISON' && (
          <ComparisonBlock 
            items={block.config.items || []}
            theme={theme}
            isHighlighted={isHighlighted}
            activeSubItemIndex={activeSubItemIndex}
            onActiveBlockChange={() => onActiveBlockChange?.(block.id)}
            onActiveSubItemChange={onActiveSubItemChange}
            onUpdateItem={(idx, updates) => {
              const newItems = [...(block.config.items || [])];
              newItems[idx] = { ...newItems[idx], ...updates };
              onUpdate?.({ config: { ...block.config, items: newItems } });
            }}
            onAddItem={() => {
              const newItems = [...(block.config.items || [])];
              const newItem = {
                id: Date.now().toString(),
                title: 'Novo Cenário',
                description: 'Descrição breve...',
                icon: 'Circle',
                isWinner: false,
                attributes: []
              };
              onUpdate?.({ config: { ...block.config, items: [...newItems, newItem] } });
              onActiveSubItemChange?.(newItems.length);
            }}
            onRemoveItem={(idx) => {
              const newItems = (block.config.items || []).filter((_: any, i: number) => i !== idx);
              onUpdate?.({ config: { ...block.config, items: newItems } });
              onActiveSubItemChange?.(null);
            }}
            onDuplicateItem={(idx) => {
              const newItems = [...(block.config.items || [])];
              const itemToDup = newItems[idx];
              if (!itemToDup) return;
              const newItem = {
                ...JSON.parse(JSON.stringify(itemToDup)),
                id: Date.now().toString(),
                isWinner: false
              };
              newItems.splice(idx + 1, 0, newItem);
              onUpdate?.({ config: { ...block.config, items: newItems } });
              onActiveSubItemChange?.(idx + 1);
            }}
            onUpdate={(u) => onUpdate?.({ config: { ...block.config, ...u } })}
          />
        )}
      </div>

      {!isSection && showAnnotation && (
        <div className={`mt-4 pt-2 border-t rounded-lg flex gap-2 shrink-0 transition-all ${isBlueTheme ? 'border-white/10 bg-white/5 p-1.5' : 'border-slate-100 bg-slate-50/40 p-1.5'} ${isHighlighted ? 'ring-1 ring-blue-400/20' : ''}`}>
          <MessageSquareQuote size={10} className="text-[#00A7E7] shrink-0 mt-0.5" />
          <div className="flex flex-col w-full">
            <span className={`text-[7px] font-black uppercase tracking-widest mb-0.5 ${isBlueTheme ? 'text-blue-300' : 'text-[#0079C2]'}`}>Comentários</span>
            <p 
              contentEditable={isHighlighted}
              suppressContentEditableWarning
              data-placeholder="Clique para adicionar sua análise..."
              onBlur={handleAnnotationBlur}
              onPaste={handleAnnotationPaste}
              onClick={(e) => isHighlighted && e.stopPropagation()}
              className={`annotation-placeholder text-[9px] font-medium leading-relaxed italic outline-none w-full min-h-[1em] ${isBlueTheme ? 'text-blue-100/70' : 'text-[#415364]'} ${isHighlighted ? 'bg-white/10 cursor-text' : ''}`}
              dangerouslySetInnerHTML={{ __html: block.config.annotation || "" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
