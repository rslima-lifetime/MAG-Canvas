import React, { useState } from 'react';
import { 
  X, Mail, Lock, UserPlus, LogIn, Sparkles, 
  AlertCircle, ArrowRight, Github 
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Por favor, digite seu e-mail acima para recuperar a senha.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email.trim());
      alert(`Um link de redefinição de senha foi enviado para o e-mail: ${email}`);
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      const msg = err.code === 'auth/user-not-found' ? 'E-mail não encontrado no sistema.' :
                  err.code === 'auth/invalid-email' ? 'Formato de e-mail inválido.' :
                  'Não foi possível enviar o e-mail de recuperação.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Criar documento do usuário no Firestore para gestão de acessos
        await setDoc(doc(db, "users", userCredential.user.uid), {
          nome: name,
          email: email,
          role: 'Editor',
          status: 'Ativo',
          createdAt: new Date().toISOString()
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Validar se o usuário está Ativo
        const { getDoc, doc } = await import('firebase/firestore');
        const userSnap = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userSnap.exists() && userSnap.data().status === 'Inativo') {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
          throw { code: 'custom/user-inactive', message: 'Sua conta está inativa. Entre em contato com o administrador.' };
        }
      }
      onClose();
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      const errorMessage = 
        err.code === 'custom/user-inactive' ? err.message :
        err.code === 'auth/user-not-found' ? 'Usuário não encontrado.' : 
        err.code === 'auth/wrong-password' ? 'Senha incorreta.' : 
        err.code === 'auth/email-already-in-use' ? 'E-mail já cadastrado.' : 
        err.code === 'auth/weak-password' ? 'A senha deve ter pelo menos 6 caracteres.' :
        err.code === 'auth/operation-not-allowed' ? 'O login por e-mail/senha não está ativado no Firebase Console.' :
        `Erro: ${err.code || 'Desconhecido'}. Tente novamente.`;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[450px] rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Banner Decorativo */}
        <div className="h-32 bg-gradient-to-r from-[#006098] to-[#00A7E7] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-6 left-8 flex items-center gap-3 text-white">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight leading-none">MAG Canvas</h2>
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest mt-1">Sincronize seus Projetos</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h3 className="text-lg font-black text-[#006098] uppercase tracking-tight">
              {isSignUp ? 'Criar Nova Conta' : 'Acessar sua Conta'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              {isSignUp 
                ? 'Preencha os dados abaixo para começar.' 
                : 'Entre para acessar seus projetos salvos na nuvem.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0079C2] transition-colors">
                    <UserPlus size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#0079C2]/10 focus:border-[#0079C2] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0079C2] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@mag.com.br"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#0079C2]/10 focus:border-[#0079C2] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Sua Senha</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0079C2] transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#0079C2]/10 focus:border-[#0079C2] transition-all"
                />
              </div>
              {!isSignUp && (
                <div className="flex justify-end pr-1">
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[11px] font-black text-[#0079C2] uppercase hover:underline tracking-wide mt-1"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold animate-in slide-in-from-top-2 duration-200">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#0079C2] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:bg-[#006098] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? 'Criar minha conta' : 'Entrar no Sistema'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              {isSignUp ? 'Já possui uma conta?' : 'Ainda não tem acesso?'}
            </p>
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="px-6 py-2 border border-slate-200 rounded-full text-xs font-black uppercase tracking-widest text-[#006098] hover:bg-slate-50 transition-colors"
            >
              {isSignUp ? 'Fazer Login' : 'Cadastre-se Agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
