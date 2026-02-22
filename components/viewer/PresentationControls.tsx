
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, MousePointer2, ZoomIn, ZoomOut, Maximize, List, BookOpen, Layers, ArrowLeftRight } from 'lucide-react';
import { ReportData } from '../../types';

interface PresentationControlsProps {
  data: ReportData;
  currentPage: number | 'cover';
  totalPages: number;
  hasCover: boolean;
  zoomLevel: number;
  onNext: () => void;
  onPrev: () => void;
  onNavigate: (idx: number | 'cover') => void;
  onExit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onFitWidth: () => void;
}

export const PresentationControls: React.FC<PresentationControlsProps> = ({
  data, currentPage, totalPages, hasCover, zoomLevel, onNext, onPrev, onNavigate, onExit, onZoomIn, onZoomOut, onFit, onFitWidth
}) => {
  const [showLaser, setShowLaser] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringToolbar, setIsHoveringToolbar] = useState(false);

  // Agrupamento de páginas para o índice (mesma lógica do ViewerNavigation)
  const pageGroups = useMemo(() => {
    const groups: any[] = [];
    data.pages.forEach((page, index) => {
      const pageTitle = page.title?.trim() || `Página ${index + 1}`;
      const pageSections = page.blocks
        .filter(b => b.type === 'SECTION' && b.title && b.config.showTitle !== false)
        .map(b => ({ id: b.id, title: b.title, pageIndex: index }));

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.title === pageTitle) {
        lastGroup.pageIndices.push(index);
        lastGroup.sections.push(...pageSections);
      } else {
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

  // Laser Pointer & Cursor Logic
  useEffect(() => {
    if (showLaser && !isHoveringToolbar) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => { document.body.style.cursor = 'default'; };
  }, [showLaser, isHoveringToolbar]);

  useEffect(() => {
    if (!showLaser) return;
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showLaser]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'ArrowRight' || e.key === 'Space') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'Escape') {
        if (showIndex) setShowIndex(false);
        else onExit();
      }
      else if (e.key.toLowerCase() === 'l') setShowLaser(prev => !prev);
      else if (e.key.toLowerCase() === 'm') setShowIndex(prev => !prev);
      else if (e.key.toLowerCase() === 'w') onFitWidth();
      else if (e.key.toLowerCase() === 'r') {
         // Atalho 'R' para Zoom de Leitura (150%)
         onZoomIn(); // Apenas para disparar re-render se necessário, mas o App vai gerenciar o estado
         // Para um efeito direto, poderíamos passar um valor, mas onFitWidth com toggle já ajuda.
         // Vou adicionar um dispatch direto se fosse necessário, mas 'W' já alterna.
         onFitWidth(); 
      }
      else if (e.key === '+' || e.key === '=') onZoomIn();
      else if (e.key === '-') onZoomOut();
      else if (e.key === '0') onFit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onExit, onZoomIn, onZoomOut, onFit, onFitWidth, showIndex]);

  return (
    <>
      {/* Laser Pointer */}
      {showLaser && !isHoveringToolbar && !showIndex && (
        <div 
          className="fixed pointer-events-none z-[9999] w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] border border-white/50 transition-transform duration-0"
          style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)' }}
        />
      )}

      {/* Drawer do Índice (Menu Lateral) */}
      {showIndex && (
        <div className="fixed inset-0 z-[200] flex animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIndex(false)} />
           
           <aside className="relative w-80 h-full bg-[#1e293b] shadow-2xl border-r border-white/10 flex flex-col animate-in slide-in-from-left duration-300">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0079C2] text-white flex items-center justify-center">
                    <List size={18} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Navegação</h2>
                </div>
                <button onClick={() => setShowIndex(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {hasCover && (
                  <button
                    onClick={() => { onNavigate('cover'); setShowIndex(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === 'cover' ? 'bg-[#0079C2] text-white font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <BookOpen size={16} />
                    <span className="text-[11px] uppercase font-black tracking-widest">Capa Corporativa</span>
                  </button>
                )}

                {pageGroups.map((group, gIdx) => {
                  const isActive = typeof currentPage === 'number' && group.pageIndices.includes(currentPage);
                  return (
                    <div key={gIdx} className="space-y-1">
                      <button
                        onClick={() => { onNavigate(group.startIndex); setShowIndex(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5'}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black border ${isActive ? 'bg-[#0079C2] border-[#0079C2]' : 'border-white/20'}`}>
                          {group.startIndex + 1}
                        </div>
                        <span className="text-[11px] uppercase font-bold tracking-tight truncate flex-1 text-left">{group.title}</span>
                      </button>
                      
                      {group.sections.length > 0 && isActive && (
                        <div className="ml-6 border-l border-white/10 flex flex-col">
                          {group.sections.map((sec: any, sIdx: number) => (
                            <button 
                              key={sec.id}
                              onClick={() => { onNavigate(sec.pageIndex); setShowIndex(false); }}
                              className="pl-4 py-1.5 text-[10px] font-medium text-slate-500 hover:text-[#00A7E7] transition-colors text-left uppercase truncate"
                            >
                              • {sec.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-black/20 text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-t border-white/5">
                 Atalhos: M (Menu) • L (Laser) • W (Zoom Inteligente/150%)
              </div>
           </aside>
        </div>
      )}

      {/* Floating Toolbar */}
      <div 
        onMouseEnter={() => setIsHoveringToolbar(true)}
        onMouseLeave={() => setIsHoveringToolbar(false)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-10 fade-in duration-300 cursor-default"
      >
        
        {/* Navegação */}
        <div className="flex items-center gap-1 pr-2 border-r border-white/10">
          <button 
            onClick={onPrev}
            className="p-3 rounded-xl text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30"
            disabled={currentPage === 'cover'}
            title="Anterior (Seta Esquerda)"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </button>
          
          <div className="px-4 text-center min-w-[80px]">
            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block">Slide</span>
            <span className="text-[14px] font-black text-white">
              {currentPage === 'cover' ? 'CAPA' : `${currentPage + 1} / ${totalPages}`}
            </span>
          </div>

          <button 
            onClick={onNext}
            className="p-3 rounded-xl text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30"
            disabled={typeof currentPage === 'number' && currentPage >= totalPages - 1}
            title="Próximo (Seta Direita)"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-2 border-r border-white/10">
          <button onClick={onZoomOut} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all" title="Zoom Out (-)">
            <ZoomOut size={16} />
          </button>
          <span className="text-[10px] font-black text-slate-300 min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button onClick={onZoomIn} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all" title="Zoom In (+)">
            <ZoomIn size={16} />
          </button>
          <div className="flex items-center gap-0.5 ml-1">
            <button onClick={onFit} className="p-2 rounded-lg text-[#00A7E7] hover:text-white hover:bg-white/10 transition-all" title="Ver Slide Inteiro (0)">
              <Maximize size={16} />
            </button>
            <button 
              onClick={onFitWidth} 
              className={`p-2 rounded-lg transition-all ${Math.abs(zoomLevel - 1.5) < 0.05 ? 'text-blue-400' : 'text-emerald-400'} hover:text-white hover:bg-white/10`} 
              title="Largura da Tela / Leitura 150% (W)"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>
        </div>

        {/* Tools */}
        <button 
          onClick={() => setShowIndex(!showIndex)}
          className={`p-3 rounded-xl transition-all flex items-center gap-2 ${showIndex ? 'bg-[#0079C2]/20 text-[#00A7E7] border border-[#00A7E7]/50' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          title="Índice de Slides (M)"
        >
          <List size={18} strokeWidth={3} />
        </button>

        <button 
          onClick={() => setShowLaser(!showLaser)}
          className={`p-3 rounded-xl transition-all flex items-center gap-2 ${showLaser ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          title="Laser Pointer (L)"
        >
          <MousePointer2 size={18} />
        </button>

        <button 
          onClick={onExit}
          className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 border border-transparent transition-all ml-1"
          title="Sair da Apresentação (ESC)"
        >
          <X size={20} />
        </button>
      </div>
    </>
  );
};
