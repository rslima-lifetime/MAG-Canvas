import React from 'react';
import { Settings } from 'lucide-react';
import { ColumnFormatType, ColumnAlignment, PageTheme } from '../../../types';
import { TableFormatMenu } from './TableFormatMenu';

interface TableHeaderCellProps {
  index: number;
  label: string;
  isTableActive: boolean;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  editValue: string;
  isHighlighted: boolean;
  isBlueTheme: boolean;
  isFormatting: boolean;
  colors: { base: string; mid: string; accent: string };
  fontClass: string;
  paddingStyle: React.CSSProperties;
  columnFormats: ColumnFormatType[];
  columnPrecisions: number[];
  columnAlignments: ColumnAlignment[];
  columnGoals: number[];
  onCellClick: (e: React.MouseEvent, r: number, c: number) => void;
  onCellDoubleClick: (e: React.MouseEvent, r: number, c: number) => void;
  onEditValueChange: (val: string) => void;
  onInputBlur: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleFormatMenu: (colIdx: number | null) => void;
  onUpdateColumnConfig: (colIdx: number, updates: any) => void;
  onResizeStart: (e: React.MouseEvent, idx: number) => void;
  isLastColumn: boolean;
  getAlignClass: (c: number) => string;
  getJustifyClass: (c: number) => string;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  index, label, isTableActive, isActive, isSelected, isEditing, editValue,
  isHighlighted, isBlueTheme, isFormatting, colors, fontClass, paddingStyle,
  columnFormats, columnPrecisions, columnAlignments, columnGoals,
  onCellClick, onCellDoubleClick, onEditValueChange, onInputBlur, onInputKeyDown,
  onToggleFormatMenu, onUpdateColumnConfig, onResizeStart, isLastColumn,
  getAlignClass, getJustifyClass
}) => {
  return (
    <th 
      onClick={(e) => onCellClick(e, -1, index)}
      onDoubleClick={(e) => onCellDoubleClick(e, -1, index)}
      style={{
        ...paddingStyle, 
        backgroundColor: isSelected ? colors.accent : (isBlueTheme ? 'rgba(255,255,255,0.1)' : colors.base)
      }}
      className={`group/header relative first:rounded-tl-xl last:rounded-tr-xl font-black text-white uppercase tracking-widest cursor-pointer transition-all border-l first:border-l-0 border-white/10 ${getAlignClass(index)} ${fontClass} ${
        isSelected ? 'z-20 shadow-lg' : ''
      }`}
    >
      {/* Indicador de Seleção de Range */}
      {isSelected && <div className="absolute inset-0 bg-white/20 pointer-events-none" />}
      
      {/* Indicador de Célula Ativa (Foco) */}
      {isActive && (
        <div className="absolute inset-0 ring-2 ring-inset ring-white/80 z-30 pointer-events-none shadow-[inset_0_0_10px_rgba(255,255,255,0.3)]" />
      )}

      <div className={`relative min-h-[1.2em] flex items-center w-full z-10 ${getJustifyClass(index)}`}>
        {isActive && isEditing ? (
          <input 
            autoFocus 
            value={editValue} 
            onChange={(e) => onEditValueChange(e.target.value)} 
            onBlur={onInputBlur} 
            onKeyDown={onInputKeyDown} 
            onPaste={(e) => e.stopPropagation()} 
            className={`w-full bg-white text-[#006098] p-0.5 outline-none font-black text-[10px] rounded uppercase shadow-inner ${getAlignClass(index)}`} 
          />
        ) : (
          <span className="w-full truncate drop-shadow-sm">{label || "Coluna"}</span>
        )}

        {isHighlighted && !isEditing && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFormatMenu(isFormatting ? null : index); }}
            className={`absolute -right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all no-print z-[60] ${
              isFormatting || isActive ? 'bg-white text-[#0079C2] shadow-lg scale-110 opacity-100' : 'opacity-0 group-hover/header:opacity-100 text-white hover:bg-white/20'
            }`}
          >
            <Settings size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {isHighlighted && isFormatting && (
        <TableFormatMenu 
          currentFormat={columnFormats[index] || 'TEXT'}
          currentPrecision={columnPrecisions[index] || 0}
          currentAlignment={columnAlignments[index] || (index === 0 ? 'LEFT' : 'CENTER')}
          currentGoal={columnGoals[index]}
          onFormatChange={(f) => onUpdateColumnConfig(index, { format: f })}
          onPrecisionChange={(p) => onUpdateColumnConfig(index, { precision: p })}
          onAlignmentChange={(a) => onUpdateColumnConfig(index, { alignment: a })}
          onGoalChange={(g) => onUpdateColumnConfig(index, { goal: g })}
        />
      )}

      {isHighlighted && !isLastColumn && (
        <div 
          onMouseDown={(e) => onResizeStart(e, index)} 
          className="absolute top-0 bottom-0 -right-[4px] w-[8px] cursor-col-resize z-40 hover:bg-[#00A7E7]/30 transition-colors" 
        />
      )}
    </th>
  );
};