import { NewsItem, Earthquake, MarketData, MapHotspot, CountryRisk, NewsMarker } from '../types';

// Optimized Proxy List - Removed dead/unreliable proxies
const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  // 'https://corsproxy.io/?' // Often rate limited, kept as reserve or removed if causing noise
];

// Expanded Country Mapping for Global Diaspora Coverage
const COUNTRY_KEYWORDS: Record<string, string[]> = {
  'Canada': ['Canada', 'Canadian', 'Toronto', 'Vancouver', 'Brampton', 'Surrey', 'Ontario', 'Trudeau', 'Khalistan', 'Alberta', 'Mississauga', 'Edmonton'],
  'USA': ['USA', 'US', 'America', 'American', 'New York', 'California', 'Texas', 'Chicago', 'Seattle', 'Ohio', 'Purdue', 'Jersey', 'Dallas', 'San Francisco', 'Atlanta', 'Boston', 'Washington'],
  'UK': ['UK', 'United Kingdom', 'British', 'London', 'Leicester', 'Birmingham', 'England', 'Scotland', 'Manchester', 'Leeds'],
  'Australia': ['Australia', 'Australian', 'Sydney', 'Melbourne', 'Canberra', 'Brisbane', 'Perth', 'Adelaide'],
  'Germany': ['Germany', 'German', 'Berlin', 'Frankfurt', 'Munich', 'Hamburg'],
  'Ukraine': ['Ukraine', 'Kyiv', 'Kharkiv', 'Odessa'],
  'Russia': ['Russia', 'Moscow', 'St. Petersburg'],
  'Israel': ['Israel', 'Tel Aviv', 'Jerusalem', 'Haifa'],
  'UAE': ['UAE', 'Dubai', 'Abu Dhabi', 'Emirates', 'Sharjah'],
  'Saudi Arabia': ['Saudi', 'Riyadh', 'Jeddah', 'Mecca'],
  'Qatar': ['Qatar', 'Doha'],
  'Kuwait': ['Kuwait'],
  'Singapore': ['Singapore'],
  'Malaysia': ['Malaysia', 'Kuala Lumpur'],
  'New Zealand': ['New Zealand', 'Auckland', 'Kiwi', 'Christchurch'],
  'Italy': ['Italy', 'Italian', 'Milan', 'Rome', 'Latina'],
  'Poland': ['Poland', 'Polish', 'Warsaw'],
  'France': ['France', 'French', 'Paris'],
  'Bangladesh': ['Bangladesh', 'Dhaka', 'Chittagong'],
  'Oman': ['Oman', 'Muscat'],
  'Bahrain': ['Bahrain', 'Manama']
};

const CRITICAL_KEYWORDS = ['killed', 'dead', 'murder', 'attacked', 'violence', 'assault', 'stabbed', 'shot', 'mob', 'lynch', 'kidnap', 'death penalty', 'execution'];
const HIGH_KEYWORDS = ['hate', 'racism', 'racist', 'slur', 'discrimination', 'vandalism', 'temple', 'deport', 'visa', 'threat', 'protest', 'agitation', 'arrested', 'detained', 'job loss'];

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  // India
  'delhi': { lat: 28.61, lon: 77.20 },
  'new delhi': { lat: 28.61, lon: 77.20 },
  'mumbai': { lat: 19.07, lon: 72.87 },
  'bengaluru': { lat: 12.97, lon: 77.59 },
  'bangalore': { lat: 12.97, lon: 77.59 },
  'hyderabad': { lat: 17.38, lon: 78.48 },
  'ladakh': { lat: 34.15, lon: 77.57 },
  'galwan': { lat: 34.75, lon: 78.28 },
  'arunachal': { lat: 28.21, lon: 94.72 },
  'kashmir': { lat: 34.08, lon: 74.79 },
  'srinagar': { lat: 34.08, lon: 74.79 },
  'punjab': { lat: 31.14, lon: 75.34 },
  'gujarat': { lat: 23.02, lon: 72.57 },
  
  // US
  'washington': { lat: 38.90, lon: -77.03 },
  'new york': { lat: 40.71, lon: -74.00 },
  'silicon valley': { lat: 37.38, lon: -122.08 },
  'san francisco': { lat: 37.77, lon: -122.41 },
  'california': { lat: 36.77, lon: -119.41 },
  'texas': { lat: 31.00, lon: -100.00 },
  
  // China
  'beijing': { lat: 39.90, lon: 116.40 },
  'shanghai': { lat: 31.23, lon: 121.47 },
  
  // Global
  'london': { lat: 51.50, lon: -0.12 },
  'canada': { lat: 56.13, lon: -106.34 },
  'toronto': { lat: 43.65, lon: -79.38 },
  'vancouver': { lat: 49.28, lon: -123.12 },
  'ukraine': { lat: 48.37, lon: 31.16 },
  'russia': { lat: 61.52, lon: 105.31 },
  'moscow': { lat: 55.75, lon: 37.61 },
  'israel': { lat: 31.04, lon: 34.85 },
  'gaza': { lat: 31.35, lon: 34.30 },
  'dubai': { lat: 25.20, lon: 55.27 },
};

