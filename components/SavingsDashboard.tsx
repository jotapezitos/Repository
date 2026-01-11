
import React, { useState, useMemo } from 'react';
import { CashFlowPoint, SavingsGoal, SYSTEM_COVERS } from '../types';
import { Target, Plus, Trash2, Edit3, X, Image as ImageIcon, Check, Save, Plane, Home, Car, Shield, TrendingUp, GraduationCap, HeartPulse, Gamepad2, Gift, Sparkles, CircleDollarSign } from 'lucide-react';

interface SavingsDashboardProps {
  projection: CashFlowPoint[];
  currentSavings: number;
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onRemoveGoal: (id: string) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  privacyMode: boolean;
  lightMode: boolean;
}

// Mapeamento dinâmico de ícones para as capas
const CoverIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  switch (name) {
    case 'Plane': return <Plane size={size} />;
    case 'Home': return <Home size={size} />;
    case 'Car': return <Car size={size} />;
    case 'Shield': return <Shield size={size} />;
    case 'TrendingUp': return <TrendingUp size={size} />;
    case 'GraduationCap': return <GraduationCap size={size} />;
    case 'HeartPulse': return <HeartPulse size={size} />;
    case 'Gamepad2': return <Gamepad2 size={size} />;
    case 'Gift': return <Gift size={size} />;
    case 'Sparkles': return <Sparkles size={size} />;
    default: return <CircleDollarSign size={size} />;
  }
};

