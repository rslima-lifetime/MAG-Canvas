import React, { useState, useRef, useEffect } from 'react';
import { PageTheme, InfographicListItem } from '../../types';
import { Plus, Trash2, LayoutGrid, List, Award, Palette, Tag, Edit3, ArrowLeft, ArrowRight, Eye, EyeOff, ChevronUp, Maximize2, Bold, Italic, Underline, Image as ImageIcon, GalleryHorizontal, Upload, Maximize, Circle as CircleIcon, Square as SquareIcon } from 'lucide-react';
import { resolveIconComponent } from '../../utils/icon-library';
import { IconPicker } from '../ui/IconPicker';

interface InfographicListBlockProps {
  items: InfographicListItem[];
  layout: 'GRID' | 'LIST' | 'FEATURE' | 'GALLERY';
  config?: any;
  theme?: PageTheme;
  isHighlighted?: boolean;
  activeSubItemIndex?: number | null;
  onActiveBlockChange?: () => void;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdateItem?: (idx: number, updates: Partial<InfographicListItem>) => void;
  onUpdateLayout?: (layout: 'GRID' | 'LIST' | 'FEATURE' | 'GALLERY') => void;
  onReorderItem?: (oldIdx: number, newIdx: number) => void;
  onRemoveItem?: (idx: number) => void;
  onAddItem?: () => void;
  onUpdate?: (updates: any) => void;
}

const COLOR_PRESETS = ['#0079C2', '#00A7E7', '#006098', '#10B981', '#F59E0B', '#EF4444', '#7C3AED'];
const TAG_COLOR_PRESETS = ['#f1f5f9', '#dcfce7', '#fee2e2', '#fef9c3', '#e0f2fe', '#f5f3ff'];

