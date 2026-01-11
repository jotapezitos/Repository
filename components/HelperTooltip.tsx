
import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelperTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const HelperTooltip: React.FC<HelperTooltipProps> = ({ text, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-block ml-1.5 align-middle">
      <HelpCircle size={14} className="text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
      <div className={`absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-slate-200 text-[10px] leading-relaxed rounded-xl shadow-2xl pointer-events-none ${positionClasses[position]}`}>
        {text}
        <div className={`absolute w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 ${
          position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2' :
          position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2' :
          position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2' :
          'right-full top-1/2 -translate-y-1/2 translate-x-1/2'
        }`} />
      </div>
    </div>
  );
};

export default HelperTooltip;
