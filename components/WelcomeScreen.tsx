
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Presentation, LayoutPanelTop, Sparkles, 
  ArrowRight, Upload, Clock, HardDrive, Trash2, AlertCircle, FileJson, Save, LayoutTemplate, CheckCircle2,
  LogIn, Cloud, Users, Share2, Shield, ShieldCheck, LogOut
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
  onImport: (file: File) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onImport }) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'TEMPLATES' | 'SAVED' | 'ADMIN'>('NEW');
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<DocumentFormat>('REPORT');
  const [design, setDesign] = useState<DesignSystem>('STANDARD');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { listProjects, loadLocalProject, deleteLocalProject } = useLocalStorageProjects();
  const { listUserProjects, listSharedProjects, deleteProject } = useFirestoreProjects();
  const { user } = useAuth();
  
  const [savedProjects, setSavedProjects] = useState<SavedProjectMeta[]>([]);
  const [cloudProjects, setCloudProjects] = useState<any[]>([]);
  const [sharedProjects, setSharedProjects] = useState<any[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'SAVED') {
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
      }
    }
  }, [activeTab, listProjects, user, listUserProjects, listSharedProjects]);

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

  const handleUseTemplate = (template: TemplateMeta) => {
    // Clona o objeto para evitar referência direta
    const templateData = JSON.parse(JSON.stringify(template.data));
    onStart(templateData);
  };

  const handleLoadProject = (id: string) => {
    const data = loadLocalProject(id);
    if (data) {
      onStart(data);
    } else {
      alert("Erro ao carregar projeto. Os dados podem ter sido limpos do navegador.");
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string, type: 'LOCAL' | 'CLOUD') => {
    e.stopPropagation();
    if (window.confirm("Tem certeza? Esta ação não pode ser desfeita.")) {
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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#00A7E7] hover:border-[#00A7E7] hover:shadow-lg transition-all group text-left"
              >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#00A7E7] transition-colors text-white">
                      <Upload size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-white group-hover:text-white transition-colors">
                        Restaurar Backup
                    </span>
                    <span className="text-[9px] text-blue-200/60 group-hover:text-white/80 transition-colors">Importar arquivo .json</span>
                  </div>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
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
                className={`text-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all whitespace-nowrap ${activeTab === 'NEW' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
              >
                Novo em Branco
              </button>
              <button 
                onClick={() => setActiveTab('TEMPLATES')}
                className={`text-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'TEMPLATES' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
              >
                <LayoutTemplate size={14} /> Modelos Prontos
                <span className="bg-emerald-100 text-emerald-600 border border-emerald-200 text-[8px] px-1.5 py-0.5 rounded-full ml-1">Novo</span>
              </button>
              <button 
                onClick={() => setActiveTab('SAVED')}
                className={`text-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'SAVED' ? 'text-[#006098] border-[#006098]' : 'text-slate-300 border-transparent hover:text-slate-400'}`}
              >
                Projetos Salvos 
                <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full ml-1">
                  {listProjects().length + (user ? cloudProjects.length + sharedProjects.length : 0)}
                </span>
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
            )}

            {activeTab === 'TEMPLATES' && (
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

                {/* Seção Nuvem - Meus Projetos */}
                {user && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-[#00A7E7]" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006098]">Meus Projetos na Nuvem</h4>
                    </div>
                    {isCloudLoading ? (
                      <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#0079C2] border-t-transparent rounded-full animate-spin"></div></div>
                    ) : cloudProjects.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-medium italic ml-6">Nenhum projeto salvo na nuvem ainda.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {cloudProjects.map((proj) => (
                          <div 
                            key={proj.id}
                            onClick={() => onStart({ ...proj, _firestoreId: proj.id })}
                            className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-[#0079C2] hover:shadow-md cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0079C2]">
                                <Cloud size={20} />
                              </div>
                              <div>
                                <h4 className="text-[12px] font-black text-[#006098] uppercase leading-tight">{proj.title}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                    <Clock size={10} /> {proj.updatedAt?.toDate().toLocaleDateString('pt-BR')}
                                  </span>
                                  {proj.isShared && (
                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Compartilhado</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => handleDeleteProject(e, proj.id, 'CLOUD')}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Seção Nuvem - Compartilhados com a Equipe */}
                {user && sharedProjects.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={16} className="text-emerald-500" />
                      <Users size={16} className="text-[#0079C2]" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006098]">Projetos da Equipe (Modo Colaborativo)</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {sharedProjects.map((proj) => (
                        <div 
                          key={proj.id}
                          onClick={() => onStart({ ...proj, _firestoreId: proj.id })}
                          className="group flex items-center justify-between p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform">
                              <Users size={18} />
                            </div>
                            <div>
                              <h4 className="text-[12px] font-black text-slate-700 uppercase leading-tight">{proj.title || 'Sem Título'}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md">Área Coletiva</span>
                                <p className="text-[9px] font-bold text-slate-400">Dono: {proj.ownerId === user.uid ? 'Você' : (proj.ownerName || 'Equipe')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Abrir para Editar →</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                          <button 
                            onClick={(e) => handleDeleteProject(e, proj.id, 'LOCAL')}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
        MAG Seguros • Núcleo People Analytics © {new Date().getFullYear()}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};
