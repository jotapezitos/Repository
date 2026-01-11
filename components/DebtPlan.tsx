
import React, { useMemo } from 'react';
import { FinancialEntity } from '../types';
import { ShieldAlert, Trash2, TrendingDown, Zap, AlertTriangle, CheckCircle2, CircleDollarSign, Edit2, CalendarCheck } from 'lucide-react';

interface DebtPlanProps {
  debts: FinancialEntity[];
  onRemove: (id: string) => void;
  onEdit: (entity: FinancialEntity) => void;
  currentBalance: number;
  privacyMode: boolean;
}

const DebtPlan: React.FC<DebtPlanProps> = ({ debts, onRemove, onEdit, currentBalance, privacyMode }) => {
  const formatMoney = (val: number) => privacyMode ? 'R$ ••••••' : `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const stats = useMemo(() => {
    const totalGross = debts.reduce((acc, d) => acc + (d.totalAmount || 0), 0);
    const totalPaid = debts.reduce((acc, d) => acc + (d.amountAlreadyPaid || 0), 0);
    const activeDebts = debts.filter(d => d.isRenegotiated).length;
    const staticDebts = debts.filter(d => !d.isRenegotiated).length;
    const balance = totalGross - totalPaid;
    
    // Estimativa de quitação baseada na soma das parcelas mensais das dividas ativas
    const monthlyPaymentTotal = debts.filter(d => d.isRenegotiated).reduce((acc, d) => acc + d.amount, 0);
    const monthsToClear = monthlyPaymentTotal > 0 ? Math.ceil(balance / monthlyPaymentTotal) : null;

    return { totalGross, totalPaid, activeDebts, staticDebts, balance, monthsToClear };
  }, [debts]);

  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (a.isRenegotiated && !b.isRenegotiated) return -1;
      if (!a.isRenegotiated && b.isRenegotiated) return 1;
      return (b.totalAmount || 0) - (a.totalAmount || 0);
    });
  }, [debts]);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-orange-600 p-8 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
           <Zap className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" size={120} />
           <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Passivo Líquido</p>
           <h2 className="text-4xl font-black tracking-tighter">{formatMoney(stats.balance)}</h2>
           <p className="text-[9px] mt-4 font-bold uppercase opacity-60">Impacto real no patrimônio</p>
        </div>
        <div className="glass-panel p-8 rounded-[50px] border-white/5 flex flex-col justify-center">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><TrendingDown size={20}/></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amortizado</p>
           </div>
           <p className="text-3xl font-black text-white">{formatMoney(stats.totalPaid)}</p>
        </div>
        <div className="glass-panel p-8 rounded-[50px] border-white/5 flex flex-col justify-center">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500"><CircleDollarSign size={20}/></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fluxos Ativos</p>
           </div>
           <p className="text-3xl font-black text-white">{stats.activeDebts} <span className="text-xs font-bold text-slate-500">planos</span></p>
        </div>
        <div className="glass-panel p-8 rounded-[50px] border-white/5 flex flex-col justify-center">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><CalendarCheck size={20}/></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quitação Estimada</p>
           </div>
           <p className="text-3xl font-black text-white">{stats.monthsToClear ? `${stats.monthsToClear} meses` : 'N/A'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <div>
              <h3 className="text-xl font-black flex items-center gap-3"><ShieldAlert className="text-orange-500" /> Plano de Ataque</h3>
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mt-1">Estratégia baseada em criticidade e fluxo de caixa</p>
           </div>
           <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-600">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Pago</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Restante</span>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sortedDebts.map((debt, idx) => {
            const remanente = (debt.totalAmount || 0) - (debt.amountAlreadyPaid || 0);
            const progress = debt.totalAmount ? Math.min(100, ((debt.amountAlreadyPaid || 0) / debt.totalAmount) * 100) : 0;
            const isCritical = idx === 0 && remanente > 0;

            return (
              <div key={debt.id} className={`group bg-slate-900/40 border border-white/5 p-8 rounded-[40px] flex flex-col md:flex-row justify-between items-center transition-all hover:border-orange-500/30 ${isCritical ? 'ring-2 ring-orange-500/20' : ''}`}>
                <div className="flex items-center gap-6 w-full md:w-1/3">
                  <div className={`p-4 rounded-[25px] ${isCritical ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-800 text-slate-500'}`}>
                    {isCritical ? <Zap size={24} className="animate-pulse" /> : <ShieldAlert size={24} />}
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-white uppercase tracking-tighter">{debt.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${debt.isRenegotiated ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                        {debt.isRenegotiated ? 'Impactando Caixa' : 'Dívida Estática'}
                      </span>
                      <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{debt.category}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/3 my-6 md:my-0 px-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progresso de Quitação</span>
                    <span className="text-[10px] font-black text-white">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-1/3 justify-end">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Passivo Restante</p>
                      <p className="text-xl font-black text-orange-500">{formatMoney(remanente)}</p>
                   </div>
                   <div className="flex gap-1">
                    <button onClick={() => onEdit(debt)} className="p-3 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => onRemove(debt.id)} className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DebtPlan;
