import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend, ReferenceLine
} from 'recharts';
import { ChartType, LabelPosition, LabelContent, PageTheme, DesignSystem, DocumentFormat } from '../../types';
import { parseCSVData } from '../../utils/data-utils';
import { BarChart3, RefreshCw } from 'lucide-react';
import { 
  CustomXAxisTick, CustomYAxisTick, getPieLabelRender, 
  formatDisplayValue, getActiveColors, GOLD_COLOR 
} from './chart/chart-utils';

interface ChartBlockProps {
  data: string;
  type: ChartType;
  stackMode?: 'GROUPED' | 'STACKED' | 'PERCENT';
  fontSize?: number;
  xAxisMargin?: number;
  chartHeight?: number; 
  abbreviate?: boolean;
  labelPosition?: LabelPosition;
  showLabels?: boolean;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean; 
  labelContent?: LabelContent;
  showGoalLine?: boolean;
  goalValue?: number;
  theme?: PageTheme;
  designSystem?: DesignSystem;
  layoutFormat?: DocumentFormat;
  isHighlighted?: boolean;
  onUpdateData?: (newData: string) => void;
  onUpdateConfig?: (updates: any) => void;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ 
  data, type, stackMode = 'GROUPED', fontSize = 8, xAxisMargin = 0, chartHeight, abbreviate, showLabels, showLegend, showXAxis = true, showYAxis = false,
  labelContent, showGoalLine, goalValue = 100, theme = 'LIGHT', designSystem = 'STANDARD', 
  layoutFormat = 'REPORT', isHighlighted, onUpdateConfig
}) => {
  const isBlueTheme = theme === 'BLUE';
  const isFuture = designSystem === 'FUTURE';
  const dataPoints = useMemo(() => parseCSVData(data), [data]);
  
  // Fixed: removed redundant default values since theme and designSystem are already defaulted in destructuring.
  // This avoids treating the arguments as generic strings (e.g. from theme || 'LIGHT').
  const activeColors = useMemo(() => getActiveColors(theme, designSystem), [theme, designSystem]);

  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [type, data, showXAxis, showYAxis, labelContent, theme, designSystem, showGoalLine, goalValue, fontSize, xAxisMargin, stackMode, chartHeight]);

  const allKeys = useMemo(() => {
    if (dataPoints.length === 0) return [];
    return Object.keys(dataPoints[0]);
  }, [dataPoints]);

  const xAxisKey = allKeys[0]; 
  const seriesKeys = allKeys.slice(1); 

  const isPieType = type === 'PIE' || type === 'DOUGHNUT';
  
  const maxDataValue = useMemo(() => {
    if (dataPoints.length === 0) return 0;
    if (stackMode === 'STACKED') {
      return Math.max(...dataPoints.map(d => seriesKeys.reduce((acc, k) => acc + (Number(d[k]) || 0), 0)));
    }
    if (stackMode === 'PERCENT') return 1;
    return Math.max(...dataPoints.flatMap(d => seriesKeys.map(k => Number(d[k]) || 0)));
  }, [dataPoints, seriesKeys, stackMode]);

  // Fix: Explicitly typing axisDomain as any to satisfy Recharts AxisDomain expectations 
  const axisDomain = useMemo((): any => {
    if (stackMode === 'PERCENT') return [0, 1];
    if (!showGoalLine || goalValue === undefined) return [0, 'auto'];
    const limit = Math.max(maxDataValue, goalValue) * 1.1; 
    return [0, limit];
  }, [maxDataValue, goalValue, showGoalLine, stackMode]);

  const finalShowLegend = useMemo(() => {
    if (showLegend !== undefined) return showLegend;
    if (isPieType) return false;
    return seriesKeys.length > 1;
  }, [showLegend, isPieType, seriesKeys.length]);

  const finalLabelContent = labelContent || (isPieType ? 'LABEL_VALUE' : 'VALUE');

  const containerHeight = chartHeight || 300;

  if (dataPoints.length === 0 || !xAxisKey) {
    return (
      <div 
        className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 ${
          isBlueTheme ? 'border-white/10 bg-white/5' : 'border-blue-200 bg-blue-50/30'
        }`}
        style={{ height: `${containerHeight}px` }}
      >
        <BarChart3 size={24} className={`${isBlueTheme ? 'text-white/20' : 'text-[#00A7E7] opacity-20'}`} />
        <p className={`text-[9px] font-black uppercase tracking-widest ${isBlueTheme ? 'text-white' : 'text-[#006098]'}`}>Aguardando Dados</p>
      </div>
    );
  }

  const axisTextColor = isBlueTheme || isFuture ? (isFuture ? '#0079C2' : '#94a3b8') : '#415364';
  const gridColor = isBlueTheme || isFuture ? 'rgba(0,121,194,0.05)' : '#f1f5f9';
  
  const axisTickFormatter = (val: any) => {
    if (stackMode === 'PERCENT') {
        return (val * 100).toFixed(0) + '%';
    }
    return formatDisplayValue(val, !!abbreviate, stackMode);
  }

  const renderChart = () => {
    const extraMargin = xAxisMargin || 0;
    const stackId = stackMode !== 'GROUPED' ? 'a' : undefined;
    const stackOffset = stackMode === 'PERCENT' ? 'expand' : undefined;

    if (isPieType) {
      const renderPieLabel = getPieLabelRender(!!showLabels, finalLabelContent, fontSize, isFuture, isBlueTheme, !!abbreviate);
      
      return (
        <PieChart margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
          <Pie 
            data={dataPoints} cx="50%" cy="50%" 
            innerRadius={type === 'DOUGHNUT' ? '30%' : 0} 
            outerRadius='52%' 
            dataKey={seriesKeys[0]} 
            nameKey={xAxisKey} 
            stroke={isFuture ? '#fff' : (isBlueTheme ? '#006098' : '#fff')}
            strokeWidth={isFuture ? 3 : 2}
            label={renderPieLabel}
            labelLine={{ 
              stroke: isFuture ? '#00A7E7' : (isBlueTheme ? 'rgba(0,121,194,0.3)' : '#cbd5e1'), 
              strokeWidth: 1,
              length: 12, 
              length2: 8
            } as any}
            paddingAngle={isFuture ? 4 : 2}
            animationDuration={1000}
          >
            {dataPoints.map((_, index) => <Cell key={index} fill={activeColors[index % activeColors.length]} />)}
          </Pie>
          <Tooltip 
            contentStyle={{ fontSize: `${fontSize + 2}px`, fontWeight: 'bold', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
          />
          {finalShowLegend && (
            <Legend 
              verticalAlign="bottom" 
              wrapperStyle={{ fontSize: `${fontSize}px`, fontWeight: 'bold', paddingTop: '2px', textTransform: 'uppercase' }} 
            />
          )}
        </PieChart>
      );
    }

    if (type === 'BAR') {
      return (
        <BarChart 
          data={dataPoints} 
          layout="vertical" 
          margin={{ top: 10, right: 60 + (fontSize * 2), left: 5, bottom: 10 }}
          barCategoryGap="20%" 
          stackOffset={stackOffset}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
          <XAxis 
            type="number" 
            hide={!showYAxis} 
            axisLine={false} 
            tickLine={false} 
            tick={showYAxis ? {fontSize: fontSize, fill: axisTextColor} : false}
            tickFormatter={axisTickFormatter}
            domain={axisDomain}
          />
          <YAxis 
            type="category" dataKey={xAxisKey} hide={!showXAxis}
            axisLine={false} tickLine={false} 
            tick={<CustomYAxisTick fontSize={fontSize} axisTextColor={axisTextColor} isFuture={isFuture} extraMargin={extraMargin} />}
            width={(fontSize * 8) + extraMargin} 
            interval={0}
          />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          {seriesKeys.map((key, i) => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={activeColors[i % activeColors.length]} 
              radius={stackId ? [0,0,0,0] : [0, 4, 4, 0]}
              maxBarSize={60} 
              stackId={stackId}
            >
              {showLabels && <LabelList dataKey={key} position={stackId ? "inside" : "right"} offset={10} fill={stackId ? (isFuture ? '#002B49' : '#fff') : (isFuture ? '#00A7E7' : (isBlueTheme ? '#fff' : activeColors[i % activeColors.length]))} fontSize={fontSize} fontWeight={900} formatter={(v: any) => formatDisplayValue(v, !!abbreviate, stackMode)} />}
            </Bar>
          ))}
          {/* Goal line not fully supported on 100% stacked */}
          {showGoalLine && goalValue !== undefined && stackMode !== 'PERCENT' && (
            <ReferenceLine x={goalValue} stroke={GOLD_COLOR} strokeDasharray="3 3" label={{ value: formatDisplayValue(goalValue, !!abbreviate), position: 'insideTopRight', fill: GOLD_COLOR, fontSize: fontSize, fontWeight: 900 }} />
          )}
          {finalShowLegend && <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: `${fontSize}px`, fontWeight: 'bold', paddingTop: '5px' }} />}
        </BarChart>
      );
    }

    const ChartComp = type === 'LINE' ? LineChart : (type === 'AREA' ? AreaChart : BarChart);
    
    return (
      <ChartComp 
        data={dataPoints} 
        margin={{ 
            top: Math.max(30, fontSize * 2.5), 
            right: 20, 
            left: 20, 
            bottom: 5
        }}
        {...(type === 'COLUMN' ? { barCategoryGap: "20%", stackOffset } : {})} 
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
        <XAxis 
          dataKey={xAxisKey} 
          hide={!showXAxis} 
          axisLine={false} 
          tickLine={false} 
          tick={<CustomXAxisTick fontSize={fontSize} axisTextColor={axisTextColor} isFuture={isFuture} extraMargin={extraMargin} />}
          interval={0} 
          height={Math.max(30, fontSize * 3) + extraMargin} 
          padding={{ left: 15, right: 15 }} 
        />
        <YAxis 
          hide={!showYAxis} 
          axisLine={false} 
          tickLine={false} 
          tick={showYAxis ? {fontSize: fontSize, fill: axisTextColor} : false} 
          tickFormatter={axisTickFormatter}
          domain={axisDomain}
        />
        {!showYAxis && <YAxis hide domain={axisDomain} />}
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
        {seriesKeys.map((key, i) => {
          const color = activeColors[i % activeColors.length];
          const isSecondarySeries = i % 2 !== 0; 
          
          const lineLabelPos = isSecondarySeries ? "bottom" : "top";
          const areaLabelPos = isSecondarySeries ? "insideTop" : "top"; 
          const offsetDist = fontSize + 8;

          if (type === 'LINE') {
            return (
              <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={isFuture ? 4 : 3} dot={{ r: 4, fill: color }}>
                {showLabels && (
                  <LabelList 
                    dataKey={key} 
                    position={lineLabelPos} 
                    offset={offsetDist} 
                    fill={isFuture ? '#002B49' : (isBlueTheme ? '#fff' : color)} 
                    fontSize={fontSize} 
                    fontWeight={900} 
                    formatter={(v: any) => formatDisplayValue(v, !!abbreviate, stackMode)} 
                  />
                )}
              </Line>
            );
          }
          if (type === 'AREA') {
            return (
              <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={isFuture ? 0.2 : 0.1}>
                {showLabels && (
                  <LabelList 
                    dataKey={key} 
                    position={areaLabelPos} 
                    offset={offsetDist} 
                    fill={isFuture ? '#002B49' : (isBlueTheme ? '#fff' : color)} 
                    fontSize={fontSize} 
                    fontWeight={900} 
                    formatter={(v: any) => formatDisplayValue(v, !!abbreviate, stackMode)} 
                  />
                )}
              </Area>
            );
          }
          return (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={color} 
              radius={stackId ? [0,0,0,0] : [4, 4, 0, 0]}
              maxBarSize={60} 
              stackId={stackId}
            >
              {showLabels && <LabelList dataKey={key} position={stackId ? "inside" : "top"} offset={stackId ? 0 : offsetDist} fill={stackId ? (isFuture ? '#002B49' : '#fff') : (isFuture ? '#002B49' : (isBlueTheme ? '#fff' : color))} fontSize={fontSize} fontWeight={900} formatter={(v: any) => formatDisplayValue(v, !!abbreviate, stackMode)} />}
            </Bar>
          );
        })}
        {/* Goal line not fully supported on 100% stacked */}
        {showGoalLine && goalValue !== undefined && stackMode !== 'PERCENT' && (
          <ReferenceLine y={goalValue} stroke={GOLD_COLOR} strokeDasharray="3 3" label={{ value: formatDisplayValue(goalValue, !!abbreviate), position: 'insideTopRight', fill: GOLD_COLOR, fontSize: fontSize, fontWeight: 900 }} />
        )}
        {finalShowLegend && <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: `${fontSize}px`, fontWeight: 'bold', paddingTop: '10px', textTransform: 'uppercase' }} />}
      </ChartComp>
    );
  };

  return (
    <div className={`w-full relative transition-all duration-300 ${isHighlighted ? 'pt-2' : 'pt-0'}`} style={{ height: `${containerHeight}px`, minHeight: '150px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
      
      <button 
        onClick={() => setRenderKey(k => k + 1)}
        className="absolute bottom-0 right-0 p-1 text-slate-300 hover:text-blue-500 transition-colors no-print opacity-20 hover:opacity-100"
      >
        <RefreshCw size={10} />
      </button>
    </div>
  );
};