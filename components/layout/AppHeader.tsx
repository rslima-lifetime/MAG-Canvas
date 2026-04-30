import React from 'react';
import { 
  PanelLeftClose, PanelLeftOpen, ZoomOut, ZoomIn, 
  Printer, Eye, Lock, List, Share2, Check, LogOut, Users, Home
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
  onShare?: () => void;
  isShared?: boolean;
  isOwner?: boolean;
  lockedBy?: string;
  lockedByName?: string;
  onCheckout?: () => void;
  onForceUnlock?: () => void;
  user?: any;
  onLogout?: () => void;
  onHome?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isSidebarOpen, onToggleSidebar, reportTitle, zoomLevel, 
  onSetZoom, onPrint, showSafeMargins, onToggleSafeMargins, isReadOnly,
  onShare, isShared, isOwner, lockedBy, lockedByName, onCheckout, onForceUnlock, user, onLogout, onHome
}) => {
  return (
    <header className="no-print w-full h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-[1000] sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        {onHome && (
          <button 
            onClick={onHome}
            className="p-2 text-slate-400 hover:text-[#0079C2] hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
            title="Voltar para a Página Inicial"
          >
            <Home size={22} />
          </button>
        )}
        
        {/* Botão de Toggle da Sidebar */}
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
             <span className="text-sm font-black uppercase text-slate-500 tracking-widest">
               Modo Visualização
             </span>
          </div>
        )}

        {isReadOnly && lockedBy && lockedBy !== user?.uid && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 ml-2">
             <Lock size={14} className="text-amber-500" />
             <span className="text-sm font-black uppercase text-amber-600 tracking-widest">
               Em edição por {lockedByName || 'Outro'}
             </span>
             {isOwner && onForceUnlock && (
               <button 
                 onClick={onForceUnlock}
                 className="ml-2 text-[11px] underline text-amber-700 hover:text-amber-900"
                 title="Atenção: Isso pode sobrescrever o trabalho se a pessoa ainda estiver editando."
               >
                 Forçar Desbloqueio
               </button>
             )}
          </div>
        )}

        {isReadOnly && (!lockedBy || lockedBy === user?.uid) && onCheckout && (
          <button 
            onClick={onCheckout}
            className="ml-2 flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-black uppercase tracking-widest hover:bg-emerald-600 shadow-sm transition-all"
          >
            ✏️ Iniciar Edição
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#0079C2] uppercase tracking-widest leading-none">MAG Canvas</span>
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
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${showSafeMargins ? 'bg-[#00A7E7] text-white shadow-md shadow-blue-200' : 'text-slate-500 bg-white border border-slate-100'}`}
            title="Simular Margens de Impressão (Etapa 4)"
          >
            <Eye size={16} />
            <span className="hidden lg:inline">Guias de Revisão</span>
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Status de Compartilhamento e Ações do Dono */}
        {!isReadOnly && user && (
          <div className="flex items-center gap-3 mr-4 border-r border-slate-100 pr-4">
            {/* Badge de Status Visual */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
              isShared 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {isShared ? (
                <>
                  <Users size={12} className="animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Colaborativo</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Privado</span>
                </>
              )}
            </div>

            {/* Ação de Compartilhamento (Apenas para o Dono) */}
            {isOwner && (
              <button 
                onClick={() => onShare && onShare()}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  isShared 
                    ? 'bg-white border border-rose-200 text-rose-500 hover:bg-rose-50' 
                    : 'bg-[#0079C2] text-white hover:bg-[#006098] shadow-sm'
                }`}
              >
                {isShared ? 'Tornar Privado' : 'Compartilhar com Equipe'}
              </button>
            )}
          </div>
        )}
        <button onClick={onPrint} className="bg-[#0079C2] text-white px-5 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-[#006098] transition-all text-sm font-black uppercase mr-2">
          <Printer size={16} /> PDF
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-[#006098] uppercase leading-none">{user.displayName || 'Usuário'}</span>
              <button 
                onClick={onLogout} 
                className="flex items-center gap-1 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors mt-1 group"
              >
                <LogOut size={10} className="group-hover:-translate-x-0.5 transition-transform" /> Sair
              </button>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#006098] to-[#00A7E7] flex items-center justify-center text-white text-[11px] font-black border-2 border-white shadow-sm">
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};