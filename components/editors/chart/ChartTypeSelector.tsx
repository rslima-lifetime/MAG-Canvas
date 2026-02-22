
import React from 'react';
import { ChartType } from '../../../types';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
}

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Tipo de Gráfico</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value as ChartType)} 
        className="w-full p-1.5 text-[10px] font-bold border rounded bg-white text-[#006098] outline-none shadow-sm"
      >
        <option value="COLUMN">Colunas Verticais</option>
        <option value="BAR">Barras Horizontais</option>
        <option value="LINE">Linha de Tendência</option>
        <option value="AREA">Área Preenchida</option>
        <option value="DOUGHNUT">Rosca (Anatomia MAG)</option>
        <option value="PIE">Pizza Clássica</option>
      </select>
    </div>
  );
};
