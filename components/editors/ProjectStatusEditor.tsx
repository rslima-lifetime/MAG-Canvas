import React from 'react';
import { Flag, Plus, Trash2, CheckCircle2, AlertTriangle, XCircle, Percent, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { ProjectMilestone } from '../../types';

interface ProjectStatusEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

const STATUS_OPTIONS = [
  { value: 'ON_TRACK', label: 'No Prazo', icon: CheckCircle2, color: 'text-[#0079C2]' },
  { value: 'AT_RISK', label: 'Atenção', icon: AlertTriangle, color: 'text-amber-500' },
  { value: 'DELAYED', label: 'Atrasado', icon: XCircle, color: 'text-rose-500' },
  { value: 'COMPLETED', label: 'Concluído', icon: Flag, color: 'text-emerald-500' },
];

export const ProjectStatusEditor: React.FC<ProjectStatusEditorProps> = ({ config, onUpdate }) => {
  
  const updateMilestone = (idx: number, updates: Partial<ProjectMilestone>) => {
    const newMilestones = [...(config.milestones || [])];
    newMilestones[idx] = { ...newMilestones[idx], ...updates };
    onUpdate({ milestones: newMilestones });
  };

  const addMilestone = () => {
    const newMilestone: ProjectMilestone = {
      id: Date.now().toString(),
      label: 'Novo Marco',
      date: 'DD/MM',
      completed: false
    };
    onUpdate({ milestones: [...(config.milestones || []), newMilestone] });
  };

  const removeMilestone = (idx: number) => {
    onUpdate({ milestones: (config.milestones || []).filter((_: any, i: number) => i !== idx) });
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const dateVal = e.target.value;
    if (!dateVal) return;
    const [y, m, d] = dateVal.split('-');
    updateMilestone(idx, { date: `${d}/${m}` });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Título e Progresso */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3 space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Nome do Projeto</label>
          <input 
            type="text" 
            value={config.projectTitle || ''} 
            onChange={(e) => onUpdate({ projectTitle: e.target.value })}
            className="w-full p-2 border rounded-xl text-[11px] font-black text-[#006098] outline-none focus:ring-1 focus:ring-blue-100"
            placeholder="Ex: Migração SAP"
          />
        </div>
        <div className="col-span-1 space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1"><Percent size={10} /> %</label>
          <input 
            type="number" 
            min="0" max="100"
            value={config.progress || 0} 
            onChange={(e) => onUpdate({ progress: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded-xl text-[11px] font-black text-center outline-none"
          />
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
          <MessageSquare size={10} className="text-[#0079C2]" /> Resumo Executivo
        </label>
        <textarea 
          value={config.description || ''} 
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full p-2.5 border rounded-xl text-[11px] h-20 outline-none focus:ring-2 focus:ring-blue-100 italic leading-relaxed"
          placeholder="Destaques, justificativas ou próximos passos..."
        />
      </div>

      {/* Status Global */}
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase">Status Geral</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = config.status === opt.value;
            return (
              <button 
                key={opt.value}
                onClick={() => onUpdate({ status: opt.value })}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  isSelected 
                    ? `bg-white border-current ${opt.color} shadow-sm` 
                    : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'
                }`}
              >
                <Icon size={14} />
                <span className="text-[9px] font-black uppercase">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Marcos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <Flag size={10} className="text-[#0079C2]" /> Marcos de Entrega
          </label>
          <button onClick={addMilestone} className="text-[#0079C2] hover:bg-blue-50 p-1 rounded transition-colors">
            <Plus size={12} />
          </button>
        </div>

        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          {(config.milestones || []).map((m: ProjectMilestone, idx: number) => (
            <div key={m.id} className="flex items-center gap-2 p-2 bg-white border rounded-lg group">
              <input 
                type="checkbox" 
                checked={m.completed} 
                onChange={(e) => updateMilestone(idx, { completed: e.target.checked })}
                className="w-3 h-3 rounded border-slate-300 text-[#0079C2] focus:ring-0" 
              />
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div className="col-span-1 relative">
                  <input 
                    type="text" 
                    value={m.date} 
                    onChange={(e) => updateMilestone(idx, { date: e.target.value })}
                    placeholder="Data"
                    className="w-full text-[9px] font-bold uppercase text-slate-500 bg-transparent outline-none border-b border-transparent focus:border-blue-200"
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="relative w-4 h-4 overflow-hidden cursor-pointer">
                        <input 
                          type="date" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          onChange={(e) => handleDatePick(e, idx)} 
                        />
                        <CalendarIcon size={12} className="text-[#0079C2]" />
                     </div>
                  </div>
                </div>
                <input 
                  type="text" 
                  value={m.label} 
                  onChange={(e) => updateMilestone(idx, { label: e.target.value })}
                  placeholder="Descrição da entrega"
                  className="col-span-2 text-[10px] font-medium text-[#006098] bg-transparent outline-none border-b border-transparent focus:border-blue-200"
                />
              </div>
              <button onClick={() => removeMilestone(idx)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {(config.milestones || []).length === 0 && (
            <div className="text-center py-4 text-[9px] text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Nenhum marco adicionado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};