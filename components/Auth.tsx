
import React, { useState } from 'react';
import { Mail, ArrowRight, Chrome, ShieldCheck, RefreshCcw, ArrowLeft, Info, KeySquare, User, Lock, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/backendBridge';
import { kiwifyService } from '../services/kiwifyService';

interface AuthProps {
  onAuthSuccess: (userProfile: any) => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.signUp(name, email, password);
      setMode('verify');
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Verifique se o e-mail já existe.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signIn(email, password);
      if (user) {
        onAuthSuccess({
          id: user.id,
          name: user.user_metadata?.full_name || email.split('@')[0],
          email: user.email,
          isPremium: true
        });
      }
    } catch (err: any) {
      setError("Credenciais incorretas ou conta ainda não verificada.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await authService.verifyCode(email, otp);
      if (user) {
        onAuthSuccess({
          id: user.id,
          name: user.user_metadata?.full_name || name || email.split('@')[0],
          email: user.email,
          isPremium: true
        });
      }
    } catch (err: any) {
      setError("Código inválido. Verifique seu e-mail novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError("Erro ao conectar com Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>
      
      <div className="max-w-md w-full bg-slate-900 border border-white/5 p-8 sm:p-12 rounded-[50px] shadow-3xl animate-in fade-in zoom-in duration-500 relative">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-6">
            <ShieldCheck size={12} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Ambiente de Segurança</span>
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
            {mode === 'login' ? 'ENTRAR' : mode === 'signup' ? 'CADASTRO' : 'VERIFICAÇÃO'}
          </h2>
          <p className="text-slate-500 text-xs font-medium">
            {mode === 'login' ? 'Seja bem-vindo de volta ao azul.' : mode === 'signup' ? 'Sua jornada para o equilíbrio começa aqui.' : `Digite o código enviado para ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[11px] font-bold text-center animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {mode !== 'verify' && (
            <>
              <button onClick={handleGoogleLogin} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 group">
                <Chrome size={18} /> {mode === 'login' ? 'Continuar com Google' : 'Cadastrar com Google'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                  <span className="bg-slate-900 px-4 text-slate-600">Ou via E-mail</span>
                </div>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
              <input type="text" placeholder="Seu Nome Completo" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 outline-none text-white text-xs focus:border-blue-500 transition-colors" required />
            </div>
          )}

          {mode !== 'verify' && (
            <>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 outline-none text-white text-xs focus:border-blue-500 transition-colors" required />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                <input type="password" placeholder="Crie uma Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 outline-none text-white text-xs focus:border-blue-500 transition-colors" required />
              </div>
            </>
          )}

          {mode === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="relative">
                <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  maxLength={6} 
                  placeholder="0 0 0 0 0 0" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-6 px-4 outline-none text-white text-3xl font-black tracking-[0.4em] text-center focus:border-emerald-500 transition-all placeholder:opacity-20" 
                  required 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                {loading ? <RefreshCcw className="animate-spin" size={18} /> : 'ATIVAR CONTA AGORA'}
              </button>
              <button type="button" onClick={() => setMode('signup')} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Voltar ao Cadastro
              </button>
            </form>
          )}

          {mode === 'login' && (
            <div className="space-y-4">
              <button onClick={handleSignIn} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {loading ? <RefreshCcw className="animate-spin" size={18} /> : 'ENTRAR NO DASHBOARD'}
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <button onClick={handleSignUp} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              {loading ? <RefreshCcw className="animate-spin" size={18} /> : 'CRIAR CONTA & ENVIAR CÓDIGO'}
            </button>
          )}

          <div className="text-center mt-8">
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-all underline underline-offset-8">
              {mode === 'login' ? 'Não tem conta? Comece aqui' : 'Já possui conta? Entrar'}
            </button>
          </div>
        </div>

        <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
          <Info className="text-blue-400 shrink-0" size={14} />
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
            {mode === 'verify' ? 'O código de 6 dígitos foi enviado ao seu e-mail. Caso não encontre, verifique a caixa de Spam.' : 'Seus dados financeiros são protegidos por criptografia de ponta a ponta em nossos servidores.'}
          </p>
        </div>
      </div>
      
      <button onClick={onBack} className="absolute top-10 left-10 text-slate-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
        <ArrowLeft size={16} /> Voltar ao Início
      </button>
    </div>
  );
};

export default Auth;
