import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Globe, 
  Activity, 
  Cpu, 
  IndianRupee, 
  Map as MapIcon,
  Zap,
  Briefcase,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Terminal,
  RefreshCw
} from 'lucide-react';

import Card from './components/Card';
import MapComponent from './components/MapComponent';
import NewsList from './components/NewsList';
import CurrencyTracker from './components/CurrencyTracker';
import CountryRiskTracker from './components/CountryRiskTracker';

import { NewsItem, Earthquake, MarketData, CountryRisk, NewsMarker } from './types';
import { 
  fetchTrackedNews,
  fetchEarthquakes, 
  fetchMarketData, 
  STATIC_HOTSPOTS,
  mapNewsToLocations
} from './services/dataService';

// Helper to merge new news items with existing ones, avoiding duplicates
// Uses ID (which is URL for real news) to identify uniqueness
const mergeNews = (existing: NewsItem[], incoming: NewsItem[]): NewsItem[] => {
  const existingIds = new Set(existing.map(i => i.id));
  const newItems = incoming.filter(i => !existingIds.has(i.id));
  
  // If no new items, return existing list to prevent unnecessary re-renders
  if (newItems.length === 0) return existing;

  // Return combined list, sorted by time (newest first)
  return [...newItems, ...existing].sort((a, b) => b.epochTime - a.epochTime);
};

