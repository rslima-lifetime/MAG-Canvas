
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { InfographicMode, DensityLevel, PageTheme, ColumnFormatType, ColumnAlignment, DesignSystem, TableTheme } from '../../types';
import { parseMatrixData, parseNumber } from '../../utils/data-utils';
import { Plus, Trash2, Sigma, Table as TableIcon, Columns2, Rows2, Calculator } from 'lucide-react';
import { useTableNavigation } from './table/useTableNavigation';
import { TableHeaderCell } from './table/TableHeaderCell';
import { TableDataRow } from './table/TableDataRow';
import { TableDataCell } from './table/TableDataCell';

interface DataGridTableProps {
  data: string;
  infographicMode?: InfographicMode;
  tableTheme?: TableTheme;
  targetColumns?: number[];
  goalValue?: number;
  density?: DensityLevel;
  wrapText?: boolean;
  lastRowIsTotal?: boolean;
  subtotalRows?: number[];
  columnWidths?: number[];
  columnFormats?: ColumnFormatType[];
  columnPrecisions?: number[];
  columnAlignments?: ColumnAlignment[];
  columnGoals?: number[];
  isHighlighted?: boolean;
  theme?: PageTheme;
  designSystem?: DesignSystem;
  onUpdateConfig?: (updates: any) => void;
  onActivate?: () => void;
}

const TABLE_THEMES: Record<TableTheme, { base: string, mid: string, accent: string }> = {
  MAG: { base: '#006098', mid: '#0079C2', accent: '#00A7E7' },
  GREEN: { base: '#065f46', mid: '#059669', accent: '#10b981' },
  TEAL: { base: '#0f766e', mid: '#0d9488', accent: '#2dd4bf' },
  SLATE: { base: '#334155', mid: '#475569', accent: '#94a3b8' },
  ROSE: { base: '#9f1239', mid: '#e11d48', accent: '#fb7185' },
  ORANGE: { base: '#9a3412', mid: '#ea580c', accent: '#f97316' }
};

