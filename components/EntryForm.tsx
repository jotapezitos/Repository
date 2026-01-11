
import React, { useState, useEffect } from 'react';
import { FinancialEntity, Frequency, Priority, TransactionStatus, INCOME_CATEGORIES, EXPENSE_CATEGORIES, DEBT_CATEGORIES, SAVINGS_CATEGORIES } from '../types';
import { X, DollarSign, PiggyBank, ShieldAlert, Receipt, PlusCircle, ArrowLeft, Calendar, Save } from 'lucide-react';

interface EntryFormProps {
  onAdd: (entity: FinancialEntity, type: 'income' | 'expense' | 'savings') => void;
  onUpdate: (entity: FinancialEntity, type: 'income' | 'expense' | 'savings') => void;
  onClose: () => void;
  initialType?: 'income' | 'expense' | 'savings' | 'debt';
  initialEntity?: FinancialEntity;
  lightMode?: boolean;
}

const EntryForm: React.FC<EntryFormProps> = ({ onAdd, onUpdate, onClose, initialType = 'expense', initialEntity, lightMode }) => {
  const isEditing = !!initialEntity;
  const [type, setType] = useState<'income' | 'expense' | 'savings' | 'debt'>(
    initialEntity?.isDebt ? 'debt' : (initialType as any)
  );
  
  const [name, setName] = useState(initialEntity?.name || '');
  const [amount, setAmount] = useState<number>(initialEntity?.amount || 0);
  
  // Debt Specific
  const [totalGrossDebt, setTotalGrossDebt] = useState<number>(initialEntity?.totalAmount || 0);
  const [alreadyPaid, setAlreadyPaid] = useState<number>(initialEntity?.amountAlreadyPaid || 0);
  const [isRenegotiated, setIsRenegotiated] = useState(initialEntity?.isRenegotiated || false);
  
  const [frequency, setFrequency] = useState<Frequency>(initialEntity?.frequency || 'mensal');
  const [startDate, setStartDate] = useState(initialEntity?.startDate || new Date().toISOString().split('T')[0]);
  
  const [category, setCategory] = useState(initialEntity?.category || '');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : type === 'expense' ? EXPENSE_CATEGORIES : type === 'debt' ? DEBT_CATEGORIES : SAVINGS_CATEGORIES;
  
  const typeColors: any = {
    income: '#3b82f6',
    expense: '#ef4444',
    debt: '#f59e0b',
    savings: '#ec4899'
  };

  useEffect(() => {
    if (!isEditing) {
      setCategory(categories[0]);
      setIsCustomCategory(false);
      setCustomCategory('');
    }
  }, [type, isEditing]);

  // Sincroniza amount automaticamente se não for renegociado (apenas para dívidas)
  useEffect(() => {
    if (type === 'debt' && !isRenegotiated) {
      setAmount(totalGrossDebt - alreadyPaid);
    }
  }, [totalGrossDebt, alreadyPaid, isRenegotiated, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && type !== 'savings') return;

    const remaining = Number(totalGrossDebt || 0) - Number(alreadyPaid || 0);
    const finalAmount = type === 'debt' ? (isRenegotiated ? Number(amount) : remaining) : Number(amount);

    const entity: FinancialEntity = {
      id: initialEntity?.id || Math.random().toString(36).substr(2, 9),
      name: type === 'savings' && !name ? 'Dedução p/ Cofre' : name,
      amount: finalAmount,
      totalAmount: type === 'debt' ? Number(totalGrossDebt) : undefined,
      amountAlreadyPaid: type === 'debt' ? Number(alreadyPaid) : undefined,
      isRenegotiated: type === 'debt' ? isRenegotiated : undefined,
      frequency: type === 'debt' ? (isRenegotiated ? frequency : 'unico') : frequency,
      startDate,
      category: type === 'savings' && !isCustomCategory && !category ? 'Reserva' : (isCustomCategory ? customCategory : category),
      categoryColor: typeColors[type === 'debt' ? 'debt' : type],
      priority: type === 'income' ? Priority.CRITICO : type === 'savings' ? Priority.INVESTIMENTO : Priority.NECESSARIO,
      status: initialEntity?.status || TransactionStatus.PLANEJADO,
      isDebt: type === 'debt'
    };

    const targetType = type === 'debt' ? 'expense' : type as any;
    if (isEditing) {
      onUpdate(entity, targetType);
    } else {
      onAdd(entity, targetType);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
      <div className={`${lightMode ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'} border border-white/10 w-full max-w-lg rounded-[50px] shadow-3xl animate-in zoom-in duration-300 overflow-hidden`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-black tracking-tighter uppercase">
            {isEditing ? `Editar ${initialEntity?.name}` : (type === 'savings' ? 'Transferir p/ Cofre' : 'Novo Registro')}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {!isEditing && (
            <div className="bg-white/5 p-1.5 rounded-3xl flex gap-1">
              <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${type === 'income' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white/5'}`}>
                <DollarSign size={14}/> Receita
              </button>
              <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${type === 'expense' ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white/5'}`}>
                <Receipt size={14}/> Custo
              </button>
              <button type="button" onClick={() => setType('debt')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${type === 'debt' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white/5'}`}>
                <ShieldAlert size={14}/> Dívida
              </button>
              <button type="button" onClick={() => setType('savings')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${type === 'savings' ? 'bg-pink-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white/5'}`}>
                <PiggyBank size={14}/> Reserva
              </button>
            </div>
          )}

          <div className="space-y-4">
            {type !== 'savings' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Categoria</label>
                  {!isCustomCategory ? (
                    <select 
                      value={category} 
                      onChange={(e) => e.target.value === 'CUSTOM' ? setIsCustomCategory(true) : setCategory(e.target.value)} 
                      className={`w-full border rounded-2xl py-4 px-4 text-sm font-bold appearance-none outline-none ${lightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-white/10 text-white'}`}
                      style={{ color: lightMode ? '#0f172a' : '#f8fafc' }}
                    >
                      {categories.map(c => <option key={c} value={c} style={{ backgroundColor: lightMode ? '#ffffff' : '#1e293b', color: lightMode ? '#0f172a' : '#f8fafc' }}>{c}</option>)}
                      <option value="CUSTOM" style={{ backgroundColor: lightMode ? '#ffffff' : '#1e293b', color: '#6366f1', fontWeight: 'bold' }}>+ CATEGORIA PERSONALIZADA</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Nova categoria..." className="flex-1 bg-white/5 border border-indigo-500/50 rounded-2xl py-4 px-6 text-sm font-bold outline-none" autoFocus />
                      <button type="button" onClick={() => setIsCustomCategory(false)} className="px-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-slate-500 uppercase flex items-center gap-2"><ArrowLeft size={14}/> Voltar</button>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Identificação</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Salário Mensal, Aluguel..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none" required />
                </div>
              </>
            )}

            {type === 'debt' && (
              <div className="space-y-4 p-6 bg-orange-600/5 border border-orange-600/20 rounded-[30px] animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-orange-500 uppercase ml-1">Valor Bruto Total</label>
                    <input type="number" step="0.01" value={totalGrossDebt || ''} onChange={(e) => setTotalGrossDebt(parseFloat(e.target.value) || 0)} placeholder="R$ 0,00" className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-orange-400 outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Já pago anteriormente?</label>
                    <input type="number" step="0.01" value={alreadyPaid || ''} onChange={(e) => setAlreadyPaid(parseFloat(e.target.value) || 0)} placeholder="0,00" className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none" />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 py-2">
                   <input type="checkbox" id="reneg" checked={isRenegotiated} onChange={(e) => setIsRenegotiated(e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-slate-800 accent-orange-500 cursor-pointer" />
                   <label htmlFor="reneg" className="text-xs font-black uppercase tracking-tighter text-slate-400 cursor-pointer">Houve parcelamento no fluxo?</label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Valor {type === 'savings' ? 'da Reserva' : (type === 'debt' && isRenegotiated) ? 'da Parcela' : 'Desta Operação'}</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount || ''} 
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
                  disabled={type === 'debt' && !isRenegotiated}
                  placeholder="R$ 0,00" 
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none ${type === 'debt' && !isRenegotiated ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Recorrência</label>
                <select 
                  value={type === 'debt' && !isRenegotiated ? 'unico' : frequency} 
                  onChange={(e) => setFrequency(e.target.value as Frequency)} 
                  disabled={type === 'debt' && !isRenegotiated}
                  className={`w-full border rounded-2xl py-4 px-4 text-sm font-bold appearance-none outline-none ${lightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-white/10 text-white'}`}
                  style={{ color: lightMode ? '#0f172a' : '#f8fafc' }}
                >
                  <option value="mensal" style={{ backgroundColor: lightMode ? '#ffffff' : '#1e293b', color: lightMode ? '#0f172a' : '#f8fafc' }}>Mensal</option>
                  <option value="quinzenal-fixo" style={{ backgroundColor: lightMode ? '#ffffff' : '#1e293b', color: lightMode ? '#0f172a' : '#f8fafc' }}>Quinzenal</option>
                  <option value="unico" style={{ backgroundColor: lightMode ? '#ffffff' : '#1e293b', color: lightMode ? '#0f172a' : '#f8fafc' }}>Pagamento Único</option>
                  <option value="semanal" style={{ backgroundColor: lightMode ? '#ffffff' : '#1e293b', color: lightMode ? '#0f172a' : '#f8fafc' }}>Semanal</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Data de Início/Vencimento</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:border-white/30" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-6 rounded-[30px] font-black text-[12px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 hover:brightness-110 flex items-center justify-center gap-3" style={{ backgroundColor: typeColors[type === 'debt' ? 'debt' : type] }}>
            {isEditing ? <Save size={20} /> : <PlusCircle size={20} />} {isEditing ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR LANÇAMENTO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;
