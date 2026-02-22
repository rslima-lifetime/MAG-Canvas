
import React from 'react';
import { BookOpen, ToggleRight, ToggleLeft, AlertTriangle, Trash2, Plus, FileText, ChevronRight, Copy, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Page } from '../../types';

interface SidebarNavigationProps {
  pages: Page[];
  coverEnabled: boolean;
  activePageIndex: number | 'cover';
  overflowingPages: number[];
  onActivePageChange: (index: number | 'cover') => void;
  onActiveBlockChange: (id: string | null) => void;
  onUpdateCover: (updates: any) => void;
  onUpdatePage: (index: number, updates: Partial<Page>) => void;
  onRemovePage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage?: (index: number) => void;
  onMovePage?: (index: number, direction: 'up' | 'down') => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  pages, coverEnabled, activePageIndex, overflowingPages,
  onActivePageChange, onActiveBlockChange, onUpdateCover, onUpdatePage, onRemovePage, onAddPage, onDuplicatePage, onMovePage
}) => {
  return (
    <div className="p-3 space-y-4 animate-in slide-in-from-top-1 duration-200">
      {/* Seção de Capa */}
      <div className="space-y-1.5">
        <div className="px-2 mb-1 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Início do Documento</span>
        </div>
        <div 
          onClick={() => onActivePageChange('cover')}
          className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
            activePageIndex === 'cover' 
              ? 'bg-[#0079C2] border-[#0079C2] shadow-lg shadow-blue-200 text-white' 
              : 'bg-white border-slate-200 text-slate-500 hover:border-[#0079C2]/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${activePageIndex === 'cover' ? 'bg-white/20' : 'bg-slate-100'}`}>
              <BookOpen size={14} className={activePageIndex === 'cover' ? 'text-white' : 'text-[#006098]'} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-tight">Capa Corporativa</span>
              <span className={`text-[8px] font-bold uppercase opacity-60 ${activePageIndex === 'cover' ? 'text-white' : 'text-slate-400'}`}>Identidade Visual</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onUpdateCover({ enabled: !coverEnabled }); }} 
            className={`p-1 transition-colors ${activePageIndex === 'cover' ? 'text-white/80 hover:text-white' : (coverEnabled ? 'text-emerald-500' : 'text-slate-300')}`}
          >
            {coverEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Seção de Páginas */}
      <div className="space-y-1.5">
        <div className="px-2 mb-1 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Conteúdo do Report</span>
          <span className="text-[8px] font-bold text-slate-300">{pages.length} Páginas</span>
        </div>
        
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
          {pages.map((page, idx) => {
            const isActive = activePageIndex === idx;
            const hasOverflow = overflowingPages.includes(idx);
            
            return (
              <div 
                key={page.id}
                onClick={() => { onActivePageChange(idx); onActiveBlockChange(null); }}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                  isActive 
                    ? 'bg-white border-[#0079C2] shadow-md ring-2 ring-blue-500/5' 
                    : hasOverflow ? 'bg-rose-50 border-rose-200' : 'bg-white/50 border-slate-100 hover:border-slate-300'
                } ${page.hidden ? 'opacity-60 grayscale' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                    isActive ? 'bg-[#0079C2] text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className={`text-[11px] font-bold truncate max-w-[120px] ${isActive ? 'text-[#006098]' : 'text-slate-600'} ${page.hidden ? 'line-through decoration-slate-400' : ''}`}>
                      {page.title || "Página sem título"}
                    </span>
                    <span className="text-[8px] font-medium opacity-50 truncate uppercase tracking-tighter">
                      {page.blocks.length} Componentes {page.hidden && '(Oculta)'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onUpdatePage(idx, { hidden: !page.hidden }); }}
                    className={`p-1.5 rounded-lg transition-colors ${page.hidden ? 'text-slate-400 hover:text-slate-600 bg-slate-100' : 'text-slate-300 hover:text-[#0079C2] hover:bg-blue-50'}`}
                    title={page.hidden ? "Exibir Página" : "Ocultar Página"}
                  >
                    {page.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  {onMovePage && (
                    <div className="flex flex-col mr-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onMovePage(idx, 'up'); }}
                        disabled={idx === 0}
                        className={`p-0.5 rounded transition-colors ${idx === 0 ? 'text-slate-100' : 'text-slate-300 hover:text-[#0079C2] hover:bg-blue-50'}`}
                        title="Mover para cima"
                      >
                        <ArrowUp size={10} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onMovePage(idx, 'down'); }}
                        disabled={idx === pages.length - 1}
                        className={`p-0.5 rounded transition-colors ${idx === pages.length - 1 ? 'text-slate-100' : 'text-slate-300 hover:text-[#0079C2] hover:bg-blue-50'}`}
                        title="Mover para baixo"
                      >
                        <ArrowDown size={10} strokeWidth={3} />
                      </button>
                    </div>
                  )}

                  {hasOverflow && <AlertTriangle size={12} className="text-rose-500" />}
                  
                  {onDuplicatePage && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicatePage(idx); }}
                      className="text-slate-300 hover:text-[#0079C2] p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicar Página"
                    >
                      <Copy size={12} />
                    </button>
                  )}

                  {pages.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemovePage(idx); }} 
                      className="text-slate-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remover Página"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <ChevronRight size={14} className={isActive ? 'text-[#0079C2]' : 'text-slate-300'} />
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={onAddPage} 
          className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 text-[9px] font-black uppercase rounded-xl hover:bg-white hover:border-[#0079C2] hover:text-[#0079C2] transition-all flex items-center justify-center gap-2 mt-2 group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform" /> 
          Nova Página de Dados
        </button>
      </div>
    </div>
  );
};
