import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Presentation, LayoutPanelTop, Sparkles, 
  ArrowRight, Upload, Clock, HardDrive, Trash2, AlertCircle, FileJson, Save, LayoutTemplate, CheckCircle2,
  LogIn, Cloud, Users, Share2, Shield, ShieldCheck, LogOut, Lock, PlusCircle, X
} from 'lucide-react';
import { DocumentFormat, DesignSystem, ReportData, DEFAULT_REPORT_DATA } from '../types';
import { useLocalStorageProjects, SavedProjectMeta } from '../hooks/useLocalStorageProjects';
import { useFirestoreProjects } from '../hooks/useFirestoreProjects';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './auth/LoginModal';
import { auth } from '../lib/firebase';
import { TEMPLATES, TemplateMeta } from '../data/templates';
import { GestaoAcessos } from './admin/GestaoAcessos';

interface WelcomeScreenProps {
  onStart: (data: Partial<ReportData>) => void;
  onImport: (jsonStr: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onImport }) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'TEMPLATES' | 'SAVED' | 'ADMIN'>('NEW');
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<DocumentFormat>('REPORT');
  const [design, setDesign] = useState<DesignSystem>('STANDARD');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  
  const { listProjects, loadLocalProject, deleteLocalProject } = useLocalStorageProjects();
  const { listUserProjects, listSharedProjects, deleteProject, toggleShareProject, saveProject } = useFirestoreProjects();
  const { user } = useAuth();

  const [savedProjects, setSavedProjects] = useState<SavedProjectMeta[]>([]);
  const [cloudProjects, setCloudProjects] = useState<any[]>([]);
  const [sharedProjects, setSharedProjects] = useState<any[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, type: 'LOCAL' | 'CLOUD' } | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<Record<string, 'IDLE' | 'MIGRATING' | 'SUCCESS'>>({});

  const handleMigrateToCloud = async (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    if (!user) return;
    
    setMigrationStatus(prev => ({ ...prev, [projId]: 'MIGRATING' }));
    
    const data = loadLocalProject(projId);
    if (data) {
      const firestoreId = await saveProject(data, user.uid, false);
      if (firestoreId) {
        setMigrationStatus(prev => ({ ...prev, [projId]: 'SUCCESS' }));
        deleteLocalProject(projId);
        
        setTimeout(() => {
          setSavedProjects(listProjects());
          listUserProjects(user.uid).then(setCloudProjects);
        }, 1500);
      } else {
        alert("Falha ao migrar para a nuvem. Verifique sua conexão.");
        setMigrationStatus(prev => ({ ...prev, [projId]: 'IDLE' }));
      }
    }
  };

  const uniqueCloudProjects = React.useMemo(() => {
    const allProjects = [...cloudProjects, ...sharedProjects];
    const uniqueProjects = Array.from(new Map(allProjects.map(p => [p.id, p])).values());
    uniqueProjects.sort((a, b) => {
      const timeA = a.updatedAt?.seconds || 0;
      const timeB = b.updatedAt?.seconds || 0;
      return timeB - timeA;
    });
    return uniqueProjects;
  }, [cloudProjects, sharedProjects]);

  useEffect(() => {
    // Carrega sempre para a contagem da badge
    setSavedProjects(listProjects());
    
    if (user) {
      setIsCloudLoading(true);
      Promise.all([
        listUserProjects(user.uid),
        listSharedProjects()
      ]).then(([userProjs, sharedProjs]) => {
        setCloudProjects(userProjs);
        setSharedProjects(sharedProjs);
        setIsCloudLoading(false);
      });
    } else {
      setCloudProjects([]);
      setSharedProjects([]);
    }
  }, [listProjects, user, listUserProjects, listSharedProjects]);

  const handleStart = () => {
    // Define um título padrão se o usuário não digitou nada
    const projectTitle = title.trim() || 'Novo Projeto de People Analytics';

    onStart({
      title: projectTitle,
      layoutFormat: format,
      designSystem: design,
      pages: design === 'FUTURE' 
        ? DEFAULT_REPORT_DATA.pages.map(p => ({ ...p, theme: 'BLUE' })) 
        : DEFAULT_REPORT_DATA.pages,
      cover: {
        ...DEFAULT_REPORT_DATA.cover!,
        title: projectTitle,
        theme: 'BLUE'
      }
    });
  };

  const handleUseTemplate = async (template: TemplateMeta) => {
    // Clona o objeto para evitar referência direta
    const templateData = JSON.parse(JSON.stringify(template.data));
    
    if (user) {
      // Salva como projeto privado na nuvem imediatamente
      const firestoreId = await saveProject(templateData, user.uid, false);
      if (firestoreId) {
        onStart({ 
          ...templateData, 
          _firestoreId: firestoreId,
          ownerId: user.uid 
        });
      } else {
        onStart(templateData);
      }
    } else {
      onStart(templateData);
    }
  };

  const handleLoadProject = (id: string) => {
    const data = loadLocalProject(id);
    if (data) {
      onStart(data);
    } else {
      alert("Erro ao carregar projeto. Os dados podem ter sido limpos do navegador.");
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string, type: 'LOCAL' | 'CLOUD') => {
    e.stopPropagation();
    setProjectToDelete({ id, type });
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const { id, type } = projectToDelete;
    
    // Optimistic UI imediato
    setProjectToDelete(null);

    if (type === 'LOCAL') {
      deleteLocalProject(id);
      setSavedProjects(listProjects());
    } else {
      // Optimistic UI: Remove da tela imediatamente
      setCloudProjects(prev => prev.filter(p => p.id !== id));
      setSharedProjects(prev => prev.filter(p => p.id !== id));
      
      const success = await deleteProject(id);
      
      if (success) {
        // Atualiza do banco de dados para garantir consistência em background
        if (user) {
          listUserProjects(user.uid).then(setCloudProjects);
          listSharedProjects().then(setSharedProjects);
        }
      } else {
        // Se falhou, avisa e recarrega os projetos reais
        alert("Não foi possível excluir o projeto da nuvem. Verifique sua conexão ou se você tem permissão.");
        if (user) {
          listUserProjects(user.uid).then(setCloudProjects);
          listSharedProjects().then(setSharedProjects);
        }
      }
    }
  };

  const handleToggleShare = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    const newStatus = !currentStatus;
    
    // Optimistic UI imediato
    setCloudProjects(prev => prev.map(p => p.id === id ? { ...p, isShared: newStatus } : p));
    
    if (!newStatus) {
      // Se parou de compartilhar, removemos da lista de compartilhados caso estivesse lá também
      setSharedProjects(prev => prev.filter(p => p.id !== id));
    }

    const success = await toggleShareProject(id, newStatus);
    
    if (!success) {
      alert("Não foi possível alterar o compartilhamento na nuvem. Verifique sua conexão.");
      // Rollback se falhar
      if (user) {
        listUserProjects(user.uid).then(setCloudProjects);
        listSharedProjects().then(setSharedProjects);
      }
    }
  };


  return (
    <div className="fixed inset-0 bg-[#f1f5f9] flex items-center justify-center z-[100] p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0079C2]/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00A7E7]/10 blur-3xl" />
      </div>

      <div className="bg-white max-w-7xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in-95 duration-500 h-[650px]">
        
        {/* Lado Esquerdo: Branding */}
        <div className="w-full md:w-[320px] shrink-0 bg-gradient-to-br from-[#006098] to-[#004a76] p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20">
              <Sparkles size={24} className="text-[#00A7E7]" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-4">MAG<br/><span className="text-[#00A7E7]">Canvas</span></h1>
            <p className="text-sm font-medium text-blue-100/80 leading-relaxed">
              Crie relatórios estratégicos e apresentações de alto impacto seguindo a identidade visual da MAG Seguros.
            </p>
          </div>

          <div className="z-10 mt-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 opacity-60 select-none">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"><LayoutPanelTop size={14} /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Padronização Visual</span>
              </div>
              <div className="flex items-center gap-3 opacity-60 select-none">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"><FileText size={14} /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Exportação PDF/A4</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <button 
                  onClick={() => { setIsImportModalOpen(true); setImportError(null); setPastedJson(''); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#00A7E7] hover:border-[#00A7E7] hover:shadow-lg transition-all group text-left"
              >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#00A7E7] transition-colors text-white">
                      <FileJson size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-white group-hover:text-white transition-colors">
                        Restaurar Backup
                    </span>
                    <span className="text-[9px] text-blue-200/60 group-hover:text-white/80 transition-colors">Colar código JSON</span>
                  </div>
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Área de Trabalho */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header com Abas */}
          <div className="px-8 pt-8 pb-0 flex items-end border-b border-slate-100 gap-4">
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-0.5 w-full">
              <button 
                onClick={() => setActiveTab('NEW')}
                className={`text-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'NEW' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
              >
                <PlusCircle size={14} /> Novo em Branco
              </button>
              <button 
                onClick={() => setActiveTab('SAVED')}
                className={`text-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'SAVED' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
              >
                <HardDrive size={14} /> Projetos Salvos 
                <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full ml-1">
                  {user ? uniqueCloudProjects.length : savedProjects.length}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('TEMPLATES')}
                className={`text-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'TEMPLATES' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
              >
                <LayoutTemplate size={14} /> Modelos Prontos
              </button>
              {user && (
                <button 
                  onClick={() => setActiveTab('ADMIN')}
                  className={`text-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'ADMIN' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
                >
                  <ShieldCheck size={14} /> Administração
                </button>
              )}
            </div>
            
            <div className="pb-4">
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#006098] to-[#00A7E7] flex items-center justify-center text-white text-[11px] font-black border-2 border-white shadow-sm shrink-0">
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-[80px]">
                    <span className="text-[10px] font-black text-[#006098] uppercase leading-tight truncate max-w-[120px]">{user.displayName || 'Usuário'}</span>
                    <button 
                      onClick={() => auth.signOut()} 
                      className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors mt-0.5 group"
                    >
                      <LogOut size={10} className="group-hover:-translate-x-0.5 transition-transform" /> Sair
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-[#006098] hover:bg-[#0079C2] hover:text-white hover:border-[#0079C2] transition-all group"
                >
                  <LogIn size={12} className="group-hover:scale-110 transition-transform" /> Acessar Conta
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'NEW' && (
              false ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-in fade-in zoom-in-95">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Lock size={32} className="text-slate-400" />
                  </div>
                  <h2 className="text-xl font-black text-[#006098] uppercase tracking-tight mb-2">Acesso Restrito</h2>
                  <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">
                    Você precisa estar conectado à sua conta corporativa para criar e salvar novos projetos com segurança na nuvem.
                  </p>
                  <button 
                    onClick={() => setIsLoginModalOpen(true)} 
                    className="px-8 py-3 bg-[#0079C2] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-[#006098] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <LogIn size={16} /> Fazer Login
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Nome do Projeto</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Report Mensal (Deixe vazio para automático)"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#006098] outline-none focus:ring-2 focus:ring-[#0079C2]/20 focus:border-[#0079C2] transition-all placeholder:text-slate-300 placeholder:font-normal"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Formato</label>
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => setFormat('REPORT')}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            format === 'REPORT' 
                            ? 'border-[#0079C2] bg-blue-50 text-[#006098]' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                          }`}
                        >
                          <FileText size={18} />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase">A4 Vertical</span>
                            <span className="text-[8px] font-medium opacity-60">Para impressão/leitura</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => setFormat('PRESENTATION')}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            format === 'PRESENTATION' 
                            ? 'border-[#0079C2] bg-blue-50 text-[#006098]' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                          }`}
                        >
                          <Presentation size={18} />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase">Slide 16:9</span>
                            <span className="text-[8px] font-medium opacity-60">Para apresentações</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Estilo Visual</label>
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => setDesign('STANDARD')}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            design === 'STANDARD' 
                            ? 'border-[#0079C2] bg-blue-50 text-[#006098]' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                          }`}
                        >
                          <LayoutPanelTop size={18} />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase">Padrão</span>
                            <span className="text-[8px] font-medium opacity-60">Clean e Corporativo</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => setDesign('FUTURE')}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            design === 'FUTURE' 
                            ? 'border-[#006098] bg-[#006098] text-white shadow-md' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                          }`}
                        >
                          <Sparkles size={18} />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase">Futuro MAG</span>
                            <span className="text-[8px] font-medium opacity-80">Conceitual e Dark</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      onClick={handleStart}
                      className="w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg bg-[#0079C2] text-white hover:bg-[#006098] hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                    >
                      <span>Iniciar Projeto</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )
            )}

            {activeTab === 'TEMPLATES' && (
              false ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-in fade-in zoom-in-95">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Lock size={32} className="text-slate-400" />
                  </div>
                  <h2 className="text-xl font-black text-[#006098] uppercase tracking-tight mb-2">Acesso Restrito</h2>
                  <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">
                    Você precisa estar conectado à sua conta corporativa para utilizar os modelos prontos da equipe.
                  </p>
                  <button 
                    onClick={() => setIsLoginModalOpen(true)} 
                    className="px-8 py-3 bg-[#0079C2] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-[#006098] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <LogIn size={16} /> Fazer Login
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2 flex gap-3">
                    <LayoutTemplate size={24} className="text-[#0079C2] shrink-0" />
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-[#006098] mb-1">Aceleradores de Produtividade</h4>
                      <p className="text-[10px] text-blue-800/70 leading-relaxed">
                        Escolha um modelo pré-configurado para iniciar seu projeto com estrutura profissional. Todos os campos são editáveis após a criação.
                      </p>
                    </div>
                  </div>

                  {TEMPLATES.map((tpl) => (
                    <div key={tpl.id} className="group border rounded-2xl p-5 hover:border-[#0079C2] hover:shadow-md transition-all bg-white flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black text-[#006098] uppercase tracking-tight">{tpl.title}</h3>
                            <span className="text-[9px] px-2 py-0.5 bg-blue-100 text-[#006098] rounded-full font-bold uppercase">{tpl.data.layoutFormat === 'REPORT' ? 'A4' : 'Slide'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">{tpl.description}</p>
                        </div>
                        <div className="flex gap-1">
                          {tpl.tags.map(tag => (
                            <span key={tag} className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={() => handleUseTemplate(tpl)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#0079C2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006098] transition-all shadow-sm group-hover:shadow-lg"
                        >
                          <CheckCircle2 size={14} /> Usar este Modelo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'SAVED' && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
                {!user && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertCircle size={20} className="text-amber-500 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[11px] font-black uppercase text-amber-700">Modo Offline (Browser)</h4>
                      <p className="text-[10px] text-amber-800/80 leading-relaxed">
                        Você não está logado. Os projetos abaixo estão salvos apenas neste computador. <br/>
                        <button onClick={() => setIsLoginModalOpen(true)} className="font-bold underline">Entre com sua conta</button> para salvar na nuvem e compartilhar com a equipe.
                      </p>
                    </div>
                  </div>
                )}

                {/* Seção Nuvem - Projetos Unificados */}
                {user && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-[#00A7E7]" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006098]">Projetos em Nuvem</h4>
                    </div>
                    {isCloudLoading ? (
                      <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#0079C2] border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                      (() => {
                        if (uniqueCloudProjects.length === 0) {
                          return <p className="text-[10px] text-slate-400 font-medium italic ml-6">Nenhum projeto salvo na nuvem ainda.</p>;
                        }

                        return (
                          <div className="grid grid-cols-1 gap-3">
                            {uniqueCloudProjects.map((proj) => {
                              const isOwner = proj.ownerId === user.uid;
                              const isShared = proj.isShared;
                              
                              let badgeColor = "bg-slate-100 text-slate-500 border-slate-200";
                              let badgeText = "PRIVADO";
                              
                              if (isOwner && !isShared) {
                                badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
                                badgeText = "SEU PROJETO";
                              } else if (isOwner && isShared) {
                                badgeColor = "bg-blue-50 text-[#0079C2] border-blue-200";
                                badgeText = "COMPARTILHADO (POR VOCÊ)";
                              } else if (!isOwner && isShared) {
                                badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
                                badgeText = `DA EQUIPE (Dono: ${proj.ownerName || 'Outro'})`;
                              }

                              return (
                                <div 
                                  key={proj.id}
                                  onClick={() => onStart({ ...proj, _firestoreId: proj.id, ownerId: proj.ownerId })}
                                  className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0079C2] hover:shadow-md cursor-pointer transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isOwner ? 'bg-blue-50 text-[#0079C2] border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                      {isOwner ? <Cloud size={20} /> : <Users size={20} />}
                                    </div>
                                    <div>
                                      <h4 className="text-[12px] font-black text-[#006098] uppercase leading-tight">{proj.title || 'Sem Título'}</h4>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                                          {badgeText}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                          <Clock size={10} /> 
                                          {proj.updatedAt?.seconds 
                                            ? new Date(proj.updatedAt.seconds * 1000).toLocaleDateString('pt-BR')
                                            : 'Recente'
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {isOwner ? (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => handleToggleShare(e, proj.id, isShared)}
                                        className={`p-2 rounded-lg transition-colors border ${
                                          isShared 
                                            ? 'text-[#0079C2] bg-blue-50 border-blue-100 hover:bg-blue-100' 
                                            : 'text-slate-300 hover:text-[#0079C2] hover:bg-slate-50 border-transparent'
                                        }`}
                                        title={isShared ? "Desfazer Compartilhamento" : "Compartilhar com a Equipe"}
                                      >
                                        <Share2 size={16} />
                                      </button>
                                      <div className="w-px h-6 bg-slate-100 mx-1"></div>
                                      <button 
                                        onClick={(e) => handleDeleteProject(e, proj.id, 'CLOUD')}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Excluir Projeto"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-[8px] font-black text-[#006098] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                      Abrir para Editar →
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}

                {true && (
                  <>
                    <div className="flex items-center gap-2 mb-4 mt-4">
                      <HardDrive size={16} className="text-slate-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cache Local (Neste Navegador)</h4>
                    </div>

                    {savedProjects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center opacity-40 py-8">
                        <HardDrive size={32} className="text-slate-300 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400">Nenhum projeto no cache local.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {savedProjects.map((proj) => (
                          <div 
                            key={proj.id}
                            onClick={() => handleLoadProject(proj.id)}
                            className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#0079C2] hover:shadow-md cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0079C2]">
                                <FileJson size={20} />
                              </div>
                              <div>
                                <h4 className="text-[12px] font-black text-[#006098] uppercase leading-tight group-hover:text-[#0079C2]">{proj.title}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span>{(proj as any).format === 'REPORT' ? 'A4 Vertical' : 'Slide 16:9'}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                    <Clock size={10} /> 
                                    {(proj as any).updatedAt?.seconds 
                                      ? new Date((proj as any).updatedAt.seconds * 1000).toLocaleDateString('pt-BR')
                                      : (proj as any).updatedAt 
                                        ? new Date((proj as any).updatedAt).toLocaleDateString('pt-BR')
                                        : 'Recente'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {user && (
                                <button 
                                  onClick={(e) => handleMigrateToCloud(e, proj.id)}
                                  disabled={migrationStatus[proj.id] === 'MIGRATING'}
                                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border transition-all shadow-sm ${
                                    migrationStatus[proj.id] === 'SUCCESS' 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100' 
                                      : 'bg-blue-50 hover:bg-blue-100 text-[#0079C2] border-[#0079C2]/20 hover:border-[#0079C2]'
                                  }`}
                                  title="Mover para Nuvem"
                                >
                                  {migrationStatus[proj.id] === 'MIGRATING' ? (
                                     <div className="w-3 h-3 border-2 border-[#0079C2] border-t-transparent rounded-full animate-spin"></div>
                                  ) : migrationStatus[proj.id] === 'SUCCESS' ? (
                                     <> <CheckCircle2 size={12} /> Movido! </>
                                  ) : (
                                     <> <Cloud size={12} /> Mover p/ Nuvem </>
                                  )}
                                </button>
                              )}
                              <button 
                                onClick={(e) => handleDeleteProject(e, proj.id, 'LOCAL')}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Excluir Backup Local"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'ADMIN' && (
              <GestaoAcessos />
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        MAG Seguros | Núcleo People Analytics (c) {new Date().getFullYear()}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full h-[70vh] p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col border border-slate-200">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0079C2] text-white flex items-center justify-center">
                  <FileJson size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#006098] uppercase tracking-tight">Restaurar Projeto (JSON)</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Cole o código completo do seu projeto</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 min-h-0 relative mb-4">
              <textarea
                value={pastedJson}
                onChange={(e) => { setPastedJson(e.target.value); setImportError(null); }}
                placeholder='{"title": "Novo Projeto", "pages": [...] }'
                spellCheck={false}
                className="w-full h-full p-4 font-mono text-xs leading-relaxed text-slate-700 bg-slate-50 rounded-2xl resize-none outline-none border border-slate-200 focus:border-[#0079C2] focus:ring-2 focus:ring-[#0079C2]/10 transition-all"
              />
              {importError && (
                <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-rose-50 border-t border-rose-200 text-xs font-bold text-rose-600 flex items-center gap-2 rounded-b-2xl">
                  <AlertCircle size={14} />
                  {importError}
                </div>
              )}
            </div>

            <div className="flex gap-3 shrink-0 justify-end">
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="py-3 px-6 rounded-xl text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  try {
                    const parsed = JSON.parse(pastedJson);
                    if (!parsed.pages) {
                      setImportError("O JSON precisa conter a propriedade 'pages'.");
                      return;
                    }
                    onImport(pastedJson);
                    setIsImportModalOpen(false);
                  } catch (err: any) {
                    setImportError(err.message || "JSON inválido. Verifique a sintaxe.");
                  }
                }}
                disabled={!pastedJson.trim()}
                className={`py-3 px-8 rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-lg transition-all ${pastedJson.trim() ? 'bg-[#0079C2] hover:bg-[#006098] hover:shadow-xl active:scale-95 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'}`}
              >
                Importar Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-[#006098] text-center uppercase tracking-tight mb-3">Excluir Projeto?</h3>
            <p className="text-sm text-slate-500 text-center mb-8">Esta ação é irreversível e o arquivo será apagado permanentemente.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteProject}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-white bg-rose-500 hover:bg-rose-600 uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
