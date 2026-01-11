
import React, { useState } from 'react';
import { CashFlowPoint, FinancialEntity, Priority } from '../types';
import { Download, Info, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface CashFlowTableProps {
  projection: CashFlowPoint[];
  onUpdateEntity: (id: string, updates: Partial<FinancialEntity>) => void;
  privacyMode: boolean;
  lightMode: boolean;
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({ projection, onUpdateEntity, privacyMode, lightMode }) => {
  const formatMoney = (val: number) => {
    const formatted = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return privacyMode ? '••••••' : formatted;
  };

  const handleExport = () => {
    const headers = ["DATA", "DIA", "EVENTO", "ENTRADA (R$)", "SAIDA (R$)", "RESERVA (R$)", "SALDO (R$)"];
    let csvContent = "sep=,\n" + headers.join(",") + "\n";

    projection.forEach((point, idx) => {
      const dateStr = point.date.split('-').reverse().join('/');
      const dayStr = new Date(point.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });

      if (point.events.length === 0) {
        csvContent += `${dateStr},${dayStr},-,0,0,0,${point.balance.toFixed(2)}\n`;
      } else {
        point.events.forEach((event, eIdx) => {
          const isFirst = eIdx === 0;
          const inflow = event.category.includes('Receita') || event.category.includes('Salário') ? event.amount : 0;
          const outflow = !event.category.includes('Receita') && event.priority !== Priority.INVESTIMENTO ? event.amount : 0;
          const investment = event.priority === Priority.INVESTIMENTO ? event.amount : 0;
          
          csvContent += `${isFirst ? dateStr : ""},${isFirst ? dayStr : ""},"${event.name.replace(/"/g, '""')}",${inflow},${outflow},${investment},${isFirst ? point.balance.toFixed(2) : ""}\n`;
        });
      }
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TOAZUL_Planilha_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Células Editáveis em Tempo Real</p>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95"
        >
          <Download size={14} /> EXPORTAR CSV
        </button>
      </div>

      <div className={`overflow-x-auto rounded-[30px] border ${lightMode ? 'border-slate-200 shadow-sm' : 'border-slate-800 shadow-2xl'} no-scrollbar`}>
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead className={`${lightMode ? 'bg-slate-100' : 'bg-slate-800/95'} sticky top-0 z-10`}>
            <tr>
              <th className="w-10 bg-black/5 border-r border-slate-700/10 text-[8px] text-center font-black">ID</th>
              <th className="p-3 border-r border-slate-700/10 text-[9px] font-black uppercase text-slate-500 text-center w-20">Data</th>
              <th className="p-3 border-r border-slate-700/10 text-[9px] font-black uppercase text-slate-500 text-center w-14">Dia</th>
              <th className="p-3 border-r border-slate-700/10 text-[9px] font-black uppercase text-indigo-500">Descrição do Lançamento</th>
              <th className="p-3 border-r border-slate-700/10 text-[9px] font-black uppercase text-emerald-500 text-right w-24">Entrada</th>
              <th className="p-3 border-r border-slate-700/10 text-[9px] font-black uppercase text-rose-500 text-right w-24">Saída</th>
              <th className="p-3 text-[9px] font-black uppercase text-blue-400 text-right w-28">Saldo Proj.</th>
            </tr>
          </thead>
          <tbody className="text-[10px] font-mono font-medium">
            {projection.map((point, idx) => {
              const dateObj = new Date(point.date + 'T00:00:00');
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

              if (point.events.length === 0) {
                return (
                  <tr key={idx} className={`${isWeekend ? (lightMode ? 'bg-slate-50' : 'bg-slate-800/10') : ''} border-b border-slate-800/20`}>
                    <td className="text-[8px] text-center font-black text-slate-700 border-r border-slate-800/10">{idx + 1}</td>
                    <td className="p-2 text-center text-slate-600 border-r border-slate-800/10">{point.date.split('-').reverse().slice(0, 2).join('/')}</td>
                    <td className="p-2 text-center text-slate-700 border-r border-slate-800/10 font-bold">{dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</td>
                    <td className="p-2 italic text-slate-800/20 border-r border-slate-800/10">-- neutro --</td>
                    <td className="p-2 text-right text-slate-800/10 border-r border-slate-800/10">0,00</td>
                    <td className="p-2 text-right text-slate-800/10 border-r border-slate-800/10">0,00</td>
                    <td className="p-2 text-right font-black text-slate-600">{formatMoney(point.balance)}</td>
                  </tr>
                );
              }

              return point.events.map((event, eIdx) => {
                const isFirst = eIdx === 0;
                const inflow = event.category.includes('Receita') || event.category.includes('Salário') || event.category === 'Contrato' ? event.amount : 0;
                const outflow = !event.category.includes('Receita') && event.priority !== Priority.INVESTIMENTO && event.category !== 'Salário' && event.category !== 'Contrato' ? event.amount : 0;

                return (
                  <tr key={`${idx}-${eIdx}`} className={`${isWeekend ? (lightMode ? 'bg-slate-50' : 'bg-slate-800/10') : ''} border-b border-slate-800/20 hover:bg-indigo-500/5 transition-colors group`}>
                    <td className="text-[8px] text-center font-black text-slate-700 border-r border-slate-800/10">{isFirst ? idx + 1 : ''}</td>
                    <td className={`p-2 text-center text-slate-600 border-r border-slate-800/10 ${!isFirst && 'opacity-0'}`}>{point.date.split('-').reverse().slice(0, 2).join('/')}</td>
                    <td className={`p-2 text-center text-slate-700 border-r border-slate-800/10 font-bold ${!isFirst && 'opacity-0'}`}>{dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</td>
                    <td className="p-0 border-r border-slate-800/10">
                      <input defaultValue={event.name} onBlur={(e) => onUpdateEntity(event.id, { name: e.target.value })} className="w-full h-full p-2 bg-transparent outline-none font-bold" />
                    </td>
                    <td className="p-2 text-right text-emerald-500 font-bold border-r border-slate-800/10">{inflow > 0 ? formatMoney(inflow) : ''}</td>
                    <td className="p-2 text-right text-rose-500 font-bold border-r border-slate-800/10">{outflow > 0 ? formatMoney(outflow) : ''}</td>
                    <td className="p-2 text-right font-black text-indigo-400">{isFirst ? formatMoney(point.balance) : ""}</td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlowTable;
