import React from 'react';
import { TextStyle } from '../../types';

interface TextEditorProps {
  content: string;
  style: TextStyle;
  onUpdate: (updates: { content?: string, style?: TextStyle }) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content = "", style, onUpdate }) => {
  
  // Helper para extrair partes do modelo PAR
  const getPARParts = () => {
    const safeContent = String(content || "");
    const lines = safeContent.split('\n');
    return {
      problema: lines.find(l => l.toUpperCase().includes('PROBLEMA:'))?.split(':').slice(1).join(':').trim() || '',
      acao: lines.find(l => l.toUpperCase().includes('AÇÃO:'))?.split(':').slice(1).join(':').trim() || '',
      resultado: lines.find(l => l.toUpperCase().includes('RESULTADO:'))?.split(':').slice(1).join(':').trim() || '',
    };
  };

  const updatePARField = (key: 'p' | 'a' | 'r', value: string) => {
    const parts = getPARParts();
    const newContent = `PROBLEMA: ${key === 'p' ? value : parts.problema}\nAÇÃO: ${key === 'a' ? value : parts.acao}\nRESULTADO: ${key === 'r' ? value : parts.resultado}`;
    onUpdate({ content: newContent });
  };

  const parParts = getPARParts();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase">Estilo da Narrativa</label>
        <select 
          value={style} 
          onChange={(e) => onUpdate({ style: e.target.value as TextStyle })} 
          className="w-full p-2 text-[11px] font-bold border rounded bg-white text-[#006098] outline-none shadow-sm"
        >
          <option value="PLAIN">Texto Corrido (Simples)</option>
          <option value="INTRO">Introdução (Padrão)</option>
          <option value="OBJECTIVE">Objetivo (Alvo)</option>
          <option value="INSIGHT">Insight (Destaque Azul)</option>
          <option value="CONCLUSION">Conclusão (Fechamento)</option>
          <option value="ATTENTION">Atenção (Alerta Vermelho)</option>
          <option value="BULLETS">Lista de Tópicos</option>
          <option value="PAR_MODEL">Modelo P.A.R (Infográfico)</option>
        </select>
      </div>

      {style === 'PAR_MODEL' ? (
        <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-rose-500 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Problema
            </label>
            <textarea 
              value={parParts.problema} 
              onChange={(e) => updatePARField('p', e.target.value)}
              className="w-full p-2 text-[10px] border rounded h-16 leading-tight outline-none focus:ring-1 focus:ring-rose-200"
              placeholder="Descreva o desafio encontrado..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-blue-500 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Ação
            </label>
            <textarea 
              value={parParts.acao} 
              onChange={(e) => updatePARField('a', e.target.value)}
              className="w-full p-2 text-[10px] border rounded h-16 leading-tight outline-none focus:ring-1 focus:ring-blue-200"
              placeholder="O que foi feito para resolver?"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Resultado
            </label>
            <textarea 
              value={parParts.resultado} 
              onChange={(e) => updatePARField('r', e.target.value)}
              className="w-full p-2 text-[10px] border rounded h-16 leading-tight outline-none focus:ring-1 focus:ring-emerald-200 font-bold"
              placeholder="Qual foi o impacto gerado?"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Conteúdo</label>
          <textarea 
            value={content} 
            onChange={(e) => onUpdate({ content: e.target.value })} 
            className="w-full p-2 text-xs border rounded min-h-[150px] leading-relaxed outline-none focus:ring-1 focus:ring-[#0079C2] shadow-inner" 
            placeholder="Digite sua análise aqui..." 
          />
        </div>
      )}
    </div>
  );
};