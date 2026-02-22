import React, { useState, useRef, useEffect } from 'react';
import { PageTheme, DesignSystem } from '../../types';
import { AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, Layout, Type, Image as ImageIcon, X } from 'lucide-react';
import { resolveIconComponent } from '../../utils/icon-library';
import { IconPicker } from '../ui/IconPicker';

interface SectionBlockProps {
  title: string;
  subtitle?: string;
  config: any;
  theme: PageTheme;
  designSystem?: DesignSystem;
  isHighlighted?: boolean;
  onUpdateTitle: (title: string) => void;
  onUpdateSubtitle: (subtitle: string) => void;
  onUpdateConfig: (configUpdates: any) => void;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({ 
  title, subtitle, config, theme, designSystem = 'STANDARD', isHighlighted, onUpdateTitle, onUpdateSubtitle, onUpdateConfig
}) => {
  const isBlueTheme = theme === 'BLUE';
  const isFuture = designSystem === 'FUTURE';
  const [showIconPicker, setShowIconPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const showTitle = config.showTitle !== false;
  const showSubtitle = config.showSubtitle !== false;
  const align = config.align || 'LEFT';
  const icon = config.icon || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    };
    if (showIconPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showIconPicker]);

  const handlePastePlain = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const renderIcon = (iconName: string, size: number) => {
    const IconComponent = resolveIconComponent(iconName);
    return <IconComponent size={size} />;
  };

