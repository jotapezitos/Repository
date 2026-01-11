
import React, { useMemo } from 'react';
import { FinancialEntity, Priority } from '../types';
import { Trash2, Calendar, Repeat, UserPlus, FileText, PiggyBank, ShieldAlert, Edit2, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface ManageContractsProps {
  incomes: FinancialEntity[];
  expenses: FinancialEntity[];
  onRemove: (id: string) => void;
  onEdit: (entity: FinancialEntity) => void;
  privacyMode: boolean;
}

const ContractCard: React.FC<{ entity: FinancialEntity; type: 'income' | 'expense'; onRemove: (id: string) => void; onEdit: (entity: FinancialEntity) => void; privacyMode: boolean }> = ({ entity, type, onRemove, onEdit, privacyMode }) => {
  const isInvestment = entity.priority === Priority.INVESTIMENTO;
  const isDebt = entity.isDebt;
  const formatMoney = (val: number) => privacyMode ? 'R$ ••••••' : `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  const progress = isDebt && entity.totalAmount ? Math.min(100, (((entity.amountAlreadyPaid || 0)) / entity.totalAmount) * 100) : 0;

  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[40px] flex flex-col sm:flex-row justify-between items-start sm:items-center group transition-all hover:border-indigo-500/30 animate-in slide-in-from-right-4">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-[25px] ${type === 'income' ? 'bg-blue-500/10 text-blue-400' : isDebt ? 'bg-orange-500/10 text-orange-400' : isInvestment ? 'bg-pink-500/10 text-pink-400' : 'bg-red-500/10 text-red-400'}`}>
          {type === 'income' ? <TrendingUp size={24} /> : isDebt ? <ShieldAlert size={24} /> : isInvestment ? <PiggyBank size={24} /> : <FileText size={24} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-lg text-white">{entity.name}</h4>
            {isDebt && <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${entity.isRenegotiated ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>{entity.isRenegotiated ? 'Fluxo Ativo' : 'Dívida Parada'}</span>}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[9px] text-slate-500 flex items-center gap-1.5 font-black uppercase tracking-widest"><Repeat size={12} /> {entity.frequency}</span>
            {entity.startDate && (
              <span className="text-[9px] text-slate-500 flex items-center gap-1.5 font-black uppercase tracking-widest"><Calendar size={12} /> Início: {new Date(entity.startDate + 'T00:00:00').toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-6 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-right">
          <p className={`text-xl font-black ${type === 'income' ? 'text-blue-400' : isDebt ? 'text-orange-400' : isInvestment ? 'text-pink-400' : 'text-red-400'}`}>
            {formatMoney(entity.amount || 0)}
          </p>
          {isDebt && entity.totalAmount ? (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-slate-500 font-black uppercase">Quitação: {progress.toFixed(0)}%</p>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-auto">
                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-1.5 mt-1">
               <span className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-400`}>{entity.category}</span>
               {entity.priority === Priority.CRITICO && <AlertTriangle size={10} className="text-rose-500" />}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(entity)} className="p-3 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
            <Edit2 size={20} />
          </button>
          <button onClick={() => onRemove(entity.id)} className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageContracts: React.FC<ManageContractsProps> = ({ incomes, expenses, onRemove, onEdit, privacyMode }) => {
  const stats = useMemo(() => {
    const totalIn = incomes.reduce((acc, i) => acc + i.amount, 0);
    const totalOut = expenses.reduce((acc, e) => acc + e.amount, 0);
    const efficiency = totalIn > 0 ? ((totalIn - totalOut) / totalIn * 100).toFixed(1) : "0";
    return { totalIn, totalOut, efficiency };
  }, [incomes, expenses]);

  const formatMoney = (val: number) => privacyMode ? '••••' : `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* QUICK STATS FOR REGISTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-[35px] border-white/5 flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2">
             <ArrowUpRight size={14} className="text-blue-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Fluxo de Entrada</span>
           </div>
           <p className="text-2xl font-black text-white">{formatMoney(stats.totalIn)}</p>
        </div>
        <div className="glass-panel p-6 rounded-[35px] border-white/5 flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2">
             <ArrowDownRight size={14} className="text-red-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Carga Operacional</span>
           </div>
           <p className="text-2xl font-black text-white">{formatMoney(stats.totalOut)}</p>
        </div>
        <div className="glass-panel p-6 rounded-[35px] border-white/5 flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2">
             <Activity size={14} className="text-emerald-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Eficiência Líquida</span>
           </div>
           <p className="text-2xl font-black text-emerald-500">{stats.efficiency}%</p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-8 px-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 flex items-center gap-3">
            Ativos & Receitas <span className="bg-blue-500/10 px-3 py-1 rounded-full text-[10px]">{incomes.length}</span>
          </h3>
        </div>
        <div className="space-y-4">
          {incomes.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[40px] group hover:border-blue-500/20 transition-all">
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Nenhum ativo de entrada mapeado</p>
            </div>
          ) : (
            incomes.map(income => <ContractCard key={income.id} entity={income} type="income" onRemove={onRemove} onEdit={onEdit} privacyMode={privacyMode} />)
          )}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-8 px-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-500 flex items-center gap-3">
            Passivos & Operações <span className="bg-orange-500/10 px-3 py-1 rounded-full text-[10px]">{expenses.length}</span>
          </h3>
        </div>
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[40px] group hover:border-orange-500/20 transition-all">
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Nenhuma saída recorrente detectada</p>
            </div>
          ) : (
            expenses.map(expense => <ContractCard key={expense.id} entity={expense} type="expense" onRemove={onRemove} onEdit={onEdit} privacyMode={privacyMode} />)
          )}
        </div>
      </section>
    </div>
  );
};

export default ManageContracts;
