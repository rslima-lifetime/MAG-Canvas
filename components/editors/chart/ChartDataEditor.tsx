
import React, { useMemo, useState } from 'react';
import { LayoutGrid, Type, Plus, Trash2, X } from 'lucide-react';
import { parseCSVDataWithHeaders, parseNumber } from '../../../utils/data-utils';

interface ChartDataEditorProps {
  data: string;
  onUpdateData: (newData: string) => void;
}

export const ChartDataEditor: React.FC<ChartDataEditorProps> = ({ data, onUpdateData }) => {
  const [viewMode, setViewMode] = useState<'GRID' | 'TEXT'>('GRID');

  const { headers, rows: dataPoints } = useMemo(() => 
    parseCSVDataWithHeaders(data || ""), 
    [data]
  );

  const saveToCSV = (newHeaders: string[], newData: any[]) => {
    const headerLine = newHeaders.join('\t');
    const dataLines = newData.map(row => 
      newHeaders.map(h => {
        const val = row[h];
        return (val === undefined || val === null) ? '' : val;
      }).join('\t')
    );

    const finalCsv = [headerLine, ...dataLines].join('\n');
    onUpdateData(finalCsv);
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
    if (!pasteText.includes('\t') && !pasteText.includes('\n')) return;
    e.preventDefault();

    const lines = pasteText.split(/\r?\n/).filter(line => line.length > 0);
    const pasteMatrix = lines.map(line => line.split('\t'));
    const startColIdx = headers.indexOf(startColKey);
    let currentHeaders = [...headers];
    let currentRows = [...dataPoints];

    const maxColsNeeded = startColIdx + Math.max(...pasteMatrix.map(row => row.length));
    while (currentHeaders.length < maxColsNeeded) {
      currentHeaders.push(`Série ${currentHeaders.length}`);
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
    const newColName = `Série ${headers.length}`;
    let finalName = newColName;
    let counter = 1;
    while (headers.includes(finalName)) finalName = `${newColName} (${counter++})`;
    const newHeaders = [...headers, finalName];
    let newData = [...dataPoints];
    if (newData.length === 0) {
      const firstRow: any = {};
      newHeaders.forEach((h, i) => firstRow[h] = i === 0 ? 'Exemplo' : 0);
      newData = [firstRow];
    } else {
      newData = newData.map(row => ({ ...row, [finalName]: 0 }));
    }
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

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Interface de Dados</label>
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1 shadow-inner">
          <button onClick={() => setViewMode('GRID')} className={`flex-1 flex items-center justify-center gap-1 p-1 rounded text-[8px] font-black uppercase transition-all ${viewMode === 'GRID' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>
            <LayoutGrid size={10} /> Planilha
          </button>
          <button onClick={() => setViewMode('TEXT')} className={`flex-1 flex items-center justify-center gap-1 p-1 rounded text-[8px] font-black uppercase transition-all ${viewMode === 'TEXT' ? 'bg-white text-[#0079C2] shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>
            <Type size={10} /> CSV/Texto
          </button>
        </div>
      </div>

      {viewMode === 'TEXT' ? (
        <textarea 
          value={data} 
          onChange={(e) => onUpdateData(e.target.value)} 
          className="w-full p-2 text-[10px] font-mono border rounded h-48 bg-slate-900 text-slate-100 outline-none shadow-lg"
          placeholder="Mês	Série1	Série2&#10;Jan	10	20"
        />
      ) : (
        <div className="border rounded-xl overflow-hidden bg-slate-50 shadow-inner ring-1 ring-slate-200">
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-[10px] border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-200 sticky top-0 z-10">
                  <th className="p-1 border-r border-slate-300 w-8"></th>
                  {headers.map((h, i) => (
                    <th key={i} className="p-0 border-r border-slate-300 min-w-[120px] relative group/header-cell">
                      <input 
                        type="text"
                        value={h}
                        onChange={(e) => handleHeaderChange(i, e.target.value)}
                        className="w-full p-1.5 bg-slate-200 text-[#006098] font-black uppercase text-[9px] outline-none focus:bg-white text-center transition-colors"
                      />
                      {i > 0 && (
                        <button 
                          onClick={() => removeColumn(i)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover/header-cell:opacity-100 transition-opacity bg-slate-200/80 rounded"
                        >
                          <X size={10} strokeWidth={3} />
                        </button>
                      )}
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
                        <input 
                          type="text"
                          value={row[h] ?? ''}
                          onChange={(e) => handleCellChange(rIdx, h, e.target.value)}
                          onPaste={(e) => handleSmartPaste(e, rIdx, h)}
                          className={`w-full p-2 bg-transparent outline-none focus:bg-blue-50/50 ${hIdx === 0 ? 'font-bold text-slate-700' : 'text-right text-slate-500'}`}
                        />
                      </td>
                    ))}
                    <td className="p-1 text-center">
                      <button 
                        onClick={() => deleteRow(rIdx)} 
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
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
    </div>
  );
};
