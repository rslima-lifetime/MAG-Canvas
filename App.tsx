
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DEFAULT_REPORT_DATA, CoverPage, Block, ReportData, BlockWidth, BlockType, ChartType } from './types';
import { SidebarForm } from './components/SidebarForm';
import { ViewerNavigation } from './components/viewer/ViewerNavigation';
import { PresentationControls } from './components/viewer/PresentationControls'; 
import { useReport } from './hooks/useReport';
import { ReportCover } from './components/layout/ReportCover';
import { ReportPage } from './components/layout/ReportPage';
import { AppHeader } from './components/layout/AppHeader';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useLocalStorageProjects } from './hooks/useLocalStorageProjects';
import { parseShareUrl, clearShareUrl } from './utils/share';
import { Plus, AlertTriangle, Save, Trash2, X } from 'lucide-react';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { 
    data: reportData, setData: setReportData, undo, redo, canUndo, canRedo,
    updateBlock, removeBlock, moveBlock, duplicateBlock, addBlockAt, updatePage, addPage, pasteBlockAt, duplicatePage, movePage
  } = useReport(DEFAULT_REPORT_DATA);
  
  const { saveLocalProject } = useLocalStorageProjects();
  
  const lastSavedDataJson = useRef<string>("");

  const [activePageIndex, setActivePageIndex] = useState<number | 'cover' | null>('cover');
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [activeSubItemIndex, setActiveSubItemIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.3); 
  const [overflowingPages, setOverflowingPages] = useState<number[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false); 
  
  // Ref para rastrear o âncora da seleção (para o Shift+Click)
  const selectionAnchorId = useRef<string | null>(null);

  const [showInsertAt, setShowInsertAt] = useState<{ 
    pageIdx: number, 
    blockIdx: number, 
    forceWidth?: 'FULL' | 'HALF' | 'QUARTER' | 'THIRD', 
    trigger?: 'TOP' | 'BOTTOM' | 'RIGHT', 
    anchorBlockIdx?: number 
  } | null>(null);
  
  const [insertSubMenu, setInsertSubMenu] = useState<'MAIN' | 'CHART'>('MAIN');
  const [clipboardBlocks, setClipboardBlocks] = useState<Block[]>([]);
  const [showSafeMargins, setShowSafeMargins] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingToPage = useRef(false);

  // --- Callbacks e Handlers (Definidos antes dos Effects para evitar ReferenceError) ---

  const clearMenus = useCallback(() => {
    setSelectedBlockIds([]);
    setActiveSubItemIndex(null);
    setShowInsertAt(null);
    setInsertSubMenu('MAIN');
    selectionAnchorId.current = null;
  }, []);

  const handleCopySelected = useCallback(() => {
    if (selectedBlockIds.length === 0) return;
    const allBlocksFlat: {block: Block, pIdx: number}[] = [];
    reportData.pages.forEach((p, pIdx) => {
      p.blocks.forEach(b => {
        if (selectedBlockIds.includes(b.id)) {
          allBlocksFlat.push({ block: JSON.parse(JSON.stringify(b)), pIdx });
        }
      });
    });
    setClipboardBlocks(allBlocksFlat.map(item => item.block));
  }, [selectedBlockIds, reportData.pages]);

  const handlePasteBlocks = useCallback((pageIdx: number, blockIdx: number) => {
    if (clipboardBlocks.length === 0) return;
    let currentIdx = blockIdx;
    const newIds: string[] = [];
    clipboardBlocks.forEach(block => {
      const newId = pasteBlockAt(pageIdx, currentIdx, block);
      newIds.push(newId);
      currentIdx++;
    });
    setSelectedBlockIds(newIds);
    setShowInsertAt(null);
  }, [clipboardBlocks, pasteBlockAt]);

  const handleBulkRemove = useCallback(() => {
    if (selectedBlockIds.length === 0) return;
    selectedBlockIds.forEach(id => {
      reportData.pages.forEach((p, pIdx) => {
        if (p.blocks.find(b => b.id === id)) {
          removeBlock(pIdx, id);
        }
      });
    });
    setSelectedBlockIds([]);
  }, [selectedBlockIds, reportData.pages, removeBlock]);

  const handleUpdateCover = useCallback((updates: Partial<CoverPage>) => {
    if (isReadOnly) return;
    setReportData(prev => ({ ...prev, cover: { ...prev.cover!, ...updates } }));
  }, [setReportData, isReadOnly]);

  const handleSaveLocal = useCallback(() => {
    const newId = saveLocalProject(reportData);
    if (newId && reportData !== undefined) {
      if (!(reportData as any)._localId) {
         setReportData(prev => ({ ...prev, _localId: newId }));
      }
      lastSavedDataJson.current = JSON.stringify({ ...reportData, _localId: newId });
    }
  }, [reportData, saveLocalProject, setReportData]);

  const updatePresentationZoom = useCallback(() => {
    if (!isPresentationMode) return;
    const isLandscape = reportData.layoutFormat === 'PRESENTATION';
    const baseWidth = isLandscape ? 1123 : 794;
    const baseHeight = isLandscape ? 631 : 1123;
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const scaleX = (availableWidth * 0.94) / baseWidth; 
    const scaleY = (availableHeight * 0.90) / baseHeight; 
    const newScale = Math.min(scaleX, scaleY);
    setZoomLevel(newScale); 
  }, [isPresentationMode, reportData.layoutFormat]);

  const handleSmartZoom = useCallback(() => {
    if (!isPresentationMode) return;
    const isLandscape = reportData.layoutFormat === 'PRESENTATION';
    const baseWidth = isLandscape ? 1123 : 794;
    const availableWidth = window.innerWidth;
    const fitWidthScale = (availableWidth * 0.98) / baseWidth; 
    
    if (Math.abs(zoomLevel - fitWidthScale) < 0.05) {
      setZoomLevel(1.5);
    } else {
      setZoomLevel(fitWidthScale);
    }
  }, [isPresentationMode, reportData.layoutFormat, zoomLevel]);

  const handleBlockSelection = useCallback((blockId: string | null, isMulti: boolean, isShift: boolean, pageIdx: number) => {
    if (isReadOnly) return;
    if (activePageIndex !== pageIdx) setActivePageIndex(pageIdx);

    if (blockId === null) {
      setSelectedBlockIds([]);
      selectionAnchorId.current = null;
      return;
    }

    if (isShift && selectionAnchorId.current) {
      const page = reportData.pages[pageIdx];
      const fromIdx = page.blocks.findIndex(b => b.id === selectionAnchorId.current);
      const toIdx = page.blocks.findIndex(b => b.id === blockId);
      
      if (fromIdx !== -1 && toIdx !== -1) {
        const start = Math.min(fromIdx, toIdx);
        const end = Math.max(fromIdx, toIdx);
        const rangeIds = page.blocks.slice(start, end + 1).map(b => b.id);
        setSelectedBlockIds(rangeIds);
        return;
      }
    }

    if (isMulti) {
      setSelectedBlockIds(prev => {
        const alreadySelected = prev.includes(blockId);
        if (alreadySelected) {
          const next = prev.filter(x => x !== blockId);
          if (next.length > 0) selectionAnchorId.current = next[next.length - 1];
          else selectionAnchorId.current = null;
          return next;
        } else {
          selectionAnchorId.current = blockId;
          return [...prev, blockId];
        }
      });
    } else {
      setSelectedBlockIds([blockId]);
      selectionAnchorId.current = blockId;
    }
    
    setShowInsertAt(null);
  }, [activePageIndex, isReadOnly, reportData.pages]);

  // --- Effects ---

  useEffect(() => {
    const { data: sharedData, isReadOnly: readOnlyMode } = parseShareUrl();
    if (sharedData) {
      setReportData(sharedData);
      delete (sharedData as any)._localId;
      lastSavedDataJson.current = JSON.stringify(sharedData);
      setShowWelcome(false);
      
      if (readOnlyMode) {
        setIsReadOnly(true);
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false); 
      }
    }
  }, [setReportData]);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY > 0 ? -1 : 1;
      const step = 0.05;
      setZoomLevel(prev => {
        const next = prev + (direction * step);
        return Math.min(Math.max(Number(next.toFixed(2)), 0.2), 3.5);
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable;

      if (isInput) {
        if (e.key === 'Escape') {
          target.blur(); 
          e.preventDefault();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (showUnsavedDialog) {
          setShowUnsavedDialog(false);
        } else if (isPresentationMode) {
          setIsPresentationMode(false);
          setIsSidebarOpen(true); 
        } else {
          e.preventDefault();
          clearMenus();
        }
        return;
      }

      if (isReadOnly) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey && canRedo) {
          e.preventDefault();
          redo();
        } else if (canUndo) {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && canRedo) {
        e.preventDefault();
        redo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedBlockIds.length > 0) {
        handleCopySelected();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, redo, canUndo, canRedo, clearMenus, showUnsavedDialog, isReadOnly, isPresentationMode, selectedBlockIds, handleCopySelected]);

  useEffect(() => {
    if (isPresentationMode) {
      updatePresentationZoom();
      window.addEventListener('resize', updatePresentationZoom);
      document.documentElement.requestFullscreen().catch((e) => console.log('Fullscreen denied', e));
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (reportData.layoutFormat === 'PRESENTATION') {
        setZoomLevel(0.8);
      } else {
        setZoomLevel(1.3);
      }
      window.removeEventListener('resize', updatePresentationZoom);
    }
    return () => window.removeEventListener('resize', updatePresentationZoom);
  }, [isPresentationMode, updatePresentationZoom, reportData.layoutFormat]);

  useEffect(() => {
    if (reportData.layoutFormat === 'PRESENTATION' && !isPresentationMode) {
      setZoomLevel(0.8);
      document.body.classList.add('print-landscape');
      document.body.classList.remove('print-portrait');
    } else {
      if (!isPresentationMode) setZoomLevel(1.3);
      document.body.classList.add('print-portrait');
      document.body.classList.remove('print-landscape');
    }
  }, [reportData.layoutFormat, isPresentationMode]);

  const sectionContinuity = useMemo(() => {
    const continuity: boolean[] = [];
    let currentInSection = false;
    reportData.pages.forEach((page, idx) => {
      continuity[idx] = currentInSection;
      page.blocks.forEach(block => {
        if (block.type === 'SECTION') currentInSection = true;
      });
    });
    return continuity;
  }, [reportData.pages]);

  useEffect(() => {
    if (isPresentationMode) return;
    const observerOptions = { root: null, rootMargin: '-20% 0px -20% 0px', threshold: 0.3 };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingToPage.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'page-cover') setActivePageIndex('cover');
          else if (id.startsWith('page-')) setActivePageIndex(parseInt(id.split('-')[1]));
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    Object.values(pageRefs.current).forEach((el: HTMLDivElement | null) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [reportData.pages.length, reportData.cover?.enabled, isPresentationMode]);

  useEffect(() => {
    if (activePageIndex === null || isPresentationMode) return;
    const pageId = activePageIndex === 'cover' ? 'page-cover' : `page-${activePageIndex}`;
    const element = pageRefs.current[pageId];
    if (element && !isScrollingToPage.current) {
      isScrollingToPage.current = true;
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isScrollingToPage.current = false; }, 800);
    }
  }, [activePageIndex, isPresentationMode]);

  useEffect(() => {
    if (isPresentationMode && mainContainerRef.current) {
      mainContainerRef.current.scrollTop = 0;
    }
  }, [activePageIndex, isPresentationMode]);

  useEffect(() => {
    const checkOverflow = () => {
      const overflows: number[] = [];
      reportData.pages.forEach((_, idx) => {
        const pageEl = pageRefs.current[`page-${idx}`];
        if (pageEl && pageEl.scrollHeight > pageEl.offsetHeight + 5) {
          overflows.push(idx);
        }
      });
      setOverflowingPages(overflows);
    };
    const timeout = setTimeout(checkOverflow, 500);
    const resizeObserver = new ResizeObserver(checkOverflow);
    Object.values(pageRefs.current).forEach((el: HTMLDivElement | null) => el && resizeObserver.observe(el));
    return () => { clearTimeout(timeout); resizeObserver.disconnect(); };
  }, [reportData, zoomLevel]);

  // --- Outros Handlers de UI ---

  const handleStartProject = (initData: Partial<ReportData>) => {
    setReportData(() => {
      const next = { ...DEFAULT_REPORT_DATA, ...initData };
      if (!(initData as any)._localId) delete (next as any)._localId;
      lastSavedDataJson.current = JSON.stringify(next);
      return next;
    });
    setShowWelcome(false);
    setIsReadOnly(false);
    clearShareUrl();
  };

  const handleGoHome = () => {
    const currentDataJson = JSON.stringify(reportData);
    if (isReadOnly || currentDataJson === lastSavedDataJson.current) {
      setShowWelcome(true);
      setIsReadOnly(false);
      clearShareUrl();
    } else {
      setShowUnsavedDialog(true);
    }
  };

  const handleAddPage = () => {
    addPage();
    setActivePageIndex(reportData.pages.length);
    clearMenus();
  };

  const handleDuplicatePage = (pageIdx: number) => {
    duplicatePage(pageIdx);
    setActivePageIndex(pageIdx + 1);
    clearMenus();
  };

  const handleDuplicateBlock = (pageIdx: number, blockIdx: number) => {
    const isOverflowing = overflowingPages.includes(pageIdx);
    const newId = duplicateBlock(pageIdx, blockIdx, isOverflowing);
    setSelectedBlockIds([newId]);
    if (isOverflowing) setActivePageIndex(pageIdx + 1);
  };

  const handleSaveAndExit = () => {
    handleSaveLocal();
    setShowUnsavedDialog(false);
    setShowWelcome(true);
    setIsReadOnly(false);
    clearShareUrl();
  };

  const handleDiscardExit = () => {
    setShowUnsavedDialog(false);
    setShowWelcome(true);
    setIsReadOnly(false);
    clearShareUrl();
  };

  const exportBackup = useCallback(() => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    link.download = `MAG_Backup_${reportData.title.replace(/\s+/g, '_')}.json`;
    link.click();
  }, [reportData]);

  const importBackup = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.pages) {
          setReportData(importedData);
          lastSavedDataJson.current = JSON.stringify(importedData);
          setShowWelcome(false); 
          setIsReadOnly(false);
          clearShareUrl();
        }
      } catch (e) {
        alert("Erro ao importar arquivo.");
      }
    };
    reader.readAsText(file);
  }, [setReportData]);

  const handleAddBlockFromSidebar = (pageIdx: number, type: BlockType, withPlaceholders: boolean = true) => {
    const page = reportData.pages[pageIdx];
    if (page) {
      const newId = addBlockAt(pageIdx, type, page.blocks.length, undefined, undefined, withPlaceholders);
      setSelectedBlockIds([newId]);
      selectionAnchorId.current = newId;
    }
  };

  const handleNextSlide = () => {
    if (activePageIndex === 'cover') {
      // Encontrar a primeira página não oculta
      const firstVisiblePageIdx = reportData.pages.findIndex(p => !p.hidden);
      if (firstVisiblePageIdx !== -1) {
        setActivePageIndex(firstVisiblePageIdx);
      }
    } else if (typeof activePageIndex === 'number') {
      // Encontrar a próxima página não oculta
      let nextIdx = activePageIndex + 1;
      while (nextIdx < reportData.pages.length && reportData.pages[nextIdx].hidden) {
        nextIdx++;
      }
      if (nextIdx < reportData.pages.length) {
        setActivePageIndex(nextIdx);
      }
    }
  };

  const handlePrevSlide = () => {
    if (activePageIndex === 'cover') return;
    
    if (typeof activePageIndex === 'number') {
      // Encontrar a página anterior não oculta
      let prevIdx = activePageIndex - 1;
      while (prevIdx >= 0 && reportData.pages[prevIdx].hidden) {
        prevIdx--;
      }
      
      if (prevIdx >= 0) {
        setActivePageIndex(prevIdx);
      } else {
        // Se não houver páginas anteriores visíveis, voltar para a capa (se habilitada)
        if (reportData.cover?.enabled) setActivePageIndex('cover');
      }
    }
  };

  if (showWelcome) return <WelcomeScreen onStart={handleStartProject} onImport={importBackup} />;

  return (
    <div className={`flex flex-col md:flex-row min-h-screen overflow-hidden print:overflow-visible relative transition-colors duration-700 ${isPresentationMode ? 'bg-[#0f172a]' : 'bg-[#f1f5f9] print:bg-white'}`}>
      
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100"><AlertTriangle size={20} /></div>
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Alterações Não Salvas</h3>
                <p className="text-[10px] font-medium text-slate-400">Você tem modificações pendentes.</p>
              </div>
              <button onClick={() => setShowUnsavedDialog(false)} className="text-slate-300 hover:text-slate-500"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">Deseja salvar o progresso atual antes de voltar para a tela inicial?</p>
            <div className="flex flex-col gap-2">
              <button onClick={handleSaveAndExit} className="w-full py-3 bg-[#0079C2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006098] flex items-center justify-center gap-2 shadow-md"><Save size={14} /> Salvar e Sair</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleDiscardExit} className="py-3 bg-white border border-rose-200 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 flex items-center justify-center gap-2"><Trash2 size={14} /> Descartar</button>
                <button onClick={() => setShowUnsavedDialog(false)} className="py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isPresentationMode && (
        <aside className={`no-print transition-all duration-500 border-r shadow-2xl z-40 overflow-hidden shrink-0 ${!isSidebarOpen ? 'w-0 opacity-0 -translate-x-full border-transparent' : (isReadOnly ? 'w-[320px]' : 'w-[450px]') + ' opacity-100 translate-x-0'}`}>
          <div className="w-full h-full">
            {isReadOnly ? (
              <ViewerNavigation 
                data={reportData} 
                activePageIndex={activePageIndex} 
                onNavigate={setActivePageIndex}
                onEnterPresentation={() => {
                  setIsPresentationMode(true);
                  setIsSidebarOpen(false);
                  setActivePageIndex('cover');
                }}
              />
            ) : (
              <SidebarForm 
                data={reportData} onChange={setReportData} 
                activeBlockId={selectedBlockIds.length === 1 ? selectedBlockIds[0] : null} activeSubItemIndex={activeSubItemIndex} onActiveSubItemChange={setActiveSubItemIndex}
                onActiveBlockChange={(id) => handleBlockSelection(id, false, false, typeof activePageIndex === 'number' ? activePageIndex : 0)}
                activePageIndex={activePageIndex} onActivePageChange={setActivePageIndex}
                undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
                onTogglePreview={() => setIsSidebarOpen(false)} 
                onExportBackup={exportBackup} onImportBackup={importBackup} onSaveLocal={handleSaveLocal} onHome={handleGoHome}
                overflowingPages={overflowingPages}
                onAddPage={handleAddPage}
                onDuplicatePage={handleDuplicatePage}
                onMovePage={movePage}
                onAddBlock={handleAddBlockFromSidebar}
              />
            )}
          </div>
        </aside>
      )}

      <main className={`flex-1 flex flex-col items-center overflow-hidden print:overflow-visible h-screen relative transition-colors duration-500 ${isPresentationMode ? 'p-0 overflow-auto' : 'bg-slate-200 print:bg-white'}`}>
        {!isPresentationMode && (
          <AppHeader 
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            reportTitle={reportData.title}
            zoomLevel={zoomLevel}
            onSetZoom={setZoomLevel}
            onPrint={() => window.print()}
            showSafeMargins={showSafeMargins}
            onToggleSafeMargins={() => setShowSafeMargins(!showSafeMargins)}
            isReadOnly={isReadOnly}
          />
        )}

        <div 
          ref={mainContainerRef}
          onClick={clearMenus} 
          className={`flex-1 w-full overflow-auto flex flex-col items-center print:p-0 scroll-smooth print:overflow-visible ${isPresentationMode ? 'p-0 overflow-auto pt-8 pb-32' : 'p-12'}`}
        >
          <div 
            className={`zoom-container flex flex-col transition-all duration-300 ${isPresentationMode ? 'items-center' : 'gap-12 origin-top items-center'}`} 
            style={{ 
                transform: `scale(${zoomLevel})`, 
                transformOrigin: 'top center',
                width: isPresentationMode ? 'auto' : '100%'
            }}
          >
            {isPresentationMode ? (
              <div className="flex flex-col items-center">
                {activePageIndex === 'cover' && reportData.cover?.enabled && (
                  <ReportCover 
                    id="page-cover"
                    cover={reportData.cover} isActive={true} 
                    layoutFormat={reportData.layoutFormat}
                    designSystem={reportData.designSystem}
                    onClick={() => {}}
                    isReadOnly={true}
                  />
                )}
                {typeof activePageIndex === 'number' && reportData.pages[activePageIndex] && !reportData.pages[activePageIndex].hidden && (
                  <ReportPage 
                    id={`page-${activePageIndex}`}
                    page={reportData.pages[activePageIndex]} pageIdx={activePageIndex} 
                    isFullScreen={true}
                    isActive={true} isOverflowing={false}
                    selectedBlockIds={[]} activeSubItemIndex={null}
                    showInsertAt={null} insertSubMenu={'MAIN'}
                    startsInSection={sectionContinuity[activePageIndex]}
                    layoutFormat={reportData.layoutFormat}
                    designSystem={reportData.designSystem}
                    showSafeMargins={false}
                    reportTitle={reportData.title}
                    isReadOnly={true}
                    zoomLevel={zoomLevel}
                    onClick={() => {}}
                    onActiveBlockChange={() => {}} onActiveSubItemChange={() => {}}
                    onShowInsertAt={() => {}} onSetInsertSubMenu={() => {}} onAddBlock={() => {}}
                    onUpdateBlock={() => {}} onRemoveBlock={() => {}} onMoveBlock={() => {}} onDuplicateBlock={() => {}}
                    onCopyBlock={() => {}} onPasteBlock={() => {}}
                    totalPages={reportData.pages.length}
                  />
                )}
              </div>
            ) : (
              <>
                {reportData.cover?.enabled && (
                  <ReportCover 
                    id="page-cover"
                    cover={reportData.cover} isActive={activePageIndex === 'cover' && !isReadOnly} 
                    layoutFormat={reportData.layoutFormat}
                    designSystem={reportData.designSystem}
                    onClick={() => { if (activePageIndex !== 'cover') setActivePageIndex('cover'); clearMenus(); }}
                    onUpdateCover={handleUpdateCover}
                    innerRef={el => { pageRefs.current['page-cover'] = el; }}
                    isReadOnly={isReadOnly}
                  />
                )}
                {reportData.pages.map((page, pIdx) => {
                  const shouldRender = !page.hidden || activePageIndex === pIdx;
                  if (!shouldRender) return null;

                  return (
                    <ReportPage 
                      key={page.id} 
                      id={`page-${pIdx}`}
                      page={page} pageIdx={pIdx} 
                      isFullScreen={!isSidebarOpen}
                      isActive={activePageIndex === pIdx && !isReadOnly} isOverflowing={overflowingPages.includes(pIdx)}
                      selectedBlockIds={selectedBlockIds} activeSubItemIndex={activeSubItemIndex}
                      showInsertAt={showInsertAt} insertSubMenu={insertSubMenu}
                      hasClipboard={clipboardBlocks.length > 0}
                      startsInSection={sectionContinuity[pIdx]}
                      layoutFormat={reportData.layoutFormat}
                      designSystem={reportData.designSystem}
                      showSafeMargins={showSafeMargins}
                      reportTitle={reportData.title}
                      isReadOnly={isReadOnly}
                      zoomLevel={zoomLevel}
                      innerRef={el => { pageRefs.current[`page-${pIdx}`] = el; }}
                      onClick={() => { if (activePageIndex !== pIdx) setActivePageIndex(pIdx); clearMenus(); }}
                      onActiveBlockChange={(id, isMulti, isShift) => handleBlockSelection(id, isMulti, isShift, pIdx)} 
                      onActiveSubItemChange={setActiveSubItemIndex}
                      onShowInsertAt={setShowInsertAt} onSetInsertSubMenu={setInsertSubMenu}
                      onAddBlock={(type, idx, w, ct) => { 
                        if (isReadOnly) return; 
                        const newId = addBlockAt(pIdx, type, idx, w, ct, false); 
                        setSelectedBlockIds([newId]); 
                        selectionAnchorId.current = newId;
                        if (type === 'KPI') setActiveSubItemIndex(-1); else setActiveSubItemIndex(null); 
                        setShowInsertAt(null); 
                        setInsertSubMenu('MAIN'); 
                      }}
                      onUpdatePage={(u) => !isReadOnly && updatePage(pIdx, u)}
                      onUpdateBlock={(id, u) => !isReadOnly && updateBlock(pIdx, id, u)}
                      onRemoveBlock={(id) => !isReadOnly && (selectedBlockIds.length > 1 ? handleBulkRemove() : removeBlock(pIdx, id))}
                      onMoveBlock={(idx, dir) => !isReadOnly && moveBlock(pIdx, idx, dir)}
                      onDuplicateBlock={(idx) => !isReadOnly && handleDuplicateBlock(pIdx, idx)}
                      onCopyBlock={handleCopySelected}
                      onPasteBlock={(idx) => !isReadOnly && handlePasteBlocks(pIdx, idx)}
                      onBulkSelect={(ids) => setSelectedBlockIds(ids)}
                      totalPages={reportData.pages.length}
                    />
                  );
                })}
                {!isReadOnly && (
                  <div className="no-print w-full mt-8 mb-24 flex justify-center shrink-0">
                     <button onClick={(e) => { e.stopPropagation(); handleAddPage(); }} className="group w-full py-16 border-4 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-[#0079C2] hover:text-[#0079C2] hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl" style={{ width: reportData.layoutFormat === 'PRESENTATION' ? '297mm' : '210mm' }}>
                       <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-[#0079C2] group-hover:text-white flex items-center justify-center transition-all duration-500 group-hover:scale-110"><Plus size={32} strokeWidth={3} /></div>
                       <div className="flex flex-col items-center"><span className="text-xl font-black uppercase tracking-widest leading-none">Inserir Novo Slide/Folha</span><span className="text-[10px] font-bold uppercase tracking-tight opacity-60 mt-1">Adicionar mais dados ao projeto</span></div>
                     </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {isPresentationMode && (
          <PresentationControls 
            data={reportData}
            currentPage={activePageIndex ?? 'cover'}
            totalPages={reportData.pages.length}
            hasCover={!!reportData.cover?.enabled}
            zoomLevel={zoomLevel}
            onNext={handleNextSlide}
            onPrev={handlePrevSlide}
            onNavigate={setActivePageIndex}
            onExit={() => { setIsPresentationMode(false); setIsSidebarOpen(true); }}
            onZoomIn={() => setZoomLevel(prev => Math.min(prev + 0.1, 3.5))}
            onZoomOut={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.4))}
            onFit={updatePresentationZoom}
            onFitWidth={handleSmartZoom}
          />
        )}
      </main>
    </div>
  );
};

export default App;