const SavingsDashboard: React.FC<SavingsDashboardProps> = ({ 
  currentSavings, goals, onAddGoal, onRemoveGoal, onUpdateGoal, privacyMode, lightMode 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [goalForm, setGoalForm] = useState<Partial<SavingsGoal>>({ name: '', targetAmount: 0, currentAmount: 0, systemCoverIndex: 0 });

  const formatMoney = (val: number) => {
    const formatted = val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return privacyMode ? '••••' : `R$ ${formatted}`;
  };

  const allocated = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const freeBalance = Math.max(0, currentSavings - allocated);

  const startEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalForm({ ...goal });
  };

  const handleSaveGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return;

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, { 
        name: goalForm.name, 
        targetAmount: goalForm.targetAmount,
        systemCoverIndex: goalForm.systemCoverIndex
      });
      setEditingGoal(null);
    } else {
      onAddGoal({
        id: Math.random().toString(36).substr(2, 9),
        name: goalForm.name || 'Nova Meta',
        targetAmount: goalForm.targetAmount || 0,
        currentAmount: 0,
        systemCoverIndex: goalForm.systemCoverIndex || 0
      });
      setIsAdding(false);
    }
    setGoalForm({ name: '', targetAmount: 0, currentAmount: 0, systemCoverIndex: 0 });
  };

  const cardStyle = `glass-panel p-8 rounded-[40px] flex flex-col ${lightMode ? 'border-slate-300 shadow-xl' : 'border-white/5 shadow-2xl'}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardStyle}>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Reserva Consolidada</p>
            <h4 className="text-3xl font-black text-pink-500">{formatMoney(currentSavings)}</h4>
          </div>
          <p className="text-[10px] text-slate-600 mt-6 leading-relaxed">Total mapeado em suas contas de investimento e reserva.</p>
        </div>
        
        <div className={cardStyle}>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Livre p/ Alocação</p>
            <h4 className="text-3xl font-black text-emerald-500">{formatMoney(freeBalance)}</h4>
          </div>
          <button onClick={() => setIsAdding(true)} className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors">
            <Plus size={14} /> Nova Caixinha
          </button>
        </div>

        <div className={`${cardStyle} items-center justify-center border-dashed border-blue-500/20 group cursor-pointer hover:bg-blue-500/5 transition-all`} onClick={() => setIsAdding(true)}>
          <div className="text-center">
            <Plus className="mx-auto text-slate-700 group-hover:text-blue-500 transition-colors mb-2" size={32} />
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Criar Objetivo</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
          const cover = SYSTEM_COVERS[goal.systemCoverIndex || 0];

          return (
            <div key={goal.id} className="glass-panel rounded-[40px] overflow-hidden group relative flex flex-col shadow-4xl hover:border-blue-500/20 transition-all">
              <div className="h-32 w-full relative overflow-hidden" style={{ background: cover.gradient }}>
                 <div className="absolute inset-0 bg-black/20"></div>
                 {/* Visual Decorativo do Ícone na Capa */}
                 <div className="absolute -right-4 -bottom-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                    <CoverIcon name={cover.icon} size={100} />
                 </div>

                 <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white shadow-xl">
                       <CoverIcon name={cover.icon} />
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight drop-shadow-md">{goal.name}</h4>
                 </div>
                 <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(goal)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => onRemoveGoal(goal.id)} className="p-2 bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-500 rounded-xl backdrop-blur-md transition-all"><Trash2 size={16}/></button>
                 </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Objetivo: {formatMoney(goal.targetAmount)}</p>
                   <div className="mt-4 flex justify-between items-end">
                      <p className="text-2xl font-black text-white">{formatMoney(goal.currentAmount)}</p>
                      <p className="text-[10px] font-black text-slate-600">{progress.toFixed(0)}%</p>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                     <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                   </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => {
                    const amount = parseFloat(prompt(`Depositar em "${goal.name}" (Máximo Livre: ${formatMoney(freeBalance)}):`) || "0");
                    if (amount > 0 && amount <= freeBalance) onUpdateGoal(goal.id, { currentAmount: goal.currentAmount + amount });
                  }} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Aportar</button>
                  <button onClick={() => {
                    const amount = parseFloat(prompt(`Resgatar de "${goal.name}" (Disponível: ${formatMoney(goal.currentAmount)}):`) || "0");
                    if (amount > 0 && amount <= goal.currentAmount) onUpdateGoal(goal.id, { currentAmount: goal.currentAmount - amount });
                  }} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Resgatar</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PARA CRIAR OU EDITAR */}
      {(isAdding || editingGoal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="glass-panel p-10 rounded-[50px] w-full max-w-lg border-white/10 space-y-8 shadow-4xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>
            
            <div className="flex justify-between items-center mb-8 relative">
               <h2 className="text-2xl font-black logo-font uppercase tracking-tight">{editingGoal ? 'Ajustar Caixinha' : 'Novo Objetivo'}</h2>
               <button onClick={() => { setIsAdding(false); setEditingGoal(null); }} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><X size={24}/></button>
            </div>

            <div className="space-y-6 relative">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nome da Caixinha</label>
                <input 
                   type="text" 
                   placeholder="Ex: Reserva, Viagem..." 
                   value={goalForm.name} 
                   onChange={e => setGoalForm({...goalForm, name: e.target.value})} 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Valor do Objetivo</label>
                <input 
                   type="number" 
                   placeholder="R$ 0,00" 
                   value={goalForm.targetAmount || ''} 
                   onChange={e => setGoalForm({...goalForm, targetAmount: parseFloat(e.target.value) || 0})} 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><ImageIcon size={12}/> Capa Temática</label>
                 <div className="grid grid-cols-5 gap-3">
                    {SYSTEM_COVERS.map((cover, idx) => (
                       <button 
                          key={idx}
                          title={cover.description}
                          onClick={() => setGoalForm({...goalForm, systemCoverIndex: idx})}
                          className={`h-12 rounded-xl transition-all relative overflow-hidden group flex items-center justify-center ${goalForm.systemCoverIndex === idx ? 'ring-2 ring-blue-500 scale-105' : 'opacity-40 hover:opacity-100'}`}
                          style={{ background: cover.gradient }}
                       >
                          <div className="text-white">
                             <CoverIcon name={cover.icon} size={18} />
                          </div>
                          {goalForm.systemCoverIndex === idx && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Check size={16} className="text-white" />
                             </div>
                          )}
                       </button>
                    ))}
                 </div>
              </div>
            </div>

            <button onClick={handleSaveGoal} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[30px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
               <Save size={18}/> {editingGoal ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CAIXINHA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsDashboard;
