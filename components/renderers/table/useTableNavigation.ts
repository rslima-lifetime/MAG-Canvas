import React, { useState, useCallback, useEffect } from 'react';

interface ActiveCell {
  r: number;
  c: number;
}

interface NavigationProps {
  rowCount: number;
  colCount: number;
  isHighlighted: boolean;
  onUpdateValue: (r: number, c: number, val: string) => void;
  getInitialEditValue: (r: number, c: number) => string;
  onEnterAtLastRow?: (r: number, c: number, val: string) => void;
}

export const useTableNavigation = ({
  rowCount,
  colCount,
  isHighlighted,
  onUpdateValue,
  getInitialEditValue,
  onEnterAtLastRow
}: NavigationProps) => {
  const [isTableActive, setIsTableActive] = useState(false);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<ActiveCell | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Sincroniza estado de ativação do bloco com a tabela
  useEffect(() => {
    if (!isHighlighted) {
      setIsTableActive(false);
      setActiveCell(null);
      setSelectionEnd(null);
      setIsEditing(false);
    }
  }, [isHighlighted]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isHighlighted) return;
    
    // Se a tabela não estava ativa, ativa na primeira tecla
    if (!isTableActive) setIsTableActive(true);

    const maxR = rowCount - 1;
    const maxC = colCount - 1;

    // Se estiver editando, ignoramos lógica de range
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setActiveCell(prev => {
          if (!prev) return null;
          const { r, c } = prev;
          if (r === maxR && onEnterAtLastRow) {
            onEnterAtLastRow(r, c, editValue);
          } else {
            onUpdateValue(r, c, editValue);
          }
          setIsEditing(false);
          setSelectionEnd(null);
          return { r: Math.min(maxR, r + 1), c };
        });
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveCell(prev => {
          if (!prev) return null;
          const { r, c } = prev;
          onUpdateValue(r, c, editValue);
          setIsEditing(false);
          setSelectionEnd(null);
          const nextC = e.shiftKey ? Math.max(0, c - 1) : Math.min(maxC, c + 1);
          return { r, c: nextC };
        });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditing(false);
      }
      return;
    }

    // Comportamento de Navegação (isEditing === false)
    if (!activeCell) {
      if (e.key.startsWith('Arrow') || e.key === 'Enter') {
        setActiveCell({ r: -1, c: 0 });
        e.preventDefault();
      }
      return;
    }

    const isJump = e.ctrlKey || e.metaKey;
    const isSelecting = e.shiftKey;

    // Se não estiver selecionando e apertar seta, resetamos o range
    if (!isSelecting && e.key.startsWith('Arrow')) {
      setSelectionEnd(null);
    }

    switch (e.key) {
      case 'ArrowUp': 
        e.preventDefault();
        if (isSelecting) {
          setSelectionEnd(prev => {
            const start = prev || activeCell;
            return { ...start, r: Math.max(-1, start.r - 1) };
          });
        } else {
          setActiveCell(prev => prev ? { ...prev, r: isJump ? -1 : Math.max(-1, prev.r - 1) } : null);
        }
        break;
      case 'ArrowDown': 
        e.preventDefault();
        if (isSelecting) {
          setSelectionEnd(prev => {
            const start = prev || activeCell;
            return { ...start, r: Math.min(maxR, start.r + 1) };
          });
        } else {
          setActiveCell(prev => prev ? { ...prev, r: isJump ? maxR : Math.min(maxR, prev.r + 1) } : null);
        }
        break;
      case 'ArrowLeft': 
        e.preventDefault();
        if (isSelecting) {
          setSelectionEnd(prev => {
            const start = prev || activeCell;
            return { ...start, c: Math.max(0, start.c - 1) };
          });
        } else {
          setActiveCell(prev => prev ? { ...prev, c: isJump ? 0 : Math.max(0, prev.c - 1) } : null);
        }
        break;
      case 'ArrowRight': 
        e.preventDefault();
        if (isSelecting) {
          setSelectionEnd(prev => {
            const start = prev || activeCell;
            return { ...start, c: Math.min(maxC, start.c + 1) };
          });
        } else {
          setActiveCell(prev => prev ? { ...prev, c: isJump ? maxC : Math.min(maxC, prev.c + 1) } : null);
        }
        break;
      case 'Tab': 
        e.preventDefault();
        setSelectionEnd(null);
        setActiveCell(prev => {
          if (!prev) return null;
          const nextC = e.shiftKey ? Math.max(0, prev.c - 1) : Math.min(maxC, prev.c + 1);
          return { ...prev, c: nextC };
        });
        break;
      case 'Enter': 
      case 'F2':
        e.preventDefault();
        setIsEditing(true); 
        setSelectionEnd(null);
        setEditValue(getInitialEditValue(activeCell.r, activeCell.c));
        break;
      case 'Backspace':
      case 'Delete':
        e.preventDefault();
        // Em caso de range, a exclusão de dados (clear) pode ser implementada aqui se desejar
        // Por enquanto deletamos o valor da célula ativa ou deixamos para o componente pai tratar exclusão de linhas
        onUpdateValue(activeCell.r, activeCell.c, "");
        break;
      case 'Escape':
        e.preventDefault();
        setIsTableActive(false);
        setActiveCell(null);
        setSelectionEnd(null);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setIsEditing(true);
          setSelectionEnd(null);
          setEditValue(e.key);
        }
        break;
    }
  }, [isHighlighted, isTableActive, activeCell, selectionEnd, isEditing, editValue, rowCount, colCount, onUpdateValue, getInitialEditValue, onEnterAtLastRow]);

  return {
    isTableActive, setIsTableActive,
    activeCell, setActiveCell,
    selectionEnd, setSelectionEnd,
    isEditing, setIsEditing,
    editValue, setEditValue,
    handleKeyDown
  };
};