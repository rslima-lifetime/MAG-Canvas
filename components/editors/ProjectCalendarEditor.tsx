
import React, { useState } from 'react';
import { Calendar as CalendarIcon, LayoutGrid, List, Plus, Trash2, Tag, Info, Maximize2, MoveVertical, Eye, EyeOff, CalendarDays, ArrowRight, MessageSquarePlus, MessageSquareText, Link2, Link2Off, RefreshCw } from 'lucide-react';
import { ProjectStatus, ProjectPriority, CalendarProject, DensityLevel } from '../../types';

interface ProjectCalendarEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

const DEFAULT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa'
};

export const ProjectCalendarEditor: React.FC<ProjectCalendarEditorProps> = ({ config, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null);

  const currentDaysData = config.daysData || {};
  const dayData = currentDaysData[selectedDate] || { date: selectedDate, projects: [] };
  const currentPriorityLabels = config.priorityLabels || DEFAULT_PRIORITY_LABELS;
  
  // Default height 110px equivalent to previous 'NORMAL'
  const currentRowHeight = config.rowHeight || 110;
  
  // Alterado para tratar undefined como FALSE
  const showLegend = config.showLegend === true;
  const showPriorityTags = config.showPriorityTags === true;
  const isLinked = !!config.syncId;

  const addProject = () => {
    const newProject: CalendarProject = {
      id: Date.now().toString(),
      title: 'Novo Projeto',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      description: ''
    };
    
    const updatedDaysData = {
      ...currentDaysData,
      [selectedDate]: {
        ...dayData,
        projects: [...dayData.projects, newProject]
      }
    };
    
    onUpdate({ daysData: updatedDaysData });
  };

  const updateProject = (projectId: string, updates: Partial<CalendarProject>) => {
    const updatedProjects = dayData.projects.map((p: CalendarProject) => 
      p.id === projectId ? { ...p, ...updates } : p
    );
    
    onUpdate({
      daysData: {
        ...currentDaysData,
        [selectedDate]: { ...dayData, projects: updatedProjects }
      }
    });
  };

  const removeProject = (projectId: string) => {
    const updatedProjects = dayData.projects.filter((p: CalendarProject) => p.id !== projectId);
    onUpdate({
      daysData: {
        ...currentDaysData,
        [selectedDate]: { ...dayData, projects: updatedProjects }
      }
    });
  };

  const updatePriorityLabel = (key: ProjectPriority, value: string) => {
    onUpdate({
      priorityLabels: {
        ...currentPriorityLabels,
        [key]: value
      }
    });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    
    try {
      const date = new Date(val + "-02"); // Append day to ensure valid month parsing
      if (!isNaN(date.getTime())) {
        onUpdate({ currentMonth: date.toISOString() });
      }
    } catch (err) {
      console.error("Invalid date input", err);
    }
  };

  const toggleSync = () => {
    if (isLinked) {
      // Desvincular: Remove o ID
      onUpdate({ syncId: null });
    } else {
      // Vincular: Cria um novo ID
      const newSyncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      onUpdate({ syncId: newSyncId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Seção de Sincronização */}
      <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 ${isLinked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${isLinked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
            {isLinked ? <Link2 size={14} /> : <Link2Off size={14} />}
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-tight ${isLinked ? 'text-emerald-700' : 'text-slate-500'}`}>
              {isLinked ? 'Dados Vinculados' : 'Dados Independentes'}
            </span>
            <span className="text-[8px] font-medium opacity-70 leading-tight">
              {isLinked ? 'Alterações replicam em cópias.' : 'Alterações apenas neste bloco.'}
            </span>
          </div>
        </div>
        <button 
          onClick={toggleSync}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm border ${
            isLinked 
              ? 'bg-white border-emerald-200 text-emerald-600 hover:text-rose-500 hover:border-rose-200' 
              : 'bg-white border-slate-200 text-slate-500 hover:text-[#0079C2] hover:border-[#0079C2]'
          }`}
        >
          {isLinked ? 'Desvincular' : 'Vincular'}
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Modo de Visão</label>
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1 shadow-inner">
          <button 
            onClick={() => onUpdate({ viewMode: 'MONTH' })} 
            className={`flex-1 flex items-center justify-center gap-1 p-1.5 rounded text-[8px] font-black uppercase transition-all ${config.viewMode === 'MONTH' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <LayoutGrid size={10} /> Mensal
          </button>
          <button 
            onClick={() => onUpdate({ viewMode: 'WEEK' })} 
            className={`flex-1 flex items-center justify-center gap-1 p-1.5 rounded text-[8px] font-black uppercase transition-all ${config.viewMode === 'WEEK' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <CalendarDays size={10} /> Semana
          </button>
          <button 
            onClick={() => onUpdate({ viewMode: 'LIST' })} 
            className={`flex-1 flex items-center justify-center gap-1 p-1.5 rounded text-[8px] font-black uppercase transition-all ${config.viewMode === 'LIST' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <List size={10} /> Agenda
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => onUpdate({ showPriorityTags: !showPriorityTags })}
          className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${showPriorityTags ? 'bg-white border-[#0079C2] text-[#0079C2]' : 'bg-slate-50 border-transparent text-slate-400'}`}
        >
          <span className="text-[9px] font-black uppercase">Tags (Cores)</span>
          {showPriorityTags ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button 
          onClick={() => onUpdate({ showLegend: !showLegend })}
          className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${showLegend ? 'bg-white border-[#0079C2] text-[#0079C2]' : 'bg-slate-50 border-transparent text-slate-400'}`}
        >
          <span className="text-[9px] font-black uppercase">Legenda</span>
          {showLegend ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      </div>

      {config.viewMode === 'LIST' ? (
        <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-2">
            <CalendarDays size={12} className="text-[#00A7E7]" />
            <span>Período da Agenda</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-400 uppercase">De</label>
              <input 
                type="date" 
                value={config.listRangeStart || ''} 
                onChange={(e) => onUpdate({ listRangeStart: e.target.value })}
                className="w-full p-1.5 text-[10px] border rounded font-bold text-[#006098] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-400 uppercase">Até</label>
              <input 
                type="date" 
                value={config.listRangeEnd || ''} 
                onChange={(e) => onUpdate({ listRangeEnd: e.target.value })}
                className="w-full p-1.5 text-[10px] border rounded font-bold text-[#006098] bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end">
             <button onClick={() => onUpdate({ listRangeStart: '', listRangeEnd: '' })} className="text-[8px] text-slate-400 underline hover:text-rose-500">Limpar período</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Mês Base</label>
            <input 
              type="month" 
              value={config.currentMonth ? config.currentMonth.substring(0, 7) : ''}
              onChange={handleMonthChange}
              className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none font-bold text-[#006098]"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><MoveVertical size={10} /> Densidade</label>
              <span className="text-[9px] font-black text-[#0079C2]">{currentRowHeight}px</span>
            </div>
            <input 
              type="range" 
              min="60" 
              max="300" 
              step="10" 
              value={currentRowHeight} 
              onChange={(e) => onUpdate({ rowHeight: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0079C2]"
            />
          </div>
        </div>
      )}

      <div className="space-y-2 p-3 bg-slate-50 border rounded-xl">
        <label className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-2 mb-2">
          <Tag size={12} className="text-[#00A7E7]" />
          <span>Editor de Legendas (Farol)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[7px] font-black text-rose-500 uppercase">Alta</label>
            <input 
              type="text" 
              value={currentPriorityLabels.HIGH} 
              onChange={(e) => updatePriorityLabel('HIGH', e.target.value)}
              className="w-full p-1.5 text-[9px] border rounded font-bold text-[#415364]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[7px] font-black text-amber-500 uppercase">Média</label>
            <input 
              type="text" 
              value={currentPriorityLabels.MEDIUM} 
              onChange={(e) => updatePriorityLabel('MEDIUM', e.target.value)}
              className="w-full p-1.5 text-[9px] border rounded font-bold text-[#415364]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[7px] font-black text-emerald-500 uppercase">Baixa</label>
            <input 
              type="text" 
              value={currentPriorityLabels.LOW} 
              onChange={(e) => updatePriorityLabel('LOW', e.target.value)}
              className="w-full p-1.5 text-[9px] border rounded font-bold text-[#415364]"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon size={12} className="text-[#0079C2]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#006098]">Gerenciar Dia</span>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 text-[11px] font-bold border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-[#00A7E7]"
        />

        <div className="space-y-3">
          {dayData.projects.length === 0 ? (
            <div className="py-6 text-center border border-dashed rounded-lg border-blue-200 bg-white/50">
               <p className="text-[8px] font-black text-blue-300 uppercase">Nenhum projeto para este dia</p>
            </div>
          ) : (
            dayData.projects.map((project: CalendarProject) => (
              <div key={project.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-3 group shadow-sm transition-all hover:border-[#0079C2]">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <input 
                      type="text" 
                      value={project.title}
                      onChange={(e) => updateProject(project.id, { title: e.target.value })}
                      placeholder="Título do Projeto"
                      className="w-full bg-transparent text-[10px] font-black text-[#006098] outline-none border-b border-transparent focus:border-[#0079C2] uppercase"
                    />
                  </div>
                  
                  {/* Botão para alternar descrição */}
                  <button 
                    onClick={() => setExpandedDescId(expandedDescId === project.id ? null : project.id)}
                    className={`p-1 rounded-md transition-colors ${project.description ? 'text-[#00A7E7] bg-blue-50' : 'text-slate-300 hover:text-[#0079C2] hover:bg-slate-50'}`}
                    title={project.description ? "Editar Comentário" : "Adicionar Comentário"}
                  >
                    {project.description ? <MessageSquareText size={14} /> : <MessageSquarePlus size={14} />}
                  </button>

                  <button onClick={() => removeProject(project.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Área de Descrição Expansível */}
                {(expandedDescId === project.id || project.description) && (
                  <div className="relative animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-[7px] font-bold text-slate-400 uppercase mb-1 block">Comentário / Detalhe</label>
                    <textarea 
                      value={project.description || ''}
                      onChange={(e) => updateProject(project.id, { description: e.target.value })}
                      placeholder="Adicionar descrição ou comentário (visível apenas na Agenda)"
                      className="w-full p-2 text-[9px] border rounded-lg bg-slate-50 min-h-[50px] outline-none focus:bg-white focus:ring-1 focus:ring-blue-100 resize-y"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase">Status</label>
                    <select 
                      value={project.status}
                      onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
                      className="w-full p-1 text-[8px] border rounded font-bold"
                    >
                      <option value="NOT_STARTED">Não Iniciado</option>
                      <option value="IN_PROGRESS">Em Andamento</option>
                      <option value="COMPLETED">Concluído</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase">Prioridade</label>
                    <select 
                      value={project.priority}
                      onChange={(e) => updateProject(project.id, { priority: e.target.value as ProjectPriority })}
                      className="w-full p-1 text-[8px] border rounded font-bold"
                    >
                      <option value="HIGH">{currentPriorityLabels.HIGH}</option>
                      <option value="MEDIUM">{currentPriorityLabels.MEDIUM}</option>
                      <option value="LOW">{currentPriorityLabels.LOW}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}

          <button 
            onClick={addProject}
            className="w-full py-2 bg-[#0079C2] text-white rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-[#006098] transition-all"
          >
            <Plus size={14} /> Adicionar Projeto ao Dia
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 p-3 bg-slate-50 rounded-xl border">
        <Info size={16} className="text-slate-400 shrink-0" />
        <p className="text-[8px] text-slate-500 font-medium leading-tight uppercase">
          No modo Agenda, use o "Período da Agenda" para visualizar eventos de múltiplos meses.
        </p>
      </div>
    </div>
  );
};