export const InfographicListBlock: React.FC<InfographicListBlockProps> = ({
  items = [],
  layout = 'GRID',
  config = {} as any,
  theme = 'LIGHT',
  isHighlighted,
  activeSubItemIndex,
  onActiveBlockChange,
  onActiveSubItemChange,
  onUpdateItem,
  onUpdateLayout,
  onReorderItem,
  onRemoveItem,
  onAddItem,
  onUpdate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const [showPickerFor, setShowPickerFor] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<'COLOR' | 'TAG' | 'WIDTH' | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const toolbarMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textScale = config.textScale || 'MD';
  const bodyWeight = config.bodyWeight || 'medium';
  const colorizeTitle = config.colorizeTitle !== false;
  const showDescription = config.showDescription !== false;
  const imageStyle = config.imageStyle || 'SQUARE'; // 'SQUARE' | 'ROUND'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPickerFor(null);
      }
      if (toolbarMenuRef.current && !toolbarMenuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderIcon = (iconName: string, color?: string, size: number = 18) => {
    const IconComponent = resolveIconComponent(iconName);
    return <IconComponent size={size} strokeWidth={2.5} style={{ color: color || (isBlueTheme ? '#00A7E7' : '#0079C2') }} />;
  };

  const getColSpan = (width?: string) => {
    if (layout === 'LIST' || layout === 'FEATURE') return 'col-span-12';
    switch (width) {
      case '25': return 'col-span-3';
      case '33': return 'col-span-4';
      case '50': return 'col-span-6';
      case '100': return 'col-span-12';
      default: return 'col-span-6';
    }
  };

  const handleMoveItem = (idx: number, direction: 'LEFT' | 'RIGHT') => {
    const targetIdx = direction === 'LEFT' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    onReorderItem?.(idx, targetIdx);
  };

  const getFontSize = (baseSize: string, feature: boolean) => {
    const scales: Record<string, any> = {
      SM: { title: 'text-[9.5px]', body: 'text-[9.5px]', tag: 'text-[6px]', featureTitle: 'text-[13px]', featureBody: 'text-[11px]' },
      MD: { title: 'text-[10.5px]', body: 'text-[10.5px]', tag: 'text-[7px]', featureTitle: 'text-[15px]', featureBody: 'text-[12px]' },
      LG: { title: 'text-[12.5px]', body: 'text-[12.5px]', tag: 'text-[8px]', featureTitle: 'text-[17px]', featureBody: 'text-[14px]' },
    };
    const s = scales[textScale] || scales.MD;
    if (feature) return baseSize === 'title' ? s.featureTitle : s.featureBody;
    if (baseSize === 'tag') return s.tag;
    return baseSize === 'title' ? s.title : s.body;
  };

  const handleFormatting = (e: React.MouseEvent, command: string) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand(command, false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateItem?.(idx, { imageUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const cycleFit = (idx: number, currentFit?: string) => {
    const fits: ('cover' | 'contain' | 'fill')[] = ['cover', 'contain', 'fill'];
    const currentIdx = fits.indexOf((currentFit as any) || 'cover');
    const nextIdx = (currentIdx + 1) % fits.length;
    onUpdateItem?.(idx, { imageFit: fits[nextIdx] });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items_cb = e.clipboardData.items;
    for (let i = 0; i < items_cb.length; i++) {
        if (items_cb[i].type.indexOf('image') !== -1 && activeSubItemIndex !== null) {
            const blob = items_cb[i].getAsFile();
            if (blob) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result && typeof activeSubItemIndex === 'number') {
                        onUpdateItem?.(activeSubItemIndex, { imageUrl: event.target.result as string });
                    }
                };
                reader.readAsDataURL(blob);
            }
            return;
        }
    }

    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className={`grid grid-cols-12 gap-3 w-full py-4 relative`}>
        {items.map((item, idx) => {
          const isActive = activeSubItemIndex === idx && isHighlighted;
          const isFeature = layout === 'FEATURE';
          const isGallery = layout === 'GALLERY';
          const itemColor = item.color || (isBlueTheme ? '#00A7E7' : '#0079C2');
          const tagColor = item.tagColor || (isBlueTheme ? 'rgba(255,255,255,0.1)' : '#f1f5f9');
          
          const isNarrow = (item.itemWidth === '25' || item.itemWidth === '33') && !isFeature;
          const isPickingIcon = showPickerFor === idx;
          const isRound = imageStyle === 'ROUND';

          return (
            <div 
              key={item.id}
              onClick={(e) => { 
                if (isActive) return;
                e.stopPropagation(); 
                if (onActiveBlockChange) onActiveBlockChange();
                onActiveSubItemChange?.(idx); 
              }}
              className={`group/card flex transition-all duration-300 cursor-pointer relative ${getColSpan(item.itemWidth)} ${
                isGallery || isRound ? 'flex-col items-center text-center' : 'flex-row items-start gap-3'
              } ${
                isActive 
                  ? 'bg-white shadow-lg border-[#0079C2] z-[900] ring-4 ring-blue-500/10' 
                  : (isBlueTheme ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-slate-200')
              } border rounded-xl ${layout === 'LIST' ? 'border-l-4' : ''} ${isFeature ? 'p-6 md:p-8' : (isGallery || isRound ? 'p-4' : 'p-3')} ${!showDescription && !isGallery && !isRound ? 'items-center min-h-[50px]' : ''} ${isPickingIcon ? 'z-[1000]' : ''}`}
              style={layout === 'LIST' ? { borderLeftColor: itemColor } : {}}
            >
              <div className={`relative shrink-0 ${isGallery && !isRound ? 'w-full aspect-video overflow-hidden bg-slate-50 mb-3' : (isRound ? 'mb-3' : '')}`}>
                <div 
                  onClick={(e) => {
                    if (isHighlighted) {
                      e.stopPropagation();
                      onActiveSubItemChange?.(idx);
                      if (!isGallery) setShowPickerFor(isPickingIcon ? null : idx);
                    }
                  }}
                  className={`flex items-center justify-center transition-all relative overflow-hidden ${
                    isGallery && !isRound 
                      ? 'w-full h-full' 
                      : (isActive 
                          ? 'ring-2 ring-[#00A7E7] shadow-inner bg-blue-50 cursor-pointer hover:bg-blue-100' 
                          : (isBlueTheme ? 'bg-white/10' : 'bg-slate-50'))
                  } ${isRound ? 'w-24 h-24 md:w-28 md:h-28 rounded-full ring-4 ring-offset-2 ring-blue-400/20' : (isFeature ? 'w-14 h-14 md:w-16 md:h-16 rounded-lg' : (isGallery ? '' : 'w-9 h-9 rounded-lg'))}`}
                  style={isGallery && !isRound ? { backgroundColor: item.imageUrl ? '#fff' : (itemColor + '10') } : (isActive ? {} : { 
                    borderColor: itemColor + '30', 
                    backgroundColor: item.imageUrl ? '#fff' : (itemColor + '10') 
                  })}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className={`w-full h-full object-${isRound ? 'cover' : item.imageFit || (isGallery ? 'cover' : 'contain')} ${!isGallery && !isRound ? 'p-1' : ''}`} />
                  ) : (
                    renderIcon(item.icon, itemColor, isFeature || isGallery || isRound ? 28 : 16)
                  )}
                  
                  {isActive && !isPickingIcon && (
                    <div className="absolute bottom-0 right-0 bg-[#0079C2] text-white rounded-full p-1 shadow-md border border-white z-10">
                        <Edit3 size={isFeature || isGallery || isRound ? 10 : 7} />
                    </div>
                  )}

                  {/* Barra de ferramentas flutuante DIRETA NO CARD para o modo Gallery ou Imagem Grande */}
                  {isActive && (isGallery || isRound) && (
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start animate-in fade-in slide-in-from-top-1 duration-300 no-print" onClick={e => e.stopPropagation()}>
                       <div className="flex gap-1">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-slate-200 text-[#0079C2] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                            title="Upload de Imagem"
                          >
                            <Upload size={14} strokeWidth={2.5} />
                          </button>
                          {!isRound && (
                            <button 
                              onClick={() => cycleFit(idx, item.imageFit)}
                              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-slate-200 text-[#0079C2] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                              title={`Ajuste: ${item.imageFit || 'Padrão'}`}
                            >
                              <Maximize size={14} strokeWidth={2.5} />
                            </button>
                          )}
                       </div>
                       
                       {item.imageUrl && (
                          <button 
                            onClick={() => onUpdateItem?.(idx, { imageUrl: undefined })}
                            className="w-8 h-8 rounded-full bg-rose-500/90 backdrop-blur border border-white text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                            title="Remover Imagem"
                          >
                            <Trash2 size={14} />
                          </button>
                       )}
                       
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, idx)} />
                    </div>
                  )}
                </div>

                {isHighlighted && isPickingIcon && (
                  <div 
                    ref={pickerRef}
                    className="absolute top-full left-0 mt-2 z-[2100] w-72 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconPicker 
                      selectedIcon={item.icon} 
                      onSelect={(newIcon) => {
                        onUpdateItem?.(idx, { icon: newIcon, imageUrl: undefined });
                        setShowPickerFor(null);
                      }} 
                    />
                  </div>
                )}
              </div>
              
              <div className={`flex-1 flex flex-col min-w-0 ${isGallery && !isRound ? 'p-2.5' : ''} ${!showDescription && !isGallery && !isRound ? 'justify-center' : ''}`}>
                <div className={`flex ${isNarrow || isRound ? 'flex-col items-center gap-1' : 'flex-row items-center justify-between gap-2'} ${isFeature || isGallery || isRound ? 'mb-1.5' : (showDescription ? 'mb-1.5' : 'mb-0')}`}>
                  {item.tag && (isNarrow || isRound) && (
                    <span 
                      contentEditable={isActive}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateItem?.(idx, { tag: e.currentTarget.textContent || '' })}
                      onClick={(e) => isActive && e.stopPropagation()}
                      className={`shrink-0 font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mb-0.5 max-w-full truncate outline-none ${isActive ? 'cursor-text' : ''} ${getFontSize('tag', false)}`}
                      style={{ 
                        backgroundColor: tagColor, 
                        borderColor: isBlueTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: isBlueTheme ? '#fff' : '#415364' 
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                  
                  <h4 
                    contentEditable={isActive}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateItem?.(idx, { title: e.currentTarget.textContent || '' })}
                    onClick={(e) => isActive && e.stopPropagation()}
                    onPaste={handlePaste}
                    className={`font-black uppercase tracking-tight outline-none w-full px-0.5 rounded leading-tight flex items-center min-h-[16px] ${isActive ? 'bg-blue-50/10 cursor-text' : ''} ${isGallery || isRound ? 'justify-center ' : ''} ${getFontSize('title', isFeature || isGallery || isRound)}`}
                    style={{ 
                      color: (colorizeTitle && !isActive) ? itemColor : (isBlueTheme ? '#fff' : '#006098')
                    }}
                  >
                    {item.title}
                  </h4>

                  {item.tag && !isNarrow && !isRound && (
                    <span 
                      contentEditable={isActive}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateItem?.(idx, { tag: e.currentTarget.textContent || '' })}
                      onClick={(e) => isActive && e.stopPropagation()}
                      className={`shrink-0 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border max-w-[100px] truncate outline-none ${isActive ? 'cursor-text' : ''} ${isFeature || isGallery ? 'text-[8px] -translate-y-0.5' : (getFontSize('tag', false) + ' -translate-y-[2px]')}`}
                      style={{ 
                        backgroundColor: tagColor, 
                        borderColor: isBlueTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: isBlueTheme ? '#fff' : '#415364' 
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>

                {showDescription && (
                  <p 
                    contentEditable={isActive}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateItem?.(idx, { description: e.currentTarget.innerHTML || '' })}
                    onClick={(e) => isActive && e.stopPropagation()}
                    className={`leading-snug outline-none w-full px-0.5 rounded break-words ${isBlueTheme ? 'text-blue-100' : 'text-slate-600'} ${isActive ? 'bg-blue-50/10 cursor-text' : ''} ${getFontSize('body', isFeature || isGallery || isRound)} ${bodyWeight === 'bold' ? 'font-bold' : 'font-medium'}`}
                    dangerouslySetInnerHTML={{ __html: item.description || '' }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {isHighlighted && onAddItem && (
          <div className={`${getColSpan('50')} p-1.5`}>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddItem(); }}
              className={`w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[0.98] active:scale-95 ${
                isBlueTheme 
                  ? 'border-white/20 text-blue-200 hover:bg-white/5' 
                  : 'border-slate-200 text-slate-400 hover:border-[#0079C2] hover:text-[#0079C2] hover:bg-blue-50'
              }`}
            >
              <Plus size={14} strokeWidth={3} />
              <span className="text-[9px] font-black uppercase tracking-widest">Novo</span>
            </button>
          </div>
        )}
      </div>

      {isHighlighted && (
        <div 
          ref={toolbarMenuRef}
          className="absolute -bottom-12 left-0 z-[350] flex items-center gap-1 bg-white shadow-2xl border border-slate-200 rounded-full p-1.5 animate-in fade-in slide-in-from-top-2 duration-300 no-print"
        >
          {activeSubItemIndex !== null && activeSubItemIndex !== undefined && (
            <>
              <div className="flex items-center bg-slate-50 rounded-full px-1 py-0.5 border border-slate-100 mr-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleMoveItem(activeSubItemIndex!, 'LEFT'); }}
                  disabled={activeSubItemIndex === 0}
                  className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === 0 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
                >
                  <ArrowLeft size={14} strokeWidth={3} />
                </button>
                <span className="text-[8px] font-black text-slate-300 mx-1 px-1">{activeSubItemIndex + 1}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleMoveItem(activeSubItemIndex!, 'RIGHT'); }}
                  disabled={activeSubItemIndex === items.length - 1}
                  className={`p-1.5 rounded-full transition-all ${activeSubItemIndex === items.length - 1 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:text-[#0079C2] shadow-sm'}`}
                >
                  <ArrowRight size={14} strokeWidth={3} />
                </button>
              </div>

              <div className="flex items-center gap-0.5 pr-1 border-r border-slate-100 mr-1">
                <button 
                  onMouseDown={(e) => handleFormatting(e, 'bold')}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Negrito"
                >
                  <Bold size={14} />
                </button>
                <button 
                  onMouseDown={(e) => handleFormatting(e, 'italic')}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Itálico"
                >
                  <Italic size={14} />
                </button>
                <button 
                  onMouseDown={(e) => handleFormatting(e, 'underline')}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Sublinhado"
                >
                  <Underline size={14} />
                </button>
              </div>
            </>
          )}

          <div className="flex items-center gap-1 pr-1 border-r border-slate-100">
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdate?.({ showDescription: !showDescription }); }}
              className={`p-1.5 rounded-lg transition-all ${showDescription ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Alternar Descrições"
            >
              {showDescription ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            
            <div className="w-px h-4 bg-slate-100 mx-1" />
            
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateLayout?.('GRID'); }}
              className={`p-1.5 rounded-lg transition-all ${layout === 'GRID' ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Grade"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateLayout?.('LIST'); }}
              className={`p-1.5 rounded-lg transition-all ${layout === 'LIST' ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Linear"
            >
              <List size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateLayout?.('FEATURE'); }}
              className={`p-1.5 rounded-lg transition-all ${layout === 'FEATURE' ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Destaque Único"
            >
              <Award size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateLayout?.('GALLERY'); }}
              className={`p-1.5 rounded-lg transition-all ${layout === 'GALLERY' ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Galeria de Fotos"
            >
              <GalleryHorizontal size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1 pr-1 border-r border-slate-100">
             <button 
                onClick={(e) => { e.stopPropagation(); onUpdate?.({ imageStyle: imageStyle === 'ROUND' ? 'SQUARE' : 'ROUND' }); }}
                className={`p-1.5 rounded-lg transition-all ${imageStyle === 'ROUND' ? 'text-[#0079C2] bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
                title="Mudar estilo da imagem (Perfil vs Produto)"
              >
                {imageStyle === 'ROUND' ? <CircleIcon size={16} /> : <SquareIcon size={16} />}
              </button>
          </div>

          {activeSubItemIndex !== null && activeSubItemIndex !== undefined && (
            <div className="flex items-center gap-1 pl-1">
              {(layout === 'GRID' || layout === 'GALLERY') && (
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'WIDTH' ? null : 'WIDTH'); }}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all font-black text-[9px] border ${activeMenu === 'WIDTH' ? 'bg-[#0079C2] border-[#0079C2] text-white' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                  >
                    <Maximize2 size={12} />
                    {items[activeSubItemIndex]?.itemWidth || '50'}%
                  </button>
                  {activeMenu === 'WIDTH' && (
                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 rounded-xl p-1 flex flex-col gap-0.5 min-w-[80px] animate-in fade-in slide-in-from-top-2 z-[610]">
                       {['25', '33', '50', '100'].map(w => (
                         <button 
                            key={w} 
                            onClick={(e) => { e.stopPropagation(); onUpdateItem?.(activeSubItemIndex!, { itemWidth: w as any }); setActiveMenu(null); }}
                            className={`px-3 py-2 text-[10px] font-black rounded-lg transition-colors text-left ${items[activeSubItemIndex!].itemWidth === w ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-500 hover:bg-slate-50'}`}
                         >
                           {w}%
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'COLOR' ? null : 'COLOR'); }}
                  className={`p-1.5 rounded-full border-2 transition-all ${activeMenu === 'COLOR' ? 'scale-110 shadow-lg border-[#0079C2]' : 'border-white shadow-sm'}`}
                  style={{ backgroundColor: items[activeSubItemIndex!].color || '#0079C2' }}
                >
                  <Palette size={14} className="text-white drop-shadow-sm" />
                </button>
                {activeMenu === 'COLOR' && (
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 rounded-2xl p-2 grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 min-w-[120px] z-[610]">
                    {COLOR_PRESETS.map(c => (
                      <button key={c} onClick={(e) => { e.stopPropagation(); onUpdateItem?.(activeSubItemIndex!, { color: c }); setActiveMenu(null); }} className="w-6 h-6 rounded-full hover:scale-125 transition-transform shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'TAG' ? null : 'TAG'); }}
                  className={`p-1.5 rounded-full border transition-all ${activeMenu === 'TAG' ? 'bg-blue-50 text-[#0079C2] border-[#0079C2]' : 'text-slate-400 bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}
                >
                  <Tag size={14} />
                </button>
                {activeMenu === 'TAG' && (
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 rounded-2xl p-2 grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 min-w-110px] z-[610]">
                    {TAG_COLOR_PRESETS.map(c => (
                      <button key={c} onClick={(e) => { e.stopPropagation(); onUpdateItem?.(activeSubItemIndex!, { tagColor: c }); setActiveMenu(null); }} className="w-6 h-6 rounded-full border hover:scale-125 transition-transform shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-slate-100 mx-1" />

              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveItem?.(activeSubItemIndex!); }}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};