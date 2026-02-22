
import React, { useMemo } from 'react';
import { ReportData } from '../../types';
import { BookOpen, ChevronRight, Hash, Bookmark, Play, Layers } from 'lucide-react';

interface ViewerNavigationProps {
  data: ReportData;
  activePageIndex: number | 'cover' | null;
  onEnterPresentation: () => void;
  onNavigate: (index: number | 'cover') => void;
}

interface PageGroup {
  title: string;
  startIndex: number; // Índice da primeira página do grupo
  pageIndices: number[]; // Todos os índices de página neste grupo
  sections: Array<{
    id: string;
    title: string;
    pageIndex: number;
  }>;
}

export const ViewerNavigation: React.FC<ViewerNavigationProps> = ({ data, activePageIndex, onEnterPresentation, onNavigate }) => {
  
  const handleSectionClick = (section: { id: string, pageIndex: number }) => {
    // 1. Atualiza o estado da página ativa (Isso dispara o scroll para o topo da página no App.tsx)
    onNavigate(section.pageIndex);
    
    // 2. Pequeno delay para garantir que o scroll específico do bloco ocorra APÓS o scroll da página iniciar
    // e sobreponha o comportamento padrão, aproveitando que o App.tsx desabilita o Observer por 800ms.
    setTimeout(() => {
      const element = document.getElementById(`block-wrapper-${section.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Agrupa páginas consecutivas com o mesmo título
  const pageGroups = useMemo(() => {
    const groups: PageGroup[] = [];
    
    data.pages.forEach((page, index) => {
      const pageTitle = page.title?.trim() || `Página ${index + 1}`;
      const pageSections = page.blocks
        .filter(b => b.type === 'SECTION' && b.title && b.config.showTitle !== false)
        .map(b => ({ id: b.id, title: b.title, pageIndex: index }));

      const lastGroup = groups[groups.length - 1];

      // Se existir um grupo anterior E o título for idêntico, agrupa
      if (lastGroup && lastGroup.title === pageTitle) {
        lastGroup.pageIndices.push(index);
        lastGroup.sections.push(...pageSections);
      } else {
        // Cria novo grupo
        groups.push({
          title: pageTitle,
          startIndex: index,
          pageIndices: [index],
          sections: pageSections
        });
      }
    });

    return groups;
  }, [data.pages]);

  return (
    <div className="w-full h-full bg-white flex flex-col font-sans">
      {/* Header do Índice */}
      <div className="px-6 py-5 border-b bg-white shrink-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0079C2] text-white flex items-center justify-center shadow-md">
            <BookOpen size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-[#006098] uppercase tracking-wide">Índice do Report</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Navegação Rápida</span>
          </div>
        </div>

        <button 
          onClick={onEnterPresentation}
          className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-lg group"
        >
          <div className="p-1 rounded-full bg-white/20 group-hover:bg-[#00A7E7] transition-colors">
             <Play size={10} fill="currentColor" />
          </div>
          Modo Apresentação
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
        
        {/* Link para Capa */}
        {data.cover?.enabled && (
          <button
            onClick={() => onNavigate('cover')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
              activePageIndex === 'cover' 
                ? 'bg-blue-50 text-[#0079C2] font-bold border border-blue-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activePageIndex === 'cover' ? 'bg-[#0079C2]' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
            <span className="text-[11px] uppercase tracking-wider">Capa Corporativa</span>
          </button>
        )}

        {/* Lista de Grupos de Páginas */}
        {pageGroups.map((group, groupIdx) => {
          // O grupo está ativo se a página atual (activePageIndex) estiver dentro dos índices deste grupo
          const isGroupActive = typeof activePageIndex === 'number' && group.pageIndices.includes(activePageIndex);
          const isMultiPage = group.pageIndices.length > 1;

          return (
            <div key={groupIdx} className="flex flex-col">
              {/* Item do Grupo (Título Principal) */}
              <button
                onClick={() => onNavigate(group.startIndex)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isGroupActive 
                    ? 'bg-blue-50 text-[#0079C2] font-bold border border-blue-100 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                <div className={`flex items-center justify-center min-w-[20px] h-5 rounded border text-[9px] font-black px-1 ${
                  isGroupActive 
                    ? 'bg-[#0079C2] border-[#0079C2] text-white' 
                    : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
                }`}>
                  {group.startIndex + 1}
                </div>
                
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-[11px] uppercase tracking-wide text-left truncate w-full">
                    {group.title}
                  </span>
                  {isMultiPage && (
                    <span className="text-[8px] font-medium opacity-60 flex items-center gap-1">
                      <Layers size={8} />
                      {group.pageIndices.length} páginas (Cont.)
                    </span>
                  )}
                </div>

                {isGroupActive && <ChevronRight size={14} className="text-[#0079C2]" />}
              </button>

              {/* Sub-itens (Seções consolidadas de todas as páginas do grupo) */}
              {group.sections.length > 0 && (
                <div className="flex flex-col ml-[19px] border-l border-slate-100 my-1 space-y-0.5">
                  {group.sections.map((section, secIdx) => (
                    <button
                      key={`${section.id}-${secIdx}`}
                      onClick={() => handleSectionClick(section)}
                      className="flex items-center gap-2 pl-4 py-1.5 text-left group/sec hover:bg-slate-50 rounded-r-lg transition-colors w-full"
                    >
                      <div className="w-1 h-1 rounded-full bg-slate-300 group-hover/sec:bg-[#00A7E7] transition-colors shrink-0" />
                      <span className="text-[10px] font-medium text-slate-400 group-hover/sec:text-[#006098] truncate uppercase tracking-tight w-full">
                        {section.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer do Índice */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <Hash size={12} />
          <span>{data.pages.length} Folhas</span>
          <span className="mx-1">•</span>
          <Bookmark size={12} />
          <span>{pageGroups.length} Capítulos</span>
        </div>
      </div>
    </div>
  );
};
