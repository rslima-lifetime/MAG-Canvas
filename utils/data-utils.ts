
import { ColumnFormatType } from '../types';

export const parseNumber = (v: any): number => {
  if (typeof v === 'number') return v;
  if (v === undefined || v === null || v === '') return 0;
  
  let s = v.toString()
    .replace(/\s/g, '')
    .replace(/[^\d.,-]/g, '');
  
  if (s === '') return 0;

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  
  if (lastComma > -1 && lastComma > lastDot) {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (lastComma > -1 && lastDot === -1) {
    s = s.replace(/,/g, '.');
  }

  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

const splitLine = (line: string, sep: string | RegExp): string[] => {
  if (sep === ',') {
    return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, ''));
  }
  return line.split(sep);
};

export const parseCSVDataWithHeaders = (data: string) => {
  if (!data || data === '') return { headers: ['Categoria', 'Série 1'], rows: [] };
  
  const lines = data.split(/\r?\n/).filter(l => l.trim() !== "");
  if (lines.length === 0) return { headers: ['Categoria', 'Série 1'], rows: [] };

  const firstLine = lines[0];
  let sep: string | RegExp = /\t/;
  
  // Prioriza tabulação (Excel/Sheets), depois ponto-e-vírgula (CSV Brasil)
  if (firstLine.includes('\t')) {
    sep = '\t';
  } else if (firstLine.includes(';')) {
    sep = ';';
  } else if (firstLine.includes(',')) {
    sep = ',';
  } else {
    sep = /\s{2,}/;
  }
  
  const rawHeaders = splitLine(lines[0], sep).map(h => h.trim());
  const headers: string[] = [];
  const headerCounts: Record<string, number> = {};

  rawHeaders.forEach(h => {
    const title = h || "Coluna";
    if (headerCounts[title]) {
      headerCounts[title]++;
      headers.push(`${title} (${headerCounts[title]})`);
    } else {
      headerCounts[title] = 1;
      headers.push(title);
    }
  });

  if (lines.length === 1) {
    return { headers, rows: [] };
  }

  const dataLines = lines.slice(1);
  const rows = dataLines.map(line => {
    const parts = splitLine(line, sep);
    const row: any = {};
    headers.forEach((h, idx) => {
      if (idx === 0) {
        row[h] = parts[idx] !== undefined ? parts[idx].trim() : '';
      } else {
        row[h] = parts[idx] !== undefined ? parseNumber(parts[idx]) : 0;
      }
    });
    return row;
  });

  return { headers, rows };
};

export const parseCSVData = (data: string) => {
  return parseCSVDataWithHeaders(data).rows;
};

export const parseMatrixData = (rawData: string) => {
  if (!rawData || rawData === '') {
    return { 
      headers: ['Categoria', 'Valor'], 
      rows: [], 
      columnFormats: ['TEXT', 'TEXT'] as ColumnFormatType[],
      columnPrecisions: [0, 0]
    };
  }

  const allLines = rawData.split(/\r?\n/).filter(l => l.trim() !== "");
  if (allLines.length === 0) {
     return { headers: ['Categoria', 'Valor'], rows: [], columnFormats: [], columnPrecisions: [] };
  }

  const firstLine = allLines[0];
  let sep: string | RegExp = /\t/;
  if (firstLine.includes('\t')) {
    sep = '\t';
  } else if (firstLine.includes(';')) {
    sep = ';';
  } else if (firstLine.includes(',')) {
    sep = ',';
  } else {
    sep = /\s{2,}/;
  }

  const headers = splitLine(allLines[0], sep).map(h => h.trim() || "Coluna");
  const colCount = headers.length;

  const rows = allLines.slice(1).map(line => {
    const parts = splitLine(line, sep);
    const label = (parts[0] || '').trim();
    const values = [];
    for (let i = 1; i < colCount; i++) {
      values.push(parts[i]?.trim() || '');
    }
    return { label, values };
  });

  return {
    headers,
    rows,
    columnFormats: headers.map(() => 'TEXT' as ColumnFormatType),
    columnPrecisions: headers.map(() => 0)
  };
};

export const formatValueWithFormat = (val: any, format: ColumnFormatType, precision: number = 0) => {
  if (format === 'TEXT') return val?.toString() || '';
  
  const num = typeof val === 'number' ? val : parseNumber(val);

  const opt = { 
    minimumFractionDigits: precision, 
    maximumFractionDigits: precision 
  };

  switch (format) {
    case 'PERCENT':
      return `${num.toLocaleString('pt-BR', opt)}%`;
    case 'CURRENCY':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        ...opt
      }).format(num);
    case 'DATE':
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
      } catch(e) {}
      return val?.toString() || '';
    case 'TIME':
      if (typeof val === 'number') return `${val}h`;
      return val?.toString() || '';
    case 'NUMBER':
    default:
      return num.toLocaleString('pt-BR', opt);
  }
};
