import React from 'react';
import { CoverPage, DocumentFormat, DesignSystem } from '../../types';
import { Building2, Briefcase, Layers, Calendar } from 'lucide-react';

const LOGO_WHITE = "https://magportaisinststgprd.blob.core.windows.net/magseguros/2023/08/Marca-MAG-Branca.svg";
const LOGO_COLOR = "https://identidade.mongeralaegon.com.br/images/mongeral.png";

interface ReportCoverProps {
  id?: string;
  cover: CoverPage;
  isActive: boolean;
  onClick: () => void;
  onUpdateCover?: (updates: Partial<CoverPage>) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  layoutFormat?: DocumentFormat;
  designSystem?: DesignSystem;
  isReadOnly?: boolean;
}

export const ReportCover: React.FC<ReportCoverProps> = ({ 
  id, cover, isActive, onClick, onUpdateCover, innerRef, layoutFormat = 'REPORT', designSystem = 'STANDARD', isReadOnly
}) => {
  const isBlue = cover.theme === 'BLUE';
  const isPresentation = layoutFormat === 'PRESENTATION';
  const isFuture = designSystem === 'FUTURE';
  const alignment = cover.alignment || 'LEFT';
  
  const handleBlur = (field: keyof CoverPage, e: React.FocusEvent<HTMLElement>) => {
    if (onUpdateCover && !isReadOnly) {
      onUpdateCover({ [field]: e.currentTarget.textContent || "" });
    }
  };

  // Se for ReadOnly, removemos classes de foco e cursor
  const editableClass = isActive && !isReadOnly ? "cursor-text focus:outline-none focus:ring-1 focus:ring-offset-4 focus:ring-blue-400/30 rounded" : "";

  // Helper para definir classes de alinhamento
  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'CENTER': return 'items-center text-center';
      case 'RIGHT': return 'items-end text-right';
      default: return 'items-start text-left';
    }
  };

  const alignClass = getAlignmentClasses();

  // --- LAYOUT FUTURO (16:9 e A4) ---
  const EyeGraphic = () => (
    <svg viewBox="0 0 500 500" className="absolute left-[-150px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-40 mix-blend-screen pointer-events-none overflow-visible">
      <defs>
        <linearGradient id="radialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0079C2" />
          <stop offset="100%" stopColor="#00A7E7" />
        </linearGradient>
      </defs>
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i * 360) / 60;
        const rad = (angle * Math.PI) / 180;
        const x1 = 250 + 120 * Math.cos(rad);
        const y1 = 250 + 120 * Math.sin(rad);
        const length = 40 + Math.random() * 80;
        const x2 = 250 + (120 + length) * Math.cos(rad);
        const y2 = 250 + (120 + length) * Math.sin(rad);
        return (
          <line 
            key={i} 
            x1={x1} y1={y1} x2={x2} y2={y2} 
            stroke="url(#radialGrad)" 
            strokeWidth={4 + (i % 3)} 
            strokeLinecap="round" 
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.1}s`, animationDuration: '3s' }}
          />
        );
      })}
    </svg>
  );

  if (isFuture) {
    return (
      <div 
        ref={innerRef} id={id} onClick={onClick}
        className={`a4-page shadow-2xl flex flex-col transition-all duration-700 relative overflow-hidden select-none print:m-0 print:shadow-none bg-[#006098] text-white ${
          isActive && !isReadOnly ? 'ring-8 ring-white/10 print:ring-0' : ''
        } ${isPresentation ? 'w-[297mm] h-[167mm]' : 'w-[210mm] h-[297mm]'}`}
        style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #0079C2 0%, #004a76 100%)' }}
      >
        <EyeGraphic />
        
        <div className={`flex-1 flex flex-col justify-center px-[40mm] z-10 ${alignClass}`}>
          <div className="w-24 h-1 bg-[#00A7E7] mb-8" />
          <h1 
            contentEditable={isActive && !isReadOnly} suppressContentEditableWarning
            onBlur={(e) => handleBlur('title', e)}
            className={`font-black uppercase leading-[0.9] mb-4 tracking-tighter max-w-[800px] ${editableClass} ${isPresentation ? 'text-[64px]' : 'text-[72px]'}`}
          >
            {cover.title}
          </h1>
          <h2 
            contentEditable={isActive && !isReadOnly} suppressContentEditableWarning
            onBlur={(e) => handleBlur('subtitle', e)}
            className={`font-bold uppercase tracking-[0.2em] mb-12 text-blue-200 ${editableClass} ${isPresentation ? 'text-[20px]' : 'text-[24px]'}`}
          >
            {cover.subtitle}
          </h2>
          
          <div className="h-[1px] w-full max-w-[400px] bg-white/20 mb-8" />
          
          <div className={`space-y-1 flex flex-col ${alignClass}`}>
            <p className="text-[12px] font-black uppercase tracking-widest text-[#00A7E7]">{cover.author}</p>
            <p className="text-[14px] font-bold uppercase text-white/80">{cover.department}</p>
            <p className="text-[12px] font-medium opacity-60 mt-4">{cover.date}</p>
          </div>
        </div>

        <div className="absolute bottom-12 right-12 z-10 flex flex-col items-end">
           <img src={LOGO_WHITE} alt="MAG" className="w-[120px] mb-4" />
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00A7E7]">O Futuro é</span>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">MAG</span>
           </div>
        </div>
      </div>
    );
  }

  // --- LAYOUT PADRÃO (Apenas para MODO APRESENTAÇÃO 16:9) ---
  // Layout Split: Esquerda (Conteúdo) | Direita (Metadados)
  if (isPresentation) {
    return (
      <div 
        ref={innerRef} id={id} onClick={onClick}
        className={`a4-page shadow-2xl flex flex-row transition-all duration-700 relative overflow-hidden select-none print:m-0 print:shadow-none w-[297mm] h-[167mm] ${
          isActive && !isReadOnly ? 'ring-8 ring-blue-500/10 print:ring-0' : ''
        } ${isBlue ? 'bg-[#006098] text-white' : 'bg-white text-[#415364]'}`}
      >
        {/* Coluna Esquerda - Principal */}
        <div className={`flex-1 p-[20mm] flex flex-col justify-between h-full ${isBlue ? 'bg-[#006098]' : 'bg-white'}`}
             style={isBlue ? { backgroundImage: 'linear-gradient(135deg, #006098 0%, #004a76 100%)' } : {}}>
          
          <div className="flex justify-between items-start">
            <img src={isBlue ? LOGO_WHITE : LOGO_COLOR} alt="MAG" className="w-[160px]" />
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isBlue ? 'text-white/30' : 'text-slate-300'}`}>Confidencial</span>
          </div>

          <div className="flex flex-col justify-center flex-1 pr-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-1 rounded-full ${isBlue ? 'bg-[#00A7E7]' : 'bg-[#0079C2]'}`} />
              <span 
                contentEditable={isActive && !isReadOnly} suppressContentEditableWarning
                onBlur={(e) => handleBlur('topLabel', e)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] ${isBlue ? 'text-blue-200' : 'text-slate-400'} ${editableClass}`}
              >
                {cover.topLabel || "Apresentação Executiva"}
              </span>
            </div>
            
            <h1 
              contentEditable={isActive && !isReadOnly} suppressContentEditableWarning 
              onBlur={(e) => handleBlur('title', e)} 
              className={`font-black uppercase leading-[1] mb-6 tracking-tight ${editableClass} text-[52px]`}
            >
              {cover.title}
            </h1>
            
            <p 
              contentEditable={isActive && !isReadOnly} suppressContentEditableWarning 
              onBlur={(e) => handleBlur('subtitle', e)} 
              className={`font-medium leading-relaxed max-w-[650px] ${isBlue ? 'text-blue-50/80' : 'text-[#415364]'} ${editableClass} text-[18px]`}
            >
              {cover.subtitle}
            </p>
          </div>

          <div className={`text-[7px] font-black uppercase tracking-[0.2em] ${isBlue ? 'text-white/30' : 'text-slate-300'}`}>
            © {new Date().getFullYear()} MAG Seguros • People Analytics
          </div>
        </div>

        {/* Coluna Direita - Metadados (Sidebar) */}
        <div className={`w-[85mm] p-[20mm] flex flex-col justify-center gap-10 border-l ${
          isBlue 
            ? 'bg-[#004a76] border-white/5' 
            : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="space-y-2">
            <div className={`flex items-center gap-2 mb-1 ${isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'}`}>
              <Building2 size={16} strokeWidth={2.5} />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Diretoria</span>
            </div>
            <span contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('author', e)} className={`text-[12px] font-bold uppercase leading-tight block ${editableClass}`}>
              {cover.author}
            </span>
          </div>

          <div className="space-y-2">
            <div className={`flex items-center gap-2 mb-1 ${isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'}`}>
              <Briefcase size={16} strokeWidth={2.5} />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Gerência</span>
            </div>
            <span contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('manager', e)} className={`text-[12px] font-bold uppercase leading-tight block ${editableClass}`}>
              {cover.manager}
            </span>
          </div>

          <div className="space-y-2">
            <div className={`flex items-center gap-2 mb-1 ${isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'}`}>
              <Layers size={16} strokeWidth={2.5} />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Núcleo</span>
            </div>
            <span contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('department', e)} className={`text-[12px] font-bold uppercase leading-tight block ${editableClass}`}>
              {cover.department}
            </span>
          </div>

          <div className={`h-[1px] w-12 ${isBlue ? 'bg-white/10' : 'bg-slate-200'}`} />

          <div contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('date', e)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[10px] font-black uppercase ${isBlue ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} ${editableClass}`}>
            <Calendar size={14} className={isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'} />
            {cover.date}
          </div>
        </div>
      </div>
    );
  }

  // --- LAYOUT PADRÃO (Vertical A4 - Original) ---
  return (
    <div 
      ref={innerRef} id={id} onClick={onClick}
      className={`a4-page shadow-2xl flex flex-col p-[30mm] transition-all duration-700 relative overflow-hidden select-none print:m-0 print:shadow-none ${
        isActive && !isReadOnly ? 'ring-8 ring-blue-500/10 print:ring-0' : ''
      } ${isBlue ? 'bg-[#006098] text-white' : 'bg-white text-[#415364]'} w-[210mm] h-[297mm]`}
      style={isBlue ? { backgroundImage: 'linear-gradient(135deg, #006098 0%, #004a76 100%)' } : { backgroundColor: '#ffffff' }}
    >
      <div className="flex justify-between items-start z-10 shrink-0">
        <img src={isBlue ? LOGO_WHITE : LOGO_COLOR} alt="MAG" className="w-[180px]" />
        <div className={`text-right ${isBlue ? 'text-blue-300/40' : 'text-slate-300'}`}>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] leading-none">Confidencial</span>
        </div>
      </div>

      <div className={`flex-1 flex flex-col justify-center max-w-[850px] z-10 overflow-hidden ${alignClass} ${alignment === 'CENTER' ? 'mx-auto' : (alignment === 'RIGHT' ? 'ml-auto' : 'mr-auto')}`}>
        <div className="flex items-center gap-4 mb-8 md:mb-12 shrink-0">
          <div className={`w-12 h-1 rounded-full ${isBlue ? 'bg-[#00A7E7]' : 'bg-[#0079C2]'}`} />
          <span 
            contentEditable={isActive && !isReadOnly} suppressContentEditableWarning
            onBlur={(e) => handleBlur('topLabel', e)}
            className={`text-[12px] font-black uppercase tracking-[0.4em] ${isBlue ? 'text-blue-200' : 'text-slate-400'} ${editableClass}`}
          >
            {cover.topLabel || "Relatório Corporativo"}
          </span>
        </div>
        <h1 contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('title', e)} className={`font-black uppercase leading-[1.1] mb-6 md:mb-10 tracking-tight break-words ${editableClass} text-[48px] md:text-[60px]`}>{cover.title}</h1>
        <div className={`h-[1px] w-full mb-8 md:mb-12 shrink-0 ${isBlue ? 'bg-white/10' : 'bg-slate-100'}`} />
        <p contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('subtitle', e)} className={`font-medium leading-relaxed max-w-[750px] ${isBlue ? 'text-blue-50/80' : 'text-[#415364]'} ${editableClass} text-[20px] md:text-[24px]`}>{cover.subtitle}</p>
      </div>

      <div className={`mt-auto z-10 shrink-0`}>
         <div className={`grid grid-cols-3 gap-8 pb-4 md:pb-8 border-b ${isBlue ? 'border-white/10' : 'border-slate-100'}`}>
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 ${isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'}`}><Building2 size={14} strokeWidth={2.5} /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">Diretoria</span></div>
              <span contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('author', e)} className={`text-[12px] font-bold uppercase leading-tight ${editableClass}`}>{cover.author}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 ${isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'}`}><Briefcase size={14} strokeWidth={2.5} /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">Gerência</span></div>
              <span contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('manager', e)} className={`text-[12px] font-bold uppercase leading-tight ${editableClass}`}>{cover.manager}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 ${isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'}`}><Layers size={14} strokeWidth={2.5} /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">Área / Núcleo</span></div>
              <span contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('department', e)} className={`text-[12px] font-bold uppercase leading-tight ${editableClass}`}>{cover.department}</span>
            </div>
         </div>
         <div className="flex justify-between items-center py-4">
           <div className="flex items-center gap-6">
             <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${isBlue ? 'text-white/30' : 'text-slate-400'}`}>© {new Date().getFullYear()} MAG SEGUROS • NÚCLEO PEOPLE ANALYTICS</span>
             <div contentEditable={isActive && !isReadOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('date', e)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-bold ${isBlue ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'} ${editableClass}`}><Calendar size={11} className={isBlue ? 'text-[#00A7E7]' : 'text-[#0079C2]'} />{cover.date}</div>
           </div>
         </div>
      </div>
    </div>
  );
};