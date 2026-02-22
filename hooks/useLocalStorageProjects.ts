
import { useState, useCallback } from 'react';
import { ReportData } from '../types';

export interface SavedProjectMeta {
  id: string;
  title: string;
  updatedAt: string;
  pageCount: number;
}

const INDEX_KEY = 'mag_canvas_projects_index';
const PROJECT_PREFIX = 'mag_canvas_p_';

export const useLocalStorageProjects = () => {
  
  // Lista todos os projetos salvos (apenas metadados)
  const listProjects = useCallback((): SavedProjectMeta[] => {
    try {
      const indexStr = localStorage.getItem(INDEX_KEY);
      return indexStr ? JSON.parse(indexStr) : [];
    } catch (e) {
      console.error("Erro ao listar projetos", e);
      return [];
    }
  }, []);

  // Salva um projeto (cria ID se não existir)
  const saveLocalProject = useCallback((data: ReportData): string => {
    try {
      // Gera ID se não houver (baseado no título + timestamp para unicidade simples)
      const projectId = (data as any)._localId || `${Date.now()}`;
      const dataWithId = { ...data, _localId: projectId };

      // 1. Salvar o conteúdo completo
      localStorage.setItem(`${PROJECT_PREFIX}${projectId}`, JSON.stringify(dataWithId));

      // 2. Atualizar o índice
      const currentIndex = listProjects();
      const now = new Date().toISOString();
      
      const newMeta: SavedProjectMeta = {
        id: projectId,
        title: data.title,
        updatedAt: now,
        pageCount: data.pages.length + (data.cover?.enabled ? 1 : 0)
      };

      const existingIdx = currentIndex.findIndex(p => p.id === projectId);
      let updatedIndex;
      
      if (existingIdx >= 0) {
        updatedIndex = [...currentIndex];
        updatedIndex[existingIdx] = newMeta;
      } else {
        updatedIndex = [newMeta, ...currentIndex];
      }

      localStorage.setItem(INDEX_KEY, JSON.stringify(updatedIndex));
      return projectId;
    } catch (e) {
      console.error("Erro ao salvar projeto localmente", e);
      alert("Erro: Limite de armazenamento do navegador excedido. Tente excluir projetos antigos.");
      return "";
    }
  }, [listProjects]);

  // Carrega um projeto específico
  const loadLocalProject = useCallback((id: string): ReportData | null => {
    try {
      const dataStr = localStorage.getItem(`${PROJECT_PREFIX}${id}`);
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (e) {
      console.error("Erro ao carregar projeto", e);
      return null;
    }
  }, []);

  // Deleta um projeto
  const deleteLocalProject = useCallback((id: string) => {
    try {
      // Remove dados
      localStorage.removeItem(`${PROJECT_PREFIX}${id}`);
      
      // Remove do índice
      const currentIndex = listProjects();
      const newIndex = currentIndex.filter(p => p.id !== id);
      localStorage.setItem(INDEX_KEY, JSON.stringify(newIndex));
      
      // Força atualização da lista retornando a nova lista se necessário
      return newIndex;
    } catch (e) {
      console.error("Erro ao deletar projeto", e);
    }
  }, [listProjects]);

  return {
    listProjects,
    saveLocalProject,
    loadLocalProject,
    deleteLocalProject
  };
};
