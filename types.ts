
export type Frequency = 'diario' | 'semanal' | 'quinzenal-14d' | 'mensal' | 'quinzenal-fixo' | 'unico';

export enum Priority {
  CRITICO = 'CRÍTICO',
  NECESSARIO = 'NECESSÁRIO',
  FLEXIVEL = 'FLEXÍVEL',
  IMPREVISTO = 'IMPREVISTO',
  INVESTIMENTO = 'RESERVA'
}

export enum TransactionStatus {
  PLANEJADO = 'PLANEJADO',
  CONFIRMADO = 'CONFIRMADO'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  coverImage?: string; 
  systemCoverIndex?: number; // 0-9
}

export interface FinancialEntity {
  id: string;
  name: string;
  amount: number; 
  totalAmount?: number; 
  amountAlreadyPaid?: number; 
  isRenegotiated?: boolean; 
  frequency: Frequency;
  startDate?: string; 
  endDate?: string;
  category: string;
  categoryColor: string;
  priority: Priority;
  status: TransactionStatus;
  customDays?: number[];
  isDebt?: boolean;
}

export interface CashFlowPoint {
  date: string;
  balance: number;
  simulatedBalance?: number;
  savingsBalance: number;
  debtBalance: number; 
  inflow: number;
  outflow: number;
  investmentFlow: number;
  events: FinancialEntity[];
}

export interface AppState {
  incomes: FinancialEntity[];
  expenses: FinancialEntity[];
  savings: FinancialEntity[];
  savingsGoals: SavingsGoal[];
  initialBalance: number;
  initialSavings: number;
  notes?: { [date: string]: string }; // New field for calendar notepad
}

export const INCOME_CATEGORIES = ["Salário", "Freelance", "Contrato", "Vendas", "Dividendos", "Bonificações", "Pró-labore"];
export const EXPENSE_CATEGORIES = ["Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Lazer", "Assinaturas", "Impostos", "Manutenção", "Vestuário"];
export const DEBT_CATEGORIES = ["Dívida Ativa", "Bancária", "Cartão de Crédito", "Empréstimo", "Financiamento", "Pessoal", "Impostos Atrasados"];
export const SAVINGS_CATEGORIES = ["Reserva de Emergência", "Aposentadoria", "Educação", "Viagem", "Investimentos", "Fundo de Oportunidade", "Outros"];

export const SYSTEM_COVERS = [
  { id: 0, name: 'Viagem', gradient: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)', icon: 'Plane', description: 'Janela de avião para novos destinos' },
  { id: 1, name: 'Casa', gradient: 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)', icon: 'Home', description: 'A chave da sua conquista' },
  { id: 2, name: 'Carro', gradient: 'linear-gradient(135deg, #0f172a 0%, #f59e0b 100%)', icon: 'Car', description: 'Acelere rumo à liberdade' },
  { id: 3, name: 'Reserva', gradient: 'linear-gradient(135deg, #0f172a 0%, #6366f1 100%)', icon: 'Shield', description: 'Sua blindagem financeira' },
  { id: 4, name: 'Investimento', gradient: 'linear-gradient(135deg, #0f172a 0%, #8b5cf6 100%)', icon: 'TrendingUp', description: 'Pilha de dinheiro crescendo' },
  { id: 5, name: 'Educação', gradient: 'linear-gradient(135deg, #0f172a 0%, #ec4899 100%)', icon: 'GraduationCap', description: 'Conhecimento que valoriza' },
  { id: 6, name: 'Saúde', gradient: 'linear-gradient(135deg, #0f172a 0%, #ef4444 100%)', icon: 'HeartPulse', description: 'Cuidado e prevenção' },
  { id: 7, name: 'Lazer', gradient: 'linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)', icon: 'Gamepad2', description: 'Momentos de desconexão' },
  { id: 8, name: 'Presentes', gradient: 'linear-gradient(135deg, #0f172a 0%, #f43f5e 100%)', icon: 'Gift', description: 'Generosidade planejada' },
  { id: 9, name: 'Sonhos', gradient: 'linear-gradient(135deg, #0f172a 0%, #d946ef 100%)', icon: 'Sparkles', description: 'O que te faz brilhar' }
];

export const PROJECTION_HORIZONS = [
  { label: '60 Dias', value: 60 },
  { label: '3 Meses', value: 90 },
  { label: '6 Meses', value: 180 },
  { label: '1 Ano', value: 365 }
];
