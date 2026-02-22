
import React, { useState } from 'react';
import { Type, Info, AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { IconPicker } from '../ui/IconPicker';
import { resolveIconComponent } from '../../utils/icon-library';

interface SectionEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ config, onUpdate }) => {
  const showTitle = config.showTitle !== false;
  const showSubtitle = config.showSubtitle !== false;
  const align = config.align || 'LEFT';
  const [showIconPicker, setShowIconPicker] = useState(false);

  const CurrentIcon = resolveIconComponent(config.icon);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
        <Info size={20} className="text-[#0079C2] shrink-0" />
        <p className="text-[9px] text-[#006098] font-medium leading-tight">
          Configure a visibilidade dos elementos da seção. Ocultar ambos cria um separador invisível ou uma quebra lógica.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Visibilidade</label>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => onUpdate({ showTitle: !showTitle })}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${showTitle ? 'bg-white border-[#0079C2] text-[#0079C2]' : 'bg-slate-50 border-transparent text-slate-400'}`}
            >
              <span className="text-[9px] font-black uppercase">Título</span>
              {showTitle ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => onUpdate({ showSubtitle: !showSubtitle })}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${showSubtitle ? 'bg-white border-[#0079C2] text-[#0079C2]' : 'bg-slate-50 border-transparent text-slate-400'}`}
            >
              <span className="text-[9px] font-black uppercase">Subtítulo</span>
              {showSubtitle ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Alinhamento</label>
          <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
            <button onClick={() => onUpdate({ align: 'LEFT' })} className={`flex-1 flex items-center justify-center rounded py-1.5 transition-all ${align === 'LEFT' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400'}`}><AlignLeft size={14} /></button>
            <button onClick={() => onUpdate({ align: 'CENTER' })} className={`flex-1 flex items-center justify-center rounded py-1.5 transition-all ${align === 'CENTER' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400'}`}><AlignCenter size={14} /></button>
            <button onClick={() => onUpdate({ align: 'RIGHT' })} className={`flex-1 flex items-center justify-center rounded py-1.5 transition-all ${align === 'RIGHT' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400'}`}><AlignRight size={14} /></button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-between">
          <span>Ícone da Seção</span>
          {config.icon && (
            <button onClick={() => onUpdate({ icon: null })} className="text-[8px] text-rose-500 hover:underline">Remover</button>
          )}
        </label>
        
        <button 
          onClick={() => setShowIconPicker(!showIconPicker)}
          className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${showIconPicker ? 'bg-blue-50 border-[#0079C2]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.icon ? 'bg-[#0079C2] text-white' : 'bg-slate-100 text-slate-300'}`}>
              {config.icon ? <CurrentIcon size={16} /> : <ImageIcon size={16} />}
            </div>
            <span className="text-[10px] font-bold text-slate-600 uppercase">
              {config.icon || "Selecionar Ícone..."}
            </span>
          </div>
          <span className="text-[9px] font-black text-[#0079C2] uppercase">
            {showIconPicker ? 'Fechar' : 'Alterar'}
          </span>
        </button>

        {showIconPicker && (
          <IconPicker 
            selectedIcon={config.icon} 
            onSelect={(icon) => { onUpdate({ icon }); setShowIconPicker(false); }} 
          />
        )}
      </div>

      {showSubtitle && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <Type size={10} className="text-[#0079C2]" /> Conteúdo do Subtítulo
          </label>
          <textarea 
            value={config.subtitle || ''} 
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-[11px] h-20 outline-none focus:ring-2 focus:ring-blue-100 italic"
            placeholder="Ex: Análise detalhada de movimentações e turnover do período..."
          />
        </div>
      )}

      {/* Legacy Option */}
      <div className="flex items-center justify-between px-1 pt-2 border-t border-slate-100 opacity-50 hover:opacity-100 transition-opacity">
        <label className="text-[9px] font-bold text-gray-400 uppercase">Linha Decorativa (Estilo Padrão)</label>
        <button 
          onClick={() => onUpdate({ showLine: config.showLine !== false })}
          className={`w-8 h-4 rounded-full transition-all relative ${config.showLine !== false ? 'bg-slate-400' : 'bg-slate-200'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.showLine !== false ? 'left-4.5' : 'left-0.5'}`} />
        </button>
      </div>
    </div>
  );
};
