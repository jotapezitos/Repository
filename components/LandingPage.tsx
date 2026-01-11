import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, ArrowRight, Sparkles, ChevronDown, 
  HeartPulse, MessageCircle, StickyNote, TrendingUp, ShieldAlert, EyeOff, Fingerprint, Layers, Briefcase
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const NOTIFICATIONS = [
  "R$ 4.500,00: Salário depositado via WhatsApp ✅",
  "Alerta: Assinatura 'Adobe' vence em 2 dias ⚠️",
  "Meta 'Viagem Europa' atingiu 45% do objetivo ✈️",
  "Gasto Flexível: R$ 85,90 em IFood registrado 🍔"
];

const TESTIMONIALS = [
  { name: "Lucas B.", avatar: "LB", accent: "#3b82f6", text: "Minha clareza financeira mudou da água para o vinho. Incrível." },
  { name: "Mariana S.", avatar: "MS", accent: "#ec4899", text: "O calendário de fluxo é o planner que eu sempre quis ter." },
  { name: "Roberto F.", avatar: "RF", accent: "#10b981", text: "Estar no azul agora é um estado de paz diário." },
  { name: "Ana P.", avatar: "AP", accent: "#f59e0b", text: "Finalmente um sistema que projeta o futuro com honestidade." },
  { name: "Juliana K.", avatar: "JK", accent: "#6366f1", text: "Design impecável e funcionalidade de engenharia de ponta." },
  { name: "Tiago M.", avatar: "TM", accent: "#ef4444", text: "Parei de me preocupar com o saldo da semana que vem." },
  { name: "Carla L.", avatar: "CL", accent: "#8b5cf6", text: "Os insights da IA são cirúrgicos. Me economizaram muito." },
  { name: "André V.", avatar: "AV", accent: "#3b82f6", text: "O melhor investimento para quem quer crescer de verdade." },
  { name: "Fernanda G.", avatar: "FG", accent: "#ec4899", text: "Simples, rápido e extremamente poderoso no dia a dia." },
  { name: "Pedro H.", avatar: "PH", accent: "#10b981", text: "O sistema de dívidas é o plano de ataque perfeito." }
];

const FAQ_ITEMS = [
  { q: "O que é estar 'no azul' com o TOAZUL?", a: "Significa alcançar um estado de clareza absoluta sobre seu dinheiro. 'Estar no azul' aqui é saber que sua conta está livre de pendências invisíveis e que você consegue vislumbrar um futuro financeiro de sucesso com previsibilidade total." },
  { q: "Meus dados financeiros são públicos?", a: "Absolutamente não. Utilizamos criptografia local AES-256. Seus dados sensíveis são blindados no seu próprio dispositivo e protegidos pela sua Chave Mestra única. Privacidade é nossa fundação." },
  { q: "O sistema lê minha conta bancária?", a: "Não. Focamos no controle consciente e manual inteligente. Acreditamos que a consciência financeira nasce do registro intencional, transformando dados brutos em decisões inteligentes." },
  { q: "Como funciona a inteligência preditiva?", a: "Nós mapeamos seu fluxo de caixa e projetamos seu saldo meses à frente. O sistema antecipa crises ou oportunidades, garantindo que você nunca mais seja pego de surpresa por um vencimento." },
  { q: "Posso registrar meus gastos pelo WhatsApp?", a: "Sim! Oferecemos uma integração rápida onde você envia valores e categorias via mensagem e o TOAZUL organiza tudo no seu fluxo principal instantaneamente." },
  { q: "O TOAZUL funciona offline?", a: "Sim. Priorizamos a performance local. Você pode registrar e consultar seu fluxo mesmo sem conexão, e os dados sincronizam com o cofre na nuvem assim que você estiver online." }
];

