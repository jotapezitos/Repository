
import { FinancialEntity, CashFlowPoint, Frequency, Priority } from '../types';

export const calculateRunway = (balance: number, monthlyExpenses: number): number => {
  if (monthlyExpenses <= 0 || balance <= 0) return 0;
  return parseFloat((balance / monthlyExpenses).toFixed(1));
};

const getNextOccurrences = (entity: FinancialEntity, horizonDays: number): { date: Date, multiplier: number }[] => {
  const occurrences: { date: Date, multiplier: number }[] = [];
  let current = new Date(entity.startDate + 'T00:00:00');
  const horizonEnd = new Date();
  horizonEnd.setDate(horizonEnd.getDate() + horizonDays);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entityEnd = entity.endDate ? new Date(entity.endDate + 'T23:59:59') : null;

  if (entity.isDebt && !entity.isRenegotiated) {
    const remaining = Number((entity.totalAmount || 0)) - Number((entity.amountAlreadyPaid || 0));
    if (current >= today && current <= horizonEnd) {
      return [{ date: current, multiplier: 1 }];
    }
    return [];
  }

  let accumulatedPaid = Number(entity.isDebt ? entity.amountAlreadyPaid : 0) || 0;

  if (entity.frequency === 'unico') {
    if (current >= today && current <= horizonEnd) {
      return [{ date: current, multiplier: 1 }];
    }
    return [];
  }

  let iterations = 0;
  while (current <= horizonEnd && iterations < 500) {
    if (entityEnd && current > entityEnd) break;
    if (entity.isDebt && entity.totalAmount && accumulatedPaid >= entity.totalAmount) break;

    if (current >= today) {
      let multiplier = 1;
      let finalAmount = Number(entity.amount);

      if (entity.isDebt && entity.totalAmount) {
        const remaining = entity.totalAmount - accumulatedPaid;
        if (finalAmount > remaining) {
          finalAmount = remaining;
          multiplier = finalAmount / (Number(entity.amount) || 1);
        }
      }

      occurrences.push({ date: new Date(current), multiplier });
      accumulatedPaid += finalAmount;
    }

    switch (entity.frequency) {
      case 'diario': current.setDate(current.getDate() + 1); break;
      case 'semanal': current.setDate(current.getDate() + 7); break;
      case 'quinzenal-14d': current.setDate(current.getDate() + 14); break;
      case 'mensal': current.setMonth(current.getMonth() + 1); break;
      case 'quinzenal-fixo':
        const days = entity.customDays || [1, 15];
        const currentDay = current.getDate();
        const sortedDays = [...days].sort((a, b) => a - b);
        let nextDay = sortedDays.find(d => d > currentDay);
        if (nextDay) {
          current.setDate(nextDay);
        } else {
          current.setMonth(current.getMonth() + 1);
          current.setDate(sortedDays[0]);
        }
        break;
      default: current.setDate(current.getDate() + 30);
    }
    iterations++;
  }
  return occurrences;
};

export const generateProjections = (
  incomes: FinancialEntity[],
  expenses: FinancialEntity[],
  savings: FinancialEntity[],
  initialBalance: number,
  initialSavings: number,
  horizonDays: number = 60
): CashFlowPoint[] => {
  const dailyData: { [dateKey: string]: { inflow: number, outflow: number, investment: number, events: FinancialEntity[] } } = {};

  let totalActiveDebtPool = expenses.filter(e => e.isDebt).reduce((acc, e) => {
    return acc + Math.max(0, Number(e.totalAmount || 0) - Number(e.amountAlreadyPaid || 0));
  }, 0);

  const processList = (list: FinancialEntity[], type: 'inflow' | 'outflow' | 'investment') => {
    list.forEach(item => {
      const occurrences = getNextOccurrences(item, horizonDays);
      occurrences.forEach(({ date, multiplier }) => {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!dailyData[key]) dailyData[key] = { inflow: 0, outflow: 0, investment: 0, events: [] };
        const adjustedAmount = Number(item.amount) * multiplier;
        if (type === 'inflow') dailyData[key].inflow += adjustedAmount;
        else if (type === 'outflow') dailyData[key].outflow += adjustedAmount;
        else if (type === 'investment') dailyData[key].investment += adjustedAmount;
        dailyData[key].events.push({ ...item, amount: adjustedAmount });
      });
    });
  };

  processList(incomes, 'inflow');
  processList(expenses, 'outflow');
  processList(savings, 'investment');

  const projection: CashFlowPoint[] = [];
  let runningBalance = Number(initialBalance);
  let runningSavings = Number(initialSavings);
  let runningDebt = totalActiveDebtPool;
  const today = new Date();

  for (let i = 0; i <= horizonDays; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    // Fix: line 124 - replace undefined 'date' with 'd'
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const data = dailyData[key] || { inflow: 0, outflow: 0, investment: 0, events: [] };
    
    const currentDebtAtPoint = runningDebt + Math.max(0, -runningBalance);
    const dailyDebtPayment = data.events.filter(e => e.isDebt).reduce((acc, e) => acc + Number(e.amount), 0);
    
    runningBalance += (data.inflow - data.outflow - data.investment);
    runningSavings += data.investment;
    runningDebt -= dailyDebtPayment;
    
    projection.push({
      date: key,
      balance: parseFloat(runningBalance.toFixed(2)),
      savingsBalance: parseFloat(runningSavings.toFixed(2)),
      debtBalance: -parseFloat(Math.max(0, currentDebtAtPoint).toFixed(2)),
      inflow: data.inflow,
      outflow: data.outflow,
      investmentFlow: data.investment,
      events: data.events
    });
  }
  return projection;
};
