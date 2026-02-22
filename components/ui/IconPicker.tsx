import React, { useState, useMemo } from 'react';
import { Search, X, Grid, Briefcase, BarChart3, Users, Cpu, Settings, DollarSign, Clock, Layout } from 'lucide-react';
import { ICON_CATEGORIES, resolveIconComponent } from '../../utils/icon-library';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

const TABS = [
  { id: 'ALL', label: 'Todos', icon: Grid },
  { id: 'STRATEGY', label: 'Estratégia', icon: Briefcase },
  { id: 'DATA', label: 'Dados', icon: BarChart3 },
  { id: 'PEOPLE', label: 'Pessoas', icon: Users },
  { id: 'TECH', label: 'Tech', icon: Cpu },
  { id: 'OPERATIONS', label: 'Ops', icon: Settings },
  { id: 'FINANCE', label: 'Finanças', icon: DollarSign },
  { id: 'TIME', label: 'Tempo', icon: Clock },
  { id: 'INTERFACE', label: 'UI', icon: Layout },
];

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect }) => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    let icons: string[] = [];

    if (activeTab === 'ALL') {
      icons = Object.values(ICON_CATEGORIES).flat();
      // Remove duplicates
      icons = Array.from(new Set(icons));
    } else {
      icons = (ICON_CATEGORIES as any)[activeTab] || [];
    }

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      icons = icons.filter(icon => icon.toLowerCase().includes(lowerTerm));
    }

    return icons;
  }, [activeTab, searchTerm]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[280px]">
      {/* Header e Busca */}
      <div className="p-2 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar ícone (ex: user, chart, goal)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-[10px] font-medium border rounded-lg outline-none focus:border-[#0079C2] focus:ring-1 focus:ring-blue-100 bg-white"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Abas de Categoria */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100 bg-white">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 text-[9px] font-black uppercase tracking-tight whitespace-nowrap transition-colors border-b-2 ${
                isActive 
                  ? 'text-[#0079C2] border-[#0079C2] bg-blue-50/30' 
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={10} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid de Ícones */}
      <div className="p-2 h-48 overflow-y-auto custom-scrollbar bg-slate-50/30">
        {filteredIcons.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Search size={24} className="mb-2 opacity-20" />
            <span className="text-[10px] font-medium">Nenhum ícone encontrado</span>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1.5">
            {filteredIcons.map(iconName => {
              const IconComp = resolveIconComponent(iconName);
              const isSelected = selectedIcon === iconName;
              
              return (
                <button
                  key={iconName}
                  onClick={() => onSelect(iconName)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all hover:scale-110 active:scale-95 group ${
                    isSelected 
                      ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-[#0079C2]'
                  }`}
                  title={iconName}
                >
                  <IconComp size={16} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};