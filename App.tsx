
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppState, FinancialEntity, UserProfile, PROJECTION_HORIZONS, SavingsGoal } from './types';
import { storageService } from './services/storageService';
import { backendBridge, supabase } from './services/backendBridge';
import { kiwifyService } from './services/kiwifyService';
import { generateProjections } from './utils/financeUtils';
import { getFinancialInsights } from './services/geminiService';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import CashFlowTimeline from './components/CashFlowTimeline';
import AIInsights from './components/AIInsights';
import DebtPlan from './components/DebtPlan';
import ManageContracts from './components/ManageContracts';
import SavingsDashboard from './components/SavingsDashboard';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import { Plus, Activity, LayoutGrid, Cpu, ShieldCheck, PiggyBank, Eye, Sun, UserCircle, Briefcase, CheckCircle2 } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

interface AppNotification {
  id: string;
  message: string;
}


const App: React.FC = () => {
  const [masterKey, setMasterKey] = useState<string>(localStorage.getItem('toazul_temp_key') || '');
  const [isLocked, setIsLocked] = useState(storageService.isEncrypted() && !masterKey);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [horizon, setHorizon] = useState(60);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [state, setState] = useState<AppState>({ 
    incomes: [], 
    expenses: [], 
    savings: [], 
    savingsGoals: [],
    initialBalance: 0, 
    initialSavings: 0,
    notes: {}
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'contracts' | 'debts' | 'savings' | 'ai' | 'settings'>('dashboard');
  const [editingEntity, setEditingEntity] = useState<{ entity: FinancialEntity, type: 'income' | 'expense' | 'savings' } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ insights: any[], resilienceScore: number }>({ insights: [], resilienceScore: 0 });
  const [stressAmount, setStressAmount] = useState(0);
  const [simulatedPurchase, setSimulatedPurchase] = useState({ amount: 0, installments: 1, startDate: new Date().toISOString().split('T')[0] });
  const [systemToasts, setSystemToasts] = useState<AppNotification[]>([]);
  const hasLoadedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const triggerToast = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setSystemToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setSystemToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('light', lightMode);
  }, [lightMode]);

  const handleLogout = async () => {
    console.log('[DEBUG] handleLogout called');
    try {
      console.log('[DEBUG] Calling supabase.auth.signOut');
      await supabase.auth.signOut();
      console.log('[DEBUG] Supabase signOut completed');
    } catch (e) {
      console.error('[DEBUG] Logout error:', e);
    }
    console.log('[DEBUG] Clearing localStorage and resetting state');
    localStorage.removeItem('toazul_temp_key');
    setMasterKey('');
    setUser(null);
    setIsPaid(false);
    setView('landing');
    setState({ incomes: [], expenses: [], savings: [], savingsGoals: [], initialBalance: 0, initialSavings: 0, notes: {} });
    hasLoadedRef.current = false;
    console.log('[DEBUG] State reset completed');
  };

  const fetchAIInsights = useCallback(async () => {
    if (!isPaid) return;
    setAiLoading(true);
    try {
      const result = await getFinancialInsights(state);
      setAiResponse(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAiLoading(false);
    }
  }, [state, isPaid]);

  useEffect(() => {
    if (activeTab === 'ai' && aiResponse.insights.length === 0 && !aiLoading && isPaid) {
      fetchAIInsights();
    }
  }, [activeTab, fetchAIInsights, aiResponse.insights.length, aiLoading, isPaid]);

  const handleAddEntity = (entity: FinancialEntity, type: 'income' | 'expense' | 'savings') => {
    setState(prev => ({
      ...prev,
      incomes: type === 'income' ? [...prev.incomes, entity] : prev.incomes,
      expenses: type === 'expense' ? [...prev.expenses, entity] : prev.expenses,
      savings: type === 'savings' ? [...prev.savings, entity] : prev.savings
    }));
    triggerToast(`Registro "${entity.name}" adicionado.`);
  };

  const handleUpdateEntity = (entity: FinancialEntity, type: 'income' | 'expense' | 'savings') => {
    setState(prev => ({
      ...prev,
      incomes: type === 'income' ? prev.incomes.map(e => e.id === entity.id ? entity : e) : prev.incomes,
      expenses: type === 'expense' ? prev.expenses.map(e => e.id === entity.id ? entity : e) : prev.expenses,
      savings: type === 'savings' ? prev.savings.map(e => e.id === entity.id ? entity : e) : prev.savings
    }));
    setEditingEntity(null);
    triggerToast(`Registro "${entity.name}" atualizado.`);
  };

  const handleRemoveEntity = (id: string) => {
    setState(prev => ({
      ...prev,
      incomes: prev.incomes.filter(e => e.id !== id),
      expenses: prev.expenses.filter(e => e.id !== id),
      savings: prev.savings.filter(e => e.id !== id)
    }));
    triggerToast("Registro removido.");
  };

  const handleAddGoal = (goal: SavingsGoal) => {
    setState(prev => ({ ...prev, savingsGoals: [...prev.savingsGoals, goal] }));
    triggerToast(`Meta "${goal.name}" criada.`);
  };

  const handleRemoveGoal = (id: string) => {
    setState(prev => ({ ...prev, savingsGoals: prev.savingsGoals.filter(g => g.id !== id) }));
    triggerToast("Meta removida.");
  };

  const handleUpdateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
    triggerToast("Meta atualizada.");
  };

  const handleUpdateNote = (date: string, note: string) => {
    setState(prev => ({
      ...prev,
      notes: { ...(prev.notes || {}), [date]: note }
    }));
  };

  useEffect(() => {
    const handleSession = async (session: any) => {
      if (session) {
        const email = session.user.email || '';
        const paid = await kiwifyService.checkPaymentStatus(email);
        setUser({ id: session.user.id, name: session.user.user_metadata?.full_name || email.split('@')[0], email, isPremium: paid });
        setIsPaid(paid);
        navigate('/app', { replace: true });
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session)).catch(() => {
      console.warn("Falha ao obter sessão do Supabase.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('[DEBUG] Load useEffect triggered. view:', view, 'user?.id:', user?.id, 'hasLoadedRef.current:', hasLoadedRef.current);
    if (view !== 'app') {
      console.log('[DEBUG] Load useEffect: view !== app, returning');
      return;
    }
    const local = storageService.load(masterKey) as AppState | 'locked';
    console.log('[DEBUG] Load useEffect: loaded local data:', local === 'locked' ? 'locked' : (local ? Object.keys(local) : 'null'));
    if (local === 'locked') {
      console.log('[DEBUG] Load useEffect: data is locked, setting isLocked to true');
      setIsLocked(true);
      return;
    }
    setIsLocked(false);
    if (user?.id && !hasLoadedRef.current) {
      console.log('[DEBUG] Load useEffect: calling fetchFromCloud for user:', user.id);
      backendBridge.fetchFromCloud(user.id).then(cloud => {
        console.log('[DEBUG] Load useEffect: fetchFromCloud resolved with:', cloud ? Object.keys(cloud) : null);
        cloud && setState(cloud as any);
      }).catch((e) => {
        console.warn("Fallando sincronização cloud, usando dados locais.", e);
      });
    } else if (local) {
      console.log('[DEBUG] Load useEffect: using local data');
      setState(prev => ({ ...prev, ...local }));
    } else {
      console.log('[DEBUG] Load useEffect: no local data and no cloud fetch');
    }
    hasLoadedRef.current = true;
  }, [masterKey, view, user?.id]);

  useEffect(() => {
    console.log('[DEBUG] Sync useEffect triggered. isLocked:', isLocked, 'hasLoadedRef.current:', hasLoadedRef.current, 'view:', view, 'user?.id:', user?.id);
    if (!isLocked && hasLoadedRef.current && view === 'app') {
      console.log('[DEBUG] Saving to localStorage and syncing to cloud');
      storageService.save(state, masterKey);
      if (user?.id) {
        console.log('[DEBUG] Calling backendBridge.syncToCloud');
        backendBridge.syncToCloud(state, user.id);
      } else {
        console.log('[DEBUG] No user.id, skipping cloud sync');
      }
    } else {
      console.log('[DEBUG] Skipping sync: conditions not met');
    }
  }, [state, masterKey, isLocked, view, user?.id]);

  const projection = useMemo(() => {
    if (isLocked) return [];
    return generateProjections(state.incomes, state.expenses, state.savings, state.initialBalance, state.initialSavings, horizon);
  }, [state, isLocked, horizon]);

  const startEdit = (entity: FinancialEntity) => {
    let type: 'income' | 'expense' | 'savings' = 'expense';
    if (state.incomes.find(e => e.id === entity.id)) type = 'income';
    else if (state.savings.find(e => e.id === entity.id)) type = 'savings';
    setEditingEntity({ entity, type });
  };


  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full glass-panel p-8 md:p-12 text-center rounded-[40px] md:rounded-[50px] border-white/10 animate-in zoom-in">
          <ShieldCheck className="mx-auto text-blue-500 mb-8 animate-pulse" size={64} />
          <h2 className="text-2xl md:text-3xl font-black logo-font tracking-tighter mb-4 uppercase">Segurança Ativa</h2>
          <p className="text-slate-500 text-xs mb-8 uppercase font-black tracking-widest px-4">Insira sua chave para desbloquear o sistema.</p>
          <input type="password" placeholder="Chave Mestra..." autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value; setMasterKey(v); localStorage.setItem('toazul_temp_key', v); window.location.reload(); }}} className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl py-5 px-6 md:px-8 text-center font-mono text-blue-400 outline-none focus:border-blue-500 transition-all text-xl md:text-2xl" />
        </div>
      </div>
    );
  }

  // Rotas principais
  return (
    <Routes>
      <Route path="/" element={<LandingPage onGetStarted={() => navigate('/auth')} onLogin={() => navigate('/auth')} />} />
      <Route path="/auth" element={<Auth onAuthSuccess={(p) => { setUser(p); setIsPaid(p.isPremium); navigate('/app'); }} onBack={() => navigate('/')} />} />
      <Route path="/app" element={
        <div className={`min-h-screen transition-all ${lightMode ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-200'}`}>
          <div className="fixed top-4 right-4 md:top-10 md:right-10 z-[300] space-y-3 pointer-events-none max-w-[80vw]">
            {systemToasts.map(toast => (
              <div key={toast.id} className="toast-morph flex items-center gap-3 md:gap-4 bg-blue-600/90 text-white px-5 md:px-6 py-3 md:py-4 rounded-full shadow-4xl backdrop-blur-xl border border-white/20">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white animate-pulse"></div>
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none truncate">{toast.message}</span>
                 <CheckCircle2 size={14} className="ml-1 md:ml-2 text-white/80 shrink-0" />
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-32 md:pb-44">
            <header className="flex flex-col lg:flex-row justify-between items-center mb-10 md:mb-16 gap-6 lg:gap-12">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
                <div className="logo-font dynamic-logo text-3xl md:text-5xl">
                  <span className="to text-blue-500">TO</span><span className="azul">AZUL</span>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                 <div className="flex gap-1.5 md:gap-2 p-1 md:p-1.5 rounded-full border border-white/5 bg-white/5 shadow-inner">
                  <button onClick={() => setPrivacyMode(!privacyMode)} className={`p-2.5 md:p-3 rounded-full transition-all ${privacyMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} title="Privacidade"><Eye size={18} /></button>
                  <button onClick={() => setLightMode(!lightMode)} className={`p-2.5 md:p-3 rounded-full transition-all ${lightMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} title="Tema"><Sun size={18} /></button>
                  <button onClick={() => setActiveTab('settings')} className={`p-2.5 md:p-3 rounded-full transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} title="Configurações"><UserCircle size={18} /></button>
                </div>
              </div>
            </header>
            <main className="animate-in fade-in slide-in-from-bottom-6 md:slide-in-from-bottom-12 duration-1000">
              {activeTab === 'dashboard' && <Dashboard projection={projection} currentBalance={state.initialBalance} trueBalance={0} onStressChange={setStressAmount} stressAmount={stressAmount} simulatedPurchase={simulatedPurchase} onSimulatePurchase={setSimulatedPurchase} privacyMode={privacyMode} lightMode={lightMode} horizon={horizon} onHorizonChange={setHorizon} />}
              {activeTab === 'timeline' && <CashFlowTimeline projection={projection} onEdit={startEdit} privacyMode={privacyMode} notes={state.notes || {}} onUpdateNote={handleUpdateNote} onConfirm={()=>{}} />}
              {activeTab === 'contracts' && <ManageContracts incomes={state.incomes} expenses={state.expenses.filter(e => !e.isDebt)} onRemove={handleRemoveEntity} onEdit={startEdit} privacyMode={privacyMode} />}
              {activeTab === 'debts' && <DebtPlan debts={state.expenses.filter(e => e.isDebt)} onRemove={handleRemoveEntity} onEdit={startEdit} currentBalance={state.initialBalance} privacyMode={privacyMode} />}
              {activeTab === 'savings' && <SavingsDashboard projection={projection} currentSavings={projection[0]?.savingsBalance || state.initialSavings} goals={state.savingsGoals} onAddGoal={handleAddGoal} onRemoveGoal={handleRemoveGoal} onUpdateGoal={handleUpdateGoal} privacyMode={privacyMode} lightMode={lightMode} />}
              {activeTab === 'ai' && <AIInsights insights={aiResponse.insights} resilienceScore={aiResponse.resilienceScore} loading={aiLoading} onRefresh={fetchAIInsights} lightMode={lightMode} />}
              {activeTab === 'settings' && <Settings user={user!} onUpdateUser={setUser} masterKey={masterKey} onKeyChange={setMasterKey} onReset={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} lightMode={lightMode} />}
            </main>
            <nav className={`fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 glass-panel px-4 md:px-10 py-3 md:py-4 rounded-full md:rounded-[50px] border-white/5 flex items-center justify-between gap-2 md:gap-6 z-50 shadow-4xl w-[92vw] md:w-auto md:min-w-[640px] ${lightMode ? 'bg-white/95 border-slate-300' : ''}`}>
              <div className="flex flex-1 justify-around gap-1 md:gap-2">
                {leftNavItems.map((btn) => (
                  <button key={btn.id} onClick={() => setActiveTab(btn.id as any)} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === btn.id ? (lightMode ? 'text-blue-700 font-black' : 'text-blue-500 font-black') : 'text-slate-600 hover:text-white'}`}>
                    <btn.icon size={20} className={`md:size-[22px] transition-transform ${activeTab === btn.id ? 'scale-110 md:scale-125' : 'group-hover:-translate-y-1'}`} />
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest truncate max-w-[40px] md:max-w-none">{btn.label}</span>
                  </button>
                ))}
              </div>
              <div className="relative flex items-center justify-center">
                <button 
                  onClick={() => setIsAdding(true)} 
                  className="bg-blue-600 hover:bg-blue-500 text-white p-3.5 md:p-5 rounded-2xl md:rounded-[25px] shadow-2xl transition-all border-2 md:border-4 flex items-center justify-center hover:rotate-12 active:scale-90"
                  style={{ borderColor: lightMode ? '#f8fafc' : '#020408' }}
                >
                  <Plus size={32} strokeWidth={3} />
                </button>
              </div>
              <div className="flex flex-1 justify-around gap-1 md:gap-2">
                {rightNavItems.map((btn) => (
                  <button key={btn.id} onClick={() => setActiveTab(btn.id as any)} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === btn.id ? (lightMode ? 'text-blue-700 font-black' : 'text-blue-500 font-black') : 'text-slate-600 hover:text-white'}`}>
                    <btn.icon size={20} className={`md:size-[22px] transition-transform ${activeTab === btn.id ? 'scale-110 md:scale-125' : 'group-hover:-translate-y-1'}`} />
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest truncate max-w-[40px] md:max-w-none">{btn.label}</span>
                  </button>
                ))}
              </div>
            </nav>
            {(isAdding || editingEntity) && (
              <EntryForm 
                onAdd={handleAddEntity} 
                onUpdate={handleUpdateEntity}
                onClose={() => { setIsAdding(false); setEditingEntity(null); }} 
                initialEntity={editingEntity?.entity}
                initialType={editingEntity?.type || 'expense'} 
                lightMode={lightMode} 
              />
            )}
          </div>
        </div>
      } />
      {/* Redireciona para landing se rota não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const leftNavItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Principal' },
    { id: 'timeline', icon: Activity, label: 'Agenda' },
    { id: 'contracts', icon: Briefcase, label: 'Registros' }
  ];

  const rightNavItems = [
    { id: 'debts', icon: ShieldCheck, label: 'Dívidas' },
    { id: 'savings', icon: PiggyBank, label: 'Cofre' },
    { id: 'ai', icon: Cpu, label: 'IA' }
  ];

  return (
    <div className={`min-h-screen transition-all ${lightMode ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-200'}`}>
      <div className="fixed top-4 right-4 md:top-10 md:right-10 z-[300] space-y-3 pointer-events-none max-w-[80vw]">
        {systemToasts.map(toast => (
          <div key={toast.id} className="toast-morph flex items-center gap-3 md:gap-4 bg-blue-600/90 text-white px-5 md:px-6 py-3 md:py-4 rounded-full shadow-4xl backdrop-blur-xl border border-white/20">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white animate-pulse"></div>
             <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none truncate">{toast.message}</span>
             <CheckCircle2 size={14} className="ml-1 md:ml-2 text-white/80 shrink-0" />
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-32 md:pb-44">
        <header className="flex flex-col lg:flex-row justify-between items-center mb-10 md:mb-16 gap-6 lg:gap-12">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <div className="logo-font dynamic-logo text-3xl md:text-5xl">
              <span className="to text-blue-500">TO</span><span className="azul">AZUL</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="flex gap-1.5 md:gap-2 p-1 md:p-1.5 rounded-full border border-white/5 bg-white/5 shadow-inner">
              <button onClick={() => setPrivacyMode(!privacyMode)} className={`p-2.5 md:p-3 rounded-full transition-all ${privacyMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} title="Privacidade"><Eye size={18} /></button>
              <button onClick={() => setLightMode(!lightMode)} className={`p-2.5 md:p-3 rounded-full transition-all ${lightMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} title="Tema"><Sun size={18} /></button>
              <button onClick={() => setActiveTab('settings')} className={`p-2.5 md:p-3 rounded-full transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} title="Configurações"><UserCircle size={18} /></button>
            </div>
          </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-6 md:slide-in-from-bottom-12 duration-1000">
          {activeTab === 'dashboard' && <Dashboard projection={projection} currentBalance={state.initialBalance} trueBalance={0} onStressChange={setStressAmount} stressAmount={stressAmount} simulatedPurchase={simulatedPurchase} onSimulatePurchase={setSimulatedPurchase} privacyMode={privacyMode} lightMode={lightMode} horizon={horizon} onHorizonChange={setHorizon} />}
          {activeTab === 'timeline' && <CashFlowTimeline projection={projection} onEdit={startEdit} privacyMode={privacyMode} notes={state.notes || {}} onUpdateNote={handleUpdateNote} onConfirm={()=>{}} />}
          {activeTab === 'contracts' && <ManageContracts incomes={state.incomes} expenses={state.expenses.filter(e => !e.isDebt)} onRemove={handleRemoveEntity} onEdit={startEdit} privacyMode={privacyMode} />}
          {activeTab === 'debts' && <DebtPlan debts={state.expenses.filter(e => e.isDebt)} onRemove={handleRemoveEntity} onEdit={startEdit} currentBalance={state.initialBalance} privacyMode={privacyMode} />}
          {activeTab === 'savings' && <SavingsDashboard projection={projection} currentSavings={projection[0]?.savingsBalance || state.initialSavings} goals={state.savingsGoals} onAddGoal={handleAddGoal} onRemoveGoal={handleRemoveGoal} onUpdateGoal={handleUpdateGoal} privacyMode={privacyMode} lightMode={lightMode} />}
          {activeTab === 'ai' && <AIInsights insights={aiResponse.insights} resilienceScore={aiResponse.resilienceScore} loading={aiLoading} onRefresh={fetchAIInsights} lightMode={lightMode} />}
          {activeTab === 'settings' && <Settings user={user!} onUpdateUser={setUser} masterKey={masterKey} onKeyChange={setMasterKey} onReset={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} lightMode={lightMode} />}
        </main>

        <nav className={`fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 glass-panel px-4 md:px-10 py-3 md:py-4 rounded-full md:rounded-[50px] border-white/5 flex items-center justify-between gap-2 md:gap-6 z-50 shadow-4xl w-[92vw] md:w-auto md:min-w-[640px] ${lightMode ? 'bg-white/95 border-slate-300' : ''}`}>
          <div className="flex flex-1 justify-around gap-1 md:gap-2">
            {leftNavItems.map((btn) => (
              <button key={btn.id} onClick={() => setActiveTab(btn.id as any)} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === btn.id ? (lightMode ? 'text-blue-700 font-black' : 'text-blue-500 font-black') : 'text-slate-600 hover:text-white'}`}>
                <btn.icon size={20} className={`md:size-[22px] transition-transform ${activeTab === btn.id ? 'scale-110 md:scale-125' : 'group-hover:-translate-y-1'}`} />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest truncate max-w-[40px] md:max-w-none">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            <button 
              onClick={() => setIsAdding(true)} 
              className="bg-blue-600 hover:bg-blue-500 text-white p-3.5 md:p-5 rounded-2xl md:rounded-[25px] shadow-2xl transition-all border-2 md:border-4 flex items-center justify-center hover:rotate-12 active:scale-90"
              style={{ borderColor: lightMode ? '#f8fafc' : '#020408' }}
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>

          <div className="flex flex-1 justify-around gap-1 md:gap-2">
            {rightNavItems.map((btn) => (
              <button key={btn.id} onClick={() => setActiveTab(btn.id as any)} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === btn.id ? (lightMode ? 'text-blue-700 font-black' : 'text-blue-500 font-black') : 'text-slate-600 hover:text-white'}`}>
                <btn.icon size={20} className={`md:size-[22px] transition-transform ${activeTab === btn.id ? 'scale-110 md:scale-125' : 'group-hover:-translate-y-1'}`} />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest truncate max-w-[40px] md:max-w-none">{btn.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {(isAdding || editingEntity) && (
          <EntryForm 
            onAdd={handleAddEntity} 
            onUpdate={handleUpdateEntity}
            onClose={() => { setIsAdding(false); setEditingEntity(null); }} 
            initialEntity={editingEntity?.entity}
            initialType={editingEntity?.type || 'expense'} 
            lightMode={lightMode} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