const fetchWithProxy = async (targetUrl: string): Promise<string> => {
  const cacheBuster = `&_t=${Date.now()}`;
  
  // Shuffle proxies to avoid hitting the same failing proxy repeatedly
  const shuffledProxies = [...PROXIES].sort(() => Math.random() - 0.5);

  for (const proxy of shuffledProxies) {
    let attempt = 0;
    const maxRetries = 1; // Reduced retries to fail faster and switch to fallback

    while (attempt <= maxRetries) {
      try {
        if (attempt > 0) {
            const delay = 500 * attempt;
            await new Promise(r => setTimeout(r, delay));
        }
        
        const fullUrl = `${proxy}${encodeURIComponent(targetUrl)}${cacheBuster}`;
        const response = await fetch(fullUrl);
        
        if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
        
        const text = await response.text();
        
        if (!text || text.length < 50 || (!text.includes('<?xml') && !text.includes('<rss') && !text.includes('<feed'))) {
            throw new Error('Invalid RSS response');
        }

        return text;
      } catch (e: any) {
        // console.warn(`[Proxy] ${proxy} failed: ${e.message}`);
        attempt++;
      }
    }
  }
  throw new Error('All XML proxies exhausted');
};

// Fallback: Fetch via RSS2JSON (Returns JSON, not XML)
const fetchWithRSS2JSON = async (rssUrl: string): Promise<any> => {
    try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('RSS2JSON failed');
        return await res.json();
    } catch (e) {
        throw new Error('RSS2JSON Fallback failed');
    }
};

// De-duplication helper
const deduplicateItems = (items: NewsItem[]): NewsItem[] => {
  const seenTitles = new Set();
  const seenUrls = new Set();
  
  return items.filter(item => {
    // Normalize title to catch almost-identical headlines
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    
    if (seenTitles.has(normalizedTitle) || seenUrls.has(item.url)) {
      return false;
    }
    
    seenTitles.add(normalizedTitle);
    seenUrls.add(item.url);
    return true;
  });
};

const fetchGoogleNews = async (query: string, category: NewsItem['category'], maxAgeDays: number = 2, maxItems: number = 20): Promise<NewsItem[]> => {
  const now = new Date();
  // Strict cutoff calculation
  const cutoffDate = new Date(now.getTime() - (maxAgeDays * 24 * 60 * 60 * 1000));
  
  const timeQuery = ` when:${Math.max(1, maxAgeDays)}d`;
  const fullQuery = `${query}${timeQuery}`;
  const encodedQuery = encodeURIComponent(fullQuery);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

  let parsedItems: any[] = [];

  // STRATEGY 1: Try XML Proxies
  try {
    const xmlString = await fetchWithProxy(rssUrl);
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');
    const items = xml.querySelectorAll('item');

    parsedItems = Array.from(items).map(item => {
        const pubDateStr = item.querySelector('pubDate')?.textContent || '';
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const source = item.querySelector('source')?.textContent || 'News';
        return { title, link, source, pubDate: new Date(pubDateStr) };
    });
  } catch (proxyError) {
    // STRATEGY 2: Fallback to RSS2JSON
    console.log(`[DataService] Switching to JSON fallback for ${category}`);
    try {
        const jsonData = await fetchWithRSS2JSON(rssUrl);
        if (jsonData.items) {
            parsedItems = jsonData.items.map((item: any) => ({
                title: item.title,
                link: item.link,
                source: item.author || 'News', // RSS2JSON often puts source in author
                pubDate: new Date(item.pubDate.replace(/-/g, '/')) // Ensure compatibility
            }));
        }
    } catch (jsonError) {
        console.warn(`[DataService] All strategies failed for ${category}`);
        return [];
    }
  }

  // Filter and Format
  const formattedItems = parsedItems
    .filter(({ pubDate }) => {
        const time = pubDate.getTime();
        if (isNaN(time)) return false;
        // Discard future dates (allowing 15 mins clock skew)
        if (time > now.getTime() + 15 * 60 * 1000) return false;
        // Discard dates older than cutoff
        if (time < cutoffDate.getTime()) return false;
        return true;
    })
    .map(({ title, link, source, pubDate }) => {
        // Calculate relative time
        const diffMs = now.getTime() - pubDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        let timeStr = "";
        if (diffMins < 60) {
            timeStr = `${Math.max(0, diffMins)}m ago`;
        } else if (diffHrs < 24) {
            timeStr = `${diffHrs}h ago`;
        } else {
            timeStr = pubDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
        }

        const isHighPriority = /alert|crisis|war|urgent|breaking|nuclear|attack|sanction|killed|death|racist|hate|student death|assault|violation|mob|lynch/i.test(title);

        return {
          id: link,
          title: title,
          source: source,
          url: link,
          timestamp: timeStr,
          epochTime: pubDate.getTime(),
          category: category,
          priority: isHighPriority ? 'high' : 'normal'
        } as NewsItem;
    });

  return deduplicateItems(formattedItems).slice(0, maxItems);
};

