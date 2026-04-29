import React, { useState, useEffect } from 'react';
import { useFirestoreTeams, TeamDoc } from '../../hooks/useFirestoreTeams';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, UserPlus, Trash2, Mail, AlertCircle, CheckCircle2, RefreshCw, X, Shield } from 'lucide-react';

export const GestaoEquipes: React.FC = () => {
  const { user } = useAuth();
  const { createTeam, listMyTeams, addMember, removeMember, deleteTeam } = useFirestoreTeams();
  
  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState<Record<string, string>>({});
  const [allUsers, setAllUsers] = useState<{id: string, nome: string, email: string}[]>([]);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome || '',
        email: doc.data().email || ''
      }));
      setAllUsers(usersList);
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
    }
  };

  const fetchTeams = async () => {
    if (!user) return;
    setLoading(true);
    const list = await listMyTeams(user.uid);
    setTeams(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, [user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTeamName.trim()) return;
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const success = await createTeam(newTeamName.trim(), user.uid, user.email || '');
    if (success) {
      setFormSuccess("Equipe criada com sucesso!");
      setNewTeamName('');
      fetchTeams();
    } else {
      setFormError("Não foi possível criar a equipe.");
    }
    setSubmitting(false);
  };

  const handleAddMember = async (teamId: string) => {
    const email = newMemberEmail[teamId];
    if (!email || !email.trim()) return;

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const success = await addMember(teamId, email);
    if (success) {
      setFormSuccess(`Membro ${email} adicionado!`);
      setNewMemberEmail(prev => ({ ...prev, [teamId]: '' }));
      fetchTeams();
    } else {
      setFormError("Erro ao adicionar membro.");
    }
    setSubmitting(false);
  };

  const handleRemoveMember = async (teamId: string, email: string) => {
    if (email === user?.email) {
      alert("Você não pode se remover da própria equipe.");
      return;
    }
    
    setSubmitting(true);
    const success = await removeMember(teamId, email);
    if (success) {
      fetchTeams();
    }
    setSubmitting(false);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta equipe?")) return;
    setSubmitting(true);
    const success = await deleteTeam(teamId);
    if (success) {
      fetchTeams();
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-[#006098] uppercase tracking-widest flex items-center gap-2">
            <Users size={18} className="text-[#00A7E7]" /> Gestão de Equipes
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Crie grupos de acesso restrito para seus projetos</p>
        </div>
      </div>

      {/* Formulário de Criação */}
      <form onSubmit={handleCreateTeam} className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Nova Equipe</label>
          <input 
            type="text" 
            required 
            value={newTeamName} 
            onChange={e => setNewTeamName(e.target.value)}
            placeholder="Ex: Diretoria Financeira, Equipe People Analytics..."
            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#0079C2] transition-all"
          />
        </div>
        <button 
          type="submit" 
          disabled={submitting || !newTeamName.trim()}
          className="px-6 py-4 bg-[#0079C2] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#006098] disabled:opacity-50 transition-all flex items-center gap-2 h-[50px]"
        >
          <UserPlus size={16} /> Criar Equipe
        </button>
      </form>

      {formError && (
        <div className="p-4 mb-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl text-[10px] font-bold flex items-center gap-2">
          <AlertCircle size={14} /> {formError}
        </div>
      )}

      {formSuccess && (
        <div className="p-4 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
          <CheckCircle2 size={14} /> {formSuccess}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <RefreshCw size={32} className="text-[#0079C2] animate-spin mb-4" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Carregando equipes...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-3xl bg-white">
          <Users size={40} className="text-slate-300 mb-3" />
          <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Nenhuma equipe criada.</p>
          <p className="text-[9px] text-slate-400 mt-1 max-w-xs">Crie uma equipe acima para começar a compartilhar projetos restritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 overflow-y-auto pr-2 pb-8">
          {teams.map(t => (
            <div key={t.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-black text-[#006098] uppercase tracking-tight">{t.name}</h4>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">{t.members.length} Membros cadastrados</span>
                </div>
                <button 
                  onClick={() => handleDeleteTeam(t.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Excluir Equipe"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Lista de Membros */}
              <div className="space-y-1 mb-4 max-h-[150px] overflow-y-auto">
                {t.members.map(email => (
                  <div key={email} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {email}</span>
                    {email !== user?.email && (
                      <button 
                        onClick={() => handleRemoveMember(t.id, email)}
                        className="text-slate-400 hover:text-rose-500 text-[8px] font-black uppercase tracking-widest"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Adicionar Membro */}
              <div className="flex gap-2">
                <select 
                  value={newMemberEmail[t.id] || ''} 
                  onChange={e => setNewMemberEmail(prev => ({ ...prev, [t.id]: e.target.value }))}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:border-[#0079C2] transition-all font-sans cursor-pointer"
                >
                  <option value="">Selecionar usuário...</option>
                  {allUsers.filter(u => !t.members.includes(u.email)).map(u => (
                    <option key={u.id} value={u.email}>{u.nome} ({u.email})</option>
                  ))}
                </select>
                <button 
                  onClick={() => handleAddMember(t.id)}
                  disabled={!newMemberEmail[t.id]?.trim()}
                  className="px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#006098] text-[9px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
