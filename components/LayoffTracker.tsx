import React from 'react';
import { LayoffItem } from '../types';
import { Users, ExternalLink } from 'lucide-react';

interface LayoffTrackerProps {
  items: LayoffItem[];
}

const LayoffTracker: React.FC<LayoffTrackerProps> = ({ items }) => {
  return (
    <div className="flex flex-col h-full">
        <div className="grid grid-cols-12 gap-2 p-2 border-b border-border bg-surface text-[9px] uppercase text-gray-500 font-mono font-bold tracking-wider">
            <div className="col-span-6">Company / Source</div>
            <div className="col-span-3 text-right">Impact</div>
            <div className="col-span-3 text-right">Link</div>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">
            {items.length === 0 ? (
                <div className="p-4 text-xs text-gray-600 text-center font-mono">Scanning for layoff reports...</div>
            ) : (
                items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-b border-border/50 hover:bg-white/5 transition-colors items-center group">
                        <div className="col-span-6">
                            <div className="text-xs font-bold text-gray-200">{item.company}</div>
                            <div className="text-[9px] text-gray-500 mt-0.5">{item.date}</div>
                        </div>
                        <div className="col-span-3 text-right">
                            <div className="text-xs font-mono text-danger font-bold">
                                {item.employees}
                            </div>
                        </div>
                        <div className="col-span-3 flex justify-end">
                            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-accent transition-colors">
                                <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default LayoffTracker;