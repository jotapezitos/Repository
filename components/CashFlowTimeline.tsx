
import React, { useState, useMemo, useEffect } from 'react';
import { CashFlowPoint, Priority, FinancialEntity } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownRight, Edit2, FileText, StickyNote, Save, Plus, Search, CalendarDays } from 'lucide-react';

interface TimelineProps {
  projection: CashFlowPoint[];
  onConfirm: (date: string, entityId: string) => void;
  onEdit: (entity: FinancialEntity) => void;
  privacyMode: boolean;
  notes: { [date: string]: string };
  onUpdateNote: (date: string, note: string) => void;
}

const CashFlowTimeline: React.FC<TimelineProps> = ({ projection, onEdit, privacyMode, notes, onUpdateNote }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'notes'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CashFlowPoint | null>(null);
  const [localNote, setLocalNote] = useState("");
  
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedDay) {
      setLocalNote(notes[selectedDay.date] || "");
    }
  }, [selectedDay, notes]);

  const formatMoney = (val: number) => {
    const formatted = val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return privacyMode ? '••••' : `R$ ${formatted}`;
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    
    return days;
  }, [currentMonth]);

  const saveNote = () => {
    if (selectedDay) {
      onUpdateNote(selectedDay.date, localNote);
    }
  };

  const allNotesList = useMemo(() => {
    return Object.entries(notes || {})
      .filter(([date, text]) => text && text.trim().length > 0 && (searchTerm === "" || text.toLowerCase().includes(searchTerm.toLowerCase())))
      .sort((a, b) => b[0].localeCompare(a[0]));
  }, [notes, searchTerm]);

  const handleCreateNoteFromTab = () => {
    if (localNote.trim()) {
      onUpdateNote(noteDate, localNote);
      setLocalNote("");
      setIsCreatingNote(false);
    }
  };

  const renderNotesTab = () => (
    <div className="glass-panel rounded-[30px] md:rounded-[40px] border-white/5 shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 md:p-8 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl md:text-4xl font-black logo-font">Anotações</h2>
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{allNotesList.length} notas no fluxo</p>
        </div>
        <button 
          onClick={() => {
            setLocalNote("");
            setNoteDate(new Date().toISOString().split('T')[0]);
            setIsCreatingNote(true);
          }} 
          className="p-3 md:p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl transition-all active:scale-95"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="px-6 md:px-8 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input 
            type="text" 
            placeholder="Buscar nas notas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-500/30 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-8 pb-8 space-y-3">
        {allNotesList.length === 0 && !isCreatingNote ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
            <StickyNote size={48} />
            <p className="font-black uppercase tracking-widest text-[10px]">Sem anotações</p>
          </div>
        ) : (
          allNotesList.map(([date, text]) => {
            const d = new Date(date + 'T00:00:00');
            const lines = text.split('\n');
            const title = lines[0] || 'Sem título';
            const preview = lines.slice(1).join(' ') || 'Toque para editar...';
            
            return (
              <button 
                key={date}
                onClick={() => {
                  const point = projection.find(p => p.date === date);
                  setSelectedDay(point || { date, balance: 0, savingsBalance: 0, debtBalance: 0, inflow: 0, outflow: 0, investmentFlow: 0, events: [] });
                }}
                className="w-full text-left bg-white/5 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <ArrowUpRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-sm font-bold text-white truncate">{title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">{preview}</p>
              </button>
            )
          })
        )}
      </div>

      {isCreatingNote && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl z-50 flex flex-col animate-in slide-in-from-bottom-full duration-500">
           <div className="p-6 md:p-8 flex justify-between items-center">
              <button onClick={() => setIsCreatingNote(false)} className="text-blue-500 font-bold flex items-center gap-2"><ChevronLeft size={18}/> Cancelar</button>
              <h3 className="font-black logo-font uppercase tracking-tighter">Nova Nota</h3>
              <button onClick={handleCreateNoteFromTab} className="text-blue-500 font-black">Salvar</button>
           </div>
           <div className="px-6 md:px-8 space-y-6 flex-1 flex flex-col">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Data Vinculada</label>
                 <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                    <input 
                      type="date" 
                      value={noteDate}
                      onChange={(e) => setNoteDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-black outline-none focus:border-blue-500 transition-all"
                    />
                 </div>
              </div>
              <textarea 
                autoFocus
                className="flex-1 w-full bg-transparent p-0 text-lg font-medium leading-relaxed outline-none resize-none placeholder:opacity-20 text-slate-200"
                placeholder="Escreva sua anotação aqui..."
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
              />
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <h3 className="text-xl md:text-2xl font-black logo-font flex items-center gap-3">
          <CalendarIcon className="text-blue-500" size={22} /> Agenda de Lançamentos
        </h3>
        <div className="flex p-1 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 w-full md:w-auto overflow-hidden">
          <button onClick={() => setViewMode('calendar')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Calendário</button>
          <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Lista</button>
          <button onClick={() => setViewMode('notes')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'notes' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Notas</button>
        </div>
      </div>

      {viewMode === 'notes' ? renderNotesTab() : viewMode === 'calendar' ? (
        <div className="glass-panel p-4 md:p-8 rounded-[30px] md:rounded-[40px] border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
          <div className="min-w-[700px] md:min-w-0">
            <div className="flex justify-between items-center mb-6 md:mb-10 px-4">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 md:p-3 bg-white/5 rounded-full hover:bg-white/10"><ChevronLeft size={20} /></button>
              <h4 className="text-base md:text-lg font-black uppercase tracking-[0.2em]">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h4>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 md:p-3 bg-white/5 rounded-full hover:bg-white/10"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-3">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
                <div key={d} className="text-center text-[8px] md:text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">{d}</div>
              ))}
              {calendarDays.map((date, i) => {
                if (!date) return <div key={i} className="h-20 md:h-28"></div>;
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const dayPoint = projection.find(p => p.date === dateStr);
                const isToday = new Date().toDateString() === date.toDateString();
                const hasNote = notes && notes[dateStr] && notes[dateStr].trim().length > 0;
                
                const dayInflow = dayPoint?.events.filter(e => e.amount > 0 && !e.isDebt).length || 0;
                const dayOutflow = dayPoint?.events.filter(e => e.amount > 0 && (e.isDebt || e.priority !== Priority.INVESTIMENTO)).length || 0;

                return (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (dayPoint) setSelectedDay(dayPoint);
                      else {
                        setSelectedDay({
                          date: dateStr,
                          balance: 0,
                          savingsBalance: 0,
                          debtBalance: 0,
                          inflow: 0,
                          outflow: 0,
                          investmentFlow: 0,
                          events: []
                        });
                      }
                    }}
                    className={`h-20 md:h-28 p-2 md:p-4 border rounded-[20px] md:rounded-[30px] transition-all flex flex-col justify-between text-left group relative ${isToday ? 'bg-blue-600/10 border-blue-600/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-start z-10 w-full">
                      <span className={`text-[10px] md:text-sm font-black ${isToday ? 'text-blue-500' : 'text-slate-400'}`}>{date.getDate()}</span>
                      <div className="flex gap-1 items-center">
                        {hasNote && <FileText size={10} className="text-amber-500" />}
                        {dayInflow > 0 && <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500"></div>}
                        {dayOutflow > 0 && <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-rose-500"></div>}
                      </div>
                    </div>
                    {dayPoint && (
                      <div className={`text-[7px] md:text-[9px] font-mono font-black z-10 truncate ${dayPoint.balance < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {formatMoney(dayPoint.balance)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
          {projection.filter(p => p.events.length > 0).map((point, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12 pb-8 md:pb-12 last:pb-0 group">
              <div className="absolute left-[14px] md:left-[20px] top-0 bottom-0 w-[1px] bg-white/5 group-last:bottom-full"></div>
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-7 md:w-10 h-7 md:h-10 rounded-lg md:rounded-xl glass-panel flex items-center justify-center font-bold text-[8px] md:text-[10px] uppercase text-blue-500 border-white/10">
                  {new Date(point.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric' })}
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                {point.events.map((event, eIdx) => (
                  <div key={eIdx} className="glass-panel rounded-xl md:rounded-2xl p-4 md:p-5 flex items-center justify-between hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`p-2 rounded-lg ${event.amount > 0 && !event.isDebt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {event.amount > 0 && !event.isDebt ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white">{event.name}</h4>
                        <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">{event.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                      <span className={`font-mono font-bold text-[11px] md:text-sm ${event.amount > 0 && !event.isDebt ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {formatMoney(event.amount)}
                      </span>
                      <button onClick={() => onEdit(event)} className="p-2 text-slate-600 hover:text-white transition-colors"><Edit2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDay && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in">
           <div className="glass-panel w-full max-w-4xl rounded-[30px] md:rounded-[50px] border-white/10 overflow-hidden animate-in zoom-in grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:max-h-none">
              <div className="p-6 md:p-8 border-r border-white/5 flex flex-col h-[40vh] md:h-[70vh]">
                 <div className="mb-4 md:mb-8 flex justify-between items-center">
                    <div>
                       <h2 className="text-xl md:text-2xl font-black logo-font uppercase tracking-tighter">Detalhes do Dia</h2>
                       <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-1">{new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                 </div>
                 <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-2">
                    {selectedDay.events.map((event, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-xl ${event.amount > 0 && !event.isDebt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                             {event.amount > 0 && !event.isDebt ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                           </div>
                           <div>
                             <h4 className="font-black text-white text-xs">{event.name}</h4>
                             <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{event.category}</span>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className={`font-mono font-black text-xs ${event.amount > 0 && !event.isDebt ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {formatMoney(event.amount)}
                           </span>
                         </div>
                      </div>
                    ))}
                    {selectedDay.events.length === 0 && <div className="text-center py-10 opacity-30 italic uppercase text-[8px] font-black tracking-widest">Sem eventos</div>}
                 </div>
                 <div className="pt-4 mt-2 border-t border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Saldo Final</p>
                    <p className={`text-xl md:text-2xl font-black ${selectedDay.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatMoney(selectedDay.balance)}</p>
                 </div>
              </div>

              <div className="p-6 md:p-8 bg-blue-600/5 flex flex-col h-[50vh] md:h-[70vh]">
                 <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-black logo-font flex items-center gap-3">
                       <StickyNote className="text-amber-500" size={20} /> Bloco de Notas
                    </h3>
                    <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-full transition-all"><X size={20}/></button>
                 </div>
                 <textarea 
                    className="flex-1 w-full bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 text-sm font-medium outline-none focus:border-blue-500/50 resize-none no-scrollbar text-slate-300 placeholder:opacity-30"
                    placeholder="Anote detalhes importantes..."
                    value={localNote}
                    onChange={(e) => setLocalNote(e.target.value)}
                    onBlur={saveNote}
                 />
                 <div className="mt-4 flex justify-between items-center">
                    <p className="text-[8px] font-black uppercase text-slate-600 italic">Salvo automaticamente</p>
                    <button 
                       onClick={() => { saveNote(); setSelectedDay(null); }} 
                       className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl transition-all"
                    >
                       FECHAR
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowTimeline;
