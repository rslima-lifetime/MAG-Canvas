import React, { useEffect, useState } from 'react';
import { useFirestoreTeams, TeamDoc } from '../hooks/useFirestoreTeams';
import { useAuth } from '../context/AuthContext';
import { X, Users, Lock, Globe, Check, Copy } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShared: boolean;
  currentTeamId: string | null | undefined;
  onSave: (isShared: boolean, teamId: string | null) => void;
  projectId: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen, onClose, currentShared, currentTeamId, onSave, projectId
}) => {
  const { user } = useAuth();
  const { listMyTeams } = useFirestoreTeams();
  
  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [isShared, setIsShared] = useState(currentShared);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(currentTeamId || null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      listMyTeams(user.uid).then(list => {
        setTeams(list);
        setLoading(false);
      });
    }
  }, [isOpen, user]);

  useEffect(() => {
    setIsShared(currentShared);
    setSelectedTeamId(currentTeamId || null);
  }, [currentShared, currentTeamId]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(isShared, selectedTeamId);
    onClose();
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?p=${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative border border-slate-200">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0079C2] flex items-center justify-center border border-blue-100">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-[#006098] uppercase tracking-tight">Compartilhar Projeto</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Defina quem pode acessar seu arquivo</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {/* Opção 1: Privado */}
          <button 
            onClick={() => { setIsShared(false); setSelectedTeamId(null); }}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${!isShared ? 'border-[#0079C2] bg-blue-50 text-[#006098]' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
          >
            <Lock size={20} />
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-black uppercase">Privado</span>
              <span className="text-[9px] font-medium opacity-60">Apenas você pode ver e editar</span>
            </div>
            {!isShared && <Check size={16} className="ml-auto text-[#0079C2]" />}
          </button>

          {/* Opção 2: Equipe Restrita */}
          <button 
            onClick={() => { setIsShared(true); if (teams.length > 0) setSelectedTeamId(teams[0].id); }}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${isShared && selectedTeamId ? 'border-[#0079C2] bg-blue-50 text-[#006098]' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
          >
            <Users size={20} />
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-black uppercase">Apenas Membros da Equipe</span>
              <span className="text-[9px] font-medium opacity-60">Restrito às equipes que você criou</span>
            </div>
            {isShared && selectedTeamId && <Check size={16} className="ml-auto text-[#0079C2]" />}
          </button>

          {/* Dropdown de Seleção de Equipes */}
          {isShared && (
            <div className="pl-4 pr-2 py-2 bg-slate-50 rounded-2xl border border-slate-200 mt-2 animate-in slide-in-from-top-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider ml-1">Selecionar Equipe</label>
              {loading ? (
                <div className="text-[10px] text-slate-400 p-2">Carregando equipes...</div>
              ) : teams.length === 0 ? (
                <div className="text-[10px] text-slate-400 p-2 italic">Nenhuma equipe encontrada. Crie uma na aba 'Equipes' da tela inicial.</div>
              ) : (
                <select 
                  value={selectedTeamId || ''} 
                  onChange={(e) => setSelectedTeamId(e.target.value || null)}
                  className="w-full bg-transparent border-none text-xs font-bold text-[#006098] outline-none cursor-pointer py-1 font-sans"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Opção 3: Público */}
          <button 
            onClick={() => { setIsShared(true); setSelectedTeamId(null); }}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${isShared && !selectedTeamId ? 'border-[#0079C2] bg-blue-50 text-[#006098]' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
          >
            <Globe size={20} />
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-black uppercase">Público (Com o Link)</span>
              <span className="text-[9px] font-medium opacity-60">Qualquer pessoa com o link pode visualizar</span>
            </div>
            {isShared && !selectedTeamId && <Check size={16} className="ml-auto text-[#0079C2]" />}
          </button>
        </div>

        {isShared && projectId && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between mb-6">
            <div className="truncate flex-1 pr-4 text-[10px] font-bold text-slate-500 font-mono">
              {`${window.location.origin}${window.location.pathname}?p=${projectId}`}
            </div>
            <button 
              onClick={copyShareLink}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${linkCopied ? 'bg-emerald-500 text-white' : 'bg-[#0079C2] text-white hover:bg-[#006098]'}`}
            >
              {linkCopied ? 'Copiado!' : <Copy size={14} />}
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white bg-[#0079C2] hover:bg-[#006098] shadow-lg transition-all active:scale-95"
          >
            Salvar Acesso
          </button>
        </div>
      </div>
    </div>
  );
};
