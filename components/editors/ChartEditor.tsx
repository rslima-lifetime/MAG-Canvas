
import React from 'react';
import { ChartTypeSelector } from './chart/ChartTypeSelector';
import { ChartDataEditor } from './chart/ChartDataEditor';
import { ChartVisualSettings } from './chart/ChartVisualSettings';

interface ChartEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export const ChartEditor: React.FC<ChartEditorProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-4">
      {/* 1. Seleção de Tipo */}
      <div className="grid grid-cols-2 gap-2">
        <ChartTypeSelector 
          value={config.type} 
          onChange={(type) => onUpdate({ type })} 
        />
        {/* Placeholder para uma futura funcionalidade ou label vazia para manter o grid */}
        <div className="hidden"></div>
      </div>

      {/* 2. Editor de Dados */}
      <ChartDataEditor 
        data={config.data}
        onUpdateData={(data) => onUpdate({ data })}
      />

      {/* 3. Configurações Visuais */}
      <ChartVisualSettings 
        config={config}
        onUpdate={onUpdate}
      />
    </div>
  );
};
