
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Palette, MoveVertical } from 'lucide-react';
import { FunnelStage } from '../../types';

interface FunnelEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
  activeSubItemIndex?: number | null;
  onActiveSubItemChange?: (idx: number | null) => void;
}

const PRESET_COLORS = ['#0079C2', '#00A7E7', '#006098', '#10B981', '#F59E0B', '#EF4444', '#7C3AED', '#6366f1', '#ec4899'];

export const FunnelEditor: React.FC<FunnelEditorProps> = ({ config, onUpdate, activeSubItemIndex, onActiveSubItemChange }) => {
  const [showColorPickerFor, setShowColorPickerFor] = useState<number | null>(null);
  
  const stages = config.stages || [];
  const currentHeight = config.sliceHeight || 64;

  const updateStage = (idx: number, updates: Partial<FunnelStage>) => {
    const newStages = [...stages];
    newStages[idx] = { ...newStages[idx], ...updates };
    onUpdate({ stages: newStages });
  };

  const addStage = () => {
    const newStage: FunnelStage = {
      id: Date.now().toString(),
      label: 'Nova Etapa',
      value: 100,
      color: PRESET_COLORS[stages.length % PRESET_COLORS.length]
    };
    onUpdate({ stages: [...stages, newStage] });
    onActiveSubItemChange?.(stages.length);
  };

  const removeStage = (idx: number) => {
    onUpdate({ stages: stages.filter((_: any, i: number) => i !== idx) });
    onActiveSubItemChange?.(null);
  };

  const moveStage = (idx: number, dir: 'UP' | 'DOWN') => {
    if ((dir === 'UP' && idx === 0) || (dir === 'DOWN' && idx === stages.length - 1)) return;
    const newStages = [...stages];
    const swapIdx = dir === 'UP' ? idx - 1 : idx + 1;
    [newStages[idx], newStages[swapIdx]] = [newStages[swapIdx], newStages[idx]];
    onUpdate({ stages: newStages });
    onActiveSubItemChange?.(swapIdx);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Controle de Altura */}
      <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
               <MoveVertical size={10} className="text-[#0079C2]" /> Altura da Etapa
            </label>
            <span className="text-[9px] font-black text-[#0079C2]">{currentHeight}px</span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="120" 
            step="4" 
            value={currentHeight} 
            onChange={(e) => onUpdate({ sliceHeight: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0079C2]" 
          />
      </div>

      <div className="space-y-2">
        {stages.map((stage: FunnelStage, idx: number) => {
          const isActive = activeSubItemIndex === idx;
          const isPickingColor = showColorPickerFor === idx;

          return (
            <div 
              key={stage.id} 
              onClick={() => onActiveSubItemChange?.(idx)}
              className={`p-3 border rounded-xl transition-all cursor-pointer space-y-2 ${
                isActive 
                  ? 'bg-blue-50 border-[#0079C2] shadow-md ring-2 ring-blue-500/5' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); moveStage(idx, 'UP'); }} className="text-slate-300 hover:text-[#0079C2] p-0.5"><GripVertical size={10} /></button>
                  </div>
                  <span className={`text-[9px] font-black uppercase ${isActive ? 'text-[#006098]' : 'text-slate-400'}`}>
                    Etapa {idx + 1}
                  </span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeStage(idx); }} className="text-slate-300 hover:text-rose-500 p-1">
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="col-span-3 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Rótulo</label>
                  <input 
                    type="text" 
                    value={stage.label} 
                    onChange={(e) => updateStage(idx, { label: e.target.value })}
                    className="w-full p-1.5 text-[10px] font-bold border rounded bg-white text-[#006098] outline-none focus:border-[#0079C2]"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Valor</label>
                  <input 
                    type="number" 
                    value={stage.value} 
                    onChange={(e) => updateStage(idx, { value: parseFloat(e.target.value) || 0 })}
                    className="w-full p-1.5 text-[10px] font-black border rounded bg-white text-right outline-none focus:border-[#0079C2]"
                  />
                </div>
              </div>

              {/* Color Picker Inline */}
              <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: stage.color }}></div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Cor da Fatia</span>
                 </div>
                 <button 
                   onClick={() => setShowColorPickerFor(isPickingColor ? null : idx)}
                   className="p-1.5 bg-slate-50 rounded hover:bg-slate-100 text-slate-400"
                 >
                   <Palette size={12} />
                 </button>
              </div>

              {isPickingColor && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 mt-2" onClick={(e) => e.stopPropagation()}>
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => { updateStage(idx, { color: c }); setShowColorPickerFor(null); }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${stage.color === c ? 'border-slate-600 scale-110' : 'border-white'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={addStage}
        className="w-full py-3 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Adicionar Etapa ao Funil
      </button>
    </div>
  );
};
