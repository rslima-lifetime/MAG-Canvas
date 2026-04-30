import React, { useState } from 'react';
import { GestaoAcessos } from './GestaoAcessos';
import { GestaoEquipes } from './GestaoEquipes';
import { ShieldCheck, Users } from 'lucide-react';

export const GestaoAdministrativa: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USUARIOS' | 'EQUIPES'>('USUARIOS');

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-6 border-b border-slate-100 pb-4 mb-6">
        <button 
          onClick={() => setActiveTab('USUARIOS')}
          className={`text-sm font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'USUARIOS' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
        >
          <ShieldCheck size={14} /> Usuários e Acessos
        </button>
        <button 
          onClick={() => setActiveTab('EQUIPES')}
          className={`text-sm font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'EQUIPES' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
        >
          <Users size={14} /> Gestão de Equipes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'USUARIOS' ? <GestaoAcessos /> : <GestaoEquipes />}
      </div>
    </div>
  );
};
