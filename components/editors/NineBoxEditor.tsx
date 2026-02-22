
import React from 'react';
import { Users, Info } from 'lucide-react';

interface NineBoxEditorProps {
  data: any[];
  onUpdate: (data: any[]) => void;
}

export const NineBoxEditor: React.FC<NineBoxEditorProps> = ({ data = [], onUpdate }) => {
  const updateBox = (idx: number, field: string, value: any) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    onUpdate(newData);
  };

  // Garante que o componente não quebre se data não for um array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
        <Info size={20} className="text-[#0079C2] shrink-0" />
        <p className="text-[10px] text-[#006098] font-medium leading-tight">
          Insira a quantidade de colaboradores em cada quadrante. O sistema atualizará a grade em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {safeData.map((item, idx) => (
          <div key={idx} className="p-2 bg-slate-50 border rounded-lg flex items-center gap-3 group hover:border-[#0079C2] transition-colors">
            <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500 shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1">
               <input 
                  type="text" 
                  value={item?.label || ''} 
                  onChange={(e) => updateBox(idx, 'label', e.target.value)}
                  className="w-full bg-transparent text-[10px] font-bold text-[#415364] outline-none border-b border-transparent focus:border-[#0079C2]"
                />
            </div>
            <div className="w-16 flex items-center gap-1.5 bg-white border rounded px-1.5 py-1 shadow-sm">
              <Users size={10} className="text-slate-300" />
              <input 
                type="number" 
                value={item?.count || 0} 
                onChange={(e) => updateBox(idx, 'count', parseInt(e.target.value) || 0)}
                className="w-full text-[10px] font-black text-[#006098] outline-none text-right" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
