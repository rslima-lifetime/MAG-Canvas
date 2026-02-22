
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Page, Block, BlockType, ChartType, DocumentFormat, DesignSystem, BlockWidth } from '../../types';
import { BlockRenderer } from '../BlockRenderer';
import { BlockToolbar } from '../BlockToolbar';
import { Plus, BarChart3, TrendingUp, AreaChart, PieChart, Donut, ChevronLeft, Hash, Type, Table as TableIcon, GitCommitHorizontal, History, Grid3X3, Target, LayoutList, Calendar, BookOpen, ClipboardPaste, Timer, Trophy, Image as ImageIcon, Flag, Filter, FilePlus, AlertTriangle, ShieldAlert, Kanban, ArrowLeftRight, EyeOff } from 'lucide-react';

const LOGO_WHITE = "https://magportaisinststgprd.blob.core.windows.net/magseguros/2023/08/Marca-MAG-Branca.svg";
const LOGO_COLOR = "https://identidade.mongeralaegon.com.br/images/mongeral.png";

interface ReportPageProps {
  id?: string;
  page: Page;
  pageIdx: number;
  isActive: boolean;
  isOverflowing: boolean;
  isFullScreen: boolean;
  selectedBlockIds: string[];
  activeSubItemIndex: number | null;
  showInsertAt: { pageIdx: number, blockIdx: number, forceWidth?: 'FULL' | 'HALF' | 'QUARTER' | 'THIRD', trigger?: 'TOP' | 'BOTTOM' | 'RIGHT', anchorBlockIdx?: number } | null;
  insertSubMenu: 'MAIN' | 'CHART';
  hasClipboard?: boolean;
  startsInSection?: boolean;
  innerRef?: React.Ref<HTMLDivElement>;
  onClick: () => void;
  onActiveBlockChange: (id: string | null, isMultiSelect: boolean, isShift: boolean) => void;
  onActiveSubItemChange: (idx: number | null) => void;
  onShowInsertAt: (insert: any) => void;
  onSetInsertSubMenu: (menu: 'MAIN' | 'CHART') => void;
  onAddBlock: (type: BlockType, idx: number, width?: 'FULL' | 'HALF' | 'THIRD' | 'QUARTER', chartType?: ChartType) => void;
  onUpdatePage?: (updates: Partial<Page>) => void;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (idx: number, dir: 'up' | 'down') => void;
  onDuplicateBlock: (idx: number) => void;
  onCopyBlock: (block: Block) => void;
  onDuplicatePage?: (idx: number) => void;
  onPasteBlock: (idx: number) => void;
  onBulkSelect?: (ids: string[]) => void;
  totalPages: number;
  layoutFormat?: DocumentFormat;
  designSystem?: DesignSystem;
  showSafeMargins?: boolean;
  reportTitle?: string;
  isReadOnly?: boolean;
  zoomLevel: number;
}

const getBlockSpanNumber = (width: BlockWidth): number => {
  switch (width) {
    case 'FULL': return 12;
    case 'THREE_QUARTERS': return 9;
    case 'TWO_THIRDS': return 8; 
    case 'HALF': return 6;
    case 'THIRD': return 4;
    case 'QUARTER': return 3;
    default: return 12;
  }
};

