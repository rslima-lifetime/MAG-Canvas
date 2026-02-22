import React from 'react';
import { Type, Hash, Percent, DollarSign, Calendar, Clock, ChevronDown, Check, AlignLeft, AlignCenter, AlignRight, Target, Binary } from 'lucide-react';
import { ColumnFormatType, ColumnAlignment } from '../../../types';

interface TableFormatMenuProps {
  currentFormat: ColumnFormatType;
  currentPrecision: number;
  currentAlignment: ColumnAlignment;
  currentGoal?: number;
  onFormatChange: (f: ColumnFormatType) => void;
  onPrecisionChange: (p: number) => void;
  onAlignmentChange: (a: ColumnAlignment) => void;
  onGoalChange?: (g: number) => void;
}

const FORMAT_OPTIONS: { type: ColumnFormatType, label: string, icon: any }[] = [
  { type: 'TEXT', label: 'Texto', icon: Type },
  { type: 'NUMBER', label: 'Número', icon: Hash },
  { type: 'PERCENT', label: 'Percentual (%)', icon: Percent },
  { type: 'CURRENCY', label: 'Moeda (R$)', icon: DollarSign },
  { type: 'DATE', label: 'Data', icon: Calendar },
  { type: 'TIME', label: 'Hora', icon: Clock },
];

const PRECISION_OPTIONS = [0, 1, 2, 3];

export const TableFormatMenu: React.FC<TableFormatMenuProps> = ({
  currentFormat,
  currentPrecision,
  currentAlignment,
  currentGoal = 100,
  onFormatChange,
  onPrecisionChange,
  onAlignmentChange,
  onGoalChange
}) => {
  const isNumeric = ['NUMBER', 'PERCENT', 'CURRENCY'].includes(currentFormat);

  return (
    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 rounded-xl py-2 w-56 z-[100] animate-in fade-in slide-in-from-top-2 text-left">
      
      <div className="px-3 py-1.5 mb-1 text-[8px] font-black uppercase text-slate-400 flex items-center justify-between">
        <span>Formato e Alinhamento</span>
        <ChevronDown size={10} />
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {/* Alinhamento */}
        <div className="flex gap-1 p-2 bg-slate-50/50 border-b">
          <button onClick={(e) => { e.stopPropagation(); onAlignmentChange('LEFT'); }} className={`flex-1 h-7 rounded flex items-center justify-center transition-all border ${currentAlignment === 'LEFT' ? 'bg-[#0079C2] border-[#0079C2] text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`} title="Esquerda"><AlignLeft size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onAlignmentChange('CENTER'); }} className={`flex-1 h-7 rounded flex items-center justify-center transition-all border ${currentAlignment === 'CENTER' ? 'bg-[#0079C2] border-[#0079C2] text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`} title="Centro"><AlignCenter size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onAlignmentChange('RIGHT'); }} className={`flex-1 h-7 rounded flex items-center justify-center transition-all border ${currentAlignment === 'RIGHT' ? 'bg-[#0079C2] border-[#0079C2] text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`} title="Direita"><AlignRight size={12} /></button>
        </div>

        {/* Tipos de Dados */}
        <div className="py-1">
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentFormat === opt.type;
            return (
              <button
                key={opt.type}
                onClick={(e) => { e.stopPropagation(); onFormatChange(opt.type); }}
                className={`w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50/50 text-[#0079C2] font-black' : 'text-slate-600 font-medium'}`}
              >
                <Icon size={12} className={isSelected ? 'text-[#0079C2]' : 'text-slate-300'} />
                <span className="text-[10px] uppercase tracking-tight">{opt.label}</span>
                {isSelected && <Check size={10} className="ml-auto text-[#0079C2]" />}
              </button>
            );
          })}
        </div>

        {/* Precisão Decimal (Apenas Numéricos) */}
        {isNumeric && (
          <div className="px-3 py-3 border-t bg-slate-50/30">
            <div className="flex items-center gap-2 mb-2">
              <Binary size={12} className="text-[#0079C2]" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Casas Decimais</span>
            </div>
            <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
              {PRECISION_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={(e) => { e.stopPropagation(); onPrecisionChange(p); }}
                  className={`flex-1 h-7 rounded-md flex flex-col items-center justify-center transition-all ${
                    currentPrecision === p 
                    ? 'bg-[#0079C2] text-white shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-black leading-none">{p}</span>
                  <span className="text-[6px] font-bold uppercase opacity-60">Casas</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meta Específica */}
        {isNumeric && (
          <div className="px-3 py-3 border-t bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Target size={12} className="text-[#0079C2]" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Meta Específica</span>
            </div>
            <input 
              type="number"
              value={currentGoal}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onGoalChange?.(parseFloat(e.target.value) || 0)}
              className="w-full p-1.5 text-[10px] font-black border rounded bg-white text-[#006098] outline-none focus:ring-1 focus:ring-blue-200"
              placeholder="Ex: 100"
            />
          </div>
        )}
      </div>
    </div>
  );
};