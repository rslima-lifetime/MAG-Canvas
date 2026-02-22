
import React from 'react';

interface Insight_BoxProps {
  content: string;
  limit?: number;
}

const Insight_Box: React.FC<Insight_BoxProps> = ({ content, limit = 400 }) => {
  const isOverLimit = content.length > limit;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] p-6 border border-[#e2e8f0] relative">
      <h3 className="text-[#006098] font-bold text-sm mb-3 uppercase flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#00A7E7] block"></span>
        Análise Qualitativa e Insights
      </h3>
      
      <div className="text-[#415364] text-sm leading-relaxed whitespace-pre-wrap">
        {content || "Nenhuma análise inserida."}
      </div>

      {isOverLimit && (
        <div className="absolute bottom-2 right-4 text-[10px] text-rose-500 font-bold uppercase">
          Atenção: Limite de caracteres excedido para layout A4
        </div>
      )}

      <div className="mt-auto pt-4 text-[10px] text-gray-400 italic">
        * Gerado via One-Page Builder MAG Seguros
      </div>
    </div>
  );
};

export default Insight_Box;