// Analyze Diaspora News to extract Country Risks
const analyzeDiasporaRisks = (items: NewsItem[]): CountryRisk[] => {
  const riskMap: Record<string, { count: number; headlines: string[]; urls: string[]; maxSeverity: number; lastTime: string }> = {};

  items.forEach(item => {
    let identifiedCountry = 'Global'; 
    const textToCheck = item.title; 

    for (const [country, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
      if (keywords.some(k => textToCheck.includes(k))) {
        identifiedCountry = country;
        break; 
      }
    }

    if (identifiedCountry === 'Global') return;

    let itemSeverity = 1; 
    const lowerTitle = item.title.toLowerCase();
    
    if (CRITICAL_KEYWORDS.some(k => lowerTitle.includes(k))) {
      itemSeverity = 3; 
    } else if (HIGH_KEYWORDS.some(k => lowerTitle.includes(k))) {
      itemSeverity = 2; 
    }

    if (!riskMap[identifiedCountry]) {
      riskMap[identifiedCountry] = { count: 0, headlines: [], urls: [], maxSeverity: 0, lastTime: item.timestamp };
    }
    
    riskMap[identifiedCountry].count += 1;
    riskMap[identifiedCountry].headlines.push(item.title);
    riskMap[identifiedCountry].urls.push(item.url);
    riskMap[identifiedCountry].maxSeverity = Math.max(riskMap[identifiedCountry].maxSeverity, itemSeverity);
  });

  return Object.entries(riskMap).map(([country, data]): CountryRisk => {
    const riskLevel: CountryRisk['riskLevel'] = data.maxSeverity === 3 ? 'Critical' : data.maxSeverity === 2 ? 'High' : 'Moderate';
    const cleanHeadline = data.headlines[0].replace(/\s-\s.*$/, '');
    
    return {
      country,
      code: country.slice(0, 2).toLowerCase(),
      riskLevel,
      incidentCount: data.count,
      latestHeadline: cleanHeadline,
      latestUrl: data.urls[0],
      lastUpdated: data.lastTime
    };
  }).sort((a, b) => {
    const severityScore: Record<CountryRisk['riskLevel'], number> = { 'Critical': 3, 'High': 2, 'Moderate': 1 };
    if (severityScore[a.riskLevel] !== severityScore[b.riskLevel]) {
      return severityScore[b.riskLevel] - severityScore[a.riskLevel];
    }
    return b.incidentCount - a.incidentCount;
  });
};

// New Geo-Extraction Utility
export const mapNewsToLocations = (newsItems: NewsItem[]): NewsMarker[] => {
  const markers: NewsMarker[] = [];
  const processedTitles = new Set();

  newsItems.forEach(item => {
    if (processedTitles.has(item.title)) return;
    
    const lowerTitle = item.title.toLowerCase();
    
    // Check against known cities
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
      if (lowerTitle.includes(city)) {
        markers.push({
          id: item.id,
          lat: coords.lat,
          lon: coords.lon,
          title: item.title,
          source: item.source,
          url: item.url,
          category: item.category
        });
        processedTitles.add(item.title);
        break; // Only map to first found location
      }
    }
  });

  return markers;
};

