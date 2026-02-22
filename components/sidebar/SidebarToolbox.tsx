import React, { useState } from 'react';
import { Hash, Type, BarChart3, Table as TableIcon, GitCommitHorizontal, History, Grid3X3, Target, LayoutList, Calendar, BookOpen, Timer, Trophy, Image as ImageIcon, Flag, Filter, ShieldAlert, Kanban, ArrowLeftRight } from 'lucide-react';
import { BlockType } from '../../types';

interface SidebarToolboxProps {
  onAddBlock: (type: BlockType) => void;
}

export const SidebarToolbox: React.FC<SidebarToolboxProps> = ({ onAddBlock }) => {
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
    <div className="p-4 grid grid-cols-4 gap-2 animate-in slide-in-from-top-1 duration-200">
      {tools.map(comp => (
        <button 
          key={comp.type} 
          onClick={() => onAddBlock(comp.type as BlockType)} 
          className="flex flex-col items-center justify-center p-3 bg-white border rounded-xl hover:border-[#0079C2] hover:bg-blue-50 transition-all shadow-sm active:scale-95 group"
        >
          <comp.icon size={18} className="text-[#0079C2] group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black mt-1.5 uppercase tracking-tighter text-slate-500 group-hover:text-[#006098]">{comp.label}</span>
        </button>
      ))}
    </div>
  );
};