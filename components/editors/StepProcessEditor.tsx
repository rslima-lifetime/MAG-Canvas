import React, { useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Target, Type, Maximize2, Bold, ToggleRight, ToggleLeft } from 'lucide-react';

interface StepProcessEditorProps {
  steps: any[];
  config: any;
  activeSubItemIndex?: number | null;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdate: (updates: any) => void;
}

export const StepProcessEditor: React.FC<StepProcessEditorProps> = ({ 
  steps = [], 
  // Fix for TypeScript error: casting config to any to allow property access
  config = {} as any, 
  activeSubItemIndex, 
  onActiveSubItemChange, 
  onUpdate 
}) => {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (activeSubItemIndex !== null && activeSubItemIndex !== undefined && stepRefs.current[activeSubItemIndex]) {
      stepRefs.current[activeSubItemIndex]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [activeSubItemIndex]);

  const updateStep = (idx: number, field: string, value: any) => {
    const newSteps = steps.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    onUpdate({ steps: newSteps });
  };

  const handleGlobalUpdate = (updates: any) => {
    onUpdate({ ...updates });
  };

  const removeStep = (idx: number) => {
    onUpdate({ steps: steps.filter((_, i) => i !== idx) });
    if (activeSubItemIndex === idx) onActiveSubItemChange?.(null);
  };

  const addStep = () => {
    onUpdate({ steps: [...steps, { label: 'Nova Etapa', value: '0', subtext: 'Descrição', status: 'NONE' }] });
    onActiveSubItemChange?.(steps.length);
  };

  return (
    <div className="space-y-6">
      {/* CONFIGURAÇÃO GLOBAL DE ESTILO */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Type size={14} className="text-[#0079C2]" />
          <span className="text-[10px] font-black uppercase text-[#006098] tracking-widest">Estilo Visual</span>
        </div>

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
                    ? 'bg-[#0079C2] border-[#0079C2] text-white' 
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

      <div className="flex flex-col gap-2">
        {steps.map((step, idx) => {
          const isActive = activeSubItemIndex === idx;
          return (
            <div 
              key={idx} 
              ref={el => { stepRefs.current[idx] = el; }}
              onClick={() => onActiveSubItemChange?.(idx)}
              className={`p-3 border rounded-xl space-y-2 relative group transition-all duration-300 cursor-pointer ${
                isActive 
                ? 'bg-white border-[#0079C2] shadow-md ring-2 ring-blue-500/5' 
                : 'bg-slate-50 border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black ${isActive ? 'text-[#006098]' : 'text-blue-300'}`}>
                  ETAPA #{idx + 1}
                </span>
                <button onClick={(e) => { e.stopPropagation(); removeStep(idx); }} className="text-gray-300 hover:text-rose-500 p-1">
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="col-span-1 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Valor</label>
                  <input type="text" value={step.value} onChange={(e) => updateStep(idx, 'value', e.target.value)} className="w-full p-1.5 text-[10px] font-black border rounded bg-white text-[#006098] outline-none" />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Título</label>
                  <input type="text" value={step.label} onChange={(e) => updateStep(idx, 'label', e.target.value)} className="w-full p-1.5 text-[10px] border rounded bg-white font-bold outline-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button 
        onClick={addStep}
        className="w-full py-2 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Adicionar Etapa ao Fluxo
      </button>
    </div>
  );
};