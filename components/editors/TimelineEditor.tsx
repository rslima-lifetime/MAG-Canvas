import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Maximize2, Bold, Type, ToggleRight, ToggleLeft, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { TimelineEvent } from '../../types';
import { IconPicker } from '../ui/IconPicker';
import { resolveIconComponent } from '../../utils/icon-library';

interface TimelineEditorProps {
  events: TimelineEvent[];
  config: any;
  activeSubItemIndex?: number | null;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdate: (data: any) => void;
}

const PRESET_COLORS = ['#0079C2', '#00A7E7', '#006098', '#10B981', '#F59E0B', '#EF4444', '#7C3AED'];

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ 
  events = [], 
  config = {} as any, 
  activeSubItemIndex, 
  onActiveSubItemChange, 
  onUpdate 
}) => {
  const [showPickerFor, setShowPickerFor] = useState<number | null>(null);

  const updateEvent = (idx: number, field: string, value: any) => {
    const newEvents = events.map((e, i) => i === idx ? { ...e, [field]: value } : e);
    onUpdate({ events: newEvents });
  };

  const handleGlobalUpdate = (updates: any) => {
    onUpdate({ ...updates });
  };

  const removeEvent = (idx: number) => {
    onUpdate({ events: events.filter((_, i) => i !== idx) });
    if (activeSubItemIndex === idx) onActiveSubItemChange?.(null);
  };

  const addEvent = () => {
    onUpdate({ events: [...events, { year: '2025', title: 'Novo Evento', description: 'Descrição curta...', icon: 'Calendar', color: '#0079C2' }] });
    onActiveSubItemChange?.(events.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* CONFIGURAÇÃO GLOBAL DE ESTILO */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Type size={14} className="text-[#0079C2]" />
          <span className="text-[10px] font-black uppercase text-[#006098] tracking-widest">Estilo Visual</span>
        </div>

        <button 
          onClick={() => handleGlobalUpdate({ showDescription: config.showDescription === false ? true : false })}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${config.showDescription !== false ? 'bg-blue-100 text-[#0079C2]' : 'bg-slate-100 text-slate-400'}`}>
              {config.showDescription !== false ? <Eye size={14} /> : <EyeOff size={14} />}
            </div>
            <span className="text-[10px] font-black text-[#006098] uppercase tracking-tight">Exibir Descrições</span>
          </div>
          {config.showDescription !== false ? <ToggleRight size={22} className="text-[#00A7E7]" /> : <ToggleLeft size={22} className="text-slate-300" />}
        </button>

        <div className="space-y-2">
          <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
             <Maximize2 size={10} /> Escala Global
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'SM', label: 'A-' },
              { id: 'MD', label: 'A' },
              { id: 'LG', label: 'A+' }
            ].map(scale => (
              <button
                key={scale.id}
                onClick={() => handleGlobalUpdate({ textScale: scale.id })}
                className={`py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all ${
                  (config.textScale || 'MD') === scale.id 
                    ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/60">
          <button 
            onClick={() => handleGlobalUpdate({ bodyWeight: config.bodyWeight === 'bold' ? 'medium' : 'bold' })}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Bold size={12} className={config.bodyWeight === 'bold' ? 'text-[#0079C2]' : 'text-slate-300'} />
              <span className="text-[9px] font-bold text-slate-500 uppercase">Descrições em Negrito</span>
            </div>
            {config.bodyWeight === 'bold' ? <ToggleRight size={20} className="text-[#00A7E7]" /> : <ToggleLeft size={20} className="text-slate-300" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event, idx) => {
          const isActive = activeSubItemIndex === idx;
          const CurrentIcon = resolveIconComponent(event.icon);
          const isPicking = showPickerFor === idx;

          return (
            <div 
              key={idx}
              onClick={() => onActiveSubItemChange?.(idx)}
              className={`p-3 border rounded-xl transition-all cursor-pointer relative group ${
                isActive ? 'bg-white border-[#0079C2] shadow-md ring-2 ring-blue-500/5' : 'bg-slate-50 border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-[#006098]' : 'text-slate-400'}`}>
                  Marco #{idx + 1}
                </span>
                <button onClick={(e) => { e.stopPropagation(); removeEvent(idx); }} className="text-gray-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                <div className="col-span-1 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Data</label>
                  <input type="text" value={event.year} onChange={(e) => updateEvent(idx, 'year', e.target.value)} className="w-full p-1.5 text-[10px] font-black border rounded bg-white" />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Título</label>
                  <input type="text" value={event.title} onChange={(e) => updateEvent(idx, 'title', e.target.value)} className="w-full p-1.5 text-[10px] font-bold border rounded bg-white" />
                </div>
              </div>

              <div className="space-y-1" onClick={e => e.stopPropagation()}>
                <label className="text-[8px] font-bold text-gray-400 uppercase">Ícone do Marco</label>
                <button 
                  onClick={() => setShowPickerFor(isPicking ? null : idx)}
                  className="w-full p-2 bg-white border rounded-lg flex items-center justify-between hover:border-[#0079C2] transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[#006098]">
                      <CurrentIcon size={14} />
                    </div>
                    <span className="text-[9px] font-medium text-slate-600 uppercase">{event.icon || 'Calendar'}</span>
                  </div>
                  <span className="text-[8px] font-black uppercase text-[#0079C2]">{isPicking ? 'Fechar' : 'Trocar'}</span>
                </button>
                {isPicking && (
                  <div className="mt-2 animate-in fade-in zoom-in-95">
                    <IconPicker selectedIcon={event.icon} onSelect={(icon) => { updateEvent(idx, 'icon', icon); setShowPickerFor(null); }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={addEvent} className="w-full py-3 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
        <Plus size={14} /> Adicionar Marco Temporal
      </button>
    </div>
  );
};