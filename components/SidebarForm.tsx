
import React, { useRef, useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, FileText, Plus, Layers, 
  Eye, LayoutPanelTop, Trash2, AlertTriangle,
  ToggleRight, ToggleLeft, Edit3, Layout, CloudDownload, CloudUpload, Presentation, Sparkles,
  Settings, PenTool, LayoutTemplate, Save, HardDrive, Home, Share2, CheckCircle2, Clock, Lock, ExternalLink,
  MessageSquare, FileJson, Send
} from 'lucide-react';
import { ReportData, BlockType, BlockWidth, Page, CoverPage, DEFAULT_REPORT_DATA, Block, NarrativeBadge, DocumentFormat, DesignSystem } from '../types';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarPageSettings } from './sidebar/SidebarPageSettings';
import { SidebarToolbox } from './sidebar/SidebarToolbox';
import { SidebarBlockList } from './sidebar/SidebarBlockList';
import { SidebarCoverSettings } from './sidebar/SidebarCoverSettings';
import { generateShareUrl } from '../utils/share';
import { SidebarNavigation } from './sidebar/SidebarNavigation';

interface SidebarFormProps {
  data: ReportData;
  onChange: (data: ReportData) => void;
  activeBlockId: string | null;
  activeSubItemIndex?: number | null;
  onActiveSubItemChange?: (idx: number | null) => void;
  onActiveBlockChange: (id: string | null) => void;
  activePageIndex: number | 'cover' | null;
  onActivePageChange: (index: number | 'cover' | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onTogglePreview: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onSaveLocal: () => void;
  onHome: () => void;
  overflowingPages?: number[];
  onAddPage: () => void;
  onDuplicatePage?: (index: number) => void;
  onMovePage?: (index: number, direction: 'up' | 'down') => void;
  onAddBlock?: (pageIdx: number, type: BlockType, withPlaceholders?: boolean) => void;
}

export const SidebarForm: React.FC<SidebarFormProps> = ({ 
  data, onChange, activeBlockId, activeSubItemIndex, onActiveSubItemChange, 
  onActiveBlockChange, activePageIndex, onActivePageChange, undo, redo, 
  canUndo, canRedo, onTogglePreview, onExportBackup, onImportBackup, onSaveLocal, onHome, overflowingPages = [],
  onAddPage, onDuplicatePage, onMovePage, onAddBlock
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  const [shareStatus, setShareStatus] = useState<'IDLE' | 'COPIED' | 'LIMIT'>('IDLE');
  const [viewLinkStatus, setViewLinkStatus] = useState<'IDLE' | 'COPIED'>('IDLE');
  const [linkSize, setLinkSize] = useState(0);
  
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [timeDisplay, setTimeDisplay] = useState<string>('');
  const [isLongUnsaved, setIsLongUnsaved] = useState(false);

  const isPageActive = typeof activePageIndex === 'number';
  const isCoverActive = activePageIndex === 'cover';

  // Monitor de tamanho de link para o limite seguro de URLs (aproximadamente 8KB)
  useEffect(() => {
    const timer = setTimeout(() => {
      const url = generateShareUrl(data);
      setLinkSize(url.length);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    const checkTime = () => {
      if (!lastSaveTime) {
        setTimeDisplay('');
        return;
      }
      const diffMs = new Date().getTime() - lastSaveTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      setIsLongUnsaved(diffMins >= 10);
      if (diffMins < 1) setTimeDisplay('Salvo agora mesmo');
      else if (diffMins === 1) setTimeDisplay('Salvo há 1 minuto');
      else setTimeDisplay(`Salvo há ${diffMins} minutos`);
    };
    const interval = setInterval(checkTime, 30000);
    checkTime();
    return () => clearInterval(interval);
  }, [lastSaveTime]);
  
  const [openSections, setOpenSections] = useState({ config: true, structure: true, content: true });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePage = (idx: number, updates: Partial<Page>) => {
    const newPages = [...data.pages];
    newPages[idx] = { ...newPages[idx], ...updates };
    onChange({ ...data, pages: newPages });
  };

  const applyLayoutToAllPages = (sourceIdx: number) => {
    const sourcePage = data.pages[sourceIdx];
    const newPages = data.pages.map(page => ({
      ...page,
      theme: sourcePage.theme,
      rowGap: sourcePage.rowGap,
      columnGap: sourcePage.columnGap,
      paddingX: sourcePage.paddingX,
      paddingY: sourcePage.paddingY,
      showTitle: sourcePage.showTitle,
      showSubtitle: sourcePage.showSubtitle,
      showLogo: sourcePage.showLogo,
      showDivider: sourcePage.showDivider,
      showFooter: sourcePage.showFooter,
    }));
    onChange({ ...data, pages: newPages });
  };

  const updateCover = (updates: Partial<CoverPage>) => {
    onChange({ ...data, cover: { ...(data.cover || DEFAULT_REPORT_DATA.cover!), ...updates } });
  };

  const removePage = (index: number) => {
    if (data.pages.length <= 1) return;
    const newPages = data.pages.filter((_, i) => i !== index);
    onChange({ ...data, pages: newPages });
    onActivePageChange(Math.max(0, index - 1));
  };

  const handleManualSave = () => {
    setSaveStatus('SAVING');
    onSaveLocal();
    setTimeout(() => {
        setSaveStatus('SAVED');
        setLastSaveTime(new Date());
        setTimeout(() => setSaveStatus('IDLE'), 2000);
    }, 800);
  };

  const handleShare = () => {
    const url = generateShareUrl(data);
    // Limite de segurança para navegadores/servidores comuns (8KB)
    if (url.length > 7800) {
      setShareStatus('LIMIT');
      setTimeout(() => setShareStatus('IDLE'), 4000);
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
        setShareStatus('COPIED');
        setTimeout(() => setShareStatus('IDLE'), 2000);
    });
  };

  const handleViewLink = () => {
    const url = generateShareUrl(data, true);
    navigator.clipboard.writeText(url).then(() => {
        setViewLinkStatus('COPIED');
        setTimeout(() => setViewLinkStatus('IDLE'), 2000);
    });
  };

  return (
    <div className="w-full md:w-[450px] bg-white h-screen flex flex-col border-r shadow-xl overflow-hidden font-sans">
      <SidebarHeader canUndo={canUndo} canRedo={canRedo} undo={undo} redo={redo} onHome={onHome} />

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 pb-20">
        
        {/* PASSO 1: CONFIGURAÇÃO GLOBAL */}
        <div className="border-b border-slate-200 bg-white">
          <button onClick={() => toggleSection('config')} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black border border-slate-200">1</div>
              <span className="text-[11px] font-black uppercase text-[#006098] tracking-widest">Configuração Global</span>
            </div>
            <ChevronDown size={14} className={`text-slate-300 transition-transform ${openSections.config ? 'rotate-180' : ''}`} />
          </button>
          {openSections.config && (
            <div className="px-6 pb-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1"><Edit3 size={10} /> Nome do Projeto</label>
                <input type="text" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#006098] outline-none focus:ring-2 focus:ring-[#00A7E7]/20 transition-all placeholder-slate-300" placeholder="Ex: Report Mensal de KPIs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Formato do Arquivo</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button onClick={() => onChange({ ...data, layoutFormat: 'REPORT' })} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[8px] font-black uppercase transition-all gap-1 ${data.layoutFormat === 'REPORT' ? 'bg-white text-[#0079C2] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}><FileText size={14} /> A4 Vertical</button>
                    <button onClick={() => onChange({ ...data, layoutFormat: 'PRESENTATION' })} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[8px] font-black uppercase transition-all gap-1 ${data.layoutFormat === 'PRESENTATION' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Presentation size={14} /> Slide 16:9</button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Identidade Visual</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button onClick={() => onChange({ ...data, designSystem: 'STANDARD' })} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[8px] font-black uppercase transition-all gap-1 ${data.designSystem === 'STANDARD' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutPanelTop size={14} /> Padrão</button>
                    <button onClick={() => onChange({ ...data, designSystem: 'FUTURE' })} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[8px] font-black uppercase transition-all gap-1 ${data.designSystem === 'FUTURE' ? 'bg-[#006098] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Sparkles size={14} /> Futuro</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PASSO 2: ESTRUTURA */}
        <div className="border-b border-slate-200 bg-white">
          <button onClick={() => toggleSection('structure')} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black border border-slate-200">2</div>
              <span className="text-[11px] font-black uppercase text-[#006098] tracking-widest">Navegação & Estrutura</span>
            </div>
            <ChevronDown size={14} className={`text-slate-300 transition-transform ${openSections.structure ? 'rotate-180' : ''}`} />
          </button>
          {openSections.structure && (
            <SidebarNavigation 
              pages={data.pages} 
              coverEnabled={!!data.cover?.enabled} 
              activePageIndex={activePageIndex ?? 'cover'} 
              overflowingPages={overflowingPages} 
              onActivePageChange={(idx) => { onActivePageChange(idx); onActiveBlockChange(null); }} 
              onActiveBlockChange={onActiveBlockChange} 
              onUpdateCover={updateCover} 
              onUpdatePage={updatePage}
              onRemovePage={removePage} 
              onAddPage={onAddPage} 
              onDuplicatePage={onDuplicatePage} 
              onMovePage={onMovePage} 
            />
          )}
        </div>

        {/* PASSO 3: EDIÇÃO DE CONTEÚDO (CONTEXTUAL) */}
        {isPageActive && openSections.content && typeof activePageIndex === 'number' && data.pages[activePageIndex] && (
          <div className="bg-white min-h-[400px] animate-in slide-in-from-right-4 duration-300 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] relative z-10">
            <div className="sticky top-0 bg-white z-20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0079C2] text-white flex items-center justify-center text-[10px] font-black border border-[#006098]">3</div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase text-[#006098] tracking-widest">Editor da Página {activePageIndex + 1}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{data.pages[activePageIndex].blocks.length} componentes adicionados</span>
                </div>
              </div>
            </div>
            <div className="p-0">
              <div className="space-y-1">
                <details className="group/details" open>
                  <summary className="px-6 py-3 cursor-pointer bg-slate-50/50 hover:bg-slate-100 flex items-center justify-between transition-colors outline-none">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Plus size={12} /> Adicionar Elementos</span>
                    <ChevronDown size={12} className="text-slate-300 group-open/details:rotate-180 transition-transform" />
                  </summary>
                  <SidebarToolbox onAddBlock={(type) => onAddBlock && typeof activePageIndex === 'number' && onAddBlock(activePageIndex, type, true)} />
                </details>
                <details className="group/details" open={data.pages[activePageIndex].blocks.length > 0}>
                  <summary className="px-6 py-3 cursor-pointer bg-slate-50/50 hover:bg-slate-100 flex items-center justify-between transition-colors outline-none border-t border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Layers size={12} /> Gerenciar Conteúdo</span>
                    <ChevronDown size={12} className="text-slate-300 group-open/details:rotate-180 transition-transform" />
                  </summary>
                  <SidebarBlockList blocks={data.pages[activePageIndex].blocks} activeBlockId={activeBlockId} activeSubItemIndex={activeSubItemIndex} onActiveBlockChange={onActiveBlockChange} onActiveSubItemChange={onActiveSubItemChange} onUpdatePage={(u) => updatePage(activePageIndex, u)} />
                </details>
                <details className="group/details">
                  <summary className="px-6 py-3 cursor-pointer bg-slate-50/50 hover:bg-slate-100 flex items-center justify-between transition-colors outline-none border-t border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Layout size={12} /> Layout e Espaçamento</span>
                    <ChevronDown size={12} className="text-slate-300 group-open/details:rotate-180 transition-transform" />
                  </summary>
                  <SidebarPageSettings page={data.pages[activePageIndex]} onUpdatePage={(u) => updatePage(activePageIndex, u)} onApplyToAll={() => applyLayoutToAllPages(activePageIndex)} />
                </details>
              </div>
            </div>
          </div>
        )}

        {isCoverActive && data.cover && (
          <div className="bg-white min-h-[400px] animate-in slide-in-from-right-4 duration-300 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] relative z-10">
             <div className="sticky top-0 bg-white z-20 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0079C2] text-white flex items-center justify-center text-[10px] font-black border border-[#006098]">3</div>
                <span className="text-[11px] font-black uppercase text-[#006098] tracking-widest">Edição da Capa</span>
             </div>
             <SidebarCoverSettings cover={data.cover} onUpdateCover={updateCover} />
          </div>
        )}

        {!isPageActive && !isCoverActive && (
          <div className="p-8 text-center opacity-50 mt-10">
            <PenTool size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-[10px] font-black uppercase text-slate-400">Selecione uma página para editar</p>
          </div>
        )}
      </div>

      {/* RODAPÉ UTILITÁRIO */}
      <div className="p-4 border-t bg-white shrink-0 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-20">
        {lastSaveTime && (
          <div className={`flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest mb-2 transition-colors ${isLongUnsaved ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
            <Clock size={10} strokeWidth={isLongUnsaved ? 3 : 2} /> {timeDisplay}
          </div>
        )}

        <div className="flex gap-2 mb-2">
          <button onClick={handleManualSave} disabled={saveStatus !== 'IDLE'} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 border transition-all ${saveStatus === 'SAVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'}`} title="Salvar no Navegador">
            <HardDrive size={12} /> {saveStatus === 'SAVING' ? 'Salvando...' : (saveStatus === 'SAVED' ? 'Salvo!' : 'Salvar')}
          </button>
          
          <div className="flex-1 group relative">
            <button onClick={handleShare} className={`w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 border transition-all ${shareStatus === 'COPIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : shareStatus === 'LIMIT' ? 'bg-rose-50 text-rose-600 border-rose-200 animate-shake' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'}`}>
              {shareStatus === 'COPIED' ? <CheckCircle2 size={12} /> : shareStatus === 'LIMIT' ? <AlertTriangle size={12} /> : <Share2 size={12} />}
              {shareStatus === 'COPIED' ? 'Copiado!' : shareStatus === 'LIMIT' ? 'Grande Demais!' : 'Link Editável'}
            </button>
            <div className={`absolute -top-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all ${linkSize > 7500 ? 'text-rose-500 scale-105' : 'text-slate-400'}`}>
               <span className={`text-[7px] font-bold bg-white px-2 py-0.5 border rounded-full shadow-md flex items-center gap-1 ${linkSize > 7500 ? 'border-rose-200 bg-rose-50' : ''}`}>
                 {linkSize > 7500 && <AlertTriangle size={8} />} Tamanho: {linkSize} / 8000
               </span>
            </div>
          </div>
          
          <button onClick={() => fileInputRef.current?.click()} className="w-10 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center border border-slate-200 transition-all" title="Restaurar Backup (JSON)"><CloudUpload size={12} /></button>
          <button onClick={onExportBackup} className="w-10 py-2 bg-[#0079C2]/5 hover:bg-[#0079C2]/10 text-[#0079C2] rounded-lg flex items-center justify-center border border-[#0079C2]/20 transition-all" title="Exportar Arquivo .JSON"><Send size={12} /></button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => { const file = e.target.files?.[0]; if (file) onImportBackup(file); e.target.value = ''; }} />
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{data.pages.length + (data.cover?.enabled ? 1 : 0)} Folhas</span>
          <div className="flex items-center gap-2">
            <button onClick={onTogglePreview} className="text-[9px] font-black text-[#0079C2] uppercase tracking-widest hover:underline flex items-center gap-1"><Eye size={12} /> Modo Visualização</button>
            <div className="w-px h-3 bg-slate-200"></div>
            <button onClick={handleViewLink} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-sm ${viewLinkStatus === 'COPIED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0079C2] hover:text-[#0079C2]'}`} title="Link de Leitura">
              {viewLinkStatus === 'COPIED' ? <CheckCircle2 size={12} /> : <Lock size={12} />}
              <span className="text-[9px] font-black uppercase tracking-wide">Link Leitura</span>
            </button>
          </div>
        </div>

        <button onClick={() => window.print()} className="w-full bg-gradient-to-r from-[#0079C2] to-[#006098] hover:shadow-lg hover:shadow-blue-200 text-white font-black py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.1em]"><FileText size={18} /> Exportar PDF Final</button>
      </div>
    </div>
  );
};
