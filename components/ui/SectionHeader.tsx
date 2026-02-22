
import React from 'react';
import { ClipboardPaste } from 'lucide-react';
import { PageTheme, DesignSystem } from '../../types';

interface SectionHeaderProps {
  title: string;
  isHighlighted: boolean;
  theme: PageTheme;
  designSystem?: DesignSystem;
  wrapText?: boolean;
  showTitle?: boolean;
  showPasteBadge?: boolean;
  onUpdateTitle: (newTitle: string) => void;
  onToggleVisibility?: (show: boolean) => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, isHighlighted, theme, designSystem = 'STANDARD', wrapText, showTitle = true, showPasteBadge, onUpdateTitle
}) => {
  const isBlueTheme = theme === 'BLUE';
  const isFuture = designSystem === 'FUTURE';
  
  if (!showTitle && !isHighlighted) return null;
  if (!title && !isHighlighted) return null;

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const titleWrapClass = wrapText ? 'whitespace-normal break-words' : 'truncate';

  return (
    <div className={`flex items-start gap-2 shrink-0 transition-all duration-300 relative z-[750] ${title ? 'mb-2' : 'mb-0'} ${isFuture ? 'mb-4' : ''} ${!showTitle && isHighlighted ? 'opacity-40' : 'opacity-100'}`}>
      <style>{`
        .section-title-placeholder:empty::before {
          content: attr(data-placeholder);
          color: ${isBlueTheme ? 'rgba(255,255,255,0.4)' : '#cbd5e1'};
          font-style: italic;
          font-weight: 400;
          text-transform: none;
          letter-spacing: normal;
          pointer-events: none;
          display: block;
        }
      `}</style>

      {/* Barra Decorativa Lateral */}
      {!isFuture && (title || isHighlighted) && showTitle && (
        <div className={`h-[2px] w-4 rounded-full mt-2 shrink-0 transition-all duration-500 ${
          isHighlighted 
          ? (isBlueTheme ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#00A7E7]') 
          : (isBlueTheme ? 'bg-white/40' : 'bg-[#0079C2]')
        } ${!title && isHighlighted ? 'opacity-20' : 'opacity-100'}`}></div>
      )}
      
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <h3 
          contentEditable={isHighlighted}
          suppressContentEditableWarning={true}
          data-placeholder="Adicionar título ao bloco..."
          onBlur={(e) => {
            const val = e.currentTarget.innerText?.trim();
            // Garante que se estiver vazio visualmente, o valor salvo seja vazio também
            onUpdateTitle(val === "" ? "" : e.currentTarget.innerText);
          }}
          onPaste={handlePaste}
          onClick={(e) => isHighlighted && e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
          className={`section-title-placeholder font-black uppercase tracking-widest flex-1 outline-none transition-all ${titleWrapClass} ${
            isHighlighted 
            ? (isBlueTheme ? 'text-white' : 'text-[#00A7E7]') + ' cursor-text focus:ring-1 focus:ring-white/20 px-1 rounded min-h-[1.2em]' 
            : (isBlueTheme ? 'text-white/80' : 'text-[#006098]')
          } ${isFuture ? 'text-[11px] tracking-[0.25em] border-b border-white/10 pb-1.5' : 'text-[10px]'} ${!showTitle && isHighlighted ? 'line-through decoration-rose-500 decoration-2' : ''}`}
        >
          {title}
        </h3>
      </div>

      {showPasteBadge && title && (
        <div className={`ml-auto animate-pulse flex items-center gap-1 text-[7px] font-black uppercase tracking-tighter shrink-0 ${isBlueTheme ? 'text-[#00A7E7]' : 'text-[#0079C2]'}`}>
          <ClipboardPaste size={9} />
          Colar
        </div>
      )}
    </div>
  );
};