export const ReportPage: React.FC<ReportPageProps> = ({
  id, page, pageIdx, isActive, isOverflowing, isFullScreen, selectedBlockIds = [], activeSubItemIndex,
  showInsertAt, insertSubMenu, hasClipboard, startsInSection = false, innerRef, onClick, onActiveBlockChange, onActiveSubItemChange,
  onShowInsertAt, onSetInsertSubMenu, onAddBlock, onUpdatePage, onUpdateBlock, onRemoveBlock, onMoveBlock, onDuplicateBlock,
  onCopyBlock, onPasteBlock, onBulkSelect, totalPages, layoutFormat = 'REPORT', designSystem = 'STANDARD', showSafeMargins = false,
  reportTitle, isReadOnly, zoomLevel
}) => {
  const isBlueTheme = page.theme === 'BLUE';
  const isPresentation = layoutFormat === 'PRESENTATION';
  const isFuture = designSystem === 'FUTURE';
  const isHidden = page.hidden;
  
  const rowGap = page.rowGap ?? (isPresentation ? 8 : 12);
  const colGap = page.columnGap ?? (isPresentation ? 12 : 16);
  const paddingX = page.paddingX ?? (isPresentation ? 8 : 12);
  const paddingY = page.paddingY ?? (isPresentation ? 6 : 15);

  const showTitle = page.showTitle !== false;
  const showSubtitle = page.showSubtitle !== false;
  const showLogo = page.showLogo !== false;
  const showDivider = page.showDivider !== false;
  const showFooter = page.showFooter !== false;

  const blockWrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  // Seleção Marquee
  const dragStartClient = useRef<{ x: number, y: number } | null>(null);
  const wasDragging = useRef(false);
  const [marqueeVisualRect, setMarqueeVisualRect] = useState<{ left: number, top: number, width: number, height: number } | null>(null);

  useEffect(() => {
    const lastId = selectedBlockIds[selectedBlockIds.length - 1];
    if (lastId && blockWrapperRefs.current[lastId]) {
      const activeEl = document.activeElement;
      const isEditing = activeEl?.getAttribute('contenteditable') === 'true' || activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      if (!isEditing) {
        blockWrapperRefs.current[lastId]?.focus({ preventScroll: true });
      }
    }
  }, [selectedBlockIds]);

  useEffect(() => {
    if (isReadOnly) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!dragStartClient.current || !pageContainerRef.current) return;
      const pageRect = pageContainerRef.current.getBoundingClientRect();
      const localStartX = (dragStartClient.current.x - pageRect.left) / zoomLevel;
      const localStartY = (dragStartClient.current.y - pageRect.top) / zoomLevel;
      const localEndX = (e.clientX - pageRect.left) / zoomLevel;
      const localEndY = (e.clientY - pageRect.top) / zoomLevel;
      setMarqueeVisualRect({
        left: Math.min(localStartX, localEndX),
        top: Math.min(localStartY, localEndY),
        width: Math.abs(localStartX - localEndX),
        height: Math.abs(localStartY - localEndY)
      });
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (!dragStartClient.current) return;
      const startX = dragStartClient.current.x;
      const startY = dragStartClient.current.y;
      const endX = e.clientX;
      const endY = e.clientY;
      const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      if (distance > 10) {
        wasDragging.current = true;
        const selBox = { left: Math.min(startX, endX), top: Math.min(startY, endY), right: Math.max(startX, endX), bottom: Math.max(startY, endY) };
        const intersectingIds: string[] = [];
        page.blocks.forEach(block => {
          const el = blockWrapperRefs.current[block.id];
          if (el) {
            const bRect = el.getBoundingClientRect();
            const intersects = !(bRect.right < selBox.left || bRect.left > selBox.right || bRect.bottom < selBox.top || bRect.top > selBox.bottom);
            if (intersects) intersectingIds.push(block.id);
          }
        });
        if (onBulkSelect && intersectingIds.length > 0) onBulkSelect(intersectingIds);
      }
      dragStartClient.current = null;
      setMarqueeVisualRect(null);
      document.body.style.userSelect = ''; 
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp, { capture: true });
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp, { capture: true });
    };
  }, [isReadOnly, zoomLevel, page.blocks, onBulkSelect]);

  const handleUpdatePage = (field: keyof Page, value: string) => {
    if (onUpdatePage) onUpdatePage({ [field]: value });
  };

  const handlePasteOnBlock = (e: React.ClipboardEvent, block: Block) => {
    if (isReadOnly) return;
    const target = e.target as HTMLElement;
    const isEditingField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isEditingField) return;

    if (block.type === 'TABLE' || block.type === 'CHART') {
      const pasteData = e.clipboardData.getData('text');
      if (pasteData && (pasteData.includes('\t') || pasteData.includes('\n'))) {
        e.preventDefault();
        onUpdateBlock(block.id, { config: { ...block.config, data: pasteData } });
      }
    }
  };

  const getComplementaryWidth = (currentWidth: BlockWidth): BlockWidth => {
    switch (currentWidth) {
      case 'QUARTER': return 'THREE_QUARTERS';
      case 'THIRD': return 'TWO_THIRDS';
      case 'HALF': return 'HALF';
      case 'TWO_THIRDS': return 'THIRD';
      case 'THREE_QUARTERS': return 'QUARTER';
      default: return 'FULL';
    }
  };

  const insertionMap = useMemo(() => {
    const map: Record<number, number> = {};
    let rowStart = 0;
    let widthSum = 0;
    for (let i = 0; i < page.blocks.length; i++) {
        const block = page.blocks[i];
        let w = getBlockSpanNumber(block.width);
        if (widthSum + w > 12) {
            for (let k = rowStart; k < i; k++) map[k] = i;
            rowStart = i;
            widthSum = 0;
        }
        widthSum += w;
    }
    for (let k = rowStart; k < page.blocks.length; k++) map[k] = page.blocks.length;
    return map;
  }, [page.blocks]);

  const handlePageMouseDown = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    const target = e.target as HTMLElement;
    const isBlock = target.closest('.block-item');
    const isButton = target.closest('button');
    const isInput = target.closest('input') || target.closest('textarea') || target.contentEditable === 'true';
    if (!isBlock && !isButton && !isInput) {
      dragStartClient.current = { x: e.clientX, y: e.clientY };
      wasDragging.current = false;
      document.body.style.userSelect = 'none';
    }
  };

  const handlePageClick = (e: React.MouseEvent) => {
    if (wasDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDragging.current = false;
      return;
    }
    onClick();
  };

  const renderInsertMenu = (blockIdx: number, forceWidth?: 'FULL' | 'HALF' | 'QUARTER' | 'THIRD') => {
    const charts: { type: ChartType, icon: any, label: string }[] = [
      { type: 'COLUMN', icon: BarChart3, label: 'Colunas' },
      { type: 'BAR', icon: BarChart3, label: 'Barras' },
      { type: 'LINE', icon: TrendingUp, label: 'Linhas' },
      { type: 'AREA', icon: AreaChart, label: 'Áreas' },
      { type: 'PIE', icon: PieChart, label: 'Pizza' },
      { type: 'DOUGHNUT', icon: Donut, label: 'Rosca' },
    ];

    const tools = [
      { type: 'SECTION', icon: BookOpen, label: 'Seção' },
      { type: 'TEXT_BOX', icon: Type, label: 'Texto' },
      { type: 'BIG_NUMBERS', icon: Hash, label: 'Big Numbers' },
      { type: 'KPI', icon: Target, label: 'Solo KPI' },
      { type: 'RANKING_LIST', icon: Trophy, label: 'Ranking' },
      { type: 'INFOGRAPHIC_LIST', icon: LayoutList, label: 'Destaques' },
      { type: 'CHART', icon: BarChart3, label: 'Gráfico' },
      { type: 'TABLE', icon: TableIcon, label: 'Tabela' },
      { type: 'PROJECT_CALENDAR', icon: Calendar, label: 'Calendário' },
      { type: 'PROJECT_STATUS', icon: Flag, label: 'Progresso' },
      { type: 'RISK_MATRIX', icon: ShieldAlert, label: 'Riscos' },
      { type: 'KANBAN', icon: Kanban, label: 'Kanban' },
      { type: 'COMPARISON', icon: ArrowLeftRight, label: 'Comparativo' },
      { type: 'STEP_PROCESS', icon: GitCommitHorizontal, label: 'Fluxo' },
      { type: 'FUNNEL', icon: Filter, label: 'Funil' },
      { type: 'TIMELINE', icon: History, label: 'Timeline' },
      { type: 'NINE_BOX', icon: Grid3X3, label: 'NineBox' },
      { type: 'GAUGE', icon: Timer, label: 'Velocímetro' },
      { type: 'IMAGE', icon: ImageIcon, label: 'Imagem' },
    ];

    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] border rounded-2xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200 z-[2000] ${insertSubMenu === 'CHART' ? 'min-w-[280px]' : 'min-w-[240px]'}`}
      >
        <div className="bg-slate-50 p-2 rounded-t-xl -m-2 mb-2 border-b border-slate-100 flex items-center justify-between">
           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
             <FilePlus size={10} /> {hasClipboard ? 'Área de Transferência' : 'Componente em Branco'}
           </span>
        </div>
        {insertSubMenu === 'CHART' ? (
          <>
            <div className="flex items-center gap-2 px-2 py-1 border-b border-slate-100">
               <button onClick={(e) => { e.stopPropagation(); onSetInsertSubMenu('MAIN'); }} className="p-1 text-slate-400 hover:text-[#0079C2] hover:bg-blue-50 rounded-lg transition-all"><ChevronLeft size={16} /></button>
               <span className="text-10px font-black uppercase text-[#006098] tracking-widest">Tipo de Gráfico</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {charts.map(opt => (
                <button key={opt.type} onClick={(e) => { e.stopPropagation(); onAddBlock('CHART', blockIdx, forceWidth, opt.type); }} className="flex flex-col items-center justify-center w-20 h-20 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-[#0079C2] transition-all group/btn border border-transparent hover:border-blue-100">
                  <opt.icon size={20} className={opt.type === 'BAR' ? 'rotate-90' : ''} />
                  <span className="text-[8px] font-black uppercase mt-1 tracking-tighter text-center">{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {hasClipboard && (
              <button onClick={(e) => { e.stopPropagation(); onPasteBlock(blockIdx); }} className="flex items-center gap-3 w-full p-2 bg-blue-50 text-[#0079C2] rounded-xl border border-blue-100 hover:bg-[#0079C2] hover:text-white transition-all group/paste animate-pulse hover:animate-none">
                <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center"><ClipboardPaste size={16} /></div>
                <div className="flex flex-col items-start"><span className="text-[9px] font-black uppercase tracking-widest">Colar em Lote</span><span className="text-[7px] font-bold uppercase opacity-60">Inserir itens copiados</span></div>
              </button>
            )}
            <div className="grid grid-cols-4 gap-1 p-1">
              {tools.map(btn => (
                <button key={btn.type} onClick={(e) => { e.stopPropagation(); if (btn.type === 'CHART') onSetInsertSubMenu('CHART'); else onAddBlock(btn.type as BlockType, blockIdx, forceWidth); }} className="flex flex-col items-center justify-center w-14 h-16 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-[#0079C2] transition-all group/btn border border-transparent hover:border-blue-100">
                  <div className="h-6 flex items-center justify-center mb-1"><btn.icon size={18} className="group-hover/btn:scale-110 transition-transform" /></div>
                  <span className="text-[7px] font-black uppercase tracking-tighter text-center leading-none px-1 text-slate-500 group-hover/btn:text-[#006098]">{btn.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const getColSpan = (w: Block['width']) => {
    if (w === 'FULL') return 'col-span-12';
    if (w === 'THREE_QUARTERS') return 'col-span-9';
    if (w === 'TWO_THIRDS') return 'col-span-8';
    if (w === 'HALF') return 'col-span-6';
    if (w === 'THIRD') return 'col-span-4';
    return 'col-span-3';
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isInput) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemoveBlock(blockId);
      onActiveBlockChange(null, false, false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onActiveBlockChange(null, false, false);
      onActiveSubItemChange(null);
    }
  };

  const isMenuOpen = (anchorIndex: number, position: 'BOTTOM' | 'RIGHT' | 'TOP') => {
    return showInsertAt?.pageIdx === pageIdx && showInsertAt?.anchorBlockIdx === anchorIndex && showInsertAt?.trigger === position;
  }

  const renderTopInsertPoint = () => {
    if (isReadOnly) return null;
    const isOpen = isMenuOpen(0, 'TOP');
    return (
      <div className={`col-span-12 no-print flex items-center justify-center group relative transition-all ${isOpen ? 'z-[1200] h-8 mb-4' : 'z-40 h-2 opacity-0 hover:opacity-100 hover:h-6 mb-0 hover:mb-2'}`}>
        <div className="absolute inset-0 flex items-center px-4"><div className="w-full h-[2px] bg-[#00A7E7] opacity-40 shadow-[0_0_8px_#00A7E7]" /></div>
        <button onClick={(e) => { e.stopPropagation(); onShowInsertAt({ pageIdx, blockIdx: 0, trigger: 'TOP', anchorBlockIdx: 0 }); onSetInsertSubMenu('MAIN'); }} className="relative z-10 w-6 h-6 rounded-full shadow-lg bg-[#0079C2] text-white flex items-center justify-center hover:scale-125 transition-all"><Plus size={12} strokeWidth={3} /></button>
        {isOpen && renderInsertMenu(0)}
      </div>
    );
  };

  let inSection = startsInSection;
  const showHeader = showTitle || showSubtitle || showLogo || showDivider;
  let gridColumnCursor = 0;

  return (
    <div 
      ref={(el) => {
        pageContainerRef.current = el;
        if (typeof innerRef === 'function') innerRef(el);
        else if (innerRef) (innerRef as any).current = el;
      }}
      id={id}
      onMouseDown={handlePageMouseDown}
      className={`a4-page shadow-2xl flex flex-col mb-8 transition-all duration-500 relative select-none print:mb-0 print:m-0 print:shadow-none print:border-none marquee-area ${
        isActive && !isReadOnly ? 'ring-8 ring-blue-500/10 print:ring-0 overflow-visible' : 'overflow-hidden'
      } ${isBlueTheme ? 'bg-[#006098] border-white/20 text-white' : 'bg-white border-gray-200 text-[#415364]'} ${
        isOverflowing ? 'border-t-8 border-rose-500 ring-4 ring-rose-500/10' : 'border-t-8 border-transparent'
      } ${
        isPresentation ? 'w-[297mm] h-[167mm]' : 'w-[210mm] h-[297mm]'
      } ${isHidden ? 'print:hidden opacity-80 grayscale-[0.8]' : ''}`}
      style={{
        padding: `${paddingY}mm ${paddingX}mm`,
        backgroundImage: isBlueTheme ? 'radial-gradient(circle at 70% 20%, #0079C2 0%, #006098 100%)' : 'none'
      }}
      onClick={handlePageClick}
    >
      {isHidden && isActive && !isReadOnly && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/90 text-white flex items-center justify-center gap-2 z-[2000] no-print">
           <EyeOff size={14} className="text-rose-400" />
           <span className="text-[10px] font-black uppercase tracking-widest">Página Oculta (Não será impressa)</span>
        </div>
      )}

      {marqueeVisualRect && <div className="absolute z-[1000] bg-[#0079C2]/25 border-[2px] border-[#0079C2] pointer-events-none shadow-[0_0_20px_rgba(0,121,194,0.5)] rounded-sm" style={{ left: `${marqueeVisualRect.left}px`, top: `${marqueeVisualRect.top}px`, width: `${marqueeVisualRect.width}px`, height: `${marqueeVisualRect.height}px` }} />}
      {showSafeMargins && <div className="absolute inset-0 pointer-events-none z-[100] no-print"><div className="absolute inset-[5mm] border-2 border-dashed border-[#00A7E7]/30 rounded-sm"><div className="absolute -top-6 left-0 bg-[#00A7E7] text-white text-[8px] font-black px-2 py-0.5 rounded-t uppercase tracking-widest">Limite de Impressão (A4)</div></div></div>}
      {showHeader && (
        <header className={`flex flex-col shrink-0 relative z-10 ${isPresentation ? 'mb-2' : 'mb-6'} ${isFuture ? '-mx-8' : (showDivider ? 'border-b-2 border-[#0079C2] pb-1' : 'pb-1')}`}>
          <div className={`relative z-10 flex items-center justify-between ${isFuture ? 'bg-[#006098] rounded-r-full pl-12 border-l-[12px] border-[#00A7E7] shadow-xl pr-10 min-h-[75px]' : (isPresentation ? 'min-h-[45px]' : 'min-h-[60px]')}`}>
            <div className="flex flex-col justify-center flex-1 pr-6 overflow-hidden">
              {isActive && !isReadOnly ? (
                <>
                  {showTitle && <input type="text" value={page.title} onChange={(e) => handleUpdatePage('title', e.target.value)} placeholder="Título da Página" className={`font-black uppercase leading-[1.1] bg-transparent border-none outline-none w-full p-0 focus:ring-0 tracking-tight ${isFuture ? 'text-[20px] text-white' : (isPresentation ? 'text-xl ' : 'text-2xl ') + (isBlueTheme ? 'text-white' : 'text-[#006098]')}`} />}
                  {showSubtitle && <div className="flex items-center gap-3 mt-0.5"><input type="text" value={page.subtitle} onChange={(e) => handleUpdatePage('subtitle', e.target.value)} placeholder="Subtítulo do Conteúdo" className={`font-bold opacity-90 bg-transparent border-none outline-none w-full p-0 focus:ring-0 ${isFuture ? 'text-[9px] tracking-[0.2em] text-white uppercase' : 'text-[11px] ' + (isBlueTheme ? 'text-blue-100' : 'text-[#415364]')}`} /></div>}
                </>
              ) : (
                <>
                  {showTitle && <h1 className={`font-black uppercase leading-[1.1] tracking-tight ${isFuture ? 'text-[20px] text-white' : (isPresentation ? 'text-xl ' : 'text-2xl ') + (isBlueTheme ? 'text-white' : 'text-[#006098]')}`}>{page.title || 'Título da Página'}</h1>}
                  {showSubtitle && <div className="flex items-center gap-3 mt-0.5"><p className={`font-bold opacity-90 ${isFuture ? 'text-[9px] tracking-[0.2em] uppercase text-white' : 'text-[11px] ' + (isBlueTheme ? 'text-blue-100' : 'text-[#415364]')}`}>{page.subtitle || 'Subtítulo da Página'}</p></div>}
                </>
              )}
            </div>
            {showLogo && (
              <>
                {!isFuture && <div className="flex flex-col items-end shrink-0 ml-4"><img src={isBlueTheme ? LOGO_WHITE : LOGO_COLOR} alt="MAG Seguros" className={`${isPresentation ? 'h-7' : 'h-10'} w-auto object-contain`} /></div>}
                {isFuture && <div className="flex flex-col items-end gap-0.5 shrink-0 ml-4"><img src={LOGO_WHITE} alt="MAG" className="h-8 w-auto drop-shadow-sm" /><span className="text-[6px] font-black uppercase tracking-[0.35em] opacity-60 text-white -mt-1">Seguros</span></div>}
              </>
            )}
          </div>
        </header>
      )}

      <div className="flex-1 grid grid-cols-12 auto-rows-min content-start relative z-10" style={{ rowGap: `${rowGap}px`, columnGap: `${colGap}px` }}>
        {page.blocks.length > 0 && renderTopInsertPoint()}
        {page.blocks.length === 0 && (
          <div className="col-span-12 no-print h-32 flex flex-col items-center justify-center group relative -mt-4 opacity-60 hover:opacity-100 transition-all border-2 border-dashed border-slate-100 rounded-3xl">
            {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onShowInsertAt({ pageIdx, blockIdx: 0, trigger: 'BOTTOM', anchorBlockIdx: 0 }); onSetInsertSubMenu('MAIN'); }} className={`relative z-[1100] w-12 h-12 rounded-full shadow-lg bg-white text-[#0079C2] border border-blue-100 flex items-center justify-center p-0 leading-none hover:scale-125 active:scale-90 transition-all ${isMenuOpen(0, 'BOTTOM') ? 'bg-rose-50 text-white rotate-45 border-rose-400 scale-110 opacity-100' : ''}`}><Plus size={24} strokeWidth={3} /></button>}
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">{isReadOnly ? 'Página Vazia' : 'Adicionar Conteúdo'}</span>
            {!isReadOnly && isMenuOpen(0, 'BOTTOM') && renderInsertMenu(0)}
          </div>
        )}

        {page.blocks.map((block, idx) => {
          const isSectionBlock = block.type === 'SECTION';
          if (isSectionBlock) inSection = true;
          const isHighlighted = selectedBlockIds.map(String).includes(String(block.id)) && !isReadOnly;
          const isLastSelected = selectedBlockIds.length > 0 && String(selectedBlockIds[selectedBlockIds.length - 1]) === String(block.id);
          const smartInsertionIdx = insertionMap[idx] ?? (idx + 1);
          const span = getBlockSpanNumber(block.width);
          if (gridColumnCursor + span > 12) gridColumnCursor = 0;
          const isLeftAligned = gridColumnCursor === 0;
          gridColumnCursor += span;
          if (gridColumnCursor >= 12) gridColumnCursor = 0;
          const isMenuForThisBlockOpen = showInsertAt?.pageIdx === pageIdx && showInsertAt?.anchorBlockIdx === idx;

          return (
            <React.Fragment key={block.id}>
              <div 
                id={`block-wrapper-${block.id}`}
                ref={el => { blockWrapperRefs.current[block.id] = el; }}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
                onMouseDown={(e) => e.stopPropagation()} 
                onPaste={(e) => handlePasteOnBlock(e, block)}
                onClick={(e) => { 
                  e.stopPropagation();
                  onActiveBlockChange(block.id, e.ctrlKey || e.metaKey, e.shiftKey); 
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) activeSubItemIndex !== null && onActiveSubItemChange(null); 
                  onShowInsertAt(null); 
                }}
                className={`relative flex flex-col transition-all duration-300 rounded-lg group/block h-full cursor-pointer overflow-visible outline-none block-item ${
                    isHighlighted 
                      ? (isBlueTheme ? 'ring-[3px] ring-white shadow-2xl z-[900] bg-white/5' : 'ring-[3px] ring-[#0079C2] bg-[#0079C2]/5 z-[900] shadow-xl') 
                      : (isMenuForThisBlockOpen ? 'z-[950]' : (isBlueTheme ? 'hover:bg-white/5 z-10' : 'hover:bg-slate-50/10 z-10'))
                } ${getColSpan(block.width)} ${inSection && !isSectionBlock && isLeftAligned ? (isFuture ? 'pl-8' : 'pl-5') : ''}`}
              >
                {isActive && !isFullScreen && !isReadOnly && selectedBlockIds.length <= 1 && (
                  <>
                    <div className={`absolute -bottom-3 left-0 right-0 h-6 flex items-center justify-center transition-opacity group/insert-bottom no-print ${isMenuOpen(idx, 'BOTTOM') ? 'z-[1000] opacity-100' : 'z-50 opacity-0 hover:opacity-100'}`}>
                       <div className={`absolute left-4 right-4 h-[2px] bg-[#00A7E7] opacity-0 group-hover/insert-bottom:opacity-100 transition-all shadow-[0_0_8px_#00A7E7] ${isMenuOpen(idx, 'BOTTOM') ? 'opacity-100' : ''}`} />
                       <button onClick={(e) => { e.stopPropagation(); onShowInsertAt({ pageIdx, blockIdx: smartInsertionIdx, trigger: 'BOTTOM', anchorBlockIdx: idx }); onSetInsertSubMenu('MAIN'); }} className={`relative z-10 w-5 h-5 rounded-full bg-[#0079C2] text-white shadow-lg flex items-center justify-center hover:scale-125 transition-transform ${isMenuOpen(idx, 'BOTTOM') ? 'scale-125 rotate-45 bg-rose-500' : ''}`} title="Inserir Nova Linha Abaixo"><Plus size={12} strokeWidth={3} /></button>
                       {isMenuOpen(idx, 'BOTTOM') && renderInsertMenu(showInsertAt?.blockIdx || smartInsertionIdx)}
                    </div>
                    {block.width !== 'FULL' && (
                      <div className={`absolute top-0 bottom-0 -right-3 w-6 flex items-center justify-center transition-opacity group/insert-right no-print ${isMenuOpen(idx, 'RIGHT') ? 'z-[1000] opacity-100' : 'z-50 opacity-0 hover:opacity-100'}`}>
                         <div className={`absolute top-4 bottom-4 w-[2px] bg-[#00A7E7] opacity-0 group-hover/insert-right:opacity-100 transition-all shadow-[0_0_8px_#00A7E7] ${isMenuOpen(idx, 'RIGHT') ? 'opacity-100' : ''}`} />
                         <button onClick={(e) => { e.stopPropagation(); const nextWidth = getComplementaryWidth(block.width); onShowInsertAt({ pageIdx, blockIdx: idx + 1, trigger: 'RIGHT', forceWidth: nextWidth, anchorBlockIdx: idx }); onSetInsertSubMenu('MAIN'); }} className={`relative z-10 w-5 h-5 rounded-full bg-[#0079C2] text-white shadow-lg flex items-center justify-center hover:scale-125 transition-transform ${isMenuOpen(idx, 'RIGHT') ? 'scale-125 rotate-45 bg-rose-500' : ''}`} title="Inserir ao Lado"><Plus size={12} strokeWidth={3} /></button>
                         {isMenuOpen(idx, 'RIGHT') && renderInsertMenu(showInsertAt?.blockIdx || idx + 1, showInsertAt?.forceWidth)}
                      </div>
                    )}
                  </>
                )}
                {inSection && !isSectionBlock && isLeftAligned && (
                  <div className={`absolute top-0 bottom-0 pointer-events-none z-0 left-0 ${isFuture ? 'border-l-2 border-[#00A7E7]/30 ml-0' : (isBlueTheme ? 'bg-white/15 w-[4px]' : 'bg-[#0079C2]/15 w-[4px]')}`} />
                )}
                {isHighlighted && isLastSelected && !isFullScreen && !isReadOnly && (
                  <BlockToolbar block={block} selectedCount={selectedBlockIds.length} onUpdate={(u) => onUpdateBlock(block.id, u)} onRemove={() => { onRemoveBlock(block.id); }} onMoveUp={() => onMoveBlock(idx, 'up')} onMoveDown={() => onMoveBlock(idx, 'down')} onDuplicate={() => onDuplicateBlock(idx)} onCopy={() => onCopyBlock(block)} />
                )}
                <BlockRenderer block={block} isHighlighted={isHighlighted} theme={page.theme || 'LIGHT'} designSystem={designSystem} layoutFormat={layoutFormat} activeSubItemIndex={isHighlighted && selectedBlockIds.length === 1 ? activeSubItemIndex : null} onActiveBlockChange={(id) => onActiveBlockChange(id, false, false)} onActiveSubItemChange={onActiveSubItemChange} onUpdate={(u) => !isReadOnly && onUpdateBlock(block.id, u)} />
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {isOverflowing && <div className="no-print absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-rose-600/90 backdrop-blur-md text-white rounded-full shadow-2xl animate-overflow z-[100] border border-white/20 group/overflow cursor-help"><AlertTriangle size={14} strokeWidth={3} className="shrink-0" /><span className="text-[9px] font-black uppercase tracking-widest leading-none whitespace-nowrap overflow-hidden max-w-0 group-hover/overflow:max-w-[200px] transition-all duration-500 ease-in-out">Conteúdo Excedido</span></div>}
      {showFooter && (
        <footer className={`mt-auto pt-2 flex justify-between items-end shrink-0 ${isFuture ? 'border-t-0 text-white' : 'border-t border-slate-100'}`}>
          <div className="flex flex-col gap-0.5"><div className="flex items-baseline gap-2"><span className={`text-[9px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-blue-100' : 'text-[#006098]'}`}>{reportTitle || 'MAG Seguros'}</span>{isFuture && <span className="text-[#00A7E7] text-[6px] tracking-[0.2em] font-black italic">O Futuro é MAG</span>}</div><span className={`text-[6px] font-bold uppercase tracking-tight ${isBlueTheme ? 'text-blue-200/40' : 'text-slate-300'}`}>Propriedade Intelectual MAG Seguros</span></div>
          <div className="flex items-end gap-1"><span className={`text-[12px] font-black leading-[0.8] ${isBlueTheme ? 'text-white' : 'text-[#415364]'}`}>{pageIdx + 1}</span><span className={`text-[8px] font-bold leading-[0.8] ${isBlueTheme ? 'text-white/40' : 'text-slate-300'}`}>/ {totalPages}</span></div>
        </footer>
      )}
    </div>
  );
};
