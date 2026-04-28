import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileJson, AlertTriangle, X } from 'lucide-react';

interface ImportJsonModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (jsonStr: string) => void;
}

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({
  open, onClose, onImport
}) => {
  const [jsonStr, setJsonStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.pages) {
        setError("O JSON precisa conter a propriedade 'pages'.");
        return;
      }
      onImport(jsonStr);
      setJsonStr('');
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.message || "JSON inválido. Verifique a sintaxe.");
    }
  };

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', padding: '16px' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '768px', height: '75vh', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0079C2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileJson size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#006098', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                Restaurar Projeto (JSON)
              </h3>
              <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                Cole o código completo do seu projeto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <textarea
            value={jsonStr}
            onChange={(e) => { setJsonStr(e.target.value); setError(null); }}
            spellCheck={false}
            autoFocus
            style={{ width: '100%', height: '100%', padding: '24px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6, color: '#374151', background: '#f8fafc', resize: 'none', border: 'none', outline: 'none', boxSizing: 'border-box' }}
            placeholder='{"title": "...", "pages": [...] }'
          />
          {error && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 24px', background: '#fff1f2', borderTop: '1px solid #fecdd3', fontSize: '10px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={12} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0, gap: '12px' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!jsonStr.trim()}
            style={{ padding: '10px 24px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', background: jsonStr.trim() ? '#0079C2' : '#cbd5e1', border: 'none', borderRadius: '12px', cursor: jsonStr.trim() ? 'pointer' : 'not-allowed', boxShadow: jsonStr.trim() ? '0 4px 12px rgba(0,121,194,0.3)' : 'none' }}
          >
            Importar Projeto
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