const App: React.FC = () => {
  const [usIndiaNews, setUsIndiaNews] = useState<NewsItem[]>([]);
  const [chinaIndiaNews, setChinaIndiaNews] = useState<NewsItem[]>([]);
  const [aiNews, setAiNews] = useState<NewsItem[]>([]);
  const [tradeNews, setTradeNews] = useState<NewsItem[]>([]);
  const [diasporaRisks, setDiasporaRisks] = useState<CountryRisk[]>([]);
  const [humanRightsNews, setHumanRightsNews] = useState<NewsItem[]>([]);
  const [factCheckNews, setFactCheckNews] = useState<NewsItem[]>([]);
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [market, setMarket] = useState<MarketData>({ usdInr: 84, lastUpdated: '-', inrChange: 0 });
  const [newsMarkers, setNewsMarkers] = useState<NewsMarker[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Ref to track fetching state to prevent race conditions or duplicate overlapping intervals
  const isFetchingRef = useRef(false);

  // Ticking Clock for Real-time Display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Stable refresh function
  const refreshAll = useCallback(async () => {
    // Prevent overlapping fetches
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const [newsData, quakeData, marketData] = await Promise.all([
        fetchTrackedNews(),
        fetchEarthquakes(),
        fetchMarketData()
      ]);

      // Merge news state properly to accumulate history
      setUsIndiaNews(prev => mergeNews(prev, newsData.usIndia));
      setChinaIndiaNews(prev => mergeNews(prev, newsData.chinaIndia));
      setAiNews(prev => mergeNews(prev, newsData.aiTech));
      setTradeNews(prev => mergeNews(prev, newsData.trade));
      setHumanRightsNews(prev => mergeNews(prev, newsData.humanRights));
      setFactCheckNews(prev => mergeNews(prev, newsData.factCheck));
      
      // Diaspora Risks: This is a calculated aggregate, so we typically replace it with the latest analysis
      setDiasporaRisks(newsData.diasporaSafety);
      
      // Process Geolocation for News Alerts (accumulate markers)
      const allIncomingNews = [
          ...newsData.usIndia,
          ...newsData.chinaIndia,
          ...newsData.aiTech,
          ...newsData.trade,
          ...newsData.humanRights,
          ...(newsData.rawDiasporaNews || [])
      ];
      
      const newMarkersData = mapNewsToLocations(allIncomingNews);
      
      setNewsMarkers(prev => {
         const existingMap = new Map(prev.map(m => [m.id, m])); // Use ID (URL) for uniqueness
         const now = Date.now();
         
         // Identify really new markers
         const processedMarkers = newMarkersData.map(m => {
             const existing = existingMap.get(m.id);
             // If exists, keep original addedAt to preserve "read" state or age
             if (existing) return existing;
             // If new, timestamp it now
             return { ...m, addedAt: now };
         });

         const newUnique = processedMarkers.filter(m => !existingMap.has(m.id));
         
         // Combine new unique markers with existing markers
         return [...newUnique, ...prev];
      });

      // Earthquakes logic: Accumulate/Update
      setEarthquakes(prev => {
         const existingMap = new Map(prev.map(e => [e.id, e]));
         const now = Date.now();
         
         const updatedQuakes = quakeData.map(q => {
             const existing = existingMap.get(q.id);
             return {
                 ...q,
                 addedAt: existing?.addedAt || now
             };
         });
         
         return updatedQuakes; 
      });

      setMarket(marketData);
    } catch (e) {
      console.error("Failed to refresh data", e);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // No dependencies ensures stability

  // Initial Load + Interval
  useEffect(() => {
    refreshAll();
    // Refresh every 60 seconds
    const interval = setInterval(() => {
        refreshAll();
    }, 60000); 
    return () => clearInterval(interval);
  }, [refreshAll]);

  return (
    <div className="h-screen w-screen bg-black text-zinc-400 font-sans overflow-hidden flex flex-col selection:bg-zinc-800 selection:text-white">
      
      {/* Minimal Header */}
      <header className="h-12 md:h-10 shrink-0 border-b border-border bg-black flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Terminal size={16} className="text-amber-500 md:w-3.5 md:h-3.5" />
          <h1 className="font-mono font-bold tracking-[0.15em] text-xs md:text-[11px] uppercase text-amber-500">
            Global-India <span className="text-zinc-600 font-normal">Tracker</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600 uppercase">
          
          {/* Manual Update Button */}
          <button 
            onClick={() => refreshAll()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-sm hover:bg-zinc-800 hover:text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mr-2"
          >
            <RefreshCw size={10} className={`text-zinc-500 group-hover:text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-zinc-500 group-hover:text-zinc-300">Update</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-sm ${loading ? "bg-warning animate-pulse" : "bg-success"}`}></span>
            {loading ? "SYNCING" : "LIVE"}
          </div>
          <div className="hidden sm:block pl-4 border-l border-zinc-900 font-mono text-zinc-500">
             {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} <span className="text-zinc-300 ml-1">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </header>

      {/* Main Container 
          Mobile: Vertical Scroll (flex-col, overflow-y-auto)
          Desktop: Fixed Grid (grid, overflow-hidden)
      */}
      <main className="flex-1 p-2 md:p-3 flex flex-col md:grid md:grid-cols-4 md:grid-rows-3 gap-3 overflow-y-auto md:overflow-hidden relative bg-black">
        
        {/* 1. MAP (Top-Left 2x2 on Desktop, Large Block on Mobile) */}
        <div className="min-h-[350px] md:min-h-0 md:col-span-2 md:row-span-2 border border-border bg-panel relative flex flex-col shrink-0">
           <div className="absolute top-0 left-0 z-10 p-3 pointer-events-none">
              <h2 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <MapIcon size={12} /> Strategic Map
              </h2>
           </div>
           <MapComponent 
              earthquakes={earthquakes} 
              hotspots={STATIC_HOTSPOTS} 
              newsMarkers={newsMarkers}
           />
        </div>

        {/* 2. US-INDIA */}
        <Card title="US-India Relations" icon={<Activity size={12} />} className="min-h-[280px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <NewsList items={usIndiaNews} />
        </Card>

        {/* 3. CHINA-INDIA */}
        <Card title="China-India Relations" icon={<Zap size={12} />} className="min-h-[280px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <NewsList items={chinaIndiaNews} />
        </Card>

        {/* 4. DIASPORA RISK */}
        <Card title="Diaspora Risk" icon={<ShieldAlert size={12} />} className="min-h-[280px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <CountryRiskTracker items={diasporaRisks} />
        </Card>

        {/* 5. TRADE */}
        <Card title="Trade & Economy" icon={<Briefcase size={12} />} className="min-h-[280px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <NewsList items={tradeNews} />
        </Card>

        {/* 6. CURRENCY */}
        <Card title="Forex" icon={<IndianRupee size={12} />} className="min-h-[200px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <CurrencyTracker data={market} />
        </Card>

        {/* 7. AI TECH */}
        <Card title="Tech & AI" icon={<Cpu size={12} />} className="min-h-[280px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <NewsList items={aiNews} />
        </Card>

        {/* 8. RIGHTS */}
        <Card title="Rights Monitor" icon={<AlertTriangle size={12} />} className="min-h-[280px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <NewsList items={humanRightsNews} />
        </Card>

        {/* 9. FACT CHECK */}
        <Card title="Info Integrity" icon={<FileCheck2 size={12} />} className="min-h-[280px] md:min-h-0 md:col-span-1 md:row-span-1 shrink-0">
          <NewsList items={factCheckNews} />
        </Card>

      </main>
    </div>
  );
};

export default App;