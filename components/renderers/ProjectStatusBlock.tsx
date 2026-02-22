import React, { useRef } from 'react';
import { PageTheme, ProjectMilestone } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Flag, Plus, Trash2, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

interface ProjectStatusBlockProps {
  projectTitle: string;
  description?: string;
  progress: number; // 0 a 100
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';
  milestones: ProjectMilestone[];
  theme?: PageTheme;
  isHighlighted?: boolean;
  onUpdate?: (updates: any) => void;
}

const STATUS_CONFIG = {
  ON_TRACK: { label: 'No Prazo', color: 'bg-[#0079C2]', text: 'text-[#0079C2]', bgLight: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle2 },
  AT_RISK: { label: 'Atenção', color: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
  DELAYED: { label: 'Atrasado', color: 'bg-rose-500', text: 'text-rose-600', bgLight: 'bg-rose-50', border: 'border-rose-200', icon: XCircle },
  COMPLETED: { label: 'Concluído', color: 'bg-emerald-500', text: 'text-emerald-600', bgLight: 'bg-emerald-50', border: 'border-emerald-200', icon: Flag }
};

export const ProjectStatusBlock: React.FC<ProjectStatusBlockProps> = ({
  projectTitle,
  description = "",
  progress = 0,
  status = 'ON_TRACK',
  milestones = [],
  theme = 'LIGHT',
  isHighlighted,
  onUpdate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const barRef = useRef<HTMLDivElement>(null);
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.ON_TRACK;
  const StatusIcon = statusInfo.icon;

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdate) return;
    const keys = Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[];
    const currentIndex = keys.indexOf(status as keyof typeof STATUS_CONFIG);
    const nextIndex = (currentIndex + 1) % keys.length;
    onUpdate({ status: keys[nextIndex] });
  };

  const handleBarClick = (e: React.MouseEvent) => {
    if (!isHighlighted || !barRef.current || !onUpdate) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.min(100, Math.max(0, Math.round((x / width) * 100)));
    onUpdate({ progress: newProgress });
  };

  const updateMilestone = (idx: number, field: keyof ProjectMilestone, value: any) => {
    if (!onUpdate) return;
    const newMilestones = [...milestones];
    newMilestones[idx] = { ...newMilestones[idx], [field]: value };
    onUpdate({ milestones: newMilestones });
  };

  const addMilestone = () => {
    if (!onUpdate) return;
    const newMilestone: ProjectMilestone = {
      id: Date.now().toString(),
      label: 'Novo Marco',
      date: 'DATA',
      completed: false
    };
    onUpdate({ milestones: [...milestones, newMilestone] });
  };

  const removeMilestone = (idx: number) => {
    if (!onUpdate) return;
    const newMilestones = milestones.filter((_, i) => i !== idx);
    onUpdate({ milestones: newMilestones });
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const dateVal = e.target.value;
    if (!dateVal) return;
    const [y, m, d] = dateVal.split('-');
    updateMilestone(idx, 'date', `${d}/${m}`);
  };

  return (
    <div className="w-full flex flex-col gap-4 py-2">
      
      {/* Header: Título e Status */}
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <span className={`text-[8px] font-bold uppercase tracking-widest mb-1 block ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}>Projeto / Iniciativa</span>
          {isHighlighted ? (
            <input 
              type="text" 
              value={projectTitle} 
              onChange={(e) => onUpdate?.({ projectTitle: e.target.value })}
              className={`w-full text-[14px] font-black uppercase tracking-tight outline-none bg-transparent border-b mb-1 ${isBlueTheme ? 'text-white border-white/20' : 'text-[#006098] border-transparent focus:border-blue-200'}`}
              placeholder="Nome do Projeto"
            />
          ) : (
            <h3 className={`text-[14px] font-black uppercase tracking-tight mb-1 ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>{projectTitle}</h3>
          )}

          {/* Campo de Descrição Contextual */}
          {isHighlighted ? (
            <textarea 
              value={description}
              onChange={(e) => onUpdate?.({ description: e.target.value })}
              placeholder="Descreva o status atual ou destaques..."
              className={`w-full text-[10px] font-medium leading-relaxed bg-transparent outline-none border-none resize-none h-12 italic ${isBlueTheme ? 'text-blue-100 placeholder-blue-300/40' : 'text-slate-500 placeholder-slate-300'}`}
            />
          ) : (
            description && (
              <p className={`text-[10px] font-medium leading-relaxed italic line-clamp-2 ${isBlueTheme ? 'text-blue-100/70' : 'text-slate-500'}`}>
                {description}
              </p>
            )
          )}
        </div>

        <button 
          onClick={isHighlighted ? cycleStatus : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all shrink-0 ${isHighlighted ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'} ${
            isBlueTheme 
              ? 'bg-white/10 text-white border-white/20' 
              : `${statusInfo.bgLight} ${statusInfo.text} ${statusInfo.border}`
          }`}
        >
          <StatusIcon size={12} strokeWidth={3} />
          <span className="text-[9px] font-black uppercase tracking-wider">{statusInfo.label}</span>
        </button>
      </div>

      {/* Barra de Progresso */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-end">
          <span className={`text-[9px] font-bold ${isBlueTheme ? 'text-blue-200' : 'text-slate-500'}`}>Progresso Geral</span>
          <span className={`text-[14px] font-black ${isBlueTheme ? 'text-white' : 'text-[#0079C2]'}`}>{progress}%</span>
        </div>
        
        <div 
          ref={barRef}
          onClick={handleBarClick}
          className={`relative h-4 w-full rounded-full overflow-hidden ${isHighlighted ? 'cursor-pointer' : ''} ${isBlueTheme ? 'bg-white/10' : 'bg-slate-100'}`}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
          
          <div 
            className={`h-full transition-all duration-700 ease-out rounded-full flex items-center justify-end pr-1 relative overflow-hidden ${statusInfo.color}`}
            style={{ width: `${progress}%` }}
          >
             <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Marcos (Milestones) */}
      {(milestones.length > 0 || isHighlighted) && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t border-dashed border-slate-200/50">
          {milestones.map((m, idx) => (
            <div key={m.id} className={`flex flex-col p-2 rounded-lg transition-all relative group/milestone ${m.completed ? (isBlueTheme ? 'bg-white/10' : 'bg-emerald-50/50') : (isBlueTheme ? 'bg-white/5' : 'bg-slate-50')}`}>
              
              {isHighlighted && (
                <button 
                  onClick={(e) => { e.stopPropagation(); removeMilestone(idx); }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/milestone:opacity-100 transition-all shadow-sm hover:scale-110 z-10"
                  title="Remover Marco"
                >
                  <Trash2 size={8} />
                </button>
              )}

              <div className="flex items-center justify-between mb-1">
                {isHighlighted ? (
                  <div className="flex items-center gap-1 w-full mr-1 relative">
                    <input 
                      type="text" 
                      value={m.date} 
                      onChange={(e) => updateMilestone(idx, 'date', e.target.value)} 
                      className={`text-[8px] font-bold uppercase w-full bg-transparent outline-none ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}
                    />
                    <div className="relative w-3 h-3 overflow-hidden shrink-0 group/picker cursor-pointer">
                       <input 
                         type="date" 
                         className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                         onChange={(e) => handleDatePick(e, idx)}
                       />
                       <CalendarIcon size={10} className={`${isBlueTheme ? 'text-blue-300' : 'text-slate-400'} group-hover/picker:text-[#0079C2] transition-colors`} />
                    </div>
                  </div>
                ) : (
                  <span className={`text-[8px] font-bold uppercase flex items-center gap-1 ${isBlueTheme ? 'text-blue-300' : 'text-slate-400'}`}>
                    <Clock size={8} /> {m.date}
                  </span>
                )}
                
                <button 
                  onClick={(e) => { e.stopPropagation(); isHighlighted && updateMilestone(idx, 'completed', !m.completed); }}
                  className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    m.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : (isBlueTheme ? 'border-white/30 text-transparent' : 'border-slate-300 bg-white text-transparent')
                  } ${isHighlighted ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
                >
                  <CheckCircle2 size={8} strokeWidth={4} />
                </button>
              </div>
              
              {isHighlighted ? (
                <input 
                  type="text" 
                  value={m.label} 
                  onChange={(e) => updateMilestone(idx, 'label', e.target.value)} 
                  className={`text-[9px] font-bold leading-tight bg-transparent outline-none w-full ${isBlueTheme ? 'text-white' : 'text-[#415364]'} ${m.completed ? 'opacity-50 line-through' : ''}`}
                />
              ) : (
                <span className={`text-[9px] font-bold leading-tight ${isBlueTheme ? 'text-white' : 'text-[#415364]'} ${m.completed ? 'opacity-50 line-through' : ''}`}>
                  {m.label}
                </span>
              )}
            </div>
          ))}

          {isHighlighted && (
             <button 
               onClick={(e) => { e.stopPropagation(); addMilestone(); }}
               className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 border-dashed transition-all opacity-60 hover:opacity-100 ${
                 isBlueTheme 
                   ? 'border-white/20 hover:bg-white/10 hover:border-white/40 text-blue-200' 
                   : 'border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-400 hover:text-blue-500'
               }`}
               title="Adicionar Marco"
             >
               <Plus size={14} strokeWidth={3} className="mb-1" />
               <span className="text-[7px] font-black uppercase tracking-widest">Novo</span>
             </button>
          )}
        </div>
      )}
    </div>
  );
};