import React, { useMemo } from 'react';
import { NewsItem } from '../types';
import { CalendarDays } from 'lucide-react';

interface NewsListProps {
  items: NewsItem[];
}

const NewsList: React.FC<NewsListProps> = ({ items }) => {
  
  const groupedData = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.epochTime - a.epochTime);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Grouping: Today vs Earlier
    const groups = { recent: [] as NewsItem[], older: [] as NewsItem[] };
    
    sorted.forEach(item => {
      if (item.epochTime >= todayStart) groups.recent.push(item);
      else groups.older.push(item);
    });
    
    return groups;
  }, [items]);

  const renderItem = (item: NewsItem, idx: number) => (
    <a 
      key={item.id + idx} 
      href={item.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block py-2.5 px-3 border-b border-border/50 hover:bg-white/[0.03] transition-colors group"
    >
      <div className="flex justify-between items-baseline mb-1">
        <span className={`text-[9px] font-mono uppercase tracking-wider ${
          item.priority === 'high' ? 'text-danger' : 'text-zinc-600'
        }`}>
          {item.source}
        </span>
        <span className="text-[9px] font-mono text-zinc-700 group-hover:text-zinc-500">
          {item.timestamp}
        </span>
      </div>
      
      <h3 className={`text-[11px] leading-relaxed font-sans ${
        item.priority === 'high' ? 'text-zinc-200 font-medium' : 'text-zinc-400'
      } group-hover:text-white transition-colors`}>
        {item.title}
      </h3>
    </a>
  );

  if (items.length === 0) {
    return <div className="p-4 text-center text-xxs font-mono text-zinc-700 animate-pulse">NO SIGNAL...</div>;
  }

  return (
    <div className="flex flex-col">
      {groupedData.recent.length > 0 && (
        <div>
          <div className="px-3 py-1 bg-zinc-900/50 border-b border-border flex items-center gap-2">
             <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
             <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold tracking-widest">Live Feed</span>
          </div>
          {groupedData.recent.map(renderItem)}
        </div>
      )}
      
      {groupedData.older.length > 0 && (
        <div>
           <div className="px-3 py-1 bg-zinc-900/50 border-b border-border border-t flex items-center gap-2">
             <CalendarDays size={8} className="text-zinc-600" />
             <span className="text-[9px] font-mono uppercase text-zinc-600 font-bold tracking-widest">Earlier</span>
          </div>
          {groupedData.older.map(renderItem)}
        </div>
      )}
    </div>
  );
};

export default NewsList;