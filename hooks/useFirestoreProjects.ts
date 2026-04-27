import { useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ReportData } from '../types';

export const useFirestoreProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProject = useCallback(async (data: ReportData, userId: string, isShared: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const projectData = {
        ...data,
        isShared,
        updatedAt: serverTimestamp(),
      };

      // Se já tiver um ID de documento do Firestore, atualiza
      if ((data as any)._firestoreId) {
        const docRef = doc(db, 'projects', (data as any)._firestoreId);
        await updateDoc(docRef, projectData);
        return (data as any)._firestoreId;
      } else {
        // Caso contrário, cria um novo
        const docRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            ownerId: userId
        });
        return docRef.id;
      }
    } catch (err: any) {
      console.error("Erro ao salvar no Firestore:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listUserProjects = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'projects'), 
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err: any) {
      console.error("Erro ao listar projetos do usuário:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const listSharedProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'projects'), 
        where('isShared', '==', true),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err: any) {
      console.error("Erro ao listar projetos compartilhados:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          _firestoreId: docSnap.id,
          ...docSnap.data()
        } as ReportData & { _firestoreId: string };
      }
      return null;
    } catch (err: any) {
      console.error("Erro ao buscar projeto:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'projects', id));
      return true;
    } catch (err: any) {
      console.error("Erro ao deletar projeto:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    saveProject,
    listUserProjects,
    listSharedProjects,
    getProject,
    deleteProject,
    loading,
    error
  };
};
