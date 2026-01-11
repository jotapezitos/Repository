
import React from 'react';
import { Brain, Sparkles, Zap, ShieldAlert } from 'lucide-react';
import HelperTooltip from './HelperTooltip';

interface Insight {
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

interface AIInsightsProps {
  insights: Insight[];
  resilienceScore: number;
  loading: boolean;
  onRefresh: () => void;
  lightMode?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, resilienceScore, loading, onRefresh, lightMode }) => {
  if (loading) {
    return (
      <div className={`border rounded-[40px] p-20 text-center space-y-6 animate-pulse shadow-2xl ${lightMode ? 'bg-white border-slate-200' : 'bg-slate-800/30 border-slate-700/50'}`}>
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full mx-auto flex items-center justify-center border border-indigo-500/20">
          <Brain className="text-indigo-400 animate-bounce" size={32} />
        </div>
        <div className="space-y-2">
           <p className={`font-black text-xl ${lightMode ? 'text-slate-900' : 'text-white'}`}>Consultando o Futuro...</p>
           <p className="text-slate-500 text-sm italic">A IA está processando seus padrões de gastos e ganhos.</p>
        </div>
      </div>
    );
  }

  const scoreColor = resilienceScore > 75 ? 'text-emerald-500' : resilienceScore > 40 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Sparkles className="text-indigo-500" /> Consultoria Financeira IA
          </h3>
          <p className="text-slate-500 text-[10px] mt-1 uppercase font-black tracking-widest">Análise Baseada no seu Comportamento</p>
        </div>
        <button onClick={onRefresh} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-white px-5 py-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 transition-all hover:bg-indigo-600">Recalcular</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`border p-8 rounded-[40px] relative overflow-hidden shadow-2xl group ${lightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-700/50'}`}>
          <Zap className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity" size={140} />
          <div className="flex items-center"><p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Score de Resiliência</p><HelperTooltip text="Quão seguro seu plano está contra imprevistos." /></div>
          <div className="flex items-end gap-3"><span className={`text-7xl font-black leading-none ${scoreColor}`}>{resilienceScore}</span><span className="text-slate-500 font-black text-2xl mb-1">/ 100</span></div>
          <div className="mt-8 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight">Capacidade de absorção de choque financeiro.</p>
            <div className="w-full h-2 bg-slate-800/20 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${resilienceScore > 75 ? 'bg-emerald-500' : resilienceScore > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${resilienceScore}%` }} /></div>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div key={idx} className={`border p-6 rounded-3xl flex gap-4 transition-all shadow-xl ${lightMode ? 'bg-white border-slate-200 hover:border-indigo-200' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}>
              <div className={`mt-1 shrink-0 p-2 rounded-xl ${insight.severity === 'high' ? 'bg-rose-500/10 text-rose-500' : insight.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}><ShieldAlert size={20} /></div>
              <div><h4 className="text-base font-black">{insight.title}</h4><p className="text-xs text-slate-500 mt-2 leading-relaxed">{insight.content}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
