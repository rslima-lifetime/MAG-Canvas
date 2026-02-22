
import { useCallback } from 'react';
import { KPIFormat } from '../types';

export const useFormatter = () => {
  const formatValue = useCallback((val: number | undefined | null, fmt: KPIFormat = 'DEFAULT', abbreviate: boolean = false) => {
    // Proteção contra valores nulos ou indefinidos
    if (val === undefined || val === null || isNaN(val)) return "0";
    
    let valueToFormat = val;
    let suffix = "";

    if (abbreviate) {
      if (Math.abs(val) >= 1000000) {
        valueToFormat = val / 1000000;
        suffix = " mi";
      } else if (Math.abs(val) >= 1000) {
        valueToFormat = val / 1000;
        suffix = "k";
      }
    }

    const localeOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: suffix !== "" ? 1 : 0,
      maximumFractionDigits: suffix !== "" ? 2 : (fmt === 'DECIMAL' ? 2 : (fmt === 'INTEGER' ? 0 : 1))
    };

    switch (fmt) {
      case 'INTEGER':
        return (abbreviate && suffix !== "" ? valueToFormat.toLocaleString('pt-BR', localeOptions) : Math.round(val).toLocaleString('pt-BR')) + suffix;
      case 'DECIMAL':
        return valueToFormat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + suffix;
      case 'PERCENT':
        return `${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;
      case 'CURRENCY':
        if (abbreviate && suffix !== "") {
          return `R$ ${valueToFormat.toLocaleString('pt-BR', localeOptions)}${suffix}`;
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      case 'TIME':
        return `${val.toLocaleString('pt-BR')}h`;
      case 'DATE':
        try {
          const d = new Date(val);
          if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
        } catch(e) {}
        return val.toLocaleString('pt-BR');
      default:
        return valueToFormat.toLocaleString('pt-BR', localeOptions) + suffix;
    }
  }, []);

  return { formatValue };
};