  const toggleIconVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (icon) {
      onUpdateConfig({ icon: null });
      setShowIconPicker(false);
    } else {
      onUpdateConfig({ icon: 'Star' });
    }
  };

  if (!showTitle && !showSubtitle && !isHighlighted) {
    return <div className="hidden print:hidden" />;
  }

  if (!showTitle && !showSubtitle && isHighlighted) {
    return (
      <div className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer group relative">
        <span className="text-[10px] font-black uppercase text-slate-400">Seção Oculta</span>
        <span className="text-[8px] font-medium text-slate-400">Clique para configurar visualização</span>
        
        <div className="absolute -top-10 bg-white shadow-xl rounded-full p-1 flex gap-1 z-[350]">
           <button onClick={(e) => {e.stopPropagation(); onUpdateConfig({ showTitle: true }); }} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-500" title="Exibir Título"><Type size={14} /></button>
           <button onClick={(e) => {e.stopPropagation(); onUpdateConfig({ showSubtitle: true }); }} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-500" title="Exibir Subtítulo"><Layout size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full relative transition-all flex flex-col group/sec ${isFuture ? 'pt-2 pb-4' : ''} ${isHighlighted ? 'z-50' : ''}`}>
      
      {isHighlighted && (
        <div className="absolute -top-14 left-0 z-[350] flex items-center gap-1 bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-full p-1 animate-in slide-in-from-bottom-2 duration-200 no-print">
          <div className="flex bg-slate-100 rounded-full p-0.5">
            <button onClick={() => onUpdateConfig({ align: 'LEFT' })} className={`p-1.5 rounded-full transition-all ${align === 'LEFT' ? 'bg-white shadow text-[#0079C2]' : 'text-slate-400 hover:text-slate-600'}`}><AlignLeft size={12} /></button>
            <button onClick={() => onUpdateConfig({ align: 'CENTER' })} className={`p-1.5 rounded-full transition-all ${align === 'CENTER' ? 'bg-white shadow text-[#0079C2]' : 'text-slate-400 hover:text-slate-600'}`}><AlignCenter size={12} /></button>
            <button onClick={() => onUpdateConfig({ align: 'RIGHT' })} className={`p-1.5 rounded-full transition-all ${align === 'RIGHT' ? 'bg-white shadow text-[#0079C2]' : 'text-slate-400 hover:text-slate-600'}`}><AlignRight size={12} /></button>
          </div>
          <div className="w-[1px] h-4 bg-slate-200 mx-1" />
          <button onClick={() => onUpdateConfig({ showTitle: !showTitle })} className={`p-1.5 rounded-full transition-all ${showTitle ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-400 hover:bg-slate-50'}`} title="Alternar Título">
            {showTitle ? <Type size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={() => onUpdateConfig({ showSubtitle: !showSubtitle })} className={`p-1.5 rounded-full transition-all ${showSubtitle ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-400 hover:bg-slate-50'}`} title="Alternar Subtítulo">
            {showSubtitle ? <Layout size={14} /> : <EyeOff size={14} />}
          </button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1" />
          <button 
            onClick={toggleIconVisibility} 
            className={`p-1.5 rounded-full transition-all ${icon ? 'bg-blue-50 text-[#0079C2]' : 'text-slate-400 hover:bg-slate-50'}`} 
            title={icon ? "Remover Ícone" : "Adicionar Ícone"}
          >
            <ImageIcon size={14} />
          </button>
        </div>
      )}

      {isFuture ? (
        <div className={`flex flex-col ${align === 'CENTER' ? 'items-center' : (align === 'RIGHT' ? 'items-end' : 'items-start')}`}>
          <div className={`flex items-center w-full ${align === 'CENTER' ? 'justify-center' : (align === 'RIGHT' ? 'justify-end' : 'justify-start')}`}>
             {showTitle && (
               <div className={`flex items-center px-6 py-2 rounded-lg relative overflow-visible shadow-md z-10 ${isBlueTheme ? 'bg-white text-[#006098]' : 'bg-[#006098] text-white'}`}>
                  {icon && (
                    <div className="mr-3 relative group/icon shrink-0">
                      <button 
                        onClick={(e) => {
                          if (isHighlighted) {
                            e.stopPropagation();
                            setShowIconPicker(!showIconPicker);
                          }
                        }}
                        className={`transition-transform ${isHighlighted ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
                      >
                        {renderIcon(icon, 14)}
                      </button>
                      
                      {isHighlighted && showIconPicker && (
                        <div ref={pickerRef} className="absolute top-full left-0 mt-2 z-[500] w-64 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                          <IconPicker selectedIcon={icon} onSelect={(newIcon) => { onUpdateConfig({ icon: newIcon }); setShowIconPicker(false); }} />
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col ${align === 'CENTER' ? 'items-center' : (align === 'RIGHT' ? 'items-end' : 'items-start')}`}>
                    <h2 
                      contentEditable={isHighlighted}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onUpdateTitle(e.currentTarget.innerText || "")}
                      onPaste={handlePastePlain}
                      onClick={(e) => isHighlighted && e.stopPropagation()}
                      className={`text-[12px] font-black uppercase tracking-[0.2em] outline-none whitespace-nowrap min-w-[80px] ${isHighlighted ? 'ring-1 ring-blue-400/30 px-2' : ''}`}
                    >
                      {title || "Setor de Dados"}
                    </h2>
                    {showSubtitle && subtitle && (
                      <p 
                        contentEditable={isHighlighted}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onUpdateSubtitle(e.currentTarget.innerText || "")}
                        onPaste={handlePastePlain}
                        onClick={(e) => isHighlighted && e.stopPropagation()}
                        className={`text-[8px] font-bold uppercase tracking-[0.1em] outline-none opacity-60 leading-tight italic mt-0.5 ${isHighlighted ? 'ring-1 ring-blue-400/30 rounded px-1' : ''}`}
                      >
                        {subtitle}
                      </p>
                    )}
                  </div>
               </div>
             )}
             
             {(align === 'LEFT' || !showTitle) && (
               <div className="flex-1 flex items-center relative ml-[-2px]">
                  {showTitle && <div className={`w-3 h-3 rounded-full border-2 bg-white z-10 ${isBlueTheme ? 'border-[#00A7E7]' : 'border-[#006098]'}`} />}
                  <div className={`w-full h-[1px] ${showTitle ? 'ml-[-6px]' : ''} ${isBlueTheme ? 'bg-white/30' : 'bg-slate-200'}`} />
                  <div className="flex gap-0.5 opacity-20 ml-2">
                     <div className={`w-1 h-1 bg-current`} />
                     <div className={`w-1 h-1 bg-current`} />
                  </div>
               </div>
             )}
          </div>
        </div>
      ) : (
        <>
          <div 
            className={`absolute inset-y-0 left-0 -right-4 rounded-r-2xl transition-all duration-500 z-0 ${
              isBlueTheme 
                ? 'bg-gradient-to-r from-white/15 via-white/5 to-transparent' 
                : 'bg-gradient-to-r from-[#0079C2]/15 via-[#0079C2]/03 to-transparent'
            } ${isHighlighted ? 'opacity-100' : 'opacity-80'}`} 
            style={align === 'CENTER' ? { left: '20%', right: '20%', borderRadius: '16px', background: isBlueTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,121,194,0.05)' } : (align === 'RIGHT' ? { left: 'auto', right: '-16px', width: '80%', borderRadius: '16px 0 0 16px', background: `linear-gradient(to left, ${isBlueTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,121,194,0.15)'}, transparent)` } : {})}
          />
          
          <div className={`relative flex min-h-[52px] px-0 z-10 items-center overflow-visible ${align === 'CENTER' ? 'justify-center' : (align === 'RIGHT' ? 'justify-end' : 'justify-start')}`}>
            {align === 'LEFT' && (
              <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-full shrink-0 z-10 transition-shadow duration-300 ${
                isBlueTheme ? 'bg-white shadow-[0_0_15px_white]' : 'bg-[#006098] shadow-sm'
              }`} />
            )}

            <div className={`flex items-center gap-4 max-w-full ${align === 'LEFT' ? 'pl-5' : (align === 'RIGHT' ? 'pr-5 text-right flex-row-reverse' : 'px-5 text-center')}`}>
              {/* ÍCONE POSICIONADO À FRENTE DO GRUPO - CENTRALIZADO VERTICALMENTE PELO ITEMS-CENTER PAI */}
              {icon && (
                <div className={`relative shrink-0 ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>
                  <button
                    onClick={(e) => {
                      if (isHighlighted) {
                        e.stopPropagation();
                        setShowIconPicker(!showIconPicker);
                      }
                    }}
                    className={`transition-transform p-1 rounded-lg ${isHighlighted ? 'cursor-pointer hover:bg-black/5 hover:scale-110' : ''}`}
                  >
                    {renderIcon(icon, 18)}
                  </button>

                  {isHighlighted && showIconPicker && (
                    <div ref={pickerRef} className="absolute top-full left-0 mt-2 z-[500] w-72 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <IconPicker selectedIcon={icon} onSelect={(newIcon) => { onUpdateConfig({ icon: newIcon }); setShowIconPicker(false); }} />
                    </div>
                  )}
                </div>
              )}

              {/* GRUPO VERTICAL: TÍTULO + SUBTÍTULO */}
              <div className={`flex flex-col min-w-0 ${align === 'CENTER' ? 'items-center' : (align === 'RIGHT' ? 'items-end' : 'items-start')}`}>
                {showTitle && (
                  <h2 
                    contentEditable={isHighlighted}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onUpdateTitle(e.currentTarget.innerText || "")}
                    onPaste={handlePastePlain}
                    onClick={(e) => isHighlighted && e.stopPropagation()}
                    className={`text-[15px] font-black uppercase tracking-tight outline-none leading-tight whitespace-pre-wrap break-words transition-colors ${
                      isBlueTheme ? 'text-white' : 'text-[#006098]'
                    } ${isHighlighted ? 'cursor-text focus:ring-1 focus:ring-blue-400/30 rounded px-1' : ''}`}
                  >
                    {title || "Nova Seção"}
                  </h2>
                )}
                
                {showSubtitle && subtitle && (
                  <p 
                    contentEditable={isHighlighted}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onUpdateSubtitle(e.currentTarget.innerText || "")}
                    onPaste={handlePastePlain}
                    onClick={(e) => isHighlighted && e.stopPropagation()}
                    className={`text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5 opacity-80 outline-none leading-normal whitespace-pre-wrap break-words transition-opacity ${
                      isBlueTheme ? 'text-blue-100' : 'text-[#415364]'
                    } ${isHighlighted ? 'cursor-text focus:ring-1 focus:ring-blue-400/30 rounded px-1' : ''}`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};