export const DataGridTable: React.FC<DataGridTableProps> = ({
  data, infographicMode = 'NONE', tableTheme = 'MAG', targetColumns = [], goalValue = 100, density = 10,
  wrapText = false, lastRowIsTotal = false, subtotalRows = [], columnWidths = [],
  columnFormats = [], columnPrecisions = [], columnAlignments = [], columnGoals = [],
  isHighlighted = false, theme = 'LIGHT' as PageTheme, designSystem = 'STANDARD',
  onUpdateConfig, onActivate
}) => {
  const isBlueTheme = theme === 'BLUE';
  const tableRef = useRef<HTMLTableElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [openFormatMenu, setOpenFormatMenu] = useState<number | null>(null);
  const shouldSaveOnBlur = useRef(true);

  const colors = TABLE_THEMES[tableTheme] || TABLE_THEMES.MAG;
  const { headers, rows: rawRows } = useMemo(() => parseMatrixData(data), [data]);

  const getSeparator = (csv: string) => {
    const firstLine = csv.split(/\r?\n/)[0];
    if (firstLine.includes('\t')) return '\t';
    if (firstLine.includes(';')) return ';';
    return ',';
  };

  const parseLines = (csv: string, sep: string) => {
    const lines = csv.split(/\r?\n/);
    return lines.map(line => line.split(sep));
  };

  const updateCSVValue = useCallback((r: number, c: number, newValue: string) => {
    if (!onUpdateConfig) return;
    const sep = getSeparator(data);
    const matrix = parseLines(data, sep);
    const matrixRowIdx = r + 1;
    if (matrix[matrixRowIdx]) {
      if (matrix[matrixRowIdx][c] === newValue) return;
      matrix[matrixRowIdx][c] = newValue;
      onUpdateConfig({ data: matrix.map(row => row.join(sep)).join('\n') });
    }
  }, [data, onUpdateConfig]);

  const getInitialValue = useCallback((r: number, c: number) => {
    if (r === -1) return headers[c] || "";
    const rowData = rawRows[r];
    if (!rowData) return "";
    if (c === 0) return rowData.label || "";
    return rowData.values[c - 1]?.toString() || "";
  }, [headers, rawRows]);

  const handleEnterAtLastRow = useCallback((r: number, c: number, currentVal: string) => {
    const sep = getSeparator(data);
    const matrix = parseLines(data, sep);
    const matrixRowIdx = r + 1;
    if (matrix[matrixRowIdx]) {
      matrix[matrixRowIdx][c] = currentVal;
    }
    matrix.push(new Array(headers.length).fill(""));
    onUpdateConfig?.({ data: matrix.map(row => row.join(sep)).join('\n') });
    setActiveCell({ r: rawRows.length, c });
    setSelectionEnd(null);
    setIsEditing(false);
  }, [data, headers.length, onUpdateConfig, rawRows.length]);

  const {
    isTableActive, setIsTableActive, activeCell, setActiveCell,
    selectionEnd, setSelectionEnd,
    isEditing, setIsEditing, editValue, setEditValue, handleKeyDown
  } = useTableNavigation({
    rowCount: rawRows.length, colCount: headers.length, isHighlighted: !!isHighlighted,
    onUpdateValue: updateCSVValue, getInitialEditValue: getInitialValue,
    onEnterAtLastRow: handleEnterAtLastRow
  });

  useEffect(() => {
    if (!isEditing && isTableActive && isHighlighted && activeCell) {
      containerRef.current?.focus({ preventScroll: true });
    }
  }, [isEditing, isTableActive, isHighlighted, activeCell]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenFormatMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCellClick = (e: React.MouseEvent, r: number, c: number) => {
    e.stopPropagation();
    if (onActivate) onActivate();
    if (openFormatMenu !== null) setOpenFormatMenu(null);
    setIsTableActive(true);
    if (e.shiftKey && activeCell) {
      setSelectionEnd({ r, c });
    } else {
      setActiveCell({ r, c });
      setSelectionEnd(null);
    }
    if (isEditing && (activeCell?.r !== r || activeCell?.c !== c)) setIsEditing(false);
    setTimeout(() => containerRef.current?.focus({ preventScroll: true }), 0);
  };

  const handleCellDoubleClick = (e: React.MouseEvent, r: number, c: number) => {
    e.stopPropagation();
    if (onActivate) onActivate();
    if (openFormatMenu !== null) setOpenFormatMenu(null);
    setIsTableActive(true);
    setActiveCell({ r, c });
    setSelectionEnd(null);
    setEditValue(getInitialValue(r, c));
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    if (activeCell && shouldSaveOnBlur.current) {
      updateCSVValue(activeCell.r, activeCell.c, editValue);
    }
    setIsEditing(false);
    shouldSaveOnBlur.current = true;
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      shouldSaveOnBlur.current = false; 
      setIsEditing(false);
      return;
    }
    
    if (e.key === 'Enter' || e.key === 'Tab') {
      return;
    }
    
    e.stopPropagation(); 
  };

  const updateColumnConfig = (colIdx: number, updates: any) => {
    if (!onUpdateConfig) return;
    const newFormats = [...(columnFormats || [])];
    const newPrecisions = [...(columnPrecisions || [])];
    const newAlignments = [...(columnAlignments || [])];
    const newGoals = [...(columnGoals || [])];
    const newWidths = [...(columnWidths || [])];

    while (newFormats.length < headers.length) newFormats.push('TEXT');
    while (newPrecisions.length < headers.length) newPrecisions.push(0);
    while (newAlignments.length < headers.length) {
      newAlignments.push(newAlignments.length === 0 ? 'LEFT' : 'CENTER');
    }
    while (newGoals.length < headers.length) newGoals.push(goalValue);
    while (newWidths.length < headers.length) newWidths.push(100 / headers.length);

    if (updates.format) newFormats[colIdx] = updates.format;
    if (updates.precision !== undefined) newPrecisions[colIdx] = updates.precision;
    if (updates.alignment) newAlignments[colIdx] = updates.alignment;
    if (updates.goal !== undefined) newGoals[colIdx] = updates.goal;
    if (updates.width !== undefined) newWidths[colIdx] = updates.width;

    onUpdateConfig({
      columnFormats: newFormats,
      columnPrecisions: newPrecisions,
      columnAlignments: newAlignments,
      columnGoals: newGoals,
      columnWidths: newWidths
    });
  };

  const [resizingIdx, setResizingIdx] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidths, setStartWidths] = useState<number[]>([]);

  const finalColWidths = useMemo(() => {
    if (headers.length === 0) return [];
    if (columnWidths && Array.isArray(columnWidths) && columnWidths.length === headers.length) return columnWidths;
    return new Array(headers.length).fill(100 / headers.length);
  }, [headers.length, columnWidths]);

  const onResizeStart = (e: React.MouseEvent, idx: number) => {
    if (!isHighlighted) return;
    e.preventDefault(); 
    e.stopPropagation();
    setResizingIdx(idx);
    setStartX(e.clientX);
    setStartWidths([...finalColWidths]);
    setOpenFormatMenu(null);
  };

  useEffect(() => {
    if (resizingIdx === null) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const tableWidth = tableRef.current?.offsetWidth || 1;
      const deltaPercent = (deltaX / tableWidth) * 100;
      const newWidths = [...startWidths];
      const idx = resizingIdx;
      const oldVal = startWidths[idx];
      const newVal = Math.max(2, oldVal + deltaPercent);
      const actualDelta = newVal - oldVal;
      const rightColumns = startWidths.slice(idx + 1);
      const sumRight = rightColumns.reduce((a, b) => a + b, 0);
      if (sumRight > 0) {
        const maxGrowthPossible = sumRight - (rightColumns.length * 2);
        const cappedDelta = Math.min(actualDelta, maxGrowthPossible);
        newWidths[idx] = oldVal + cappedDelta;
        const factor = (sumRight - cappedDelta) / sumRight;
        for (let i = idx + 1; i < newWidths.length; i++) {
          newWidths[i] = startWidths[i] * factor;
        }
        onUpdateConfig?.({ columnWidths: newWidths });
      }
    };
    const handleMouseUp = () => setResizingIdx(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingIdx, startX, startWidths, onUpdateConfig]);

  const handleAddRow = (idx: number) => {
    const sep = getSeparator(data);
    const matrix = parseLines(data, sep);
    matrix.splice(idx + 2, 0, new Array(headers.length).fill(""));
    onUpdateConfig?.({ data: matrix.map(r => r.join(sep)).join('\n') });
  };

  const handleAddColumn = (idx: number) => {
    const sep = getSeparator(data);
    const matrix = parseLines(data, sep);
    const newMatrix = matrix.map((row, rIdx) => {
      const newRow = [...row];
      newRow.splice(idx + 1, 0, rIdx === 0 ? `Nova Coluna` : "");
      return newRow;
    });
    const newWidths = [...finalColWidths];
    newWidths.splice(idx + 1, 0, 15);
    const total = newWidths.reduce((a,b) => a+b, 0);
    const normWidths = newWidths.map(w => (w/total)*100);
    onUpdateConfig?.({ data: newMatrix.map(r => r.join(sep)).join('\n'), columnWidths: normWidths });
  };

  const handleDeleteActive = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!activeCell) return;
    const sep = getSeparator(data);
    const matrix = parseLines(data, sep);

    const minR = selectionEnd ? Math.min(activeCell.r, selectionEnd.r) : activeCell.r;
    const maxR = selectionEnd ? Math.max(activeCell.r, selectionEnd.r) : activeCell.r;
    const minC = selectionEnd ? Math.min(activeCell.c, selectionEnd.c) : activeCell.c;
    const maxC = selectionEnd ? Math.max(activeCell.c, selectionEnd.c) : activeCell.c;

    if (minR === -1) {
      if (headers.length > (maxC - minC + 1)) {
        const nm = matrix.map(row => row.filter((_, i) => i < minC || i > maxC));
        const filterFn = (_: any, i: number) => i < minC || i > maxC;
        const nw = finalColWidths.filter(filterFn);
        const nf = (columnFormats || []).filter(filterFn);
        const np = (columnPrecisions || []).filter(filterFn);
        const na = (columnAlignments || []).filter(filterFn);
        const ng = (columnGoals || []).filter(filterFn);

        onUpdateConfig?.({ 
          data: nm.map(row => row.join(sep)).join('\n'), 
          columnWidths: nw,
          columnFormats: nf,
          columnPrecisions: np,
          columnAlignments: na,
          columnGoals: ng
        });
        
        setActiveCell(null); 
        setSelectionEnd(null); 
        setIsTableActive(false);
      }
      return;
    }

    if (rawRows.length > (maxR - minR + 1)) {
      matrix.splice(minR + 1, (maxR - minR) + 1);
      onUpdateConfig?.({ data: matrix.map(row => row.join(sep)).join('\n') });
      
      setActiveCell(null); 
      setSelectionEnd(null); 
      setIsTableActive(false);
    }
  };

  const toggleSubtotal = (idx: number) => {
    if (idx === -1) return;
    const current = subtotalRows || [];
    const updated = current.includes(idx) ? current.filter(r => r !== idx) : [...current, idx];
    onUpdateConfig?.({ subtotalRows: updated });
  };

  const paddingValue = typeof density === 'number' ? density : 10;
  const getFontSizeClass = (p: number) => {
    if (p <= 4) return 'text-[8.5px]';
    if (p <= 8) return 'text-[10px]';
    if (p <= 16) return 'text-[11.5px]';
    return 'text-[13px]';
  };

  const ds = {
    header: { style: { paddingTop: `${paddingValue * 1.2}px`, paddingBottom: `${paddingValue * 1.2}px`, paddingLeft: '1rem', paddingRight: '1rem' }, fontClass: getFontSizeClass(paddingValue) },
    cell: { style: { paddingTop: `${paddingValue}px`, paddingBottom: `${paddingValue}px`, paddingLeft: '1rem', paddingRight: '1rem' }, fontClass: getFontSizeClass(paddingValue) }
  };

  const getAlign = (c: number) => {
    const a = columnAlignments?.[c] || (c === 0 ? 'LEFT' : 'CENTER');
    return a === 'LEFT' ? 'text-left' : a === 'RIGHT' ? 'text-right' : 'text-center';
  };

  const getJustify = (c: number) => {
    const a = columnAlignments?.[c] || (c === 0 ? 'LEFT' : 'CENTER');
    return a === 'LEFT' ? 'justify-start' : a === 'RIGHT' ? 'justify-end' : 'justify-center';
  };

  const isInRange = (r: number, c: number) => {
    if (!activeCell || !selectionEnd) return false;
    const minR = Math.min(activeCell.r, selectionEnd.r);
    const maxR = Math.max(activeCell.r, selectionEnd.r);
    const minC = Math.min(activeCell.c, selectionEnd.c);
    const maxC = Math.max(activeCell.c, selectionEnd.c);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const hasRangeSelection = !!(activeCell && selectionEnd);

  return (
    <div 
      ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown}
      onClick={(e) => { e.stopPropagation(); if (onActivate) onActivate(); setIsTableActive(true); if (!isEditing) containerRef.current?.focus({ preventScroll: true }); }}
      className={`w-full border rounded-xl shadow-md mt-1 relative outline-none transition-all ${isHighlighted ? 'pt-16' : 'pt-0'} ${isTableActive ? 'ring-2 ring-opacity-50 shadow-lg' : ''} ${isBlueTheme ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} ${isHighlighted ? 'overflow-visible' : 'overflow-hidden'}`}
      style={{ borderColor: isTableActive ? colors.accent : undefined }}
    >
      {isHighlighted && isTableActive && activeCell && !isEditing && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[700] flex items-center gap-1 bg-white shadow-2xl border border-slate-200 rounded-full p-1.5 animate-in slide-in-from-top-1 no-print min-w-max">
          {!hasRangeSelection && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleAddRow(activeCell.r); }} className="p-1.5 hover:bg-blue-50 text-[#0079C2] rounded-lg flex items-center gap-1"><Rows2 size={14} /><Plus size={10} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleAddColumn(activeCell.c); }} className="p-1.5 hover:bg-blue-50 text-[#0079C2] rounded-lg flex items-center gap-1"><Columns2 size={14} /><Plus size={10} /></button>
              <div className="w-px h-4 bg-slate-100 mx-1" />
            </>
          )}
          {activeCell.r >= 0 && !hasRangeSelection && (
            <>
              <button onClick={(e) => { e.stopPropagation(); toggleSubtotal(activeCell.r); }} className={`p-1.5 rounded-lg transition-all ${subtotalRows?.includes(activeCell.r) ? 'bg-[#0079C2] text-white shadow-inner' : 'hover:bg-blue-50 text-[#006098]'}`}><Sigma size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); onUpdateConfig?.({ lastRowIsTotal: !lastRowIsTotal }); }} className={`p-1.5 rounded-lg transition-all ${lastRowIsTotal ? 'bg-[#006098] text-white shadow-inner' : 'hover:bg-blue-50 text-[#006098]'}`}><Calculator size={14} /></button>
              <div className="w-px h-4 bg-slate-100 mx-1" />
            </>
          )}
          <button onClick={handleDeleteActive} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg flex items-center gap-1.5 pr-2">
            <Trash2 size={14} />
            {hasRangeSelection && <span className="text-[10px] font-black uppercase">Excluir Intervalo</span>}
          </button>
        </div>
      )}

      <table ref={tableRef} className="w-full border-separate border-spacing-0 table-fixed select-none">
        <colgroup>{finalColWidths.map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}</colgroup>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <TableHeaderCell 
                key={i} index={i} label={h} isTableActive={isTableActive}
                isActive={activeCell?.r === -1 && activeCell?.c === i}
                isSelected={isInRange(-1, i)}
                isEditing={activeCell?.r === -1 && activeCell?.c === i && isEditing}
                editValue={editValue} isHighlighted={isHighlighted} isBlueTheme={isBlueTheme}
                isFormatting={openFormatMenu === i} colors={colors} fontClass={ds.header.fontClass}
                paddingStyle={ds.header.style} columnFormats={columnFormats}
                columnPrecisions={columnPrecisions} columnAlignments={columnAlignments}
                columnGoals={columnGoals} onCellClick={handleCellClick}
                onCellDoubleClick={handleCellDoubleClick} onEditValueChange={setEditValue}
                onInputBlur={handleInputBlur} onInputKeyDown={handleInputKeyDown}
                onToggleFormatMenu={setOpenFormatMenu} onUpdateColumnConfig={updateColumnConfig}
                onResizeStart={onResizeStart} isLastColumn={i === headers.length - 1}
                getAlignClass={getAlign} getJustifyClass={getJustify}
              />
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${isBlueTheme ? 'divide-white/5' : 'divide-slate-100'}`}>
          {rawRows.map((row, rIdx) => {
            const isSub = subtotalRows?.includes(rIdx);
            const isTot = lastRowIsTotal && rIdx === rawRows.length - 1;
            const rowData = [row.label, ...row.values];
            return (
              <TableDataRow key={rIdx} index={rIdx} isTotal={isTot} isSubtotal={isSub} isBlueTheme={isBlueTheme} colors={colors}>
                {rowData.map((val, cIdx) => (
                  <TableDataCell 
                    key={cIdx} rowIndex={rIdx} colIndex={cIdx} value={val}
                    isTableActive={isTableActive} isActive={activeCell?.r === rIdx && activeCell?.c === cIdx}
                    isSelected={isInRange(rIdx, cIdx)} isEditing={activeCell?.r === rIdx && activeCell?.c === cIdx && isEditing}
                    editValue={editValue} isHighlighted={isHighlighted} isBlueTheme={isBlueTheme}
                    isTotal={isTot} isSubtotal={isSub} isTargeted={targetColumns?.includes(cIdx)}
                    infographicMode={infographicMode} density={density}
                    maxRowValue={Math.max(...rawRows.map(r => parseNumber(cIdx === 0 ? r.label : r.values[cIdx - 1])), 1)}
                    colors={colors} fontClass={ds.cell.fontClass} paddingStyle={ds.cell.style}
                    columnFormats={columnFormats} columnPrecisions={columnPrecisions}
                    columnGoals={columnGoals} goalValue={goalValue} wrapText={wrapText}
                    onCellClick={handleCellClick} onCellDoubleClick={handleCellDoubleClick}
                    onEditValueChange={setEditValue} onInputBlur={handleInputBlur}
                    onInputKeyDown={handleInputKeyDown} onAddRow={handleAddRow}
                    getAlignClass={getAlign} getJustifyClass={getJustify}
                  />
                ))}
              </TableDataRow>
            );
          })}
        </tbody>
      </table>
      {isHighlighted && isTableActive && <div className="absolute -bottom-6 right-0 text-[8px] font-black uppercase animate-pulse" style={{color: colors.accent}}>Modo Tabela Ativo • ESC para sair</div>}
    </div>
  );
};
