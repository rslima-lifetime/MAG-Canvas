
import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, Maximize, FileType, Type, AlignCenter } from 'lucide-react';

interface ImageEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ config, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdate({ imageUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Área de Preview / Upload */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3">
        {config.imageUrl ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-white">
            <img src={config.imageUrl} alt="Preview" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
            <ImageIcon size={32} />
          </div>
        )}
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 bg-white border border-slate-300 rounded-lg text-[10px] font-black uppercase text-slate-600 hover:text-[#0079C2] hover:border-[#0079C2] transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Upload size={14} />
          {config.imageUrl ? 'Trocar Imagem' : 'Carregar Imagem'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        <p className="text-[8px] text-slate-400 text-center px-4">
          Dica: Você também pode colar (Ctrl+V) uma imagem diretamente no bloco.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <Maximize size={10} className="text-[#0079C2]" /> Ajuste da Imagem (Fit)
          </label>
          <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
            <button 
              onClick={() => onUpdate({ fit: 'cover' })} 
              className={`flex-1 py-1.5 rounded text-[8px] font-black uppercase transition-all ${config.fit === 'cover' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cobrir
            </button>
            <button 
              onClick={() => onUpdate({ fit: 'contain' })} 
              className={`flex-1 py-1.5 rounded text-[8px] font-black uppercase transition-all ${config.fit === 'contain' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Conter
            </button>
            <button 
              onClick={() => onUpdate({ fit: 'fill' })} 
              className={`flex-1 py-1.5 rounded text-[8px] font-black uppercase transition-all ${config.fit === 'fill' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Esticar
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <Type size={10} className="text-[#0079C2]" /> Legenda
          </label>
          <input 
            type="text" 
            value={config.caption || ''} 
            onChange={(e) => onUpdate({ caption: e.target.value })}
            className="w-full p-2.5 text-[11px] border rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Digite a legenda da imagem..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <AlignCenter size={10} className="text-[#0079C2]" /> Altura Fixa (px)
          </label>
          <input 
            type="number" 
            value={config.height || ''} 
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || undefined })}
            className="w-full p-2.5 text-[11px] border rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Auto (Padrão)"
          />
          <p className="text-[8px] text-slate-400">Deixe vazio para altura automática.</p>
        </div>
      </div>
    </div>
  );
};
