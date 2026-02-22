import { useState, useCallback } from 'react';
import { ReportData, Block, Page, BlockType, ChartType, CoverPage, DEFAULT_REPORT_DATA, RiskStatus, KanbanColumn, KanbanCard } from '../types';

// Helper para gerar IDs robustos e evitar colisões em operações em lote
const generateUniqueId = (prefix: string = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const DEFAULT_MEMBERS = [
  "Adila Silva",
  "Aline Pacobahyba",
  "Andre Lima",
  "Andrea Simões",
  "Eliane Sarkiz",
  "Herbert Rios",
  "Janaina Silva",
  "Leonardo Freitas",
  "Loreine Carvalho",
  "Luana Figueiredo",
  "Mylyane Azevedo",
  "Natalia Rodrigues",
  "Raphael Oliveira",
  "Renata Schaeffer",
  "Ricardo Jeronymo",
  "Riley Vieira",
  "Roberto Lima",
  "Tatiana Santos",
  "Thiago Breves"
];

export const useReport = (initialData: ReportData) => {
  const [data, setDataState] = useState<ReportData>(initialData);
  const [past, setPast] = useState<ReportData[]>([]);
  const [future, setFuture] = useState<ReportData[]>([]);

  const setData = useCallback((update: ReportData | ((prev: ReportData) => ReportData)) => {
    setDataState(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      setPast(p => [...p, prev].slice(-50));
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(p => p.slice(0, -1));
    setFuture(f => [data, ...f]);
    setDataState(previous);
  }, [data, past]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(f => f.slice(1));
    setPast(p => [...p, data]);
    setDataState(next);
  }, [data, future]);

  const addPage = useCallback(() => {
    const newId = generateUniqueId('page');
    const newPage: Page = { 
      id: newId, 
      title: "Nova Página", 
      subtitle: "Descrição do conteúdo", 
      theme: 'LIGHT', 
      blocks: [], 
      rowGap: 12, 
      columnGap: 16, 
      paddingX: 12, 
      paddingY: 15,
      showTitle: true,
      showSubtitle: true,
      showLogo: true,
      showDivider: true,
      showFooter: true
    };
    
    setData(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    
    return newId;
  }, [setData]);

  const duplicatePage = useCallback((pageIdx: number) => {
    let newPageId = "";
    setData(prev => {
      const pageToCopy = prev.pages[pageIdx];
      const newBlocks = pageToCopy.blocks.map(b => ({
        ...JSON.parse(JSON.stringify(b)),
        id: generateUniqueId('block')
      }));

      newPageId = generateUniqueId('page');
      
      const newPage: Page = {
        ...JSON.parse(JSON.stringify(pageToCopy)),
        id: newPageId,
        title: `${pageToCopy.title} (Cópia)`,
        blocks: newBlocks
      };

      const newPages = [...prev.pages];
      newPages.splice(pageIdx + 1, 0, newPage);

      return { ...prev, pages: newPages };
    });
    return newPageId;
  }, [setData]);

  const updatePage = useCallback((pageIdx: number, updates: Partial<Page>) => {
    setData(prev => {
      const newPages = [...prev.pages];
      newPages[pageIdx] = {
        ...newPages[pageIdx],
        ...updates
      };
      return { ...prev, pages: newPages };
    });
  }, [setData]);

  const movePage = useCallback((pageIdx: number, direction: 'up' | 'down') => {
    setData(prev => {
      const newPages = [...prev.pages];
      const targetIdx = direction === 'up' ? pageIdx - 1 : pageIdx + 1;
      if (targetIdx < 0 || targetIdx >= newPages.length) return prev;
      
      const temp = newPages[pageIdx];
      newPages[pageIdx] = newPages[targetIdx];
      newPages[targetIdx] = temp;
      
      return { ...prev, pages: newPages };
    });
  }, [setData]);

  const updateBlock = useCallback((pageIdx: number, blockId: string, updates: Partial<Block>) => {
    setData(prev => {
      const targetPage = prev.pages[pageIdx];
      const targetBlock = targetPage?.blocks.find(b => b.id === blockId);
      
      let fieldsToPropagate: any = {};
      let syncIdToPropagate: string | null = null;

      if (targetBlock && targetBlock.type === 'PROJECT_CALENDAR') {
        const currentConfig = targetBlock.config || {};
        const newConfig = updates.config || {};
        
        syncIdToPropagate = newConfig.syncId || currentConfig.syncId;

        if (syncIdToPropagate) {
           const syncFields = ['daysData', 'priorityLabels'];
           syncFields.forEach(field => {
             if (newConfig[field] !== undefined) {
               fieldsToPropagate[field] = newConfig[field];
             }
           });
        }
      }

      const hasSyncUpdates = syncIdToPropagate && Object.keys(fieldsToPropagate).length > 0;

      const newPages = prev.pages.map((page, pIdx) => {
        const isTargetPage = pIdx === pageIdx;
        const containsSyncedBlock = hasSyncUpdates && page.blocks.some(b => b.type === 'PROJECT_CALENDAR' && b.config?.syncId === syncIdToPropagate);

        if (!isTargetPage && !containsSyncedBlock) {
          return page;
        }

        return {
          ...page,
          blocks: page.blocks.map(block => {
            if (isTargetPage && String(block.id) === String(blockId)) {
              return { 
                ...block, 
                ...updates, 
                config: { ...block.config, ...updates.config } 
              };
            }

            if (hasSyncUpdates && block.type === 'PROJECT_CALENDAR' && block.config?.syncId === syncIdToPropagate) {
               return {
                 ...block,
                 config: { ...block.config, ...fieldsToPropagate }
               };
            }

            return block;
          })
        };
      });

      return { ...prev, pages: newPages };
    });
  }, [setData]);

  const removeBlock = useCallback((pageIdx: number, blockId: string) => {
    setData(prev => {
      const newPages = [...prev.pages];
      newPages[pageIdx] = {
        ...newPages[pageIdx],
        blocks: newPages[pageIdx].blocks.filter(b => String(b.id) !== String(blockId))
      };
      return { ...prev, pages: newPages };
    });
  }, [setData]);

  const moveBlock = useCallback((pageIdx: number, blockIdx: number, direction: 'up' | 'down') => {
    setData(prev => {
      const newPages = [...prev.pages];
      const blocks = [...newPages[pageIdx].blocks];
      const target = direction === 'up' ? blockIdx - 1 : blockIdx + 1;
      if (target < 0 || target >= blocks.length) return prev;
      [blocks[blockIdx], blocks[target]] = [blocks[target], blocks[blockIdx]];
      newPages[pageIdx] = { ...newPages[pageIdx], blocks };
      return { ...prev, pages: newPages };
    });
  }, [setData]);

  const duplicateBlock = useCallback((pageIdx: number, blockIdx: number, shouldMoveToNextPage?: boolean) => {
    let finalNewId = "";
    setData(prev => {
      const sourcePage = prev.pages[pageIdx];
      const blockToCopy = JSON.parse(JSON.stringify(sourcePage.blocks[blockIdx]));
      const newId = generateUniqueId('copy');
      blockToCopy.id = newId;
      finalNewId = newId;

      if (blockToCopy.config && blockToCopy.config.syncId) {
        blockToCopy.config.syncId = null;
      }

      const newPages = [...prev.pages];

      if (shouldMoveToNextPage) {
        const nextPageIdx = pageIdx + 1;
        if (nextPageIdx >= newPages.length) {
          const newPageId = generateUniqueId('page');
          const newPage: Page = { 
            id: newPageId, 
            title: sourcePage.title, 
            subtitle: "Continuação", 
            theme: sourcePage.theme || 'LIGHT', 
            blocks: [blockToCopy], 
            rowGap: sourcePage.rowGap || 12, 
            columnGap: sourcePage.columnGap || 16, 
            paddingX: sourcePage.paddingX || 12, 
            paddingY: sourcePage.paddingY || 15,
            showTitle: sourcePage.showTitle !== false,
            showSubtitle: sourcePage.showSubtitle !== false,
            showLogo: sourcePage.showLogo !== false,
            showDivider: sourcePage.showDivider !== false,
            showFooter: sourcePage.showFooter !== false
          };
          return { ...prev, pages: [...newPages, newPage] };
        } else {
          const targetPage = newPages[nextPageIdx];
          const updatedBlocks = [blockToCopy, ...targetPage.blocks];
          newPages[nextPageIdx] = { ...targetPage, blocks: updatedBlocks };
          return { ...prev, pages: newPages };
        }
      } else {
        const blocks = [...sourcePage.blocks];
        blocks.splice(blockIdx + 1, 0, blockToCopy);
        newPages[pageIdx] = { ...sourcePage, blocks };
        return { ...prev, pages: newPages };
      }
    });
    return finalNewId;
  }, [setData]);

  const pasteBlockAt = useCallback((pageIdx: number, blockIdx: number, blockData: Block) => {
    const newId = generateUniqueId('paste');
    const newBlock = { ...JSON.parse(JSON.stringify(blockData)), id: newId };
    
    if (newBlock.config) {
      if (newBlock.config.syncId) newBlock.config.syncId = null;
      
      if (newBlock.type === 'PROJECT_CALENDAR' && newBlock.config.daysData) {
         Object.keys(newBlock.config.daysData).forEach(date => {
            newBlock.config.daysData[date].projects = newBlock.config.daysData[date].projects.map((p: any) => ({
               ...p, id: generateUniqueId('proj')
            }));
         });
      }
      
      if (newBlock.type === 'INFOGRAPHIC_LIST' && newBlock.config.items) {
         newBlock.config.items = newBlock.config.items.map((it: any) => ({
            ...it, id: generateUniqueId('item')
         }));
      }
    }
    
    setData(prev => {
      const newPages = [...prev.pages];
      const blocks = [...newPages[pageIdx].blocks];
      blocks.splice(blockIdx, 0, newBlock);
      newPages[pageIdx] = { ...newPages[pageIdx], blocks };
      return { ...prev, pages: newPages };
    });
    return newId;
  }, [setData]);

  const addBlockAt = useCallback((
    pageIdx: number, 
    type: BlockType, 
    atIdx: number, 
    width?: 'FULL' | 'HALF' | 'THIRD' | 'QUARTER', 
    specificChartType?: ChartType, 
    withPlaceholders: boolean = false 
  ) => {
    const newId = generateUniqueId('block');
    setData(prev => {
      const newPages = [...prev.pages];
      const blocks = [...newPages[pageIdx].blocks];
      
      let defaultConfig: any = {
        showAnnotation: false, 
        annotation: "" 
      };
      let defaultWidth: Block['width'] = width || 'FULL';
      let defaultTitle = 'Novo Componente';
      
      if (type === 'SECTION') {
        defaultTitle = withPlaceholders ? 'Nova Seção Estratégica' : 'TÍTULO DA SEÇÃO';
        defaultConfig = { ...defaultConfig, subtitle: withPlaceholders ? 'Agrupamento de informações estratégicas' : 'Subtítulo da Seção', showLine: true, showTitle: true, showSubtitle: true };
      } 
      else if (type === 'BIG_NUMBERS') {
        defaultTitle = withPlaceholders ? 'Painel de Indicadores' : 'Indicadores';
        defaultConfig.columns = 4;
        defaultConfig.kpis = withPlaceholders ? [
          { label: "Receita (YTD)", current: 150000, prev: 120000, format: 'CURRENCY', abbreviate: true, showDelta: true },
          { label: "Headcount", current: 345, prev: 340, format: 'INTEGER', showDelta: true },
          { label: "Turnover", current: 2.5, prev: 3.1, format: 'PERCENT', showDelta: true },
          { label: "NPS Interno", current: 75, prev: 60, format: 'INTEGER', showGoal: true, goal: 80 }
        ] : [
          { label: "Indicador 1", current: 0, prev: 0, format: 'DEFAULT' },
          { label: "Indicador 2", current: 0, prev: 0, format: 'DEFAULT' },
          { label: "Indicador 3", current: 0, prev: 0, format: 'DEFAULT' },
          { label: "Indicador 4", current: 0, prev: 0, format: 'DEFAULT' },
        ];
      } 
      else if (type === 'KPI') {
        defaultWidth = width || 'QUARTER';
        defaultTitle = withPlaceholders ? 'Métrica Solo' : '';
        defaultConfig = withPlaceholders ? { ...defaultConfig, label: 'Métrica Chave', current: 85, prev: 72, goal: 100, format: 'INTEGER', trendData: '60, 65, 72, 80, 85', subMeasures: [{ label: 'Target', value: '100' }, { label: 'Min', value: '50' }] } 
        : { ...defaultConfig, label: 'Métrica', current: 0, prev: 0, format: 'DEFAULT', showDelta: true, showGoal: false, showTrend: false, showSubMeasures: false };
      } 
      else if (type === 'TEXT_BOX') {
        defaultTitle = withPlaceholders ? 'Análise de Contexto' : 'Título (Opcional)';
        defaultConfig.style = 'INTRO';
        defaultConfig.content = withPlaceholders ? 'Insira aqui a narrativa que explica os dados apresentados.' : '';
      }
      else if (type === 'CHART') {
        defaultTitle = withPlaceholders ? 'Análise Visual' : '';
        defaultWidth = width || 'HALF';
        defaultConfig.type = specificChartType || 'COLUMN';
        defaultConfig.showLabels = true;
        defaultConfig.data = withPlaceholders ? 'Mês\tRealizado\tMeta\nJan\t80\t100\nFev\t95\t100' : 'Categoria\tValor\nA\t10\nB\t20';
        defaultConfig.showGoalLine = withPlaceholders;
        if (withPlaceholders) defaultConfig.goalValue = 100;
      }
      else if (type === 'TABLE') {
        defaultTitle = withPlaceholders ? 'Detalhamento de Dados' : 'Tabela de Dados';
        defaultConfig.data = withPlaceholders ? 'Colaborador\tCargo\tPerformance\tStatus\nAna Silva\tAnalista Sr\t98\tAlta' : 'Coluna 1\tColuna 2\nItem A\t0';
        defaultConfig.density = 'NORMAL';
        defaultConfig.targetColumns = withPlaceholders ? [3] : [];
        defaultConfig.infographicMode = withPlaceholders ? 'STATUS' : 'NONE';
      }
      else if (type === 'INFOGRAPHIC_LIST') {
        defaultTitle = withPlaceholders ? 'Destaques Estratégicos' : 'Lista Visual';
        defaultConfig = {
          ...defaultConfig,
          layout: 'GRID',
          showDescription: true,
          items: withPlaceholders ? [
            { id: generateUniqueId('item'), title: 'Eficiência', description: 'Redução de custos operacionais.', icon: 'TrendingUp', tag: 'Foco', tagColor: '#dcfce7', itemWidth: '50' },
            { id: generateUniqueId('item'), title: 'Inovação', description: 'Implementação de novas ferramentas.', icon: 'Zap', tag: 'Novo', tagColor: '#e0f2fe', itemWidth: '50' }
          ] : [
            { id: generateUniqueId('item'), title: 'Item 1', description: 'Descrição...', icon: 'Circle', itemWidth: '100' }
          ]
        };
      }
      else if (type === 'PROJECT_CALENDAR') {
        defaultTitle = withPlaceholders ? 'Cronograma do Projeto' : 'Calendário';
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0];
        defaultConfig = { ...defaultConfig, viewMode: 'MONTH', currentMonth: today.toISOString(), daysData: {}, syncId: null };
        if (withPlaceholders) {
          defaultConfig.daysData = { [dateKey]: { date: dateKey, projects: [{ id: generateUniqueId('proj'), title: 'Início do Projeto', status: 'IN_PROGRESS', priority: 'HIGH', description: 'Kick-off.' }] } };
        }
      }
      else if (type === 'GAUGE') {
        defaultWidth = width || 'HALF';
        defaultTitle = withPlaceholders ? 'Atingimento da Meta' : '';
        defaultConfig = withPlaceholders ? { ...defaultConfig, value: 82, min: 0, max: 100, lowThreshold: 70, highThreshold: 90, unit: '%', format: 'PERCENT' } 
        : { ...defaultConfig, value: 0, min: 0, max: 100, lowThreshold: 30, highThreshold: 70, unit: '', format: 'DEFAULT' };
      }
      else if (type === 'NINE_BOX') {
        defaultTitle = 'Matriz de Talentos (Nine-Box)';
        defaultWidth = 'HALF';
        defaultConfig.data = [
          { label: "Risco", count: 0 }, { label: "Dilema", count: 0 }, { label: "Enigma", count: 0 },
          { label: "Eficaz", count: 0 }, { label: "Core", count: 0 }, { label: "Forte", count: 0 },
          { label: "Confiável", count: 0 }, { label: "Alta Perf.", count: 0 }, { label: "Top Talent", count: 0 }
        ];
      }
      else if (type === 'RISK_MATRIX') {
        defaultTitle = 'Monitoramento de Riscos Estratégicos';
        defaultConfig.items = withPlaceholders ? [
          { id: generateUniqueId('risk'), status: 'CRITICAL' as RiskStatus, riskTitle: 'Infraestrutura Crítica', riskDetail: 'A proposta prevê acréscimo de 20% na mensalidade caso a administração seja externa.', mitigationTitle: 'Mitigação de Custo', mitigationDetail: 'TI Interna deve provisionar e administrar o ambiente SQL Azure.' },
          { id: generateUniqueId('risk'), status: 'ATTENTION' as RiskStatus, riskTitle: 'Retenção de Talentos', riskDetail: 'Volatilidade alta em cargos de liderança técnica no Q3.', mitigationTitle: 'Plano de Retenção', mitigationDetail: 'Revisão da política de bônus e stock options para posições chave.' }
        ] : [
          { id: generateUniqueId('risk'), status: 'ATTENTION' as RiskStatus, riskTitle: 'Novo Risco', riskDetail: 'Detalhe...', mitigationTitle: 'Plano...', mitigationDetail: 'Ações...' }
        ];
      }
      else if (type === 'KANBAN') {
        defaultTitle = 'Acompanhamento de Fluxo (Kanban)';
        const c1 = generateUniqueId('col');
        const c2 = generateUniqueId('col');
        const c3 = generateUniqueId('col');
        defaultConfig.columns = [
          { id: c1, title: 'A Fazer', color: '#64748b' },
          { id: c2, title: 'Em Execução', color: '#0079C2' },
          { id: c3, title: 'Finalizado', color: '#10B981' }
        ];
        defaultConfig.members = [...DEFAULT_MEMBERS];
        defaultConfig.cards = withPlaceholders ? [
          { 
            id: generateUniqueId('card'), 
            columnId: c1, 
            title: 'Revisão de Budget', 
            description: 'Consolidar dados do Q4.', 
            priority: 'HIGH', 
            tags: ['Financeiro'], 
            owner: 'Andre Lima',
            checklist: [
               { id: '1', text: 'Coleta de dados brutos', completed: true },
               { id: '2', text: 'Aprovação diretoria', completed: false }
            ]
          },
          { id: generateUniqueId('card'), columnId: c2, title: 'Workshops Cultura', description: 'Fase de aplicação.', priority: 'MEDIUM', tags: ['DHO'], owner: 'Aline Pacobahyba', checklist: [] },
          { id: generateUniqueId('card'), columnId: c3, title: 'Migração ERP', description: 'Módulo RH OK.', priority: 'LOW', tags: ['Tech'], owner: 'Adila Silva', checklist: [] }
        ] : [];
      }
      else if (type === 'PROJECT_STATUS') {
        defaultTitle = withPlaceholders ? 'Acompanhamento de Projeto' : 'Status de Projeto';
        defaultConfig = {
          ...defaultConfig,
          projectTitle: withPlaceholders ? 'Implementação de People Analytics' : 'Novo Projeto',
          description: withPlaceholders ? 'Fase final de homologação do banco de dados e testes de stress na nuvem.' : '',
          progress: withPlaceholders ? 75 : 0,
          status: 'ON_TRACK',
          milestones: withPlaceholders ? [
            { id: '1', label: 'Infraestrutura', date: '10/01', completed: true },
            { id: '2', label: 'Carga de Dados', date: '15/02', completed: true },
            { id: '3', label: 'Dashboards', date: '30/03', completed: false }
          ] : []
        };
      }
      else if (type === 'COMPARISON') {
        defaultTitle = withPlaceholders ? 'Análise Comparativa de Cenários' : 'Comparativo';
        defaultConfig = {
          ...defaultConfig,
          items: withPlaceholders ? [
            { 
              id: generateUniqueId('comp'), 
              title: 'Cenário A', 
              description: 'Manutenção do modelo atual de gestão.', 
              icon: 'History', 
              isWinner: false,
              attributes: [
                { id: 'a1', label: 'Custo', value: 'Baixo' },
                { id: 'a2', label: 'Risco', value: 'Moderado' }
              ]
            },
            { 
              id: generateUniqueId('comp'), 
              title: 'Cenário B', 
              description: 'Implementação de nova tecnologia.', 
              icon: 'Zap', 
              isWinner: true,
              attributes: [
                { id: 'a1', label: 'Custo', value: 'Investimento' },
                { id: 'a2', label: 'Risco', value: 'Controlado' }
              ]
            }
          ] : [
            { id: generateUniqueId('comp'), title: 'Opção 1', description: '', icon: 'Circle', isWinner: false, attributes: [] },
            { id: generateUniqueId('comp'), title: 'Opção 2', description: '', icon: 'Circle', isWinner: false, attributes: [] }
          ]
        };
      }

      const newBlock = { 
        id: newId, 
        type, 
        width: defaultWidth, 
        title: defaultTitle, 
        config: defaultConfig 
      };
      
      blocks.splice(atIdx, 0, newBlock);
      newPages[pageIdx] = { ...newPages[pageIdx], blocks };
      return { ...prev, pages: newPages };
    });
    return newId;
  }, [setData]);

  return {
    data, setData, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0,
    updateBlock, removeBlock, moveBlock, duplicateBlock, addBlockAt, updatePage, addPage, pasteBlockAt,
    duplicatePage, movePage
  };
};