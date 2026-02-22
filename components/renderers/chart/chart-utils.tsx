
import React from 'react';
import { LabelContent, PageTheme, DesignSystem } from '../../../types';

// --- CONSTANTES ---
export const MAG_COLORS = ['#0079C2', '#00A7E7', '#006098', '#415364', '#10B981', '#F59E0B', '#EF4444'];
export const BLUE_THEME_COLORS = ['#FFFFFF', '#00A7E7', '#E0F2FE', '#34D399', '#FBBF24', '#FB7185'];
export const FUTURE_COLORS = ['#00A7E7', '#0079C2', '#002B49', '#BAE6FD', '#006098', '#7DD3FC'];
export const GOLD_COLOR = '#F59E0B';

// --- HELPERS ---

export const getActiveColors = (theme: PageTheme, designSystem: DesignSystem) => {
  if (designSystem === 'FUTURE') return FUTURE_COLORS;
  return theme === 'BLUE' ? BLUE_THEME_COLORS : MAG_COLORS;
};

export const formatDisplayValue = (val: any, abbreviate: boolean, stackMode?: string) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return "0";
  
  if (stackMode === 'PERCENT') return (num * 100).toFixed(0) + '%';

  if (abbreviate && Math.abs(num) >= 1000000) return (num / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'mi';
  if (abbreviate && Math.abs(num) >= 1000) return (num / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
  return num.toLocaleString('pt-BR');
};

export const wrapText = (text: any, maxLength: number) => {
  const str = String(text || "");
  if (!str) return [""];
  const words = str.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine === '' ? '' : ' ') + word;
    } else {
      if (currentLine !== '') lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine !== '') lines.push(currentLine);
  
  return lines.map(line => line.length > maxLength + 2 ? line.substring(0, maxLength) + '..' : line);
};

// --- COMPONENTES DE RENDERIZAÇÃO (TICKS) ---

interface TickProps {
  x: number;
  y: number;
  payload: { value: string };
  fontSize: number;
  axisTextColor: string;
  isFuture: boolean;
  extraMargin?: number;
}

export const CustomXAxisTick: React.FC<any> = ({ x, y, payload, fontSize, axisTextColor, isFuture, extraMargin = 0 }) => {
  const lines = wrapText(payload.value, 10);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} y={0} 
        dy={fontSize + 10 + extraMargin} 
        textAnchor="middle" 
        fill={axisTextColor} 
        fontSize={fontSize} 
        fontWeight={isFuture ? 900 : 700}
        style={{ opacity: isFuture ? 0.8 : 1 }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : fontSize + 3}>{line}</tspan>
        ))}
      </text>
    </g>
  );
};

export const CustomYAxisTick: React.FC<any> = ({ x, y, payload, fontSize, axisTextColor, isFuture, extraMargin = 0 }) => {
  const lines = wrapText(payload.value, 12);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={-6 - extraMargin} 
        y={0} 
        textAnchor="end" 
        dominantBaseline="central"
        fill={axisTextColor} 
        fontSize={fontSize} 
        fontWeight={isFuture ? 900 : 700}
        style={{ opacity: isFuture ? 0.8 : 1 }}
      >
        {lines.map((line, i) => (
          <tspan 
            key={i} 
            x={-6 - extraMargin} 
            dy={i === 0 ? `-${(lines.length - 1) * (fontSize/2)}px` : `${fontSize + 1}px`}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Factory function para gerar o renderizador de labels de pizza com contexto
export const getPieLabelRender = (
  showLabels: boolean,
  labelContent: LabelContent,
  fontSize: number,
  isFuture: boolean,
  isBlueTheme: boolean,
  abbreviate: boolean
) => {
  return (props: any) => {
    if (!showLabels) return null;
    const { value, percent, name, x, y, textAnchor } = props;
    const p = (percent * 100).toFixed(0) + '%';
    const v = formatDisplayValue(value, abbreviate);
    
    const showName = labelContent.startsWith('LABEL') || labelContent === 'ALL';
    const nameLines = showName ? wrapText(name, 12) : [];
    
    let dataPart = "";
    switch(labelContent) {
      case 'PERCENT': dataPart = p; break;
      case 'LABEL_VALUE': dataPart = v; break;
      case 'LABEL_PERCENT': dataPart = p; break;
      case 'ALL': dataPart = `${v} (${p})`; break;
      case 'VALUE':
      default: dataPart = v; break;
    }

    const color = isFuture ? '#002B49' : (isBlueTheme ? '#fff' : "#006098");
    const lineHeight = 1.1; 

    const horizontalOffset = textAnchor === 'end' ? -8 : 8;
    const adjustedX = x + horizontalOffset;

    return (
      <text x={adjustedX} y={y} fill={color} textAnchor={textAnchor} dominantBaseline="central" fontSize={fontSize} fontWeight="900">
        {nameLines.map((line, i) => (
          <tspan 
            key={i} 
            x={adjustedX} 
            dy={i === 0 ? `-${(nameLines.length * lineHeight) / 2}em` : `${lineHeight}em`} 
            fontWeight="bold" 
            opacity={0.8}
          >
            {line}
          </tspan>
        ))}
        <tspan 
          x={adjustedX} 
          dy={showName ? `${lineHeight}em` : "0"} 
          fontSize={fontSize + 1} 
          fontWeight="900"
          fill={isFuture ? '#00A7E7' : color}
        >
          {dataPart}
        </tspan>
      </text>
    );
  };
};
