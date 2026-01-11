
import React, { useState } from 'react';
import { Shield, Download, Upload, Trash2, Key, Cloud, Info, CheckCircle, LogOut, User, Mail, Lock, Check, RefreshCcw } from 'lucide-react';
import { storageService } from '../services/storageService';
import { supabase } from '../services/backendBridge';
import { UserProfile } from '../types';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  masterKey: string;
  onKeyChange: (newKey: string) => void;
  onReset: () => void;
  onLogout: () => void;
  lightMode: boolean;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, masterKey, onKeyChange, onReset, onLogout, lightMode }) => {
  const [showKeyEditor, setShowKeyEditor] = useState(false);
  const [tempKey, setTempKey] = useState(masterKey);
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [otp, setOtp] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
        setShowVerify(true);
        alert("Um código de confirmação foi enviado para o novo e-mail.");
      } else {
        const { error } = await supabase.auth.updateUser({ 
          data: { full_name: name } 
        });
        if (error) throw error;
        onUpdateUser({ ...user, name });
        alert("Perfil atualizado com sucesso!");
      }
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email_change'
      });
      if (error) throw error;
      onUpdateUser({ ...user, email, name });
      setShowVerify(false);
      alert("E-mail alterado e verificado com sucesso!");
    } catch (err: any) {
      alert("Código inválido: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKey.length < 4) return alert("Mínimo 4 caracteres.");
    onKeyChange(tempKey);
    setShowKeyEditor(false);
    alert("Cofre re-criptografado!");
  };

  const cardStyle = `border p-8 rounded-[40px] transition-all ${lightMode ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900/60 border-slate-800 shadow-2xl'}`;
  const inputStyle = `w-full border rounded-2xl py-3 pl-10 pr-4 outline-none transition-all ${lightMode ? 'bg-slate-50 border-slate-400 text-slate-900 focus:border-blue-700' : 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'}`;
  const labelStyle = `text-[10px] font-black uppercase tracking-widest ml-1 ${lightMode ? 'text-slate-600' : 'text-slate-500'}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
      {/* Perfil do Usuário */}
      <div className={cardStyle}>
        <h3 className={`text-xl font-black flex items-center gap-3 mb-8 ${lightMode ? 'text-slate-900' : 'text-white'}`}>
          <User className="text-indigo-500" /> Perfil & Acesso
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <label className={labelStyle}>Seu Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelStyle}>E-mail Principal</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} />
            </div>
          </div>

          {!showVerify && (
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${lightMode ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
              {loading ? "Sincronizando..." : "Atualizar Cadastro"}
            </button>
          )}
        </form>
      </div>

      {/* Criptografia */}
      <div className={cardStyle}>
        <h3 className={`text-xl font-black flex items-center gap-3 mb-6 ${lightMode ? 'text-slate-900' : 'text-white'}`}>
          <Shield className="text-indigo-400" /> Segurança Tech-Zen
        </h3>
        <div className="space-y-6">
          <div className={`${lightMode ? 'bg-slate-100' : 'bg-slate-800/40'} p-6 rounded-3xl border ${lightMode ? 'border-slate-300' : 'border-slate-700'}`}>
            {!showKeyEditor ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${lightMode ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/10 text-indigo-400'}`}><Key size={20} /></div>
                  <div><p className={`text-sm font-bold ${lightMode ? 'text-slate-900' : 'text-white'}`}>Chave Mestra</p><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Controle local dos dados</p></div>
                </div>
                <button onClick={() => setShowKeyEditor(true)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${lightMode ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>Alterar</button>
              </div>
            ) : (
              <form onSubmit={handleUpdateKey} className="space-y-4">
                <p className="text-[10px] text-amber-600 font-black uppercase">Isso altera a criptografia dos seus dados locais.</p>
                <div className="flex gap-2">
                  <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} className={inputStyle.replace('pl-10', 'px-4')} />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">OK</button>
                  <button type="button" onClick={() => setShowKeyEditor(false)} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold">X</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={onLogout} className={`p-8 border rounded-[40px] flex flex-col items-center gap-4 transition-all ${lightMode ? 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700' : 'bg-slate-800/20 border-slate-700/30 hover:bg-slate-800 text-slate-500'}`}>
          <LogOut size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Encerrar Sessão</span>
        </button>
        <button onClick={() => confirm("Tem certeza? Isso apaga tudo localmente.") && onReset()} className={`p-8 border rounded-[40px] flex flex-col items-center gap-4 transition-all ${lightMode ? 'bg-rose-50 border-rose-200 hover:bg-rose-100' : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'} text-rose-500`}>
          <Trash2 size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Reset Total</span>
        </button>
      </div>

      <div className={`flex items-center gap-3 p-6 rounded-3xl border ${lightMode ? 'bg-blue-50 border-blue-200' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
        <Info className="text-blue-500 shrink-0" size={20} />
        <p className={`text-[9px] leading-relaxed font-bold uppercase tracking-wider ${lightMode ? 'text-blue-800' : 'text-slate-500'}`}>
          Sua conta é blindada por design. Os dados financeiros mais sensíveis nunca deixam seu dispositivo sem serem criptografados pela sua Chave Mestra.
        </p>
      </div>
    </div>
  );
};

export default Settings;
