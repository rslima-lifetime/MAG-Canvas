
import React from 'react';
import { Maximize, Palette, Eye, EyeOff, Layout, Copy, CheckCircle2 } from 'lucide-react';
import { Page } from '../../types';

interface SidebarPageSettingsProps {
  page: Page;
  onUpdatePage: (updates: Partial<Page>) => void;
  onApplyToAll?: () => void;
}

export const SidebarPageSettings: React.FC<SidebarPageSettingsProps> = ({ page, onUpdatePage, onApplyToAll }) => {
  const [copied, setCopied] = React.useState(false);

  // Valores padrão consistentes com a inicialização em useReport
  const rowGap = page.rowGap ?? 12;
  const columnGap = page.columnGap ?? 16;
  const paddingX = page.paddingX ?? 12;
  const paddingY = page.paddingY ?? 15;

  // Defaults para visibilidade
  const showTitle = page.showTitle !== false;
  const showSubtitle = page.showSubtitle !== false;
  const showLogo = page.showLogo !== false;
  const showDivider = page.showDivider !== false;
  const showFooter = page.showFooter !== false;

  const handleSliderChange = (field: keyof Page, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      onUpdatePage({ [field]: numValue });
    }
  };

  const handleApplyToAll = () => {
    if (onApplyToAll) {
      if (confirm("Deseja aplicar este Layout (Margens, Tema e Elementos) para TODAS as páginas do relatório?")) {
        onApplyToAll();
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    }
  };

  const Toggle = ({ label, value, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${value ? 'bg-white border-[#0079C2] text-[#006098]' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
    >
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
      {value ? <Eye size={12} className="text-[#0079C2]" /> : <EyeOff size={12} />}
    </button>
  );

  return (
    <div className="p-4 space-y-5 animate-in slide-in-from-top-1 duration-200 bg-white">
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase">Tema Visual</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onUpdatePage({ theme: 'LIGHT' })} 
            className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${page.theme !== 'BLUE' ? 'bg-blue-50 border-[#0079C2] text-[#0079C2]' : 'bg-slate-50 text-slate-400 opacity-60'}`}
          >
            Light
          </button>
          <button 
            onClick={() => onUpdatePage({ theme: 'BLUE' })} 
            className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${page.theme === 'BLUE' ? 'bg-[#006098] border-[#006098] text-white' : 'bg-slate-50 text-slate-400 opacity-60'}`}
          >
            Blue MAG
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center gap-2 mb-1">
          <Layout size={12} className="text-[#00A7E7]" />
          <span className="text-[9px] font-black text-[#006098] uppercase">Elementos da Página</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Toggle label="Título" value={showTitle} onClick={() => onUpdatePage({ showTitle: !showTitle })} />
          <Toggle label="Subtítulo" value={showSubtitle} onClick={() => onUpdatePage({ showSubtitle: !showSubtitle })} />
          <Toggle label="Logo MAG" value={showLogo} onClick={() => onUpdatePage({ showLogo: !showLogo })} />
          <Toggle label="Linha Div." value={showDivider} onClick={() => onUpdatePage({ showDivider: !showDivider })} />
          <Toggle label="Rodapé" value={showFooter} onClick={() => onUpdatePage({ showFooter: !showFooter })} />
        </div>
      </div>
      
      <div className="space-y-4 pt-2 border-t">
        <div className="flex items-center gap-2 mb-1">
          <Maximize size={12} className="text-[#00A7E7]" />
          <span className="text-[9px] font-black text-[#006098] uppercase">Densidade e Margens</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase">
              <span>Espaço V (Y)</span>
              <span className="text-[#0079C2]">{rowGap}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="64" 
              step="4" 
              value={rowGap} 
              onChange={(e) => handleSliderChange('rowGap', e.target.value)} 
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00A7E7]" 
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase">
              <span>Espaço H (X)</span>
              <span className="text-[#0079C2]">{columnGap}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="48" 
              step="4" 
              value={columnGap} 
              onChange={(e) => handleSliderChange('columnGap', e.target.value)} 
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00A7E7]" 
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase">
              <span>Margem X</span>
              <span className="text-[#0079C2]">{paddingX}mm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="30" 
              step="1" 
              value={paddingX} 
              onChange={(e) => handleSliderChange('paddingX', e.target.value)} 
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00A7E7]" 
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase">
              <span>Margem Y</span>
              <span className="text-[#0079C2]">{paddingY}mm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="30" 
              step="1" 
              value={paddingY} 
              onChange={(e) => handleSliderChange('paddingY', e.target.value)} 
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00A7E7]" 
            />
          </div>
        </div>
      </div>
      
      {onApplyToAll && (
        <div className="pt-2 border-t">
          <button 
            onClick={handleApplyToAll}
            disabled={copied}
            className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${
              copied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'border-blue-200 text-[#0079C2] hover:bg-blue-50'
            }`}
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {copied ? 'Aplicado com Sucesso!' : 'Replicar em todas as páginas'}
            </span>
          </button>
        </div>
      )}
      
      {showTitle && (
        <div className="grid grid-cols-1 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título da Página</label>
            <input 
              type="text" 
              value={page.title} 
              onChange={(e) => onUpdatePage({ title: e.target.value })} 
              className="w-full p-2.5 text-xs font-bold border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" 
            />
          </div>
          {showSubtitle && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo</label>
              <input 
                type="text" 
                value={page.subtitle} 
                onChange={(e) => onUpdatePage({ subtitle: e.target.value })} 
                className="w-full p-2.5 text-[11px] border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
