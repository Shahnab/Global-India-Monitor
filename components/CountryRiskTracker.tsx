import React from 'react';
import { CountryRisk } from '../types';
import { Circle, AlertOctagon } from 'lucide-react';

interface CountryRiskTrackerProps {
  items: CountryRisk[];
}

const CountryRiskTracker: React.FC<CountryRiskTrackerProps> = ({ items }) => {
  return (
    <div className="flex flex-col h-full bg-panel">
      {/* Minimal Header */}
      <div className="grid grid-cols-12 px-3 py-2 border-b border-border text-[9px] font-mono font-bold uppercase text-zinc-600 tracking-wider">
        <div className="col-span-8">Region</div>
        <div className="col-span-4 text-right">Threat Level</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-zinc-700 text-xxs font-mono">
            SCANNING GLOBAL REGIONS...
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map((item) => (
              <a 
                key={item.country} 
                href={item.latestUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 px-3 border-b border-border/40 hover:bg-white/[0.02] transition-colors group text-left"
              >
                {/* Row Top */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-300">{item.country}</span>
                    {item.incidentCount > 0 && (
                      <span className="text-[9px] font-mono text-zinc-600">
                        [{item.incidentCount}]
                      </span>
                    )}
                  </div>
                  
                  {/* Text-based Risk Indicator */}
                  <div className={`flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wide ${
                    item.riskLevel === 'Critical' ? 'text-danger' :
                    item.riskLevel === 'High' ? 'text-warning' :
                    'text-zinc-500'
                  }`}>
                    {item.riskLevel === 'Critical' && <AlertOctagon size={8} />}
                    {item.riskLevel === 'Moderate' && <Circle size={6} className="fill-current" />}
                    {item.riskLevel}
                  </div>
                </div>
                
                {/* Minimal Headline Display with Tooltip */}
                <div 
                  className="text-[10px] text-zinc-500 font-sans leading-tight truncate group-hover:text-zinc-300 transition-colors"
                  title={item.latestHeadline}
                >
                  {item.latestHeadline}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryRiskTracker;