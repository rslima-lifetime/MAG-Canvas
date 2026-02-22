import LZString from 'lz-string';
import { ReportData, DEFAULT_REPORT_DATA } from '../types';

/**
 * Gera uma URL de compartilhamento contendo o estado do relatório comprimido.
 * @param data O objeto ReportData completo.
 * @param readOnly Define se o link abrirá em modo de visualização ou edição.
 */
export const generateShareUrl = (data: ReportData, readOnly: boolean = false): string => {
  try {
    // 1. Criamos uma cópia limpa para remover IDs locais e referências desnecessárias
    const cleanData = JSON.parse(JSON.stringify(data));
    if (cleanData._localId) delete cleanData._localId;

    // 2. Compressão do JSON (Padrão LZString Encoded URI Component)
    const jsonString = JSON.stringify(cleanData);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    
    // Usamos o caminho absoluto para evitar duplicação de parâmetros
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('share', compressed);
    
    if (readOnly) {
      url.searchParams.set('mode', 'view');
    }

    return url.toString();
  } catch (e) {
    console.error("Erro ao gerar link de compartilhamento:", e);
    return "";
  }
};

/**
 * Processa a URL atual em busca de dados comprimidos e retorna o estado inicial.
 */
export const parseShareUrl = (): { data: ReportData | null, isReadOnly: boolean } => {
  try {
    const params = new URLSearchParams(window.location.search);
    // Suporte a múltiplos nomes de parâmetros para compatibilidade legada
    const compressed = params.get('share') || params.get('s') || params.get('data');
    const mode = params.get('mode') || params.get('m');
    
    if (!compressed) return { data: null, isReadOnly: false };

    // Descompressão
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) {
      console.warn("Falha na descompressão: Dados corrompidos ou URL incompleta.");
      return { data: null, isReadOnly: false };
    }

    const parsed = JSON.parse(decompressed);
    
    // Merge com dados padrão para garantir estabilidade do schema (backward compatibility)
    const finalData = {
      ...DEFAULT_REPORT_DATA,
      ...parsed,
      pages: (parsed.pages || []).map((page: any) => ({
        ...page,
        blocks: page.blocks || []
      }))
    };

    return { 
      data: finalData as ReportData,
      isReadOnly: mode === 'view' || mode === 'v' || mode === 'viewOnly'
    };
  } catch (e) {
    console.error("Erro ao processar link de compartilhamento:", e);
    return { data: null, isReadOnly: false };
  }
};

/**
 * Remove os parâmetros de compartilhamento da URL sem recarregar a página.
 */
export const clearShareUrl = () => {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('share');
    url.searchParams.delete('s');
    url.searchParams.delete('mode');
    url.searchParams.delete('m');
    url.searchParams.delete('data');
    window.history.replaceState({}, '', url.toString());
  } catch (e) {
    console.error("Erro ao limpar URL:", e);
  }
};