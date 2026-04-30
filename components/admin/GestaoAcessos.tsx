import React, { useState, useEffect } from 'react';
import { db, auth as primaryAuth } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { 
  sendPasswordResetEmail, 
  getAuth, 
  createUserWithEmailAndPassword, 
  setPersistence, 
  inMemoryPersistence 
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  Shield, KeyRound, Trash2, UserPlus, Mail, Lock, 
  User, RefreshCw, X, AlertCircle, Search, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
interface UserDoc {
  id: string;
  nome: string;
  email: string;
  role: string;
  status?: string;
  createdAt?: string;
}

export const GestaoAcessos: React.FC = () => {
  const { isAdmin, role: currentRole } = useAuth();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  // Estados para o Modal de Confirmação Customizado
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'DANGER' | 'INFO';
  }>({ show: false, title: '', message: '', onConfirm: () => {}, type: 'INFO' });

  // New user state
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Editor');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: UserDoc[] = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() } as UserDoc);
      });
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // Técnica do App Secundário para criar usuário sem deslogar o admin
      const secondaryAppName = "SecondaryApp_" + Date.now();
      const firebaseConfig = (primaryAuth.app as any).options;
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      await setPersistence(secondaryAuth, inMemoryPersistence);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUid = userCredential.user.uid;

      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      // Salvar perfil no Firestore
      await setDoc(doc(db, "users", newUid), {
        nome: newNome,
        email: newEmail,
        role: newRole,
        status: 'Ativo',
        createdAt: new Date().toISOString()
      });

      setFormSuccess("Usuário cadastrado com sucesso!");
      
      // Limpar campos e fechar após 2 segundos
      setNewNome('');
      setNewEmail('');
      setNewPassword('');
      fetchUsers();
      
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
      }, 2000);

    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        try {
          const { query, collection, where, getDocs, addDoc, updateDoc } = await import('firebase/firestore');
          const q = query(collection(db, 'users'), where('email', '==', newEmail));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(userDoc.ref, {
              nome: newNome,
              role: newRole,
              status: 'Ativo'
            });
            setFormSuccess("Acesso reativado com sucesso!");
          } else {
            await addDoc(collection(db, 'users'), {
              nome: newNome,
              email: newEmail,
              role: newRole,
              status: 'Ativo',
              createdAt: new Date().toISOString()
            });
            setFormSuccess("Acesso restaurado com sucesso!");
          }
          
          setNewNome('');
          setNewEmail('');
          setNewPassword('');
          fetchUsers();
          setTimeout(() => {
            setShowAddModal(false);
            setFormSuccess(null);
          }, 2000);
          return;
        } catch (firestoreErr) {
          console.error("Erro ao recuperar usuário no Firestore:", firestoreErr);
        }
      }

      const msg = error.code === 'auth/email-already-in-use' ? 'Este e-mail já está em uso.' :
                  error.code === 'auth/weak-password' ? 'A senha deve ter pelo menos 6 caracteres.' :
                  error.message || "Falha na operação.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const executePasswordReset = async (email: string) => {
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(primaryAuth, email);
      setFormSuccess(`E-mail de redefinição enviado para ${email}!`);
      setTimeout(() => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setFormSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao enviar reset:", error);
      setFormError("Erro ao enviar e-mail. Verifique se o e-mail existe no sistema.");
      setTimeout(() => setFormError(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const executeToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      const newStatus = currentStatus === 'Inativo' ? 'Ativo' : 'Inativo';
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      fetchUsers();
      setConfirmModal(prev => ({ ...prev, show: false }));
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const openResetConfirm = (email: string) => {
    setConfirmModal({
      show: true,
      title: 'Resetar Senha',
      message: `Deseja enviar um e-mail de redefinição para ${email}?`,
      type: 'INFO',
      onConfirm: () => executePasswordReset(email)
    });
  };

  const openToggleStatusConfirm = (user: UserDoc) => {
    const isCurrentlyActive = user.status !== 'Inativo';
    setConfirmModal({
      show: true,
      title: isCurrentlyActive ? 'Desativar Usuário' : 'Ativar Usuário',
      message: `Tem certeza que deseja ${isCurrentlyActive ? 'desativar' : 'reativar'} o acesso de ${user.nome}?`,
      type: isCurrentlyActive ? 'DANGER' : 'INFO',
      onConfirm: () => executeToggleUserStatus(user.id, user.status || 'Ativo')
    });
  };

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    return u.nome?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
  });

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-[#006098] uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00A7E7]" /> Gestão de Acessos
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Controle de usuários e permissões da equipe</p>
        </div>
        <button 
          onClick={() => { setShowAddModal(true); setFormError(null); setFormSuccess(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0079C2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006098] transition-all shadow-md"
        >
          <UserPlus size={14} /> Novo Usuário
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#0079C2]/10 focus:border-[#0079C2] transition-all"
        />
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <RefreshCw size={32} className="text-[#0079C2] animate-spin mb-4" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Carregando usuários...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredUsers.map(u => (
            <div key={u.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#0079C2] transition-all flex items-center justify-between group shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-[12px] font-black text-[#006098] uppercase leading-tight">{u.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-slate-400">{u.email}</span>
                    {u.status === 'Inativo' && (
                      <span className="text-[7px] px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded font-black uppercase tracking-wider border border-rose-100">
                        Inativo
                      </span>
                    )}
                    {(isAdmin || currentRole === 'Master') && u.email !== 'master@mag.com.br' ? (
                      <select
                        value={u.role || 'Editor'}
                        onChange={async (e) => {
                          const newRole = e.target.value;
                          try {
                            const { updateDoc, doc } = await import('firebase/firestore');
                            await updateDoc(doc(db, 'users', u.id), { role: newRole });
                            fetchUsers();
                          } catch (error) {
                            console.error("Erro ao atualizar perfil:", error);
                          }
                        }}
                        className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 text-[#0079C2] rounded border border-blue-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="Editor">Editor</option>
                        <option value="Admin">Admin</option>
                        <option value="Master">Master</option>
                      </select>
                    ) : (
                      <span className="text-[8px] px-2 py-0.5 bg-blue-50 text-[#0079C2] rounded-full font-black uppercase tracking-tighter">
                        {u.email === 'master@mag.com.br' ? 'Master' : (u.role || 'Editor')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openResetConfirm(u.email)}
                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all active:scale-90"
                  title="Resetar Senha"
                >
                  <KeyRound size={16} />
                </button>
                <button 
                  onClick={() => openToggleStatusConfirm(u)}
                  className={`p-2 rounded-lg transition-all active:scale-90 ${
                    u.status === 'Inativo' 
                      ? 'text-emerald-500 hover:bg-emerald-50' 
                      : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                  title={u.status === 'Inativo' ? "Ativar Usuário" : "Desativar Usuário"}
                  disabled={primaryAuth.currentUser?.uid === u.id || u.email === 'master@mag.com.br'}
                >
                  {u.status === 'Inativo' ? <CheckCircle2 size={16} /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação Customizado */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmModal.type === 'DANGER' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-[#0079C2]'}`}>
                {confirmModal.type === 'DANGER' ? <AlertCircle size={32} /> : <KeyRound size={32} />}
              </div>
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-widest mb-2">{confirmModal.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">{confirmModal.message}</p>
              
              {formError && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <AlertCircle size={14} /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} /> {formSuccess}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button 
                  onClick={confirmModal.onConfirm}
                  disabled={submitting}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${confirmModal.type === 'DANGER' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#0079C2] hover:bg-[#006098]'}`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Processando...
                    </>
                  ) : 'Confirmar Ação'}
                </button>
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[400px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#006098] p-6 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest">Novo Acesso</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required value={newNome} onChange={e => setNewNome(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#0079C2] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input 
                  type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#0079C2] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Inicial</label>
                <input 
                  type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#0079C2] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo/Permissão</label>
                <select 
                  value={newRole} onChange={e => setNewRole(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#0079C2] transition-all appearance-none cursor-pointer"
                >
                  <option value="Editor">Editor</option>
                  <option value="Admin">Administrador</option>
                  <option value="Master">Master</option>
                </select>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle size={14} /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <CheckCircle2 size={14} /> {formSuccess}
                </div>
              )}

              <button 
                type="submit" disabled={submitting}
                className="w-full py-4 bg-[#0079C2] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#006098] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Criando...
                  </>
                ) : 'Cadastrar Usuário'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
