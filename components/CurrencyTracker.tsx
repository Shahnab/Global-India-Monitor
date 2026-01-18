import React from 'react';
import { MarketData } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CurrencyTrackerProps {
  data: MarketData;
}

const CurrencyTracker: React.FC<CurrencyTrackerProps> = ({ data }) => {
  const isNegative = data.inrChange < 0;
  const TrendIcon = isNegative ? TrendingDown : TrendingUp;
  const trendColor = isNegative ? 'text-red-500' : 'text-emerald-500';
  const glowColor = isNegative ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <div className="h-full flex flex-col bg-panel p-5 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[60px] opacity-[0.08] pointer-events-none ${glowColor}`} />

      {/* Header Section */}
      <div className="flex justify-between items-start mb-2 z-10">
         <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Currency Pair</span>
            <div className="flex items-center gap-2">
               <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">USD</span>
               <span className="text-zinc-600 text-xs">/</span>
               <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">INR</span>
            </div>
         </div>
         
         <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">24h Change</span>
            <div className={`flex items-center gap-1.5 ${trendColor}`}>
                <TrendIcon size={14} />
                <span className="text-sm font-mono font-bold">{Math.abs(data.inrChange).toFixed(2)}%</span>
            </div>
         </div>
      </div>

      {/* Main Value Section - Centered */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 py-2">
         <div className="flex items-baseline gap-2">
            <span className="text-3xl text-zinc-700 font-light select-none">₹</span>
            <span className="text-6xl font-mono font-medium text-zinc-100 tracking-tighter drop-shadow-2xl">
                {data.usdInr.toFixed(2)}
            </span>
         </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto pt-3 border-t border-zinc-800/50 flex justify-between items-end z-10">
         <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">Spot Rate</span>
            <span className="text-[10px] text-zinc-500 font-mono">{data.lastUpdated}</span>
         </div>
      </div>
    </div>
  );
};

export default CurrencyTracker;