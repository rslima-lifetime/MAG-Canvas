
import React, { useState, useRef, useEffect } from 'react';
import { PageTheme, FunnelStage } from '../../types';
import { ArrowDown, Plus, Trash2, Palette, Image as ImageIcon } from 'lucide-react';
import { resolveIconComponent } from '../../utils/icon-library';
import { IconPicker } from '../ui/IconPicker';

interface FunnelBlockProps {
  stages: FunnelStage[];
  sliceHeight?: number;
  theme?: PageTheme;
  isHighlighted?: boolean;
  activeSubItemIndex?: number | null;
  onUpdateStage?: (idx: number, updates: Partial<FunnelStage>) => void;
  onActiveBlockChange?: () => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onAddStage?: () => void;
  onRemoveStage?: (idx: number) => void;
}

const PRESET_COLORS = ['#0079C2', '#00A7E7', '#006098', '#10B981', '#F59E0B', '#EF4444', '#7C3AED', '#6366f1', '#ec4899'];

export const FunnelBlock: React.FC<FunnelBlockProps> = ({ 
  stages = [], sliceHeight = 64, theme = 'LIGHT', isHighlighted, activeSubItemIndex, onActiveBlockChange, onActiveSubItemChange, onUpdateStage, onAddStage, onRemoveStage
}) => {
  const isBlueTheme = theme === 'BLUE';
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Geometria
  const maxStages = Math.max(stages.length, 1);
  const maxWidth = 100;
  const minWidth = 25; 
  const widthStep = (maxWidth - minWidth) / maxStages;
  const totalValue = stages[0]?.value || 1;

  // Altura da fatia configurável
  const SLICE_HEIGHT = sliceHeight; 
  const ELLIPSE_HEIGHT = 16;
  const OVERLAP = ELLIPSE_HEIGHT - 4; 

  // Fecha popovers ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(null);
        setShowIconPicker(null);
      }
    };
    if (showColorPicker !== null || showIconPicker !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker, showIconPicker]);

  // Configuração dinâmica de estilos do card baseado na altura
  const getCardStyles = (h: number) => {
    if (h < 56) return { 
      padding: 'p-1.5', 
      valSize: 'text-[12px]', 
      lblSize: 'text-[7px]', 
      badgeSize: 'text-[6px]',
      gap: 'mt-0'
    };
    if (h > 90) return { 
      padding: 'p-4', 
      valSize: 'text-[24px]', 
      lblSize: 'text-[12px]', 
      badgeSize: 'text-[9px]',
      gap: 'mt-2'
    };
    return { 
      padding: 'p-2.5', 
      valSize: 'text-[16px]', 
      lblSize: 'text-[9px]', 
      badgeSize: 'text-[7px]',
      gap: 'mt-1'
    };
  };

  const cardStyle = getCardStyles(SLICE_HEIGHT);

  // Renderiza ícone dinâmico
  const renderIcon = (iconName: string, color: string) => {
    const Icon = resolveIconComponent(iconName);
    return <Icon size={SLICE_HEIGHT < 60 ? 12 : 16} style={{ color }} strokeWidth={2.5} />;
  };

  return (
    <div className="w-full flex justify-center py-4 relative group/funnel-block">
      <div className="w-full flex flex-col items-center">
        <div className="w-full flex relative px-2">
          
          {/* COLUNA 1: Gráfico do Funil */}
          <div className="w-[40%] min-w-[160px] flex flex-col items-center relative z-10 pointer-events-none shrink-0">
            {stages.map((stage, idx) => {
              const isActive = isHighlighted && activeSubItemIndex === idx;
              const topWidthPct = maxWidth - (idx * widthStep);
              const bottomWidthPct = maxWidth - ((idx + 1) * widthStep);
              const baseColor = stage.color || '#0079C2';

              return (
                <div 
                  key={`funnel-${stage.id}`}
                  className="w-full flex justify-center relative pointer-events-auto"
                  style={{ 
                    height: `${SLICE_HEIGHT}px`,
                    zIndex: maxStages - idx, // Decrescente
                    marginBottom: `-${OVERLAP}px`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActiveBlockChange?.();
                    onActiveSubItemChange?.(idx);
                  }}
                >
                  <div className="relative w-full flex flex-col items-center justify-center transition-all duration-300">
                    {/* Topo Elíptico */}
                    <div 
                      className="absolute top-0 h-[16px] rounded-[100%] z-20 transition-all duration-300"
                      style={{ 
                        backgroundColor: baseColor,
                        width: `${topWidthPct}%`,
                        top: `-${ELLIPSE_HEIGHT / 2}px`,
                        filter: isActive ? 'brightness(1.2)' : 'brightness(1.1)',
                        boxShadow: idx === 0 ? 'inset 0 -2px 5px rgba(0,0,0,0.1)' : 'none',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)'
                      }}
                    />

                    {/* Corpo Trapezoidal */}
                    <div 
                      className={`relative w-full transition-all duration-300 ${isActive ? 'filter brightness-110 drop-shadow-xl scale-105' : 'hover:filter hover:brightness-105'}`}
                      style={{
                        height: `${SLICE_HEIGHT}px`,
                        clipPath: `polygon(
                          ${(100 - topWidthPct) / 2}% 0%, 
                          ${100 - (100 - topWidthPct) / 2}% 0%, 
                          ${100 - (100 - bottomWidthPct) / 2}% 100%, 
                          ${(100 - bottomWidthPct) / 2}% 100%
                        )`,
                        background: `linear-gradient(to right, ${baseColor}, ${baseColor}dd 40%, ${baseColor} 60%, ${baseColor}aa)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-white/10 to-black/10 pointer-events-none"></div>
                    </div>

                    {/* Fundo Elíptico */}
                    <div 
                      className="absolute bottom-0 h-[16px] rounded-[100%] z-30 shadow-sm transition-all duration-300"
                      style={{ 
                        backgroundColor: baseColor,
                        width: `${bottomWidthPct}%`,
                        bottom: `-${ELLIPSE_HEIGHT / 2}px`,
                        background: `linear-gradient(to bottom, ${baseColor}, ${baseColor})`, 
                        filter: 'brightness(0.9)',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLUNA 2: Cards de Dados */}
          <div className="flex-1 flex flex-col relative z-20 pointer-events-none pl-4 min-w-0">
            {stages.map((stage, idx) => {
              const isActive = isHighlighted && activeSubItemIndex === idx;
              const isLast = idx === stages.length - 1;
              const prevValue = idx > 0 ? stages[idx - 1].value : stage.value;
              const dropOff = idx > 0 ? ((prevValue - stage.value) / prevValue) * 100 : 0;
              const overallConversion = ((stage.value / totalValue) * 100);
              const overallLoss = 100 - overallConversion;
              const baseColor = stage.color || '#0079C2';

              return (
                <div 
                  key={`card-${stage.id}`}
                  className="w-full relative flex items-center pointer-events-auto"
                  style={{
                      height: `${SLICE_HEIGHT}px`,
                      zIndex: idx + 1, // Crescente!
                      marginBottom: `-${OVERLAP}px`,
                      marginTop: isLast ? `${OVERLAP}px` : undefined 
                  }}
                  onClick={(e) => {
                      e.stopPropagation();
                      onActiveBlockChange?.();
                      onActiveSubItemChange?.(idx);
                  }}
                >
                    {/* Linha Conectora */}
                    <div 
                      className="absolute left-[-24px] -translate-y-1/2 w-[24px] h-[1px] pointer-events-none z-0 opacity-50"
                      style={{ top: isLast ? `calc(50% - ${OVERLAP}px)` : '50%' }}
                    >
                      <div className="w-full border-t border-dashed border-slate-400 relative">
                          <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full" style={{ backgroundColor: baseColor }}></div>
                          <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-slate-300"></div>
                      </div>
                    </div>

                    {/* Card */}
                    <div className={`relative w-full max-w-[240px] ${cardStyle.padding} rounded-xl border transition-all duration-300 bg-white flex flex-col justify-center ${
                        isActive 
                          ? 'shadow-lg border-[#00A7E7] scale-105 z-50 ring-2 ring-[#00A7E7]/20' 
                          : (isBlueTheme ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'border-slate-200 text-[#415364] hover:border-slate-300')
                      }`}>
                        
                        {/* Badge de Perda */}
                        {idx > 0 && (
                          <div className={`absolute -top-2 right-2 flex items-center gap-1 ${cardStyle.badgeSize} font-bold text-rose-500 bg-white border border-rose-100 px-1.5 py-0.5 rounded-full shadow-sm z-10`}>
                            <ArrowDown size={SLICE_HEIGHT < 56 ? 6 : 8} />
                            <span>{dropOff.toFixed(1)}%</span>
                          </div>
                        )}

                        <div className="flex flex-col relative z-0">
                          <div className="flex items-baseline gap-2 w-full">
                            {/* Ícone (Visualização e Trigger) */}
                            {(stage.icon || isActive) && (
                              <div className="relative shrink-0 self-center">
                                {isActive ? (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowIconPicker(showIconPicker === idx ? null : idx); }}
                                    className={`p-1 rounded-md border transition-all ${isBlueTheme ? 'border-white/20 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-50'}`}
                                  >
                                    {stage.icon ? renderIcon(stage.icon, baseColor) : <ImageIcon size={14} className="text-slate-300" />}
                                  </button>
                                ) : (
                                  stage.icon && renderIcon(stage.icon, baseColor)
                                )}
                                
                                {/* Icon Picker Popover */}
                                {isActive && showIconPicker === idx && (
                                  <div ref={pickerRef} className="absolute top-full left-0 mt-2 z-[100] w-64 shadow-xl" onClick={e => e.stopPropagation()}>
                                    <IconPicker selectedIcon={stage.icon || ''} onSelect={(icon) => { onUpdateStage?.(idx, { icon }); setShowIconPicker(null); }} />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Valor Editável */}
                            <div className="flex-1 min-w-0">
                              {isActive ? (
                                <input 
                                  type="number"
                                  value={stage.value}
                                  onChange={(e) => onUpdateStage?.(idx, { value: parseFloat(e.target.value) || 0 })}
                                  className={`w-full ${cardStyle.valSize} font-black leading-none bg-transparent outline-none border-b border-dashed border-[#00A7E7] text-[#006098]`}
                                  autoFocus
                                />
                              ) : (
                                <span className={`${cardStyle.valSize} font-black leading-none ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>
                                  {stage.value.toLocaleString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rótulo Editável */}
                          <div className={`${cardStyle.gap} w-full`}>
                            {isActive ? (
                              <input 
                                type="text"
                                value={stage.label}
                                onChange={(e) => onUpdateStage?.(idx, { label: e.target.value })}
                                className={`w-full ${cardStyle.lblSize} font-bold uppercase tracking-wide bg-transparent outline-none border-b border-dashed border-slate-300 text-slate-600`}
                                placeholder="Nome da Etapa"
                              />
                            ) : (
                              <span className={`${cardStyle.lblSize} font-bold uppercase tracking-wide leading-tight truncate block ${isBlueTheme ? 'text-blue-200' : 'text-slate-500'}`}>
                                {stage.label}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Toolbar de Edição (Cor e Excluir) */}
                        {isActive && (
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-50">
                            {onRemoveStage && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onRemoveStage(idx); }}
                                className="w-5 h-5 rounded-full shadow-md bg-rose-500 text-white flex items-center justify-center border-2 border-white transition-transform hover:scale-110 hover:bg-rose-600"
                                title="Excluir Etapa"
                              >
                                <Trash2 size={10} strokeWidth={3} />
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShowColorPicker(showColorPicker === idx ? null : idx); }}
                              className="w-5 h-5 rounded-full shadow-md border-2 border-white transition-transform hover:scale-110"
                              style={{ backgroundColor: baseColor }}
                              title="Alterar Cor"
                            />
                            {/* Color Picker Popover */}
                            {showColorPicker === idx && (
                              <div ref={pickerRef} className="absolute right-full mr-2 top-0 bg-white p-2 rounded-lg shadow-xl border border-slate-100 flex gap-1 z-[100]" onClick={e => e.stopPropagation()}>
                                {PRESET_COLORS.map(c => (
                                  <button key={c} onClick={() => { onUpdateStage?.(idx, { color: c }); setShowColorPicker(null); }} className="w-4 h-4 rounded-full hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Conversão Geral e Perda (Apenas no último item) */}
                        {isLast && (
                          <div className={`mt-1 pt-1 border-t border-slate-100 flex items-center justify-between ${cardStyle.badgeSize}`}>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className={`font-black uppercase ${isBlueTheme ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                  Conv: {overallConversion.toFixed(1)}%
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                <span className={`font-black uppercase ${isBlueTheme ? 'text-rose-300' : 'text-rose-500'}`}>
                                  Perda: {overallLoss.toFixed(1)}%
                                </span>
                            </div>
                          </div>
                        )}
                    </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão de Adicionar Etapa */}
        {isHighlighted && onAddStage && (
          <div className="w-full px-4 mt-2 mb-2 no-print">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddStage(); }}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:border-[#0079C2] hover:text-[#0079C2] hover:bg-blue-50 transition-all"
            >
              <Plus size={12} strokeWidth={3} />
              Adicionar Etapa
            </button>
          </div>
        )}
      </div>
      
      {isHighlighted && stages.length === 0 && !onAddStage && (
        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Adicione etapas ao funil via menu lateral</p>
        </div>
      )}
    </div>
  );
};
