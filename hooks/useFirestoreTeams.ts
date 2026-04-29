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
  arrayUnion, 
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TeamDoc {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // Emails
  createdAt?: any;
}

export const useFirestoreTeams = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = useCallback(async (name: string, ownerId: string, ownerEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, 'teams'), {
        name,
        ownerId,
        members: [ownerEmail],
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err: any) {
      console.error("Erro ao criar equipe:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listMyTeams = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'teams'), where('ownerId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamDoc[];
    } catch (err: any) {
      console.error("Erro ao listar minhas equipes:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const listTeamsIAmIn = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'teams'), where('members', 'array-contains', email));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamDoc[];
    } catch (err: any) {
      console.error("Erro ao listar equipes em que estou:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (teamId: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'teams', teamId);
      await updateDoc(docRef, {
        members: arrayUnion(email.toLowerCase().trim())
      });
      return true;
    } catch (err: any) {
      console.error("Erro ao adicionar membro:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (teamId: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'teams', teamId);
      await updateDoc(docRef, {
        members: arrayRemove(email)
      });
      return true;
    } catch (err: any) {
      console.error("Erro ao remover membro:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'teams', teamId));
      return true;
    } catch (err: any) {
      console.error("Erro ao deletar equipe:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTeam,
    listMyTeams,
    listTeamsIAmIn,
    addMember,
    removeMember,
    deleteTeam,
    loading,
    error
  };
};