const AnimatedExplodedView = () => {
  const [state, setState] = useState<'cri' | 'est' | 'exp' | 'zen'>('est');
  
  useEffect(() => {
    const states: ('cri' | 'est' | 'exp' | 'zen')[] = ['cri', 'est', 'exp', 'zen'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % states.length;
      setState(states[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    cri: { color: '#ef4444', label: 'CRISE', icon: ShieldAlert },
    est: { color: '#f59e0b', label: 'ESTÁVEL', icon: Activity },
    exp: { color: '#10b981', label: 'EXPANSÃO', icon: TrendingUp },
    zen: { color: '#3b82f6', label: 'EQUILÍBRIO', icon: HeartPulse }
  };

  const current = config[state];

  return (
    <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden rounded-[40px] md:rounded-[60px] bg-black/40 border border-white/5 shadow-2xl">
       <div className="z-10 text-center space-y-4 md:space-y-6 px-4">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl" style={{ backgroundColor: `${current.color}20`, border: `2px solid ${current.color}` }}>
             <current.icon size={36} className="md:size-[40px] animate-pulse" style={{ color: current.color }} />
          </div>
          <div className="space-y-2">
             <h4 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.5em] transition-all duration-700" style={{ color: current.color }}>{current.label}</h4>
             <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Análise de Performance Financeira</p>
          </div>
       </div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [notifIndex, setNotifIndex] = useState(0);
  const testimonialScrollRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifIndex(prev => (prev + 1) % NOTIFICATIONS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scroll = () => {
      if (testimonialScrollRef.current && !isHovering.current) {
        if (testimonialScrollRef.current.scrollLeft >= testimonialScrollRef.current.scrollWidth / 2) {
          testimonialScrollRef.current.scrollLeft = 0;
        } else {
          testimonialScrollRef.current.scrollLeft += 1.2;
        }
      }
    };
    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#05070a] text-[#f8fafc] min-h-screen selection:bg-blue-600/40 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-[100] px-4 md:px-10 py-4 md:py-8 flex justify-between items-center backdrop-blur-2xl border-b border-white/5">
        <div className="logo-font dynamic-logo text-xl md:text-3xl">
          <span className="to text-blue-500">TO</span><span className="azul">AZUL</span>
        </div>
        <div className="flex gap-4 md:gap-12 items-center">
          <button onClick={onLogin} className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 hover:text-white transition-all">Acessar</button>
          <button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-10 py-2 md:py-4 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl transition-all active:scale-95">Começar</button>
        </div>
      </nav>

      <section className="relative pt-28 md:pt-64 pb-20 md:pb-48 px-4 md:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="h-10 md:h-12 overflow-hidden mb-8 md:mb-12 flex justify-center">
           <div className="bg-white/5 border border-white/10 px-4 md:px-6 py-1 md:py-2 rounded-full flex items-center gap-2 md:gap-3 max-w-[90vw]">
              <Sparkles size={12} className="text-blue-400 shrink-0" />
              <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-slate-300 font-mono italic truncate">
                {NOTIFICATIONS[notifIndex]}
              </span>
           </div>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[11rem] font-black logo-font tracking-tighter mb-8 md:mb-14 leading-[0.95] md:leading-[0.8]">
          Clareza é<br/><span className="text-blue-500">Poder.</span>
        </h1>
        <p className="text-base sm:text-xl md:text-3xl text-slate-400 max-w-4xl mx-auto mb-10 md:mb-20 leading-relaxed font-light px-4">
          A única plataforma que projeta seu futuro, antecipa dívidas e blinda seus dados com engenharia financeira de elite.
        </p>
        <button onClick={onGetStarted} className="bg-white text-black px-8 md:px-16 py-4 md:py-8 rounded-[25px] md:rounded-[40px] font-black text-base md:text-2xl flex items-center gap-3 md:gap-5 hover:scale-105 transition-all mx-auto shadow-2xl active:scale-95">
          Iniciar Jornada <ArrowRight size={22} className="md:size-[28px]" />
        </button>
      </section>

      {/* SEÇÃO FODA RESTAURADA */}
      <section className="py-20 md:py-40 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
           <div className="space-y-8 md:space-y-12">
              <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-blue-500">A Visão Prediz o Destino</h3>
              <h2 className="text-4xl md:text-7xl font-black logo-font leading-tight">Mapeie sua<br/><span className="opacity-40">liberdade.</span></h2>
              <p className="text-lg md:text-2xl text-slate-400 font-light leading-relaxed">
                Dinheiro é ferramenta, paz é o objetivo. Quando você domina seu fluxo, o medo desaparece e a liberdade financeira deixa de ser um sonho para se tornar um cálculo preciso.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg"><Activity size={24}/></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Tempo de Fôlego</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg"><TrendingUp size={24}/></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Resiliência IA</span>
                </div>
              </div>
           </div>
           <AnimatedExplodedView />
        </div>
      </section>

      <section className="py-20 md:py-40 bg-gradient-to-b from-transparent to-blue-600/5 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
           <div className="space-y-6 md:space-y-8 text-left">
              <div className="inline-flex p-3 md:p-4 bg-amber-500/10 rounded-2xl md:rounded-3xl text-amber-500 border border-amber-500/20 shadow-xl"><StickyNote size={24} className="md:size-[32px]" /></div>
              <h2 className="text-4xl md:text-6xl font-black logo-font leading-tight tracking-tighter">Sua Agenda<br/><span className="text-amber-500">Inteligente.</span></h2>
              <p className="text-base md:text-xl text-slate-400 font-light leading-relaxed">Novo Bloco de Notas Integrado: anote cada detalhe importante diretamente no dia do lançamento. Memória e fluxo em um só lugar, acessível em qualquer tela.</p>
           </div>
           <div className="relative group">
              <div className="glass-panel p-6 md:p-10 rounded-[35px] md:rounded-[60px] border-white/10 bg-black/60 shadow-4xl transform group-hover:rotate-1 transition-all duration-700">
                 <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-white/5 pb-4 md:pb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500"><StickyNote size={20} className="md:size-[24px]" /></div>
                    <div className="text-left">
                       <h4 className="text-sm md:text-lg font-black text-white">Notas de 15 de Dezembro</h4>
                       <p className="text-[8px] md:text-[10px] font-bold uppercase text-slate-500">Vinculado ao fluxo</p>
                    </div>
                 </div>
                 <div className="space-y-3 md:space-y-4 text-left font-mono text-[11px] md:text-sm text-slate-400 italic">
                    <p className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">"Pagar seguro hoje p/ evitar juros."</p>
                    <p className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">"O bônus entra na conta amanhã."</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section className="py-20 md:py-40 bg-white/5 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8">
              <div className="space-y-4 md:space-y-6 text-left">
                 <h2 className="text-4xl md:text-6xl font-black logo-font uppercase tracking-tighter">O Ecossistema<br/><span className="text-blue-500">Completo.</span></h2>
                 <p className="text-base md:text-xl text-slate-400 font-light">Ferramentas desenhadas para a elite do controle consciente.</p>
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {[
                { icon: MessageCircle, title: "Ponte WhatsApp", text: "Registre qualquer gasto enviando uma mensagem rápida." },
                { icon: Fingerprint, title: "Criptografia Local", text: "Dados blindados no dispositivo e protegidos pela sua Chave Mestra." },
                { icon: EyeOff, title: "Privacidade", text: "Oculte valores sensíveis instantaneamente com um clique." },
                { icon: Layers, title: "Multicontas", text: "Separe fluxos pessoal e profissional em ambientes isolados." },
                { icon: Briefcase, title: "Agenda Planner", text: "Visualize o fluxo em grade mensal para planejar saídas futuras." },
                { icon: Sparkles, title: "Insights IA", text: "Receba avisos preventivos sobre falta de liquidez antes dela ocorrer." }
              ].map((func, i) => (
                <div key={i} className="flex gap-4 md:gap-6 items-start group hover:-translate-y-1 md:hover:-translate-y-2 transition-all">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all shadow-lg shrink-0">
                      <func.icon size={20} className="md:size-[22px]" />
                   </div>
                   <div className="space-y-1 md:space-y-2 text-left">
                      <h4 className="text-base md:text-lg font-black uppercase tracking-tighter text-white">{func.title}</h4>
                      <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{func.text}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="py-20 md:py-40 overflow-hidden bg-black/20">
        <div className="text-center mb-12 md:mb-20">
           <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-slate-500 mb-4 md:mb-6 font-mono">Feedback Comprovado</h3>
           <h2 className="text-3xl md:text-5xl font-black logo-font uppercase tracking-tighter">Quem Vive no Azul</h2>
        </div>
        <div 
          ref={testimonialScrollRef} 
          className="flex gap-6 md:gap-10 whitespace-nowrap px-4 md:px-10 no-scrollbar overflow-x-hidden py-10"
          onMouseEnter={() => isHovering.current = true}
          onMouseLeave={() => isHovering.current = false}
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div key={i} className="inline-block glass-panel p-6 md:p-10 rounded-[30px] md:rounded-[40px] w-[260px] md:w-[350px] shrink-0 space-y-4 md:space-y-6 border-white/5 shadow-4xl transition-all cursor-default whitespace-normal">
               <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-white text-base md:text-lg shadow-2xl" style={{ backgroundColor: t.accent }}>{t.avatar}</div>
                  <p className="font-black text-white text-sm md:text-base">{t.name}</p>
               </div>
               <p className="text-slate-400 italic text-[11px] md:text-sm leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-40 max-w-3xl mx-auto px-4 md:px-6 border-t border-white/5">
        <h2 className="text-2xl md:text-4xl font-black logo-font text-center mb-12 md:mb-16 uppercase tracking-tighter flex items-center justify-center gap-3 md:gap-4">
           <MessageCircle className="text-blue-500" /> Dúvidas Frequentes
        </h2>
        <div className="space-y-3 md:space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="glass-panel rounded-[20px] md:rounded-[35px] overflow-hidden border-white/5 shadow-xl">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 md:p-8 flex justify-between items-center text-left hover:bg-white/5 transition-all outline-none">
                <span className="font-bold text-sm md:text-lg text-slate-200 pr-4">{item.q}</span>
                <ChevronDown size={18} className={`text-blue-500 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-6 md:px-8 pb-6 md:pb-8 text-slate-400 text-xs md:text-sm leading-relaxed animate-in slide-in-from-top-4">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <footer className="py-12 md:py-20 px-6 md:px-10 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16">
           <div className="logo-font dynamic-logo text-2xl md:text-3xl">
             <span className="to text-blue-500">TO</span><span className="azul">AZUL</span>
           </div>
           <p className="text-[8px] md:text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-center md:text-left">
             Engenharia Financeira para Performance e Equilíbrio Consciente
           </p>
           <p className="text-[8px] md:text-[9px] text-slate-800 font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">© 2025 TOAZUL INTERACTIVE</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;