export const fetchTrackedNews = async () => {
  // Use a tight window for general news (3 days max) to ensure freshness
  const STD_DAYS = 3; 
  const STD_LIMIT = 20;
  // Diaspora news
  const DIASPORA_DAYS = 4; 
  const DIASPORA_LIMIT = 50;

  // STRICTER Queries to ensure uniqueness and relevance
  const [usIndia, chinaIndia, aiTech, trade, rawDiasporaNews, humanRights, factCheck] = await Promise.all([
    // US-India: Focus on bilateral ties, avoiding general US news
    fetchGoogleNews('"US India" (relations OR defense OR trade OR visa OR technology OR strategic partnership OR Modi) -cricket', 'US-India', STD_DAYS, STD_LIMIT),
    
    // China-India: Focus on border, trade, diplomacy
    fetchGoogleNews('"India China" (border OR LAC OR trade OR diplomacy OR military talks OR Galwan OR Arunachal) -cricket', 'China-India', STD_DAYS, STD_LIMIT),
    
    // AI: Global + India context. Explicitly including Indian AI initiatives to balance global news
    fetchGoogleNews('(Generative AI OR OpenAI OR Google Gemini OR NVIDIA OR "India AI" OR "AI Mission India" OR "Indian startup") (launch OR model OR chip OR investment OR regulation) 2025', 'AI-Tech', STD_DAYS, STD_LIMIT),
    
    // Trade: Purely India economy focus
    fetchGoogleNews('India (economy OR exports OR imports OR FTA OR tariff OR manufacturing OR GDP OR Sensex OR RBI) 2025 -cricket', 'Trade', STD_DAYS, STD_LIMIT),
    
    // Diaspora: Broad safety search
    fetchGoogleNews('Indian (student OR diaspora OR expat OR national) (attacked OR killed OR hate crime OR racism OR assault OR violence OR death OR visa crisis OR deported) 2025', 'Diaspora-Safety', DIASPORA_DAYS, DIASPORA_LIMIT),

    // Rights: Internal India human rights focus
    fetchGoogleNews('India (hate speech OR religious intolerance OR caste violence OR minority rights OR press freedom OR custodial death OR human rights) 2025', 'Human-Rights', STD_DAYS, STD_LIMIT),
    
    // Fact Check: Indian media focus
    fetchGoogleNews('India (fake news OR misinformation OR "Indian media" OR "godi media" OR "fact check" OR debunked OR propaganda) 2025', 'Fact-Check', STD_DAYS, STD_LIMIT),
  ]);

  const diasporaSafety = analyzeDiasporaRisks(rawDiasporaNews);

  return { usIndia, chinaIndia, aiTech, trade, diasporaSafety, humanRights, factCheck, rawDiasporaNews };
};

export const fetchEarthquakes = async (): Promise<Earthquake[]> => {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson');
    const data = await res.json();
    return data.features.map((f: any) => ({
      id: f.id,
      place: f.properties.place,
      mag: f.properties.mag,
      time: f.properties.time,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      url: f.properties.url
    }));
  } catch (e) {
    return [];
  }
};

export const fetchMarketData = async (): Promise<MarketData> => {
  let usdInr = 84.0;
  let inrChange = 0;

  try {
    // Standard Free API for exchange rates
    const currRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const currData = await currRes.json();
    if (currData.rates.INR) {
        usdInr = currData.rates.INR;
        // NOTE: We cannot calculate 24h change accurately from this free endpoint as it doesn't provide yesterday's close.
        // To avoid false information (as requested), we default the change to 0 
        // rather than simulating fake volatility. 
        inrChange = 0;
    }
  } catch (e) {
    console.warn("Market data fetch failed");
  }

  return {
    usdInr,
    lastUpdated: new Date().toLocaleTimeString(),
    inrChange
  };
};

export const STATIC_HOTSPOTS: MapHotspot[] = [
  { id: 'lac', name: 'Ladakh (LAC)', lat: 34.15, lon: 77.57, type: 'conflict', description: 'China-India Border Standoff', status: 'critical' },
  { id: 'scs', name: 'South China Sea', lat: 12.0, lon: 113.0, type: 'conflict', description: 'Maritime Territorial Disputes', status: 'critical' },
  { id: 'sv', name: 'Silicon Valley', lat: 37.38, lon: -122.08, type: 'tech', description: 'Global AI Innovation Hub', status: 'monitoring' },
  { id: 'dc', name: 'Washington DC', lat: 38.90, lon: -77.03, type: 'diplomacy', description: 'US Foreign Policy Center', status: 'active' },
  { id: 'del', name: 'New Delhi', lat: 28.61, lon: 77.20, type: 'diplomacy', description: 'Indian Government', status: 'active' },
  { id: 'bei', name: 'Beijing', lat: 39.90, lon: 116.40, type: 'diplomacy', description: 'Chinese Government', status: 'active' },
  { id: 'ukr', name: 'Ukraine Front', lat: 48.0, lon: 37.0, type: 'conflict', description: 'Active Conflict Zone', status: 'critical' },
  { id: 'guj', name: 'Gujarat', lat: 23.0, lon: 72.5, type: 'economic', description: 'Strategic Trade & Port Hub', status: 'monitoring' },
];