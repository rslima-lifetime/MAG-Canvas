import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, LayoutGrid, List, Award, Maximize2, Target, Type, Bold, Palette, ChevronUp, ChevronDown, ToggleRight, ToggleLeft, Eye, EyeOff, Image as ImageIcon, Upload, GalleryHorizontal, Maximize, Circle as CircleIcon, Square as SquareIcon } from 'lucide-react';
import { InfographicListItem } from '../../types';
import { IconPicker } from '../ui/IconPicker';
import { resolveIconComponent } from '../../utils/icon-library';

interface InfographicListEditorProps {
  items: InfographicListItem[];
  config: any;
  activeSubItemIndex?: number | null;
  onActiveSubItemChange?: (idx: number | null) => void;
  onUpdate: (updates: any) => void;
}

const COLOR_PRESETS = ['#0079C2', '#00A7E7', '#006098', '#10B981', '#F59E0B', '#EF4444', '#7C3AED'];
const TAG_COLORS = ['#f1f5f9', '#dcfce7', '#fee2e2', '#fef9c3', '#e0f2fe', '#f5f3ff'];

export const InfographicListEditor: React.FC<InfographicListEditorProps> = ({ 
  items = [], config, activeSubItemIndex, onActiveSubItemChange, onUpdate 
}) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showPickerFor, setShowPickerFor] = useState<number | null>(null);

  useEffect(() => {
    if (activeSubItemIndex !== null && activeSubItemIndex !== undefined && itemRefs.current[activeSubItemIndex]) {
      itemRefs.current[activeSubItemIndex]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [activeSubItemIndex]);

  const updateItem = (idx: number, updates: Partial<InfographicListItem>) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], ...updates };
    onUpdate({ items: newItems });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateItem(idx, { imageUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newItem: InfographicListItem = {
      id: Date.now().toString(),
      title: 'Novo Pilar',
      description: 'Descrição breve sobre este tópico estratégico.',
      icon: 'Target',
      tag: 'Status',
      itemWidth: '50'
    };
    onUpdate({ items: [...items, newItem] });
    onActiveSubItemChange?.(items.length);
  };

  const removeItem = (idx: number) => {
    onUpdate({ items: items.filter((_, i) => i !== idx) });
    onActiveSubItemChange?.(null);
  };

  const moveItem = (idx: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    
    const newItems = [...items];
    [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
    onUpdate({ items: newItems });
    onActiveSubItemChange?.(targetIdx);
  };

  return (
    <div className="space-y-6">
      {/* Configurações Globais de Estilo */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Type size={14} className="text-[#0079C2]" />
          <span className="text-[10px] font-black uppercase text-[#006098] tracking-widest">Estilo e Visibilidade</span>
        </div>

        {/* Estilo da Imagem */}
        <div className="space-y-2">
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Formato da Imagem</label>
          <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={() => onUpdate({ imageStyle: 'SQUARE' })}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${(!config.imageStyle || config.imageStyle === 'SQUARE') ? 'bg-white border-[#0079C2] text-[#0079C2] shadow-sm' : 'bg-slate-100 text-slate-400 border-transparent'}`}
             >
                <SquareIcon size={14} />
                <span className="text-[9px] font-black uppercase">Box (16:9)</span>
             </button>
             <button 
                onClick={() => onUpdate({ imageStyle: 'ROUND' })}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${config.imageStyle === 'ROUND' ? 'bg-white border-[#0079C2] text-[#0079C2] shadow-sm' : 'bg-slate-100 text-slate-400 border-transparent'}`}
             >
                <CircleIcon size={14} />
                <span className="text-[9px] font-black uppercase">Perfil (1:1)</span>
             </button>
          </div>
        </div>

        {/* Visibilidade da Descrição */}
        <button 
          onClick={() => onUpdate({ showDescription: config.showDescription === false ? true : false })}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${config.showDescription !== false ? 'bg-blue-100 text-[#0079C2]' : 'bg-slate-100 text-slate-400'}`}>
              {config.showDescription !== false ? <Eye size={14} /> : <EyeOff size={14} />}
            </div>
            <span className="text-[10px] font-black text-[#006098] uppercase tracking-tight">Exibir Descrições</span>
          </div>
          {config.showDescription !== false ? <ToggleRight size={22} className="text-[#00A7E7]" /> : <ToggleLeft size={22} className="text-slate-300" />}
        </button>

        {/* Escala de Texto */}
        <div className="space-y-2 pt-2 border-t border-slate-200/60">
          <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
             <Maximize2 size={10} /> Escala Global (A- / A+)
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'SM', label: 'Pequeno' },
              { id: 'MD', label: 'Padrão' },
              { id: 'LG', label: 'Grande' }
            ].map(scale => (
              <button
                key={scale.id}
                onClick={() => onUpdate({ textScale: scale.id })}
                className={`py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all ${
                  (config.textScale || 'MD') === scale.id 
                    ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Peso e Ênfase de Cor */}
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-200/60">
          <button 
            onClick={() => onUpdate({ bodyWeight: config.bodyWeight === 'bold' ? 'medium' : 'bold' })}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Bold size={12} className={config.bodyWeight === 'bold' ? 'text-[#0079C2]' : 'text-slate-300'} />
              <span className="text-[9px] font-bold text-slate-500 uppercase">Texto em Negrito</span>
            </div>
            {config.bodyWeight === 'bold' ? <ToggleRight size={20} className="text-[#00A7E7]" /> : <ToggleLeft size={20} className="text-slate-300" />}
          </button>

          <button 
            onClick={() => onUpdate({ colorizeTitle: config.colorizeTitle !== false ? true : false })}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Palette size={12} className={config.colorizeTitle !== false ? 'text-[#0079C2]' : 'text-slate-300'} />
              <span className="text-[9px] font-bold text-slate-500 uppercase">Título Colorido</span>
            </div>
            {config.colorizeTitle !== false ? <ToggleRight size={20} className="text-[#00A7E7]" /> : <ToggleLeft size={20} className="text-slate-300" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Layout do Bloco</label>
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => onUpdate({ layout: 'GRID' })} 
            title="Grade de Ícones"
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${config.layout === 'GRID' ? 'bg-blue-50 border-[#0079C2] text-[#0079C2]' : 'bg-white border-slate-100 text-slate-400'}`}
          >
            <LayoutGrid size={16} />
            <span className="text-[7px] font-black uppercase">Grade</span>
          </button>
          <button 
            onClick={() => onUpdate({ layout: 'LIST' })} 
            title="Lista Linear"
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${config.layout === 'LIST' ? 'bg-blue-50 border-[#0079C2] text-[#0079C2]' : 'bg-white border-slate-100 text-slate-400'}`}
          >
            <List size={16} />
            <span className="text-[7px] font-black uppercase">Linear</span>
          </button>
          <button 
            onClick={() => onUpdate({ layout: 'FEATURE' })} 
            title="Destaque Único"
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${config.layout === 'FEATURE' ? 'bg-blue-50 border-[#0079C2] text-[#0079C2]' : 'bg-white border-slate-100 text-slate-400'}`}
          >
            <Award size={16} />
            <span className="text-[7px] font-black uppercase">Destaque</span>
          </button>
          <button 
            onClick={() => onUpdate({ layout: 'GALLERY' })} 
            title="Galeria de Fotos"
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${config.layout === 'GALLERY' ? 'bg-blue-50 border-[#0079C2] text-[#0079C2]' : 'bg-white border-slate-100 text-slate-400'}`}
          >
            <GalleryHorizontal size={16} />
            <span className="text-[7px] font-black uppercase">Galeria</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isActive = activeSubItemIndex === idx;
          const CurrentIcon = resolveIconComponent(item.icon);
          const isPicking = showPickerFor === idx;

          return (
            <div 
              key={item.id}
              ref={el => { itemRefs.current[idx] = el; }}
              onClick={() => onActiveSubItemChange?.(idx)}
              className={`p-4 border rounded-2xl space-y-3 transition-all cursor-pointer ${
                isActive ? 'bg-blue-50 border-[#0079C2] shadow-md ring-2 ring-blue-500/5' : 'bg-slate-50 border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveItem(idx, 'UP'); }}
                      disabled={idx === 0}
                      className={`p-0.5 rounded transition-colors ${idx === 0 ? 'text-slate-200' : 'text-slate-400 hover:bg-white hover:text-[#0079C2]'}`}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveItem(idx, 'DOWN'); }}
                      disabled={idx === items.length - 1}
                      className={`p-0.5 rounded transition-colors ${idx === items.length - 1 ? 'text-slate-200' : 'text-slate-400 hover:bg-white hover:text-[#0079C2]'}`}
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                  <span className={`text-[9px] font-black uppercase ${isActive ? 'text-[#006098]' : 'text-slate-400'}`}>Card #{idx + 1}</span>
                  {isActive && (
                    <div className="flex items-center gap-1 text-[8px] font-black uppercase text-[#0079C2] animate-pulse">
                      <Target size={10} /> Ativo no Preview
                    </div>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
              </div>

              <div className="grid grid-cols-4 gap-3" onClick={e => e.stopPropagation()}>
                {/* Título e Tag */}
                <div className="col-span-3 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Título</label>
                  <input type="text" value={item.title} onChange={e => updateItem(idx, { title: e.target.value })} className="w-full p-2 text-[10px] font-bold border rounded-lg outline-none focus:ring-1 focus:ring-blue-300" />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Tag</label>
                  <input type="text" value={item.tag || ''} onChange={e => updateItem(idx, { tag: e.target.value })} className="w-full p-2 text-[10px] border rounded-lg outline-none focus:ring-1 focus:ring-blue-300" />
                </div>

                {/* Largura do Card */}
                {(config.layout === 'GRID' || config.layout === 'GALLERY') && (
                  <div className="col-span-4 space-y-2">
                    <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1"><Maximize2 size={10} /> Tamanho do Card (%)</label>
                    <div className="grid grid-cols-4 gap-1">
                      {['25', '33', '50', '100'].map(w => (
                        <button 
                          key={w} 
                          onClick={() => updateItem(idx, { itemWidth: w as any })}
                          className={`py-1 rounded-md text-[8px] font-black border transition-all ${item.itemWidth === w ? 'bg-[#0079C2] text-white border-[#0079C2]' : 'bg-white text-slate-400 border-slate-200'}`}
                        >
                          {w}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {config.showDescription !== false && (
                  <div className="col-span-4 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Descrição Contextual</label>
                    <textarea value={item.description} onChange={e => updateItem(idx, { description: e.target.value })} className="w-full p-2 text-[10px] border rounded-lg h-16 leading-tight outline-none focus:ring-1 focus:ring-blue-300" />
                  </div>
                )}
                
                {/* Cor da Tag */}
                <div className="col-span-4 space-y-1 pt-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Cor da Tag</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map(c => (
                      <button 
                        key={c}
                        onClick={() => updateItem(idx, { tagColor: c })}
                        className={`w-4 h-4 rounded-full border transition-all ${item.tagColor === c ? 'scale-125 ring-2 ring-blue-400' : 'border-slate-200'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* IMAGEM / LOGO */}
                <div className="col-span-4 space-y-2 pt-2 border-t">
                  <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
                    <ImageIcon size={10} /> {config.layout === 'GALLERY' ? 'Foto da Galeria' : 'Logo / Imagem'}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" 
                        value={item.imageUrl || ''} 
                        onChange={e => updateItem(idx, { imageUrl: e.target.value })}
                        placeholder="URL da imagem..."
                        className="w-full p-2 text-[9px] border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300"
                      />
                    </div>
                    <label className="w-10 h-10 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#0079C2] text-slate-300 hover:text-[#0079C2] transition-all shrink-0">
                       <Upload size={16} />
                       <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                    </label>
                    {item.imageUrl && (
                      <button onClick={() => updateItem(idx, { imageUrl: undefined })} className="text-rose-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  {item.imageUrl && (
                    <div className="space-y-1 mt-2">
                      <label className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
                        <Maximize size={10} className="text-[#0079C2]" /> Ajuste da Imagem
                      </label>
                      <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                        <button 
                          onClick={() => updateItem(idx, { imageFit: 'cover' })} 
                          className={`flex-1 py-1.5 rounded text-[8px] font-black uppercase transition-all ${(!item.imageFit || item.imageFit === 'cover') ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          Cortar
                        </button>
                        <button 
                          onClick={() => updateItem(idx, { imageFit: 'contain' })} 
                          className={`flex-1 py-1.5 rounded text-[8px] font-black uppercase transition-all ${item.imageFit === 'contain' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          Conter
                        </button>
                        <button 
                          onClick={() => updateItem(idx, { imageFit: 'fill' })} 
                          className={`flex-1 py-1.5 rounded text-[8px] font-black uppercase transition-all ${item.imageFit === 'fill' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          Esticar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ícone e Cor do Ícone (Fallback) */}
                {!item.imageUrl && (
                  <div className="col-span-4 space-y-2 pt-2 border-t">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Ícone (Fallback)</label>
                    
                    <button 
                      onClick={() => setShowPickerFor(isPicking ? null : idx)}
                      className="w-full p-2 bg-white border rounded-lg flex items-center justify-between hover:border-[#0079C2] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-[#006098]">
                          <CurrentIcon size={16} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600">{item.icon || 'Selecionar...'}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-[#0079C2]">{isPicking ? 'Fechar' : 'Alterar'}</span>
                    </button>

                    {isPicking && (
                      <div className="mt-2">
                        <IconPicker 
                          selectedIcon={item.icon} 
                          onSelect={(icon) => { updateItem(idx, { icon }); setShowPickerFor(null); }} 
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {COLOR_PRESETS.map(c => (
                        <button 
                          key={c}
                          onClick={() => updateItem(idx, { color: c })}
                          className={`w-4 h-4 rounded-full border-2 ${item.color === c ? 'scale-125 border-slate-900 shadow-sm' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={addItem}
        className="w-full py-3 border-2 border-dashed border-blue-200 text-[#0079C2] text-[10px] font-black uppercase rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Adicionar Novo Card Visual
      </button>
    </div>
  );
};