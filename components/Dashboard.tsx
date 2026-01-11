import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  Legend
} from 'recharts';
import { CashFlowPoint, Priority, PROJECTION_HORIZONS } from '../types';
import { Activity, LayoutDashboard, Hourglass, Coins, Flame, HeartPulse, AlertCircle, ArrowUpCircle, ArrowDownCircle, ShieldAlert, TrendingUp, Zap } from 'lucide-react';
import { calculateRunway } from '../utils/financeUtils';
import HelperTooltip from './HelperTooltip';

interface DashboardProps {
  projection: CashFlowPoint[];
  currentBalance: number;
  trueBalance: number;
  onStressChange: (amount: number) => void;
  stressAmount: number;
  simulatedPurchase: { amount: number, installments: number, startDate: string };
  onSimulatePurchase: (p: { amount: number, installments: number, startDate: string }) => void;
  privacyMode: boolean;
  lightMode: boolean;
  horizon: number;
  onHorizonChange: (h: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  projection, currentBalance, onStressChange, stressAmount, privacyMode, lightMode, horizon, onHorizonChange
}) => {
  const hasData = useMemo(() => projection.some(p => p.inflow > 0 || p.outflow > 0) || currentBalance > 0, [projection, currentBalance]);
  const [localStress, setLocalStress] = useState(stressAmount);

  useEffect(() => {
    setLocalStress(stressAmount);
  }, [stressAmount]);

  const stats = useMemo(() => {
    const totalOutflow = projection.reduce((acc, p) => acc + p.outflow, 0);
    const totalInflow = projection.reduce((acc, p) => acc + p.inflow, 0);
    const days = projection.length || 1;
    
    const monthPoints = projection.slice(0, 30);
    const monthOutflow = monthPoints.reduce((acc, p) => acc + p.outflow, 0);
    const monthInflow = monthPoints.reduce((acc, p) => acc + p.inflow, 0);
    
    const avgMonthlyOutflow = totalOutflow / (days / 30);
    const totalDebt = Math.abs(projection[0]?.debtBalance || 0);
    const totalSavings = projection[0]?.savingsBalance || 0;

    const netWorth = (currentBalance + totalSavings) - totalDebt;
    const dailyBurn = days > 0 ? totalOutflow / days : 0;
    
    const runwayVal = (monthOutflow <= 0) ? 0 : calculateRunway(currentBalance, avgMonthlyOutflow);
    const stressRunway = (monthOutflow <= 0) ? 0 : calculateRunway(Math.max(0, currentBalance - localStress), avgMonthlyOutflow);
    const runwayImpact = parseFloat(Math.max(0, runwayVal - stressRunway).toFixed(1));

    const healthScore = !hasData ? 0 : Math.min(100, Math.round(( (totalInflow / (totalOutflow || 1)) * 40) + (Math.min(runwayVal, 12) / 12 * 60)));

    let flowStatus: 'CRISE' | 'ESTÁVEL' | 'EXPANSÃO' | 'MODO AZUL' = 'ESTÁVEL';
    let flowColor = '#f59e0b';
    let FlowIcon = Activity;

    if (healthScore < 25 || netWorth < 0) {
      flowStatus = 'CRISE';
      flowColor = '#ef4444';
      FlowIcon = ShieldAlert;
    } else if (healthScore >= 75) {
      flowStatus = 'MODO AZUL';
      flowColor = '#3b82f6';
      FlowIcon = HeartPulse;
    } else if (healthScore >= 50) {
      flowStatus = 'EXPANSÃO';
      flowColor = '#10b981';
      FlowIcon = TrendingUp;
    }

    return {
      runway: runwayVal,
      runwayImpact,
      netWorth: hasData ? netWorth : 0,
      dailyBurn: hasData ? dailyBurn : 0,
      healthScore: hasData ? healthScore : 0,
      totalDebt,
      monthInflow,
      monthOutflow,
      flowStatus,
      flowColor,
      FlowIcon,
      avgMonthlyOutflow
    };
  }, [projection, currentBalance, hasData, localStress]);

  const chartData = useMemo(() => {
    let runningSim = currentBalance - localStress;
    return projection.map(p => {
      runningSim += (p.inflow - p.outflow - p.investmentFlow);
      return {
        ...p,
        displayDate: new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        "Saldo Projetado": p.balance,
        "Caminho Simulado": parseFloat(runningSim.toFixed(2))
      };
    });
  }, [projection, currentBalance, localStress]);

  const formatCurrency = (val: number) => {
    if (privacyMode) return '••••';
    return `R$ ${Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const panelClass = `glass-panel p-6 md:p-8 rounded-[30px] md:rounded-[40px] flex flex-col ${lightMode ? 'border-slate-300 shadow-xl' : 'border-white/5 shadow-2xl'}`;
  const miniCardClass = `glass-panel p-5 rounded-[25px] md:rounded-[30px] border-white/5 flex flex-col justify-between ${lightMode ? 'border-slate-300 shadow-lg' : 'shadow-xl'}`;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-1000">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className={`${panelClass} border-l-4 border-l-blue-500`}>
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-blue-500/10 rounded-xl text-blue-500"><Hourglass size={16}/></div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Fôlego</p>
          </div>
          <h4 className="text-xl md:text-4xl font-black logo-font">{stats.runway} <span className="text-[10px] md:text-sm font-bold text-slate-600">meses</span></h4>
        </div>
        <div className={`${panelClass} border-l-4 border-l-emerald-500`}>
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><Coins size={16}/></div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Saldo Real</p>
          </div>
          <h4 className="text-lg md:text-3xl font-black logo-font truncate">{formatCurrency(stats.netWorth)}</h4>
        </div>
        <div className={`${panelClass} border-l-4 border-l-rose-500`}>
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-rose-500/10 rounded-xl text-rose-500"><Flame size={16}/></div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Gasto Diário</p>
          </div>
          <h4 className="text-lg md:text-3xl font-black logo-font text-rose-500 truncate">{formatCurrency(stats.dailyBurn)}</h4>
        </div>
        <div className={`${panelClass} border-l-4 border-l-indigo-500`}>
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-indigo-500/10 rounded-xl text-indigo-500"><HeartPulse size={16}/></div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Saúde</p>
          </div>
          <h4 className="text-xl md:text-4xl font-black logo-font">{stats.healthScore}<span className="text-[10px] md:text-sm font-bold text-slate-600">%</span></h4>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className={`${miniCardClass} border-l-4 border-l-orange-500`}>
           <div className="flex items-center gap-2 mb-2">
             <AlertCircle size={14} className="text-orange-500" />
             <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">Dívida Total</span>
           </div>
           <p className="text-base md:text-xl font-black text-orange-500 truncate">{formatCurrency(stats.totalDebt)}</p>
        </div>
        <div className={`${miniCardClass} border-l-4 border-l-rose-400`}>
           <div className="flex items-center gap-2 mb-2">
             <ArrowDownCircle size={14} className="text-rose-400" />
             <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">Gastos Mês</span>
           </div>
           <p className="text-base md:text-xl font-black text-rose-400 truncate">{formatCurrency(stats.monthOutflow)}</p>
        </div>
        <div className={`${miniCardClass} border-l-4 border-l-blue-400`}>
           <div className="flex items-center gap-2 mb-2">
             <ArrowUpCircle size={14} className="text-blue-400" />
             <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">Entradas Mês</span>
           </div>
           <p className="text-base md:text-xl font-black text-blue-400 truncate">{formatCurrency(stats.monthInflow)}</p>
        </div>
        <div className={`${miniCardClass} border-l-4 relative overflow-hidden group`} style={{ borderLeftColor: stats.flowColor }}>
           <div className="flex items-center gap-2 mb-2 z-10 relative">
             <stats.FlowIcon size={14} style={{ color: stats.flowColor }} />
             <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">Estado</span>
           </div>
           <div className="flex items-center gap-3 z-10 relative">
              <p className="text-sm md:text-lg font-black uppercase tracking-tighter" style={{ color: stats.flowColor }}>{stats.flowStatus}</p>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                <div className="h-full transition-all duration-1000" style={{ backgroundColor: stats.flowColor, width: `${stats.healthScore}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${panelClass} lg:col-span-2 relative overflow-hidden animate-border`}>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black logo-font flex items-center gap-3">
                  <LayoutDashboard size={24} className="text-blue-500" /> Trajetória de Fluxo
                </h3>
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] mt-1 text-slate-500 italic px-1">Previsão algorítmica de caixa real</p>
              </div>
              <div className={`flex gap-1 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full ${lightMode ? 'bg-slate-100 shadow-inner' : 'bg-black/40 border border-white/5'}`}>
                {PROJECTION_HORIZONS.map(h => (
                  <button key={h.value} onClick={() => onHorizonChange(h.value)} className={`px-3 md:px-5 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${horizon === h.value ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{h.label}</button>
                ))}
              </div>
           </div>
           
           <div className="h-[250px] md:h-[400px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke={lightMode ? "#94a3b840" : "#ffffff05"} vertical={false} />
                 <XAxis dataKey="displayDate" stroke={lightMode ? "#475569" : "#334155"} fontSize={8} fontWeight={900} tickLine={false} axisLine={false} dy={10} />
                 <YAxis 
                   stroke={lightMode ? "#475569" : "#334155"} 
                   fontSize={8} 
                   fontWeight={900} 
                   tickLine={false} 
                   axisLine={false}
                   tickFormatter={(val) => privacyMode ? '••' : `R$ ${val.toLocaleString('pt-BR', { notation: 'compact' })}`}
                 />
                 <Tooltip 
                   cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                   contentStyle={{ backgroundColor: lightMode ? '#ffffff' : '#0a0f19', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                 />
                 <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} />
                 <ReferenceLine y={0} stroke={lightMode ? "#0f172a" : "#ffffff"} strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
                 <Area type="monotone" dataKey="Saldo Projetado" stroke="#3b82f6" strokeWidth={3} fill="url(#colorFlow)" activeDot={{ r: 5, strokeWidth: 0 }} />
                 {localStress > 0 && <Area type="monotone" dataKey="Caminho Simulado" stroke="#f43f5e" strokeWidth={2} strokeDasharray="6 6" fill="transparent" />}
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className={`${panelClass} border-2 border-dashed border-blue-500/20 bg-blue-500/5`}>
           <div className="flex items-center justify-between mb-6 md:mb-10">
              <h3 className="text-lg md:text-xl font-black logo-font flex items-center gap-3">
                 <Zap className="text-blue-500" size={20} /> Simulador Impacto
              </h3>
              <HelperTooltip text="Simule um gasto imprevisto e veja como ele afeta seu fôlego financeiro." />
           </div>

           <div className="space-y-6 md:space-y-8 flex-1">
              <div className="space-y-2">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">Valor Imprevisto</label>
                    <span className="text-[10px] md:text-xs font-black text-blue-500">{formatCurrency(localStress)}</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max={Math.max(10000, currentBalance * 2)} 
                    step="50" 
                    value={localStress} 
                    onChange={(e) => {
                       const val = parseFloat(e.target.value);
                       setLocalStress(val);
                       onStressChange(val);
                    }} 
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                 />
              </div>

              <div className="grid grid-cols-1 gap-3 md:gap-4">
                 <div className="p-4 md:p-6 bg-white/5 rounded-[20px] md:rounded-[30px] border border-white/5">
                    <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 mb-2 md:mb-3 tracking-widest">Redução de Fôlego</p>
                    <div className="flex items-center justify-between">
                       <span className={`text-2xl md:text-3xl font-black ${stats.runwayImpact > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                          {stats.runwayImpact > 0 ? `-${stats.runwayImpact}` : '0.0'} <span className="text-[10px] md:text-sm font-bold opacity-60">meses</span>
                       </span>
                       <div className="p-1.5 md:p-2 bg-rose-500/10 rounded-full text-rose-500">
                          <Activity size={16} className={stats.runwayImpact > 1 ? 'animate-pulse' : ''} />
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-4 md:p-6 bg-white/5 rounded-[20px] md:rounded-[30px] border border-white/5">
                    <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 mb-1 tracking-widest">Viabilidade</p>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 italic leading-relaxed">
                       {localStress === 0 ? "Arraste o cursor p/ simular um gasto hoje." : 
                        stats.runwayImpact > 2 ? "Risco Crítico: Este gasto compromete severamente sua segurança." :
                        stats.runwayImpact > 0 ? "Atenção: Impacto moderado na sua reserva." :
                        "Viável: Sua saúde financeira absorve este impacto."}
                    </p>
                 </div>
              </div>
           </div>

           <button 
              onClick={() => { setLocalStress(0); onStressChange(0); }}
              className="mt-6 md:mt-8 w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
           >
              LIMPAR SIMULAÇÃO
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;