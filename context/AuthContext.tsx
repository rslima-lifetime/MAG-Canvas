import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
