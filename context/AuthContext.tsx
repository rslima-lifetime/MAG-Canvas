import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  role: null, 
  isAdmin: false, 
  isEditor: true 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Usuário Master por padrão
        if (currentUser.email === 'master@mag.com.br') {
          setRole('Master');
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              setRole(userDoc.data().role || 'Editor');
            } else {
              setRole('Editor');
            }
          } catch (e) {
            console.error("Erro ao buscar permissões:", e);
            setRole('Editor');
          }
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = role === 'Admin' || role === 'Master' || role === 'Administrador';
  const isEditor = role === 'Editor';

  return (
    <AuthContext.Provider value={{ user, loading, role, isAdmin, isEditor }}>
      {!loading ? children : (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[200]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#0079C2] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[10px] font-black uppercase text-[#006098] tracking-[0.2em] animate-pulse">
              MAG Canvas - Carregando
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
