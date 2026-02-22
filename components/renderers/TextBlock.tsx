import React, { useRef, useEffect } from 'react';
import { TextStyle, PageTheme, DesignSystem } from '../../types';
import { AlertCircle, Zap, Target, FileText, Lightbulb, AlertOctagon, ListChecks, Terminal, Flag } from 'lucide-react';

interface TextBlockProps {
  content: string;
  style: TextStyle;
  isEditable?: boolean;
  theme?: PageTheme;
  designSystem?: DesignSystem;
  onContentChange?: (newContent: string) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ 
  content = "", style, isEditable = false, theme = 'LIGHT', designSystem = 'STANDARD', onContentChange 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const probRef = useRef<HTMLDivElement>(null);
  const acaoRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  
  const isBlueTheme = theme === 'BLUE';
  const isFuture = designSystem === 'FUTURE';

  // Helper para extrair seções do P.A.R. mantendo HTML
  const getPARData = (raw: string) => {
    const lines = (raw || "").split('\n');
    const findContent = (prefix: string) => {
      const line = lines.find(l => l.toUpperCase().startsWith(prefix.toUpperCase()));
      if (!line) return "";
      return line.substring(prefix.length).trim();
    };
    return {
      problema: findContent('PROBLEMA:'),
      acao: findContent('AÇÃO:'),
      resultado: findContent('RESULTADO:')
    };
  };

  // Efeito de Sincronização (Crucial para Backup e Undo/Redo)
  useEffect(() => {
    if (style === 'PAR_MODEL') {
      const { problema, acao, resultado } = getPARData(content);
      if (probRef.current && probRef.current.innerHTML !== problema) probRef.current.innerHTML = problema;
      if (acaoRef.current && acaoRef.current.innerHTML !== acao) acaoRef.current.innerHTML = acao;
      if (resRef.current && resRef.current.innerHTML !== resultado) resRef.current.innerHTML = resultado;
    } else {
      if (contentRef.current) {
        const isOldPlaceholder = content === 'Digite seu texto aqui...';
        const targetHtml = isOldPlaceholder ? "" : (content || "");
        if (contentRef.current.innerHTML !== targetHtml) {
          contentRef.current.innerHTML = targetHtml;
        }
      }
    }
  }, [content, style]);

  const handleBlur = () => {
    if (contentRef.current && onContentChange && style !== 'PAR_MODEL') {
      const html = contentRef.current.innerHTML;
      const finalHtml = (html === '<br>' || html === '<div><br></div>') ? "" : html;
      if (finalHtml !== content) {
        onContentChange(finalHtml);
      }
    }
  };

  const updatePar = () => {
    if (!onContentChange) return;
    const p = probRef.current?.innerHTML || "";
    const a = acaoRef.current?.innerHTML || "";
    const r = resRef.current?.innerHTML || "";
    const newContent = `PROBLEMA: ${p}\nAÇÃO: ${a}\nRESULTADO: ${r}`;
    if (newContent !== content) {
      onContentChange(newContent);
    }
  };

  const getTextStyle = () => {
    const textColor = isBlueTheme ? 'text-white' : (isFuture ? '#002B49' : '#415364');
    let base = `text-[13px] leading-relaxed w-full min-h-[2em] outline-none block relative z-10 ${isEditable ? 'cursor-text' : ''}`;

    if (style === 'INSIGHT' || style === 'OBJECTIVE' || style === 'CONCLUSION') {
      return `${base} font-bold ${isBlueTheme ? 'text-white' : (isFuture ? 'text-[#002B49]' : 'text-[#006098]')}`;
    }
    if (style === 'ATTENTION') {
      return `${base} font-bold ${isBlueTheme ? 'text-rose-100' : 'text-rose-900'}`;
    }

    return `${base} font-medium ${textColor}`;
  };

