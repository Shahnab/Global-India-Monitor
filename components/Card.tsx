import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '', action }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Expanded: Fixed Z-Index, remove grid classes
  // Standard: Relative, keep grid classes
  const containerClasses = isExpanded 
    ? 'fixed inset-4 z-[100] bg-surface border border-border shadow-2xl' 
    : `relative ${className} bg-panel border border-border`; 

  return (
    <>
      {/* Dimmed Backdrop when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/90 z-[90] transition-opacity" onClick={toggleExpand} />
      )}
      
      <div className={`flex flex-col overflow-hidden group transition-all duration-300 ease-in-out ${containerClasses}`}>
        
        {/* Header: Minimal, Border-Bottom only */}
        <div className="h-8 px-3 border-b border-border flex justify-between items-center shrink-0 bg-panel">
          <div className="flex items-center gap-2">
            {icon && <span className="text-amber-500">{icon}</span>}
            <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] font-semibold text-amber-500 group-hover:text-amber-400 transition-colors">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {action && <div className="text-zinc-600">{action}</div>}
            <button 
              onClick={toggleExpand}
              className="text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              title={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-panel/50">
          {children}
        </div>
      </div>
    </>
  );
};

export default Card;