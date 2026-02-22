
import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { PageTheme } from '../../types';

interface ImageBlockProps {
  imageUrl?: string;
  caption?: string;
  fit?: 'cover' | 'contain' | 'fill';
  height?: number; // Altura customizada em px (opcional)
  theme?: PageTheme;
  isHighlighted?: boolean;
  onUpdate?: (updates: any) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  imageUrl,
  caption,
  fit = 'cover',
  height,
  theme = 'LIGHT',
  isHighlighted,
  onUpdate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Estados para redimensionamento
  const [isResizing, setIsResizing] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Efeito para gerenciar o drag-to-resize globalmente
  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const delta = e.clientY - startY.current;
      const newHeight = Math.max(100, startHeight.current + delta); // Altura mínima de 100px
      containerRef.current.style.height = `${newHeight}px`;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!containerRef.current) return;
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      const delta = e.clientY - startY.current;
      const newHeight = Math.max(100, startHeight.current + delta);
      
      if (onUpdate) {
        onUpdate({ height: newHeight });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, onUpdate]);

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isHighlighted || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = containerRef.current.offsetHeight;
    
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && onUpdate) {
        onUpdate({ imageUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) processFile(blob);
        break;
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Se não houver imagem, mostra área de upload
  if (!imageUrl) {
    return (
      <div 
        className={`w-full min-h-[200px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer relative group ${
          isDragging 
            ? 'border-[#00A7E7] bg-blue-50' 
            : (isBlueTheme ? 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#0079C2]')
        }`}
        onClick={() => fileInputRef.current?.click()}
        onPaste={handlePaste}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        tabIndex={0} // Permite focar para colar
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
          isBlueTheme ? 'bg-white/10 text-white' : 'bg-white text-[#0079C2] shadow-sm'
        }`}>
          {isDragging ? <Upload size={24} /> : <ImageIcon size={24} />}
        </div>
        
        <div className="text-center">
          <p className={`text-[10px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>
            {isDragging ? 'Solte a imagem aqui' : 'Adicionar Imagem'}
          </p>
          <p className={`text-[8px] mt-1 ${isBlueTheme ? 'text-blue-200' : 'text-slate-400'}`}>
            Clique para upload ou Cole (Ctrl+V)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative group/image w-full flex flex-col"
      tabIndex={0}
      onPaste={isHighlighted ? handlePaste : undefined}
    >
      <div 
        ref={containerRef}
        className={`relative w-full rounded-2xl overflow-hidden shadow-sm border transition-all ${
          isBlueTheme ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'
        } ${isResizing ? 'ring-2 ring-[#00A7E7] z-50' : ''}`}
        style={{ height: height ? `${height}px` : 'auto', minHeight: '150px' }}
      >
        <img 
          src={imageUrl} 
          alt={caption || "Imagem do relatório"} 
          className={`w-full h-full object-${fit} pointer-events-none select-none`}
          style={{ maxHeight: isResizing ? 'none' : (height ? 'none' : '500px') }}
        />

        {/* Botão de Remover (Apenas edição) */}
        {isHighlighted && !isResizing && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity z-40">
             <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="p-1.5 bg-white text-[#0079C2] rounded-full shadow-lg hover:scale-110 transition-transform"
              title="Trocar Imagem"
            >
              <Upload size={12} strokeWidth={3} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdate?.({ imageUrl: '' }); }}
              className="p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
              title="Remover Imagem"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        )}
        
        {/* Alça de Redimensionamento */}
        {isHighlighted && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute bottom-0 left-0 right-0 h-6 cursor-ns-resize flex items-end justify-center z-40 group/handle transition-all ${isResizing ? 'opacity-100 bg-black/10' : 'opacity-0 group-hover/image:opacity-100 hover:bg-gradient-to-t hover:from-black/20 hover:to-transparent'}`}
            title="Arraste para ajustar a altura"
          >
            <div className={`w-12 h-1.5 rounded-full mb-1.5 shadow-sm backdrop-blur-md transition-all ${isResizing ? 'bg-[#00A7E7] scale-110' : 'bg-white/80 group-hover/handle:scale-110'}`} />
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

      {/* Legenda Opcional */}
      {(caption || isHighlighted) && (
        <div className="mt-2 text-center px-4">
          {isHighlighted ? (
            <input 
              type="text" 
              value={caption || ''} 
              onChange={(e) => onUpdate?.({ caption: e.target.value })}
              placeholder="Adicionar legenda..."
              className={`w-full text-center text-[9px] font-medium bg-transparent border-b border-transparent focus:border-blue-300 outline-none placeholder-slate-300 italic ${
                isBlueTheme ? 'text-blue-100' : 'text-slate-500'
              }`}
            />
          ) : (
            caption && (
              <p className={`text-[9px] font-medium italic ${isBlueTheme ? 'text-blue-100/70' : 'text-slate-500'}`}>
                {caption}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
};
