export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
  epochTime: number; // For sorting/grouping
  category: 'US-India' | 'China-India' | 'AI-Tech' | 'Trade' | 'Human-Rights' | 'Fact-Check' | 'Diaspora-Safety' | 'General';
  priority: 'normal' | 'high';
}

export interface CountryRisk {
  country: string;
  code: string; // ISO code for flags or mapping
  riskLevel: 'Critical' | 'High' | 'Moderate';
  incidentCount: number;
  latestHeadline: string;
  latestUrl?: string;
  lastUpdated: string;
}

export interface Earthquake {
  id: string;
  place: string;
  mag: number;
  time: number;
  lat: number;
  lon: number;
  url: string;
  addedAt?: number; // Timestamp when first fetched
}

export interface MarketData {
  usdInr: number;
  lastUpdated: string;
  inrChange: number;
}

export interface MapHotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'conflict' | 'diplomacy' | 'tech' | 'economic';
  description: string;
  status: 'active' | 'monitoring' | 'critical';
}

export interface NewsMarker {
  id: string;
  lat: number;
  lon: number;
  title: string;
  source: string;
  url: string;
  category: NewsItem['category'];
  addedAt?: number; // Timestamp when first fetched
}

export interface CurrencyState {
  current: number;
  change: number;
  history: { time: string; value: number }[];
}

export interface LayoffItem {
  id: string;
  company: string;
  employees: string;
  date: string;
  location: string;
  industry: string;
  sourceUrl: string;
}