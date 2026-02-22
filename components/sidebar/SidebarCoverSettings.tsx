import React from 'react';
import { Palette, Info, AlignLeft, AlignCenter, AlignRight, Tag } from 'lucide-react';
import { CoverPage } from '../../types';

interface SidebarCoverSettingsProps {
  cover: CoverPage;
  onUpdateCover: (updates: Partial<CoverPage>) => void;
}

export const SidebarCoverSettings: React.FC<SidebarCoverSettingsProps> = ({ cover, onUpdateCover }) => {
  const alignment = cover.alignment || 'LEFT';

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300 bg-white">
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
        <Info size={18} className="text-[#0079C2] shrink-0" />
        <p className="text-[9px] text-[#006098] font-medium leading-tight uppercase tracking-tight">
          As informações abaixo são aplicadas exclusivamente à primeira página do relatório (Capa Corporativa).
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Tema Visual da Capa</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onUpdateCover({ theme: 'LIGHT' })} 
              className={`py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all ${cover.theme === 'LIGHT' ? 'bg-white border-[#0079C2] text-[#0079C2] shadow-md' : 'bg-slate-50 text-slate-400 opacity-60'}`}
            >
              Light Clean
            </button>
            <button 
              onClick={() => onUpdateCover({ theme: 'BLUE' })} 
              className={`py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all ${cover.theme === 'BLUE' ? 'bg-[#006098] border-[#006098] text-white shadow-md' : 'bg-slate-50 text-slate-400 opacity-60'}`}
            >
              Azul Institucional
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Alinhamento do Texto</label>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button 
              onClick={() => onUpdateCover({ alignment: 'LEFT' })} 
              className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${alignment === 'LEFT' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Alinhar à Esquerda"
            >
              <AlignLeft size={16} />
            </button>
            <button 
              onClick={() => onUpdateCover({ alignment: 'CENTER' })} 
              className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${alignment === 'CENTER' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Centralizar"
            >
              <AlignCenter size={16} />
            </button>
            <button 
              onClick={() => onUpdateCover({ alignment: 'RIGHT' })} 
              className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${alignment === 'RIGHT' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Alinhar à Direita"
            >
              <AlignRight size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <Tag size={10} className="text-[#0079C2]" /> Etiqueta Superior
          </label>
          <input 
            type="text" 
            value={cover.topLabel || ''} 
            onChange={(e) => onUpdateCover({ topLabel: e.target.value })} 
            className="w-full p-3 text-[11px] font-bold border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 uppercase" 
            placeholder="Ex: Relatório Corporativo"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Título Principal</label>
          <input 
            type="text" 
            value={cover.title || ''} 
            onChange={(e) => onUpdateCover({ title: e.target.value })} 
            className="w-full p-3 text-[12px] font-black border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 uppercase" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo Contextual</label>
          <textarea 
            value={cover.subtitle || ''} 
            onChange={(e) => onUpdateCover({ subtitle: e.target.value })} 
            className="w-full p-3 text-[11px] border rounded-xl h-24 outline-none leading-relaxed italic" 
          />
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Diretoria Responsável</label>
            <input type="text" value={cover.author || ''} onChange={(e) => onUpdateCover({ author: e.target.value })} className="w-full p-2.5 text-[11px] font-bold border rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Gerência</label>
            <input type="text" value={cover.manager || ''} onChange={(e) => onUpdateCover({ manager: e.target.value })} className="w-full p-2.5 text-[11px] font-bold border rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Área / Núcleo de Origem</label>
            <input type="text" value={cover.department || ''} onChange={(e) => onUpdateCover({ department: e.target.value })} className="w-full p-2.5 text-[11px] font-bold border rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};