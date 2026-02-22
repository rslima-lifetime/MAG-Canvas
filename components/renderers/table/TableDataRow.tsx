import React from 'react';

interface TableDataRowProps {
  index: number;
  isTotal: boolean;
  isSubtotal: boolean;
  isBlueTheme: boolean;
  colors: { base: string; mid: string; accent: string };
  children: React.ReactNode;
}

export const TableDataRow: React.FC<TableDataRowProps> = ({
  index, isTotal, isSubtotal, isBlueTheme, colors, children
}) => {
  return (
    <tr 
      className={`group/row transition-colors relative ${isTotal ? 'text-white' : isSubtotal ? (isBlueTheme ? 'bg-white/10' : 'bg-slate-50') : ''}`}
      style={{ 
        background: isTotal ? `linear-gradient(to right, ${colors.base}, ${colors.mid})` : undefined
      }}
    >
      {children}
    </tr>
  );
};
