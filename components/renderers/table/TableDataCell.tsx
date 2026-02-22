import React from 'react';
import { Plus } from 'lucide-react';
import { ColumnFormatType, PageTheme, InfographicMode, DensityLevel } from '../../../types';
import { formatValueWithFormat, parseNumber } from '../../../utils/data-utils';
import { TableInfographics } from './TableInfographics';

interface TableDataCellProps {
  rowIndex: number;
  colIndex: number;
  value: any;
  isTableActive: boolean;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  editValue: string;
  isHighlighted: boolean;
  isBlueTheme: boolean;
  isTotal: boolean;
  isSubtotal: boolean;
  isTargeted: boolean;
  infographicMode: InfographicMode;
  density: DensityLevel;
  maxRowValue: number;
  colors: { base: string; mid: string; accent: string };
  fontClass: string;
  paddingStyle: React.CSSProperties;
  columnFormats: ColumnFormatType[];
  columnPrecisions: number[];
  columnGoals: number[];
  goalValue: number;
  wrapText: boolean;
  onCellClick: (e: React.MouseEvent, r: number, c: number) => void;
  onCellDoubleClick: (e: React.MouseEvent, r: number, c: number) => void;
  onEditValueChange: (val: string) => void;
  onInputBlur: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onAddRow: (idx: number) => void;
  getAlignClass: (c: number) => string;
  getJustifyClass: (c: number) => string;
}

export const TableDataCell: React.FC<TableDataCellProps> = ({
  rowIndex, colIndex, value, isTableActive, isActive, isSelected, isEditing, editValue,
  isHighlighted, isBlueTheme, isTotal, isSubtotal, isTargeted, infographicMode, density,
  maxRowValue, colors, fontClass, paddingStyle, columnFormats, columnPrecisions,
  columnGoals, goalValue, wrapText, onCellClick, onCellDoubleClick, onEditValueChange,
  onInputBlur, onInputKeyDown, onAddRow, getAlignClass, getJustifyClass
}) => {
  
  const currentPrecision = columnPrecisions?.[colIndex] || 0;
  const currentFormat = columnFormats[colIndex] || 'TEXT';
  const displayValue = formatValueWithFormat(value, currentFormat, currentPrecision);
  const numericVal = parseNumber(value);

  return (
    <td 
      onClick={(e) => onCellClick(e, rowIndex, colIndex)}
      onDoubleClick={(e) => onCellDoubleClick(e, rowIndex, colIndex)}
      style={paddingStyle}
      className={`${fontClass} transition-all cursor-cell relative border-l first:border-l-0 ${isTotal ? 'border-white/10' : 'border-slate-100'} ${isSelected ? (isTotal ? 'ring-2 ring-inset ring-white/60 bg-white/20 shadow-inner' : 'bg-blue-50/60 z-10 shadow-inner') : ''} ${getAlignClass(colIndex)} ${
        isTotal ? 'text-white font-black' : isBlueTheme ? 'text-white' : (isSubtotal ? 'font-bold' : 'text-slate-600')
      }`}
    >
      {isSelected && !isTotal && <div className="absolute inset-0 ring-1 ring-inset pointer-events-none opacity-30" style={{ backgroundColor: colors.accent }} />}
      {isActive && !isTotal && <div className="absolute inset-0 ring-2 ring-inset pointer-events-none" style={{ boxShadow: `inset 0 0 0 2px ${colors.accent}` }} />}
      
      {isTargeted && !isEditing && (
        <TableInfographics 
           mode={infographicMode} 
           value={numericVal} 
           maxValue={maxRowValue} 
           goalValue={columnGoals[colIndex] || goalValue} 
           theme={isBlueTheme ? 'BLUE' : 'LIGHT'} 
           density={density}
           accentColor={colors.accent}
           midColor={colors.mid}
        />
      )}

      {isHighlighted && colIndex === 0 && (
        <div className="absolute -bottom-2 left-0 right-0 h-4 z-40 group/row-trigger opacity-0 hover:opacity-100 transition-opacity no-print">
           <button 
            onClick={(e) => { e.stopPropagation(); onAddRow(rowIndex); }} 
            className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-125 transition-transform" 
            style={{backgroundColor: colors.accent}}
           >
            <Plus size={10} strokeWidth={3} />
           </button>
        </div>
      )}

      {isSubtotal && colIndex === 0 && !isTotal && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-r-full" style={{backgroundColor: colors.accent}} />
      )}

      <div className={`relative min-h-[1.2em] flex items-center w-full ${getJustifyClass(colIndex)}`}>
        {isActive && isEditing ? (
          <input 
            autoFocus 
            value={editValue} 
            onChange={(e) => onEditValueChange(e.target.value)} 
            onBlur={onInputBlur} 
            onInput={(e) => { if(isTotal) e.currentTarget.style.color = 'black'; }}
            onKeyDown={onInputKeyDown} 
            onPaste={e => e.stopPropagation()} 
            className={`w-full p-0.5 outline-none font-bold rounded shadow-inner ${getAlignClass(colIndex)} ${isTotal ? 'bg-white text-slate-800' : 'bg-white'}`} 
            style={{color: isTotal ? undefined : colors.accent}} 
          />
        ) : (
          <span className={`${wrapText ? 'whitespace-normal' : 'truncate'} ${isSubtotal || isTotal ? 'uppercase tracking-tighter' : ''} relative z-10 w-full`}>
            {displayValue}
          </span>
        )}
      </div>
    </td>
  );
};
