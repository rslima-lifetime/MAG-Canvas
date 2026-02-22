
import React, { useMemo, useState } from 'react';
import { PageTheme, CalendarDayData, CalendarProject, ProjectStatus, ProjectPriority } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Trash2, X, Check, List, MessageSquareText, LayoutGrid, CalendarDays } from 'lucide-react';

interface ProjectCalendarBlockProps {
  currentMonth: string; // ISO String
  viewMode: 'MONTH' | 'WEEK' | 'LIST';
  daysData: Record<string, CalendarDayData>;
  rowHeight?: number; // Nova prop para controle deslizante
  priorityLabels?: Record<ProjectPriority, string>;
  theme?: PageTheme;
  isHighlighted?: boolean;
  onUpdateConfig?: (updates: any) => void;
  showLegend?: boolean;
  showPriorityTags?: boolean;
  listRangeStart?: string;
  listRangeEnd?: string;
}

const STATUS_ORDER: ProjectStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITY_ORDER: ProjectPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const STATUS_CONFIG: Record<ProjectStatus, { label: string, color: string }> = {
  NOT_STARTED: { label: 'Pendente', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  IN_PROGRESS: { label: 'Em Andamento', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  COMPLETED: { label: 'Concluído', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  CANCELLED: { label: 'Cancelado', color: 'bg-slate-100 text-slate-500 border-slate-300' }
};

const DEFAULT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa'
};

const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  HIGH: 'bg-rose-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-emerald-500'
};

const toLocalDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const ProjectCalendarBlock: React.FC<ProjectCalendarBlockProps> = ({
  currentMonth, viewMode, daysData, rowHeight = 110, priorityLabels = DEFAULT_PRIORITY_LABELS, theme = 'LIGHT', isHighlighted, onUpdateConfig,
  showLegend = false, showPriorityTags = false, listRangeStart, listRangeEnd
}) => {
  const isBlueTheme = theme === 'BLUE';
  
  const baseDate = useMemo(() => {
    try {
      const d = new Date(currentMonth);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch (e) {
      return new Date();
    }
  }, [currentMonth]);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [addingToDate, setAddingToDate] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  
  const autoResize = (target: HTMLTextAreaElement) => {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  // Componente interno para alternar visualização
  const ViewSwitcher = () => {
    if (!isHighlighted) return null; // Só mostra se estiver em modo de edição
    
    return (
      <div className={`flex items-center p-0.5 rounded-lg mr-2 no-print ${isBlueTheme ? 'bg-white/10 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); onUpdateConfig?.({ viewMode: 'MONTH' }); }}
          className={`p-1 rounded transition-all ${viewMode === 'MONTH' ? (isBlueTheme ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-[#0079C2] shadow-sm') : (isBlueTheme ? 'text-blue-200/40 hover:text-white' : 'text-slate-400 hover:text-slate-600')}`}
          title="Mensal"
        >
          <LayoutGrid size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onUpdateConfig?.({ viewMode: 'WEEK' }); }}
          className={`p-1 rounded transition-all ${viewMode === 'WEEK' ? (isBlueTheme ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-[#0079C2] shadow-sm') : (isBlueTheme ? 'text-blue-200/40 hover:text-white' : 'text-slate-400 hover:text-slate-600')}`}
          title="Semanal"
        >
          <CalendarDays size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onUpdateConfig?.({ viewMode: 'LIST' }); }}
          className={`p-1 rounded transition-all ${viewMode === 'LIST' ? (isBlueTheme ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-[#0079C2] shadow-sm') : (isBlueTheme ? 'text-blue-200/40 hover:text-white' : 'text-slate-400 hover:text-slate-600')}`}
          title="Agenda"
        >
          <List size={12} />
        </button>
      </div>
    );
  };

  // Calcula o estilo dinâmico com base na altura da linha (rowHeight)
  const getDynamicStyles = (height: number) => {
    if (viewMode === 'LIST') return {
      padding: 'p-3', gap: 'gap-2', dateText: 'text-sm', projectText: 'text-[10px]', projectPadding: 'p-3', statusText: 'text-[8px]', addButtonSize: 'w-6 h-6', showStatusBadge: true
    };

    if (height < 90) { // Modo Compacto
      return {
        padding: 'p-0.5',
        gap: 'gap-0.5',
        dateText: 'text-[8px]',
        projectText: 'text-[7px]',
        projectPadding: 'p-0.5',
        statusText: 'text-[6px]',
        addButtonSize: 'w-3 h-3',
        showStatusBadge: false
      };
    } else if (height > 140) { // Modo Relaxado
      return {
        padding: 'p-2',
        gap: 'gap-2',
        dateText: 'text-[10px]',
        projectText: 'text-[9px]',
        projectPadding: 'p-2',
        statusText: 'text-[8px]',
        addButtonSize: 'w-5 h-5',
        showStatusBadge: true
      };
    } else { // Modo Normal
      return {
        padding: 'p-1',
        gap: 'gap-1',
        dateText: 'text-[9px]',
        projectText: 'text-[8px]',
        projectPadding: 'p-1.5',
        statusText: 'text-[7px]',
        addButtonSize: 'w-4 h-4',
        showStatusBadge: true
      };
    }
  };

  const densityConfig = getDynamicStyles(rowHeight);

  const calendarDays = useMemo(() => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    
    if (viewMode === 'WEEK') {
      const day = baseDate.getDay() || 7; 
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() - (day - 1));
      
      const weekDays = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDays.push({ date: d, isCurrentMonth: d.getMonth() === month });
      }
      return weekDays;
    }

    if (viewMode === 'LIST') {
      // Retorna apenas dias com projetos dentro do range ou do mês atual
      const relevantDates = Object.keys(daysData).filter(iso => {
        // Se houver um range explícito, usa-o
        if (listRangeStart || listRangeEnd) {
           const d = iso; // String comparison works for ISO dates (YYYY-MM-DD)
           if (listRangeStart && d < listRangeStart) return false;
           if (listRangeEnd && d > listRangeEnd) return false;
           return daysData[iso].projects.length > 0;
        }

        // Fallback: Filtrar pelo mês atual
        // Parsing simples de string YYYY-MM-DD para evitar fuso horário
        const parts = iso.split('-');
        const dYear = parseInt(parts[0]);
        const dMonth = parseInt(parts[1]) - 1; // Mês é 0-indexed
        
        return daysData[iso].projects.length > 0 && dMonth === month && dYear === year;
      }).sort();
      
      // Constrói objetos de data localmente para exibição
      return relevantDates.map(iso => {
        const parts = iso.split('-');
        const localDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return { date: localDate, isCurrentMonth: true };
      });
    }

    const firstDayOfMonth = new Date(year, month, 1);
    const firstMonday = new Date(firstDayOfMonth);
    const offset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    firstMonday.setDate(firstDayOfMonth.getDate() - offset);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstMonday);
      d.setDate(firstMonday.getDate() + i);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push({ date: d, isCurrentMonth: d.getMonth() === month });
      }
      if (days.length >= 30) break;
    }
    return days;
  }, [baseDate, viewMode, daysData, listRangeStart, listRangeEnd]);

  const monthName = baseDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  const getHeaderTitle = () => {
    if (viewMode === 'LIST') {
      if (listRangeStart && listRangeEnd) {
        // Formatação manual para garantir consistência
        const formatBR = (iso: string) => {
           const [y, m, d] = iso.split('-');
           return `${d}/${m}/${y.slice(2)}`;
        };
        return `Agenda • ${formatBR(listRangeStart)} a ${formatBR(listRangeEnd)}`;
      }
      if (listRangeStart) {
         const [y, m, d] = listRangeStart.split('-');
         return `Agenda • A partir de ${d}/${m}/${y}`;
      }
      return `Agenda • ${monthName}`;
    }
    return `${monthName} ${viewMode === 'WEEK' ? '(Semana)' : ''}`;
  }

  const handleAddProject = (dateKey: string) => {
    if (!tempTitle.trim()) {
      setAddingToDate(null);
      return;
    }
    const newProject: CalendarProject = {
      id: Date.now().toString(),
      title: tempTitle,
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      description: ''
    };
    const currentDay = daysData[dateKey] || { date: dateKey, projects: [] };
    onUpdateConfig?.({ daysData: { ...daysData, [dateKey]: { ...currentDay, projects: [...currentDay.projects, newProject] } } });
    setTempTitle("");
    setAddingToDate(null);
  };

  const handleDeleteProject = (dateKey: string, projectId: string) => {
    const currentDay = daysData[dateKey];
    if (!currentDay) return;
    onUpdateConfig?.({ daysData: { ...daysData, [dateKey]: { ...currentDay, projects: currentDay.projects.filter(p => p.id !== projectId) } } });
  };

  const handleUpdateProjectField = (dateKey: string, projectId: string, field: keyof CalendarProject, value: any) => {
    const currentDay = daysData[dateKey];
    if (!currentDay) return;
    const updatedProjects = currentDay.projects.map(p => p.id === projectId ? { ...p, [field]: value } : p);
    onUpdateConfig?.({ daysData: { ...daysData, [dateKey]: { ...currentDay, projects: updatedProjects } } });
  };

  const cycleStatus = (e: React.MouseEvent, dateKey: string, project: CalendarProject) => {
    if (!isHighlighted) return;
    e.stopPropagation();
    const currentIndex = STATUS_ORDER.indexOf(project.status);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    handleUpdateProjectField(dateKey, project.id, 'status', STATUS_ORDER[nextIndex]);
  };

  const cyclePriority = (e: React.MouseEvent, dateKey: string, project: CalendarProject) => {
    if (!isHighlighted) return;
    e.stopPropagation();
    const currentIndex = PRIORITY_ORDER.indexOf(project.priority);
    const nextIndex = (currentIndex + 1) % PRIORITY_ORDER.length;
    handleUpdateProjectField(dateKey, project.id, 'priority', PRIORITY_ORDER[nextIndex]);
  };

  const handleBlurContainer = (e: React.FocusEvent<HTMLDivElement>) => {
    // Só fecha a edição se o foco foi para fora do container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setEditingProjectId(null);
    }
  };

  const renderProject = (project: CalendarProject, dateKey: string, isListView: boolean = false) => {
    const isEditing = editingProjectId === project.id;
    const status = STATUS_CONFIG[project.status];
    const priorityColor = PRIORITY_COLORS[project.priority];
    const priorityLabel = priorityLabels[project.priority] || DEFAULT_PRIORITY_LABELS[project.priority];
    const hasDescription = !!project.description && project.description.trim().length > 0;

    return (
      <div 
        key={project.id} 
        className={`group/prj flex flex-col ${densityConfig.projectPadding} bg-white border border-slate-100 rounded-lg shadow-sm ${densityConfig.projectText} leading-[1.1] relative transition-all ${isEditing ? 'ring-2 ring-[#00A7E7] z-30' : 'hover:z-20 hover:shadow-md'} ${isListView ? 'mb-2 w-full' : 'mb-1'}`}
      >
        {isHighlighted && !isEditing && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteProject(dateKey, project.id); }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/prj:opacity-100 transition-all z-40 no-print shadow-lg border border-white hover:scale-110 active:scale-90"
          >
            <Trash2 size={8} />
          </button>
        )}

        <div className="flex justify-between items-center mb-1 gap-1">
          {showPriorityTags ? (
            <div 
              onClick={(e) => cyclePriority(e, dateKey, project)}
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColor} ${isHighlighted ? 'cursor-pointer hover:brightness-110 active:scale-125 transition-all' : ''}`} 
              title={`Prioridade: ${priorityLabel} (Clique para alterar)`}
            />
          ) : (
            <div /> // Spacer if needed
          )}
          
          <div className="flex items-center gap-1">
            {/* Ícone de Comentário (Aparece em Grid View se houver descrição) */}
            {!isListView && hasDescription && !isEditing && (
              <MessageSquareText size={8} className="text-slate-300" />
            )}

            {!isEditing && densityConfig.showStatusBadge && (
              <div 
                onClick={(e) => cycleStatus(e, dateKey, project)}
                className={`px-1.5 py-0.5 rounded-full ${densityConfig.statusText} font-black uppercase tracking-tighter border ${status.color} ${isHighlighted ? 'cursor-pointer hover:brightness-95 active:scale-95 transition-all' : ''}`}
                title={isHighlighted ? "Clique para alterar status" : ""}
              >
                {status.label}
              </div>
            )}
          </div>
        </div>

        <div className="w-full">
          {isEditing ? (
            <div className="flex flex-col gap-1 min-w-[120px]" onBlur={handleBlurContainer}>
              {/* Título */}
              <textarea 
                autoFocus
                defaultValue={project.title}
                onFocus={(e) => autoResize(e.currentTarget)}
                onInput={(e) => autoResize(e.currentTarget)}
                onBlur={(e) => {
                  handleUpdateProjectField(dateKey, project.id, 'title', e.target.value);
                }}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Para o título, Enter apenas sai do campo (comportamento Excel)
                    e.currentTarget.blur();
                  }
                  if (e.key === 'Escape') setEditingProjectId(null);
                }}
                className={`w-full ${densityConfig.projectText} font-black text-slate-800 outline-none bg-blue-50/30 px-1 py-0.5 rounded border-b border-[#00A7E7] resize-none leading-tight whitespace-pre-wrap overflow-hidden`}
                style={{ minHeight: '1.5em' }}
                placeholder="Título do Projeto"
              />
              
              {/* Descrição/Comentário - Agora visível na edição inline */}
              <textarea 
                defaultValue={project.description || ''}
                onFocus={(e) => autoResize(e.currentTarget)}
                onInput={(e) => autoResize(e.currentTarget)}
                onBlur={(e) => {
                  handleUpdateProjectField(dateKey, project.id, 'description', e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.altKey) {
                      // Alt + Enter: Quebra de linha manual
                      e.preventDefault();
                      const target = e.currentTarget;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const val = target.value;
                      const newVal = val.substring(0, start) + "\n" + val.substring(end);
                      
                      target.value = newVal;
                      target.selectionStart = target.selectionEnd = start + 1;
                      autoResize(target);
                      handleUpdateProjectField(dateKey, project.id, 'description', newVal);
                    } else {
                      // Enter: Salva e fecha (Blur)
                      e.preventDefault();
                      e.currentTarget.blur();
                      setEditingProjectId(null);
                    }
                  }
                  if (e.key === 'Escape') setEditingProjectId(null);
                }}
                className={`w-full text-[8px] font-medium text-slate-500 outline-none bg-slate-50 px-1 py-0.5 rounded border border-transparent focus:border-slate-200 focus:bg-white resize-none leading-tight whitespace-pre-wrap overflow-hidden italic`}
                style={{ minHeight: '1.2em' }}
                placeholder="Adicionar comentário... (Alt+Enter para nova linha)"
              />
            </div>
          ) : (
            <span 
              onClick={(e) => { if (isHighlighted) { e.stopPropagation(); setEditingProjectId(project.id); } }}
              className={`block px-0.5 font-bold text-slate-800 break-words leading-tight whitespace-pre-wrap ${isHighlighted ? 'cursor-text hover:bg-slate-50 rounded' : ''}`}
            >
              {project.title}
            </span>
          )}
        </div>

        {/* Descrição em Texto (Aparece apenas em List View) */}
        {isListView && hasDescription && (
          <div className="mt-1 px-0.5">
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Renderização Específica para Modo Lista (Agenda)
  if (viewMode === 'LIST') {
    // calendarDays já vem filtrado pelo useMemo acima
    const sortedDays = calendarDays;

    return (
      <div className={`w-full flex flex-col p-4 rounded-xl transition-all ${isBlueTheme ? 'bg-white/5 border-white/10' : 'bg-white border-slate-50 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4 border-b pb-2 px-1">
          <div className="flex items-center gap-2">
             <List size={16} className={isBlueTheme ? 'text-[#00A7E7]' : 'text-[#0079C2]'} />
             <h3 className={`text-xs font-black uppercase tracking-widest ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>
                {getHeaderTitle()}
             </h3>
          </div>
          <div className="flex items-center">
            {/* Switcher de Views */}
            <ViewSwitcher />
            
            {/* Navegação removida se for LIST com range customizado, pois confunde o user. Mantida se for baseada em mês. */}
            {(!listRangeStart && !listRangeEnd) && (
              <div className="flex items-center gap-1 no-print">
                <button onClick={() => { const d = new Date(baseDate); d.setMonth(d.getMonth() - 1); onUpdateConfig?.({ currentMonth: d.toISOString() }); }} className={`p-1.5 rounded hover:bg-slate-100 ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}><ChevronLeft size={16} /></button>
                <button onClick={() => { const d = new Date(baseDate); d.setMonth(d.getMonth() + 1); onUpdateConfig?.({ currentMonth: d.toISOString() }); }} className={`p-1.5 rounded hover:bg-slate-100 ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>

        {sortedDays.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center opacity-50">
             <CalendarIcon size={32} className="mb-2 text-slate-300" />
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nenhum evento registrado no período</span>
             {isHighlighted && <span className="text-[8px] mt-1 text-slate-400">Use o painel lateral para adicionar projetos ou ajustar datas</span>}
          </div>
        ) : (
          <div className="flex flex-col gap-0 relative">
             <div className={`absolute top-2 bottom-2 left-[58px] w-[2px] rounded-full z-0 ${isBlueTheme ? 'bg-white/10' : 'bg-slate-100'}`} />
             
             {sortedDays.map(dayInfo => {
               const dateKey = toLocalDateKey(dayInfo.date);
               const dayData = daysData[dateKey];
               const dateObj = dayInfo.date;
               const dayNum = dateObj.getDate();
               const weekDay = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });

               if (!dayData || dayData.projects.length === 0) return null;

               return (
                 <div key={dateKey} className="flex gap-4 relative z-10 mb-4 group">
                    {/* Coluna Data */}
                    <div className="flex flex-col items-end w-[45px] shrink-0 pt-1">
                       <span className={`text-lg font-black leading-none ${isBlueTheme ? 'text-white' : 'text-[#0079C2]'}`}>{dayNum}</span>
                       <span className={`text-[8px] font-bold uppercase tracking-widest ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}>{weekDay.replace('.', '')}</span>
                    </div>

                    {/* Dot Timeline */}
                    <div className={`w-3 h-3 rounded-full border-2 mt-2 shrink-0 z-10 transition-transform group-hover:scale-125 ${isBlueTheme ? 'bg-[#006098] border-[#00A7E7]' : 'bg-white border-[#0079C2]'}`} />

                    {/* Lista de Projetos */}
                    <div className="flex-1 flex flex-col gap-2 pt-0.5">
                       {dayData.projects.map(prj => renderProject(prj, dateKey, true))}
                    </div>
                 </div>
               )
             })}
          </div>
        )}
      </div>
    );
  }

  // Renderização Padrão (Grade: Mês/Semana)
  return (
    <div className={`w-full flex flex-col p-2 rounded-xl transition-all ${isBlueTheme ? 'bg-white/5 border-white/10' : 'bg-white border-slate-50 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-3 border-b pb-1.5 px-1">
        <div className="flex items-center gap-2">
           <CalendarIcon size={12} className={isBlueTheme ? 'text-[#00A7E7]' : 'text-[#0079C2]'} />
           <h3 className={`text-[11px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>
              {getHeaderTitle()}
           </h3>
        </div>
        <div className="flex items-center">
          {/* Switcher de Views */}
          <ViewSwitcher />

          <div className="flex items-center gap-1 no-print">
            <button onClick={() => { const d = new Date(baseDate); viewMode === 'WEEK' ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1); onUpdateConfig?.({ currentMonth: d.toISOString() }); }} className={`p-1 rounded hover:bg-slate-100 ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}><ChevronLeft size={14} /></button>
            <button onClick={() => { const d = new Date(baseDate); viewMode === 'WEEK' ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1); onUpdateConfig?.({ currentMonth: d.toISOString() }); }} className={`p-1 rounded hover:bg-slate-100 ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-5 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden`}>
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(d => (
          <div key={d} className={`py-1 text-center text-[8px] font-black uppercase tracking-widest ${isBlueTheme ? 'bg-[#006098] text-white/80' : 'bg-slate-50 text-[#0079C2]'}`}>{d}</div>
        ))}
        {calendarDays.map((d, i) => {
          const dateKey = toLocalDateKey(d.date);
          const data = daysData[dateKey];
          const isToday = toLocalDateKey(new Date()) === dateKey;
          const isAdding = addingToDate === dateKey;
          return (
            <div 
              key={i} 
              style={{ minHeight: `${rowHeight}px` }}
              className={`${densityConfig.padding} flex flex-col ${densityConfig.gap} transition-all group relative ${d.isCurrentMonth ? (isBlueTheme ? 'bg-white/5' : 'bg-white') : (isBlueTheme ? 'bg-white/0 opacity-20' : 'bg-slate-50/50 opacity-40')}`}
            >
              <div className="flex justify-between items-center px-0.5 border-b border-slate-100/10 pb-0.5">
                <span className={`${densityConfig.dateText} font-black ${isToday ? 'bg-[#00A7E7] text-white px-1 rounded-sm' : (isBlueTheme ? 'text-white' : 'text-slate-400')}`}>{d.date.getDate()}</span>
                {isHighlighted && d.isCurrentMonth && !isAdding && (
                  <button onClick={() => { setAddingToDate(dateKey); setTempTitle(""); }} className={`${densityConfig.addButtonSize} rounded-full bg-blue-50 text-[#0079C2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity no-print hover:bg-blue-100`}><Plus size={10} strokeWidth={3} /></button>
                )}
              </div>
              <div className="flex flex-col gap-0.5 overflow-visible">
                {data?.projects.map(p => renderProject(p, dateKey))}
                {isAdding && (
                  <div className="flex flex-col gap-1 p-1 bg-blue-50 border border-blue-200 rounded shadow-sm no-print animate-in fade-in zoom-in-95">
                    <textarea 
                      autoFocus 
                      placeholder="Novo projeto..." 
                      value={tempTitle} 
                      onFocus={(e) => autoResize(e.currentTarget)}
                      onInput={(e) => autoResize(e.currentTarget)}
                      onChange={(e) => setTempTitle(e.target.value)} 
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter') {
                          if (e.ctrlKey && e.altKey) {
                            const cursor = e.currentTarget.selectionStart;
                            const val = e.currentTarget.value;
                            e.currentTarget.value = val.slice(0, cursor) + '\n' + val.slice(e.currentTarget.selectionEnd);
                            e.currentTarget.selectionStart = e.currentTarget.selectionEnd = cursor + 1;
                            setTempTitle(e.currentTarget.value);
                            autoResize(e.currentTarget);
                            e.preventDefault();
                          } else {
                            e.preventDefault();
                            handleAddProject(dateKey);
                          }
                        }
                        if (e.key === 'Escape') setAddingToDate(null); 
                      }} 
                      className={`text-[8.5px] bg-transparent outline-none font-black text-[#006098] w-full resize-none leading-tight whitespace-pre-wrap overflow-hidden`} 
                      style={{ minHeight: '1.5em' }}
                    />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setAddingToDate(null)} className="p-0.5 text-slate-400 hover:text-rose-500"><X size={8} /></button>
                      <button onClick={() => handleAddProject(dateKey)} className="p-0.5 text-emerald-600 hover:text-emerald-700"><Check size={8} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {showLegend && (
        <div className="mt-3 flex items-center justify-center gap-4 border-t pt-2 border-slate-100">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className={`text-[7px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-200/50' : 'text-slate-500'}`}>{priorityLabels.HIGH}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className={`text-[7px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-200/50' : 'text-slate-500'}`}>{priorityLabels.MEDIUM}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className={`text-[7px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-200/50' : 'text-slate-500'}`}>{priorityLabels.LOW}</span></div>
        </div>
      )}
    </div>
  );
};
