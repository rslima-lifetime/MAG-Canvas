
import React from 'react';
import { Undo2, Redo2, ChevronLeft } from 'lucide-react';

interface SidebarHeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  onHome: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  canUndo, canRedo, undo, redo, onHome
}) => {
  return (
    <div className="px-6 py-5 border-b bg-white shrink-0 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={onHome}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-[#0079C2] hover:text-white transition-all border border-slate-200 hover:border-[#0079C2] group shadow-sm"
          title="Voltar para Tela Inicial (Meus Projetos)"
        >
          <ChevronLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Início</span>
        </button>
        
        <div className="w-px h-8 bg-slate-100 mx-1 hidden md:block" />
        
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-[#006098] tracking-tight leading-none">MAG Canvas</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Builder Estratégico</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shadow-inner">
         <button 
           onClick={undo} 
           disabled={!canUndo} 
           className={`p-1.5 rounded-md transition-all ${canUndo ? 'text-[#006098] hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}
           title="Desfazer (Ctrl+Z)"
         >
           <Undo2 size={16} />
         </button>
         <div className="w-px h-4 bg-slate-200" />
         <button 
           onClick={redo} 
           disabled={!canRedo} 
           className={`p-1.5 rounded-md transition-all ${canRedo ? 'text-[#006098] hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}
           title="Refazer (Ctrl+Y)"
         >
           <Redo2 size={16} />
         </button>
      </div>
    </div>
  );
};
