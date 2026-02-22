
import React, { useMemo, useState, useEffect } from 'react';
import { InfographicMode, DensityLevel, ColumnFormatType, TableTheme } from '../../types';
import { Sigma, Table as TableIcon, LayoutGrid, Type, Plus, Trash2, X, Hash, ArrowUpFromLine, ArrowLeftRight, ToggleLeft, ToggleRight, Target, Sparkles, MoveVertical, Palette } from 'lucide-react';
import { parseCSVDataWithHeaders, parseNumber } from '../../utils/data-utils';

interface TableEditorProps {
  config: any;
  onUpdate: (updates: any) => void;
}

const THEME_OPTIONS: { id: TableTheme, color: string, label: string }[] = [
  { id: 'MAG', color: '#0079C2', label: 'MAG Seguros' },
  { id: 'GREEN', color: '#10b981', label: 'Escorbe' },
  { id: 'TEAL', color: '#0d9488', label: 'Equilíbrio' },
  { id: 'SLATE', color: '#64748b', label: 'Neutro' },
  { id: 'ROSE', color: '#e11d48', label: 'Atenção' },
  { id: 'ORANGE', color: '#ea580c', label: 'Energia' },
];

export const TableEditor: React.FC<TableEditorProps> = ({ config, onUpdate }) => {
  const [viewMode, setViewMode] = useState<'GRID' | 'TEXT'>('GRID');

  const { headers, rows: dataPoints } = useMemo(() => 
    parseCSVDataWithHeaders(config.data || ""), 
    [config.data]
  );

  useEffect(() => {
    const currentWidths = config.columnWidths || [];
    if (headers.length > 0 && currentWidths.length !== headers.length) {
      const perCol = Math.floor(100 / headers.length);
      const newWidths = new Array(headers.length).fill(perCol);
      newWidths[newWidths.length - 1] = 100 - (perCol * (newWidths.length - 1));
      onUpdate({ columnWidths: newWidths });
    }
  }, [headers.length]);

  const saveToCSV = (newHeaders: string[], newData: any[]) => {
    const headerLine = newHeaders.join('\t');
    const dataLines = newData.map(row => 
      newHeaders.map(h => {
        const val = row[h];
        return (val === undefined || val === null) ? '' : val;
      }).join('\t')
    );

    const finalCsv = [headerLine, ...dataLines].join('\n');
    onUpdate({ data: finalCsv });
  };

  const handleHeaderChange = (idx: number, newTitle: string) => {
    const sanitizedTitle = newTitle.replace(/\t/g, ' ').trim();
    if (!sanitizedTitle) return;
    
    const oldTitle = headers[idx];
    const newHeaders = [...headers];
    newHeaders[idx] = sanitizedTitle;
    
    const newData = dataPoints.map(row => {
      const newRow = { ...row };
      newRow[sanitizedTitle] = row[oldTitle];
      delete row[oldTitle];
      return newRow;
    });
    
    saveToCSV(newHeaders, newData);
  };

  const handleCellChange = (rowIndex: number, key: string, newValue: string) => {
    const newData = [...dataPoints];
    const isFirstCol = headers.indexOf(key) === 0;
    
    if (isFirstCol) {
      newData[rowIndex][key] = newValue;
    } else {
      const cleanVal = newValue.replace(/[^\d.,-]/g, '').replace(',', '.');
      const val = parseFloat(cleanVal);
      newData[rowIndex][key] = isNaN(val) ? 0 : val;
    }
    
    saveToCSV(headers, newData);
  };

  const handleSmartPaste = (e: React.ClipboardEvent, startRow: number, startColKey: string) => {
    const pasteText = e.clipboardData.getData('text');
    if (!pasteText.includes('\t') && !pasteText.includes('\n')) {
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const lines = pasteText.split(/\r?\n/).filter(line => line.length > 0);
    const pasteMatrix = lines.map(line => line.split('\t'));
    const startColIdx = headers.indexOf(startColKey);
    let currentHeaders = [...headers];
    let currentRows = [...dataPoints];

    const maxColsNeeded = startColIdx + Math.max(...pasteMatrix.map(row => row.length));
    while (currentHeaders.length < maxColsNeeded) {
      currentHeaders.push(`Col ${currentHeaders.length}`);
    }

    pasteMatrix.forEach((pasteRow, rOffset) => {
      const targetRowIdx = startRow + rOffset;
      if (!currentRows[targetRowIdx]) {
        const newRow: any = {};
        currentHeaders.forEach((h, i) => newRow[h] = i === 0 ? '' : 0);
        currentRows[targetRowIdx] = newRow;
      }
      
      const updatedRow = { ...currentRows[targetRowIdx] };
      pasteRow.forEach((value, cOffset) => {
        const targetColIdx = startColIdx + cOffset;
        const colKey = currentHeaders[targetColIdx];
        if (colKey) {
          if (targetColIdx === 0) updatedRow[colKey] = value.trim();
          else updatedRow[colKey] = parseNumber(value);
        }
      });
      currentRows[targetRowIdx] = updatedRow;
    });
    saveToCSV(currentHeaders, currentRows);
  };

  const addRow = () => {
    const newRow: any = {};
    headers.forEach((h, i) => newRow[h] = i === 0 ? 'Novo Item' : 0);
    saveToCSV(headers, [...dataPoints, newRow]);
  };

  const deleteRow = (idx: number) => {
    const newData = dataPoints.filter((_, i) => i !== idx);
    saveToCSV(headers, newData);
  };

  const addColumn = () => {
    const newColName = `Coluna ${headers.length}`;
    let finalName = newColName;
    let counter = 1;
    while (headers.includes(finalName)) finalName = `${newColName} (${counter++})`;
    const newHeaders = [...headers, finalName];
    const newData = dataPoints.length > 0 
      ? dataPoints.map(row => ({ ...row, [finalName]: 0 }))
      : [{ [newHeaders[0]]: 'Exemplo', [finalName]: 0 }];
    saveToCSV(newHeaders, newData);
  };

  const removeColumn = (idx: number) => {
    if (idx === 0) return;
    const colToRemove = headers[idx];
    const newHeaders = headers.filter((_, i) => i !== idx);
    const newData = dataPoints.map(row => {
      const newRow = { ...row };
      delete newRow[colToRemove];
      return newRow;
    });
    saveToCSV(newHeaders, newData);
  };

  const updateColumnGoal = (idx: number, goal: number) => {
    const newGoals = [...(config.columnGoals || [])];
    while(newGoals.length < headers.length) newGoals.push(config.goalValue || 100);
    newGoals[idx] = goal;
    onUpdate({ columnGoals: newGoals });
  };

  const toggleTargetColumn = (idx: number) => {
    const currentTargets = [...(config.targetColumns || [])];
    const newTargets = currentTargets.includes(idx)
      ? currentTargets.filter(c => c !== idx)
      : [...currentTargets, idx].sort();
    onUpdate({ targetColumns: newTargets });
  };

  const currentDensity = typeof config.density === 'number' ? config.density : 10;

  return (
    <div className="space-y-4">
      
      {/* SELETOR DE TEMA DA TABELA */}
      <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
        <label className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-2 mb-1">
          <Palette size={12} className="text-[#00A7E7]" />
          <span>Tema Cromático</span>
        </label>
        <div className="flex flex-wrap gap-2">
           {THEME_OPTIONS.map(opt => (
             <button
                key={opt.id}
                onClick={() => onUpdate({ tableTheme: opt.id })}
                title={opt.label}
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                  (config.tableTheme || 'MAG') === opt.id ? 'ring-2 ring-blue-400 ring-offset-1 border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: opt.color }}
             >
                {(config.tableTheme || 'MAG') === opt.id && <X size={10} className="text-white rotate-45" strokeWidth={4} />}
             </button>
           ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Entrada de Dados</label>
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1 shadow-inner">
          <button 
            onClick={() => setViewMode('GRID')} 
            className={`flex items-center gap-1 px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${viewMode === 'GRID' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <LayoutGrid size={10} /> Planilha
          </button>
          <button 
            onClick={() => setViewMode('TEXT')} 
            className={`flex items-center gap-1 px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${viewMode === 'TEXT' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <Type size={10} /> CSV/Texto
          </button>
        </div>
      </div>

      {viewMode === 'TEXT' ? (
        <div className="space-y-1">
          <textarea 
            value={config.data} 
            onChange={(e) => onUpdate({ data: e.target.value })} 
            className="w-full p-2 text-[10px] font-mono border rounded h-40 bg-slate-900 text-white shadow-inner outline-none focus:ring-1 focus:ring-[#0079C2]"
            placeholder="Cargos\tMeta\tReal\nCEO\t100\t98"
          />
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-slate-50 shadow-inner ring-1 ring-slate-200">
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-[10px] border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-200 sticky top-0 z-10">
                  <th className="p-1 border-r border-slate-300 w-8"></th>
                  {headers.map((h, i) => (
                    <th key={i} className="p-0 border-r border-slate-300 min-w-[120px] relative group/header-cell">
                      <input type="text" value={h} onChange={(e) => handleHeaderChange(i, e.target.value)} onPaste={(e) => e.stopPropagation()} className="w-full p-1.5 bg-slate-200 text-[#006098] font-black uppercase text-[9px] outline-none focus:bg-white text-center transition-colors" />
                      {i > 0 && <button onClick={() => removeColumn(i)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover/header-cell:opacity-100 transition-opacity bg-slate-200/80 rounded"><X size={10} strokeWidth={3} /></button>}
                    </th>
                  ))}
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-200 bg-white group/row hover:bg-blue-50/20">
                    <td className="p-1 text-center text-slate-300 font-mono text-[8px] border-r">{rIdx + 1}</td>
                    {headers.map((h, hIdx) => (
                      <td key={hIdx} className="p-0 border-r border-slate-100">
                        <input type="text" value={row[h] ?? ''} onChange={(e) => handleCellChange(rIdx, h, e.target.value)} onPaste={(e) => handleSmartPaste(e, rIdx, h)} className={`w-full p-2 bg-transparent outline-none focus:bg-blue-50/50 ${hIdx === 0 ? 'font-bold text-slate-700' : 'text-center text-slate-500'}`} />
                      </td>
                    ))}
                    <td className="p-1 text-center"><button onClick={() => deleteRow(rIdx)} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2 flex gap-2 bg-slate-100 border-t border-slate-200">
            <button onClick={addRow} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-[#415364] uppercase hover:text-[#0079C2] hover:border-[#0079C2] transition-all flex items-center justify-center gap-1 shadow-sm"><Plus size={10} strokeWidth={3} /> Linha</button>
            <button onClick={addColumn} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-[#415364] uppercase hover:text-[#0079C2] hover:border-[#0079C2] transition-all flex items-center justify-center gap-1 shadow-sm"><Plus size={10} strokeWidth={3} /> Coluna</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Modo Infográfico</label>
          <select value={config.infographicMode || 'NONE'} onChange={(e) => onUpdate({ infographicMode: e.target.value as InfographicMode })} className="w-full p-1.5 text-[10px] border rounded bg-white font-bold text-[#006098]">
            <option value="NONE">Tabela Padrão</option>
            <option value="SPARKBAR">Sparkbar (Barras)</option>
            <option value="GOAL">Atingimento % (Goal)</option>
            <option value="HEATMAP">Heatmap (Calor)</option>
            <option value="STATUS">Status (Farol Dot)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Meta Geral</label>
          <input type="number" value={config.goalValue || 100} onChange={(e) => onUpdate({ goalValue: parseFloat(e.target.value) })} className="w-full p-1.5 text-[10px] border rounded" />
        </div>
      </div>

      <div className="space-y-2 p-3 bg-slate-50 border rounded-xl">
        <label className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-2 mb-2">
          <Sparkles size={12} className="text-[#00A7E7]" />
          <span>Formatação Visual</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {headers.slice(1).map((h, i) => {
            const colIdx = i + 1;
            const isSelected = config.targetColumns?.includes(colIdx);
            return (
              <button key={colIdx} onClick={() => toggleTargetColumn(colIdx)} className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase transition-all flex items-center gap-2 ${isSelected ? 'bg-[#0079C2] border-[#0079C2] text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                {isSelected && <Target size={10} />}
                {h}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 bg-blue-50/30 rounded-lg border border-blue-100">
        <label className="flex items-center justify-between cursor-pointer group"><span className="text-[10px] font-bold text-[#006098] uppercase group-hover:text-[#00A7E7]">Total Geral (Última linha)</span><div onClick={() => onUpdate({ lastRowIsTotal: !config.lastRowIsTotal })} className={`transition-colors ${config.lastRowIsTotal ? 'text-[#00A7E7]' : 'text-slate-300'}`}>{config.lastRowIsTotal ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</div></label>
        <label className="flex items-center justify-between cursor-pointer group pt-1 border-t border-blue-100/50"><span className="text-[10px] font-bold text-[#006098] uppercase group-hover:text-[#00A7E7]">Quebrar linhas</span><div onClick={() => onUpdate({ wrapText: !config.wrapText })} className={`transition-colors ${config.wrapText ? 'text-[#00A7E7]' : 'text-slate-300'}`}>{config.wrapText ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</div></label>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-2"><div className="flex items-center gap-1"><MoveVertical size={10} className="text-[#00A7E7]" /><span>Espaçamento</span></div><span className="text-[#0079C2] font-black">{currentDensity}px</span></div>
        <div className="px-1"><input type="range" min="2" max="32" step="2" value={currentDensity} onChange={(e) => onUpdate({ density: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A7E7] hover:accent-[#0079C2] transition-all" /></div>
      </div>
    </div>
  );
};
