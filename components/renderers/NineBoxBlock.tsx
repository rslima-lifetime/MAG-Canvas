
import React from 'react';
import { PageTheme } from '../../types';

interface NineBoxData {
  label: string;
  count: number;
}

interface NineBoxBlockProps {
  data: NineBoxData[];
  isEditable?: boolean;
  theme?: PageTheme;
  onUpdateBox?: (idx: number, updates: Partial<NineBoxData>) => void;
}

export const NineBoxBlock: React.FC<NineBoxBlockProps> = ({ data = [], isEditable, theme = 'LIGHT', onUpdateBox }) => {
  const isBlueTheme = theme === 'BLUE';
  
  // Garante um array de 9 itens para evitar quebra de layout
  const safeData = Array.isArray(data) && data.length === 9 
    ? data 
    : Array.from({ length: 9 }, (_, i) => data[i] || { label: 'Quadrante', count: 0 });
    
  const total = safeData.reduce((acc, curr) => acc + (curr?.count || 0), 0);

  const getBoxColor = (index: number) => {
    const colors = [
      isBlueTheme ? 'bg-slate-700/40 border-slate-600' : 'bg-slate-50 border-slate-200',   // 1
      isBlueTheme ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100', // 2
      isBlueTheme ? 'bg-blue-800/20 border-blue-700' : 'bg-blue-50 border-blue-100',    // 3
      isBlueTheme ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-100 border-amber-200', // 4
      isBlueTheme ? 'bg-blue-700/40 border-blue-600' : 'bg-blue-100 border-blue-200',   // 5
      isBlueTheme ? 'bg-blue-600/50 border-blue-500' : 'bg-blue-200 border-blue-300',   // 6
      isBlueTheme ? 'bg-blue-900/40 border-blue-800' : 'bg-blue-50 border-blue-100',    // 7
      isBlueTheme ? 'bg-emerald-800/30 border-emerald-700' : 'bg-emerald-50 border-emerald-100', // 8
      isBlueTheme ? 'bg-emerald-500 border-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-emerald-500 border-emerald-400', // 9 (STAR)
    ];
    return colors[index] || colors[0];
  };

  const getTextColor = (index: number) => {
    if (index === 8) return 'text-white';
    return isBlueTheme ? 'text-blue-100' : 'text-[#415364]';
  };

  const handleUpdate = (idx: number, field: keyof NineBoxData, val: string) => {
    if (!onUpdateBox) return;
    
    if (field === 'count') {
      const num = parseInt(val.replace(/\D/g, '')) || 0;
      onUpdateBox(idx, { count: num });
    } else {
      onUpdateBox(idx, { label: val });
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-1 overflow-visible mb-2">
      <div className="relative w-full aspect-square flex pt-2 pb-10 pl-10 pr-2">
        
        {/* Eixo Vertical (Potencial) */}
        <div className="absolute left-4 top-2 bottom-10 flex flex-col justify-between py-4 z-20 select-none">
          <span className={`text-[8px] font-black uppercase tracking-widest rotate-[-90deg] origin-center ${isBlueTheme ? 'text-blue-300' : 'text-[#0079C2]'}`}>Alto</span>
          <span className={`text-[8px] font-black uppercase tracking-widest rotate-[-90deg] origin-center ${isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}`}>Médio</span>
          <span className={`text-[8px] font-black uppercase tracking-widest rotate-[-90deg] origin-center ${isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}`}>Baixo</span>
          
          <div className="absolute -left-6 top-0 bottom-0 w-[14px] flex items-center justify-center pointer-events-none">
             <div className={`rotate-[-90deg] whitespace-nowrap px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${
               isBlueTheme ? 'bg-[#00A7E7] text-white' : 'bg-[#006098] text-white'
             }`}>
                Potencial
             </div>
          </div>
        </div>

        {/* Grade Nine Box */}
        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-1 relative">
          {[6, 7, 8, 3, 4, 5, 0, 1, 2].map((dataIdx) => {
            const item = safeData[dataIdx];
            const perc = total > 0 ? ((item.count || 0) / total * 100).toFixed(0) : '0';
            const boxColor = getBoxColor(dataIdx);
            const textColor = getTextColor(dataIdx);

            return (
              <div 
                key={dataIdx} 
                className={`group relative rounded-lg border p-1.5 flex flex-col justify-between transition-all duration-300 ${boxColor} ${isEditable ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={(e) => { if (isEditable) e.stopPropagation(); }}
              >
                <div className="flex justify-between items-start gap-1">
                  <h4 
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdate(dataIdx, 'label', e.currentTarget.textContent || '')}
                    className={`text-[8px] font-black uppercase leading-tight tracking-tighter outline-none ${textColor} opacity-80 break-words min-w-[30px] ${isEditable ? 'focus:bg-white/10 px-0.5 rounded' : ''}`}
                  >
                    {item.label}
                  </h4>
                  <span 
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdate(dataIdx, 'count', e.currentTarget.textContent || '0')}
                    className={`text-[11px] font-black leading-none shrink-0 outline-none ${textColor} ${isEditable ? 'focus:bg-white/10 px-0.5 rounded' : ''}`}
                  >
                    {item.count || 0}
                  </span>
                </div>
                
                <div className="flex items-end justify-between select-none">
                   <div className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${indexToBadge(dataIdx, isBlueTheme)}`}>
                      {perc}%
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Eixo Horizontal (Desempenho) */}
        <div className="absolute bottom-2 left-10 right-2 flex justify-between px-4 select-none">
          <span className={`text-[8px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}`}>Baixo</span>
          <span className={`text-[8px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-200/40' : 'text-slate-400'}`}>Médio</span>
          <span className={`text-[8px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-300' : 'text-[#0079C2]'}`}>Alto</span>
          
          <div className="absolute -bottom-7 left-0 right-0 h-[18px] flex items-center justify-center pointer-events-none">
             <div className={`whitespace-nowrap px-3 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${
               isBlueTheme ? 'bg-[#00A7E7] text-white' : 'bg-[#006098] text-white'
             }`}>
                Desempenho
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const indexToBadge = (idx: number, isBlue: boolean) => {
  if (idx === 8) return isBlue ? 'bg-white/20 text-white' : 'bg-black/10 text-white';
  if (idx === 7 || idx === 5) return isBlue ? 'bg-white/10 text-blue-200' : 'bg-slate-200 text-slate-500';
  return isBlue ? 'bg-white/5 text-blue-300/40' : 'bg-slate-100 text-slate-400';
}