  if (style === 'PAR_MODEL') {
    const items = [
      { label: 'Problema', ref: probRef, icon: AlertOctagon, color: '#EF4444', bgColor: isBlueTheme ? 'bg-rose-500/10' : 'bg-rose-50', borderColor: isBlueTheme ? 'border-rose-500/30' : 'border-rose-100', placeholder: 'Qual era o desafio?' },
      { label: 'Ação', ref: acaoRef, icon: Zap, color: '#0079C2', bgColor: isBlueTheme ? 'bg-blue-500/10' : 'bg-blue-50', borderColor: isBlueTheme ? 'border-blue-500/30' : 'border-blue-100', placeholder: 'O que foi implementado?' },
      { label: 'Resultado', ref: resRef, icon: Target, color: '#10B981', bgColor: isBlueTheme ? 'bg-emerald-500/20' : 'bg-emerald-50', borderColor: isBlueTheme ? 'border-emerald-500/30' : 'border-emerald-200', placeholder: 'Qual o ganho obtido?' }
    ];

    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pb-4">
        <style>{`
          .rich-placeholder:empty::before {
            content: attr(data-placeholder);
            color: ${isBlueTheme ? 'rgba(255,255,255,0.3)' : '#cbd5e1'};
            font-style: italic;
            font-weight: 400;
            pointer-events: none;
            display: block;
          }
        `}</style>
        {items.map((item, i) => (
          <div key={i} className={`flex flex-col rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden ${item.bgColor} ${item.borderColor} ${isEditable ? 'hover:shadow-md' : ''}`}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: item.color }} />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: item.color }}>
                <item.icon size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isBlueTheme ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
            </div>
            <div 
              ref={item.ref}
              contentEditable={isEditable} 
              suppressContentEditableWarning 
              data-placeholder={item.placeholder}
              onBlur={updatePar}
              onClick={(e) => isEditable && e.stopPropagation()}
              className={`text-[11px] font-medium leading-relaxed outline-none rich-placeholder min-h-[4em] ${isBlueTheme ? 'text-blue-50' : 'text-[#415364]'} ${item.label === 'Resultado' ? 'text-[12.5px] font-black' : ''}`}
            />
            <item.icon size={64} className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none rotate-12" style={{ color: item.color }} />
          </div>
        ))}
      </div>
    );
  }

  const isPlain = style === 'PLAIN';
  const styleConfig: Record<string, any> = {
    OBJECTIVE: { label: 'Objetivo Estratégico', icon: Target, color: isFuture ? '#00A7E7' : (isBlueTheme ? '#00A7E7' : '#0079C2') },
    INSIGHT: { label: 'Insight Estratégico', icon: Lightbulb, color: isFuture ? '#00A7E7' : (isBlueTheme ? '#00A7E7' : '#0079C2') },
    CONCLUSION: { label: 'Conclusão e Recomendações', icon: Flag, color: isFuture ? '#10B981' : (isBlueTheme ? '#10B981' : '#059669'), wrapClass: isBlueTheme ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100 rounded-2xl p-4' },
    ATTENTION: { label: 'Ponto de Atenção', icon: AlertOctagon, color: '#EF4444' },
    INTRO: { label: 'Contexto', icon: isFuture ? Terminal : FileText, color: isFuture ? '#00A7E7' : (isBlueTheme ? 'rgba(255,255,255,0.4)' : '#64748b') },
    BULLETS: { label: 'Destaques', icon: ListChecks, color: isFuture ? '#00A7E7' : (isBlueTheme ? 'rgba(255,255,255,0.4)' : '#64748b') },
  };
  const currentStyle = styleConfig[style] || { label: 'Narrativa', icon: FileText, color: '#64748b' };

  return (
    <div className={`w-full h-auto min-h-[60px] transition-all duration-300 relative flex flex-col ${isPlain ? 'py-1' : 'py-2 pl-6'} ${currentStyle.wrapClass || ''}`}>
      <style>{`
        .rich-placeholder:empty::before {
          content: attr(data-placeholder);
          color: ${isBlueTheme ? 'rgba(255,255,255,0.3)' : '#cbd5e1'};
          font-style: italic;
          font-weight: 400;
          pointer-events: none;
          display: block;
        }
      `}</style>
      {!isPlain && !currentStyle.wrapClass && <div className="absolute left-0 top-2 bottom-2 w-[4px] rounded-full transition-colors duration-500 z-0" style={{ backgroundColor: currentStyle.color }} />}
      {!isPlain && (
        <div className="flex items-center gap-2 mb-3 select-none pointer-events-none w-full shrink-0">
          <currentStyle.icon size={12} style={{ color: currentStyle.color }} className="shrink-0" />
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${isFuture ? 'font-mono' : ''}`} style={{ color: currentStyle.color }}>{currentStyle.label}</span>
        </div>
      )}
      <div 
        ref={contentRef} 
        contentEditable={isEditable} 
        suppressContentEditableWarning 
        data-placeholder="Digite seu texto aqui..."
        onBlur={handleBlur} 
        onClick={(e) => isEditable && e.stopPropagation()}
        className={`rich-text-editor rich-placeholder ${getTextStyle()}`} 
        style={{ minWidth: '100%' }}
      />
    </div>
  );
};