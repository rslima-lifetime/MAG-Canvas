import React from 'react';
import { 
  PanelLeftClose, PanelLeftOpen, ZoomOut, ZoomIn, 
  Printer, Eye, Lock, List
} from 'lucide-react';

interface AppHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  reportTitle: string;
  zoomLevel: number;
  onSetZoom: (val: number) => void;
  onPrint: () => void;
  showSafeMargins: boolean;
  onToggleSafeMargins: () => void;
  isReadOnly?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isSidebarOpen, onToggleSidebar, reportTitle, zoomLevel, 
  onSetZoom, onPrint, showSafeMargins, onToggleSafeMargins, isReadOnly
}) => {
  return (
    <header className="no-print w-full h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-[1000] sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Botão de Toggle da Sidebar (Funciona tanto para Edição quanto para Índice em ReadOnly) */}
        <button 
          onClick={onToggleSidebar} 
          className={`p-2 rounded-xl transition-all ${isSidebarOpen ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50 border border-slate-100'}`} 
          title={isSidebarOpen ? "Ocultar Painel" : (isReadOnly ? "Mostrar Índice" : "Abrir Editor")}
        >
          {isReadOnly ? (
             <List size={22} />
          ) : (
             isSidebarOpen ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />
          )}
        </button>

        {isReadOnly && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
             <Lock size={14} className="text-slate-400" />
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Modo Visualização</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[#0079C2] uppercase tracking-widest leading-none">MAG Canvas</span>
          <span className="text-[12px] font-bold text-slate-400 truncate max-w-[200px]">{reportTitle}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-100/50 border rounded-full px-3 py-1">
          <button onClick={() => onSetZoom(Math.max(zoomLevel - 0.1, 0.4))} className="p-1.5 text-slate-400 hover:text-[#0079C2] hover:bg-white rounded-full transition-all"><ZoomOut size={16} /></button>
          <div className="min-w-[70px] text-center border-x border-slate-200 mx-1">
            <span className="text-[11px] font-black text-[#006098] uppercase tracking-tighter">{Math.round(zoomLevel * 100)}%</span>
          </div>
          <button onClick={() => onSetZoom(Math.min(zoomLevel + 0.1, 2.0))} className="p-1.5 text-slate-400 hover:text-[#0079C2] hover:bg-white rounded-full transition-all"><ZoomIn size={16} /></button>
        </div>

        {!isReadOnly && (
          <button 
            onClick={onToggleSafeMargins}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showSafeMargins ? 'bg-[#00A7E7] text-white shadow-md shadow-blue-200' : 'text-slate-500 bg-white border border-slate-100'}`}
            title="Simular Margens de Impressão (Etapa 4)"
          >
            <Eye size={16} />
            <span className="hidden lg:inline">Guias de Revisão</span>
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button onClick={onPrint} className="bg-[#0079C2] text-white px-5 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-[#006098] transition-all text-[10px] font-black uppercase">
          <Printer size={16} /> PDF
        </button>
      </div>
    </header>
  );
};