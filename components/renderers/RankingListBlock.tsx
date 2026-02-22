
import React from 'react';
import { PageTheme, RankingItem, DesignSystem } from '../../types';
import { Trophy, Medal, Star, Crown } from 'lucide-react';
import { resolveIconComponent } from '../../utils/icon-library';

interface RankingListBlockProps {
  items: RankingItem[];
  heroIcon?: string;
  showBar?: boolean;
  theme?: PageTheme;
  designSystem?: DesignSystem;
  isHighlighted?: boolean;
  activeSubItemIndex?: number | null;
  onActiveBlockChange?: () => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdateItem?: (idx: number, updates: Partial<RankingItem>) => void;
  onRemoveItem?: (idx: number) => void;
}

export const RankingListBlock: React.FC<RankingListBlockProps> = ({
  items = [],
  heroIcon,
  showBar = true,
  theme = 'LIGHT',
  designSystem = 'STANDARD',
  isHighlighted,
  activeSubItemIndex,
  onActiveBlockChange,
  onActiveSubItemChange,
  onUpdateItem,
  onRemoveItem
}) => {
  const isBlueTheme = theme === 'BLUE';
  
  // Encontrar o maior valor para calcular a barra de progresso
  const maxValue = Math.max(...items.map(i => i.value || 0), 1);

  // Configuração Visual de Rank (Cores e Bordas)
  const getRankConfig = (rank: number) => {
    if (rank === 0) return { 
      badgeBg: 'bg-gradient-to-br from-yellow-300 to-yellow-500', 
      ring: 'ring-yellow-400', 
      text: 'text-white',
      shadow: 'shadow-yellow-200',
      icon: Crown
    }; 
    if (rank === 1) return { 
      badgeBg: 'bg-gradient-to-br from-slate-300 to-slate-400', 
      ring: 'ring-slate-300', 
      text: 'text-white',
      shadow: 'shadow-slate-200',
      icon: Medal
    }; 
    if (rank === 2) return { 
      badgeBg: 'bg-gradient-to-br from-orange-300 to-orange-500', 
      ring: 'ring-orange-300', 
      text: 'text-white',
      shadow: 'shadow-orange-200',
      icon: Medal
    };
    
    // Padrão (4º em diante)
    return { 
      badgeBg: isBlueTheme ? 'bg-[#00A7E7]' : 'bg-slate-100', 
      ring: isBlueTheme ? 'ring-white/20' : 'ring-slate-100', 
      text: isBlueTheme ? 'text-white' : 'text-slate-500',
      shadow: '',
      icon: null
    };
  };

  const HeroIconComp = heroIcon ? resolveIconComponent(heroIcon) : Trophy;

  return (
    <div className="flex w-full gap-6 relative">
      
      {/* Lista de Ranking */}
      <div className="flex-1 flex flex-col gap-3 relative z-10">
        {items.map((item, idx) => {
          const rankConfig = getRankConfig(idx);
          const isActive = isHighlighted && activeSubItemIndex === idx;
          const percentage = ((item.value || 0) / maxValue) * 100;
          const RankIcon = rankConfig.icon;

          // Se tiver imagem, layout expandido. Se não, layout compacto.
          const hasImage = !!item.image;

          return (
            <div 
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onActiveBlockChange?.();
                onActiveSubItemChange?.(idx);
              }}
              className={`relative flex items-center justify-between rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
                isActive 
                  ? 'bg-white shadow-xl scale-[1.02] border-[#00A7E7] ring-4 ring-blue-500/10 z-20' 
                  : (isBlueTheme ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md')
              } ${hasImage ? 'py-3 pr-6 pl-3 min-h-[80px]' : 'p-3 min-h-[50px]'}`}
            >
              {/* Barra de Progresso (Background Sutil) */}
              {showBar && (
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out z-0 opacity-20 ${
                    isBlueTheme ? 'bg-white' : 'bg-blue-50'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="flex items-center gap-4 relative z-10 w-full">
                
                {/* 1. Coluna Esquerda: Rank + Avatar */}
                <div className="relative shrink-0">
                  {hasImage ? (
                    <div className={`relative w-14 h-14 rounded-full p-0.5 bg-white shadow-sm ring-2 ${rankConfig.ring}`}>
                      <img 
                        src={item.image} 
                        alt="" 
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {/* Badge de Rank Flutuante */}
                      <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white ${rankConfig.badgeBg} ${rankConfig.text}`}>
                        {idx + 1}
                      </div>
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[12px] shadow-sm border ${rankConfig.badgeBg} ${rankConfig.text} border-transparent`}>
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* 2. Coluna Central: Nome, Cargo e Medalha */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <input 
                        type="text"
                        value={item.label}
                        onChange={(e) => onUpdateItem?.(idx, { label: e.target.value })}
                        className="bg-transparent outline-none font-bold text-[13px] w-full border-b border-blue-200 text-[#006098] uppercase tracking-wide"
                        placeholder="Nome"
                        autoFocus
                      />
                    ) : (
                      <span className={`font-bold text-[13px] uppercase tracking-wide truncate leading-tight ${isBlueTheme ? 'text-white' : 'text-[#415364]'}`}>
                        {item.label}
                      </span>
                    )}
                    {/* Ícone de Ouro/Prata/Bronze decorativo ao lado do nome */}
                    {RankIcon && (
                      <RankIcon size={14} className={idx === 0 ? 'text-yellow-500 fill-yellow-500' : (idx === 1 ? 'text-slate-400 fill-slate-400' : 'text-orange-400 fill-orange-400')} />
                    )}
                  </div>

                  {/* Subtítulo / Cargo */}
                  {isActive ? (
                    <input 
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => onUpdateItem?.(idx, { description: e.target.value })}
                      className="bg-transparent outline-none font-medium text-[10px] w-full border-b border-blue-100 text-slate-400 mt-0.5"
                      placeholder="Cargo / Descrição"
                    />
                  ) : (
                    item.description && (
                      <span className={`text-[10px] font-medium truncate leading-tight mt-0.5 ${isBlueTheme ? 'text-blue-100/70' : 'text-slate-400'}`}>
                        {item.description}
                      </span>
                    )
                  )}
                  
                  {/* Barra de progresso mini visual (opcional) */}
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden max-w-[100px] opacity-60">
                     <div className={`h-full ${idx < 3 ? 'bg-gradient-to-r from-[#00A7E7] to-[#0079C2]' : 'bg-slate-300'}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>

                {/* 3. Coluna Direita: Valor em Destaque */}
                <div className="flex flex-col items-end justify-center shrink-0 pl-4 border-l border-slate-100/50">
                  {isActive ? (
                    <div className="flex flex-col items-end gap-1">
                       <input 
                          type="text"
                          value={item.formattedValue || item.value}
                          onChange={(e) => onUpdateItem?.(idx, { formattedValue: e.target.value })}
                          className="bg-transparent outline-none font-black text-[16px] text-right w-24 border-b border-blue-200 text-[#006098]"
                          placeholder="Texto"
                        />
                        <input 
                          type="number"
                          value={item.value}
                          onChange={(e) => onUpdateItem?.(idx, { value: parseFloat(e.target.value) || 0 })}
                          className="bg-transparent outline-none font-medium text-[9px] text-right w-16 text-slate-400"
                          placeholder="Numérico"
                        />
                    </div>
                  ) : (
                    <>
                      <span className={`font-black text-[18px] leading-none ${isBlueTheme ? 'text-[#00A7E7] drop-shadow-sm' : 'text-[#0079C2]'}`}>
                        {item.formattedValue || item.value}
                      </span>
                      {idx === 0 && <span className="text-[7px] font-bold uppercase text-emerald-500 tracking-widest mt-0.5">Líder</span>}
                    </>
                  )}
                </div>
              </div>

              {/* Botão Remover (Hover) */}
              {isActive && onRemoveItem && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveItem(idx); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 border-2 border-white"
                >
                  <span className="text-[12px] font-bold">×</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Hero Icon (Opcional - Lado Direito - Apenas se não for mobile) */}
      {heroIcon && (
        <div className={`hidden lg:flex flex-col items-center justify-start pt-4 min-w-[100px] relative`}>
           <div className={`w-24 h-24 rounded-3xl rotate-6 flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(0,121,194,0.4)] transition-transform hover:rotate-0 duration-500 ${
             isBlueTheme ? 'bg-white/10 backdrop-blur border border-white/20' : 'bg-gradient-to-br from-[#00A7E7] to-[#006098]'
           }`}>
              <HeroIconComp size={48} className="text-white drop-shadow-lg" />
           </div>
           
           <div className="mt-6 text-center space-y-1">
              <div className={`w-16 h-1 rounded-full mx-auto ${isBlueTheme ? 'bg-white/20' : 'bg-slate-200'}`} />
              <div className={`w-10 h-1 rounded-full mx-auto ${isBlueTheme ? 'bg-white/10' : 'bg-slate-100'}`} />
           </div>
        </div>
      )}
    </div>
  );
};
