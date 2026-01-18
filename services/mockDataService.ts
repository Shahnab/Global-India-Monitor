import { NewsItem, LayoffItem, CurrencyState, MapHotspot } from '../types';

// Generators for realistic looking data
const generateId = () => Math.random().toString(36).substr(2, 9);

const US_INDIA_HEADLINES = [
  "Strategic defense partnership deepens as naval exercises conclude",
  "Semiconductor supply chain pact signed between Washington and New Delhi",
  "Visa backlog discussions progress during diplomatic summit",
  "Joint space mission scheduled for late 2025 launch",
  "Trade delegation visits Silicon Valley to boost investment",
  "Cybersecurity framework agreed upon to counter regional threats",
  "US supports India's bid for permanent Security Council seat",
  "Technology transfer deal for jet engines finalized",
  "Climate finance discussions stall during bilateral talks",
  "New consulate opening announced to boost people-to-people ties",
  "Critical minerals partnership expands with new MoU",
  "Defense startups from both nations showcase joint innovations",
  "White House emphasizes strategic importance of Indo-Pacific ties",
  "Joint counter-terrorism working group meets in Delhi",
  "Higher education collaboration initiative launched for STEM fields"
];

const CHINA_INDIA_HEADLINES = [
  "Border patrol talks continue in Ladakh sector amid calm",
  "Trade deficit widens despite manufacturing initiatives",
  "Infrastructure buildup reported near LAC",
  "Diplomatic channels open for river water sharing data",
  "Tech investment scrutiny increases for cross-border entities",
  "Military commanders hold 21st round of corps commander talks",
  "Disengagement process completes in sensitive friction point",
  "Satellite imagery reveals new airfield construction across border",
  "Bilateral trade volume hits new record despite political tensions",
  "Visa issuance for journalists remains a point of contention",
  "Think tank report highlights strategic maritime competition",
  "Neighboring nations discuss regional stability influence",
  "Import restrictions on non-essential goods considered",
  "Cyber espionage attempt flagged by intelligence agencies",
  "Cultural exchange programs remain suspended indefinitely"
];

const AI_TECH_HEADLINES = [
  "OpenAI releases efficient 'Turbo' variant of latest model",
  "Google DeepMind solves protein folding challenge in record time",
  "Anthropic announces new safety tiers for enterprise AI",
  "NVIDIA reveals next-gen Blackwell architecture chips",
  "Indian startup raises $50M for Indic language LLM",
  "Meta open-sources massive 400B parameter model",
  "Regulatory body proposes new framework for GenAI watermarking",
  "India launches national AI mission with focus on healthcare",
  "New AI chip design center inaugurated in Bengaluru",
  "Global summit on AI safety to include Indian delegation",
  "Sovereign AI infrastructure project gets cabinet approval",
  "Major IT firm integrates Generative AI across service lines",
  "AI-driven weather forecasting model deployed for monsoon tracking",
  "Deepfake detection tool developed by IIT researchers",
  "Voice AI agent for rural banking services pilot successful"
];

const TRADE_ECONOMY_HEADLINES = [
  "Global supply chain rerouting continues amid Red Sea tensions",
  "Energy prices stabilize following OPEC+ meeting",
  "Exports show resilience in service sector despite global slowdown",
  "New Free Trade Agreement negotiations enter final stage",
  "Manufacturing PMI hits 4-month high indicating strong growth",
  "RBI maintains status quo on repo rates citing inflation control",
  "Forex reserves reach all-time high boosting currency stability",
  "Smartphone exports from India cross $10 billion mark",
  "Automobile sector sees record sales during festive season",
  "Green energy investment policy attracts global capital",
  "Tariff adjustments proposed for electronic components",
  "Digital payments volume surges to new monthly record",
  "Start-up ecosystem sees revival in late-stage funding",
  "Infrastructure spending boosted in interim budget",
  "GST collections surpass expectations for third consecutive month"
];

const DIASPORA_SAFETY_HEADLINES = [
  "Concern rises over safety of Indian students in US universities",
  "Community leaders condemn racial vandalism at cultural center in Canada",
  "New hotline established for hate crime reporting for diaspora in UK",
  "Protest held against rising intolerance in London suburb",
  "Embassy issues advisory regarding safety precautions in Israel",
  "Worker rights issues highlighted in UAE construction sector",
  "Indian student attacked in Australia, police launch probe",
  "Deportation fears rise among undocumented workers in Saudi Arabia",
  "Singapore authorities detain individual for hate speech against migrants",
  "Viral video of racial slur incident in Poland sparks diplomatic response",
  "Indian community rallies for justice in local assault case",
  "Consulate provides legal aid to detained nationals",
  "Safety orientation program launched for new students abroad",
  "Hate crime statistics show worrying trend in metro areas",
  "Diplomatic note sent regarding security of places of worship"
];

const HUMAN_RIGHTS_HEADLINES = [
    "Activists demand probe into recent communal clashes in rural districts",
    "Report highlights rising hate speech cases on social media platforms",
    "Minority commission issues notice regarding housing discrimination",
    "Protest staged in capital against alleged rights violations",
    "International body urges stronger protection for vulnerable groups",
    "Fact-finding team blocked from visiting affected area",
    "Press freedom index ranking sparks debate on media independence",
    "Judicial concern raised over delay in bail for activists",
    "Tribal rights group protests land acquisition policy",
    "Custodial death allegations prompt high-level inquiry",
    "Internet shutdown in unrest region criticized by rights bodies",
    "NGO funding restrictions impact grassroots welfare work",
    "Hate speech monitoring cell flagged concerning trends",
    "Civil society raises alarm over surveillance laws",
    "Dalit rights organization demands stricter enforcement of SC/ST Act"
];

const FACT_CHECK_HEADLINES = [
    "Fact Check: Viral video claiming border conflict is from 2021 simulation",
    "Debunked: False circular regarding new currency notes circulating on WhatsApp",
    "Misleading report on trade tariffs clarified by ministry",
    "Manipulated audio of political speech flagged by AI detection tools",
    "Old footage shared as recent infrastructure collapse",
    "Verify before sharing: Deepfake detection tips issued",
    "Fake news regarding election dates spreads on social media",
    "Doctoring of official document exposed by PIB Fact Check",
    "Viral claim about new tax regime found to be baseless",
    "AI-generated image of celebrity endorsing political party debunked",
    "Misattributed quote causing communal tension clarified",
    "Scam alert: fraudulent government scheme links circulating",
    "Old riot video falsely shared as recent incident in neighboring state",
    "Fabricated news report screenshot targeting specific community identified",
    "Rumors of shortage of essential medicines quashed by health ministry"
];

const LAYOFF_COMPANIES = [
  { name: "TechCorp Global", loc: "San Francisco, US", ind: "Software" },
  { name: "FinStream", loc: "London, UK", ind: "Fintech" },
  { name: "AutoNext", loc: "Detroit, US", ind: "Automotive" },
  { name: "CloudScale", loc: "Bengaluru, IN", ind: "Cloud Infra" },
  { name: "MediaVision", loc: "New York, US", ind: "Media" },
  { name: "ShopLink", loc: "Berlin, DE", ind: "E-commerce" }
];

export const generateNewsItem = (category: NewsItem['category']): NewsItem => {
  let headlines: string[] = [];
  // Map valid types from NewsItem['category'] to available headline lists
  switch (category) {
    case 'US-India': 
      headlines = US_INDIA_HEADLINES; 
      break;
    case 'China-India': 
      headlines = CHINA_INDIA_HEADLINES; 
      break;
    case 'AI-Tech': 
      headlines = AI_TECH_HEADLINES; 
      break;
    case 'Diaspora-Safety':
      headlines = DIASPORA_SAFETY_HEADLINES;
      break;
    case 'Trade':
      headlines = TRADE_ECONOMY_HEADLINES; 
      break;
    case 'Human-Rights':
      headlines = HUMAN_RIGHTS_HEADLINES;
      break;
    case 'Fact-Check':
      headlines = FACT_CHECK_HEADLINES;
      break;
    case 'General':
    default:
      headlines = TRADE_ECONOMY_HEADLINES;
  }
  
  if (headlines.length === 0) headlines = TRADE_ECONOMY_HEADLINES;
  
  const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
  const sources = ["Reuters", "AP", "Bloomberg", "TechCrunch", "PTI", "The Hindu", "Alt News", "Boom Live", "Indian Express"];
  
  // Date Logic - UPDATED FOR FRESHNESS
  const now = new Date();
  
  let timeOffset = 0;
  if (category === 'Diaspora-Safety') {
      // Last 7 days for diaspora
      timeOffset = Math.floor(Math.random() * (7 * 24 * 60 * 60 * 1000));
  } else {
      // Last 6 HOURS for general news to simulate real-time
      timeOffset = Math.floor(Math.random() * (6 * 60 * 60 * 1000));
  }
  
  const date = new Date(now.getTime() - timeOffset);
  
  // Create relative time string
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  
  let timestamp = '';
  if (diffMins < 60) timestamp = `${diffMins}m ago`;
  else if (diffHrs < 24) timestamp = `${diffHrs}h ago`;
  else timestamp = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Generate a Google Search URL so the user can find the source even if this is a mock item
  const url = `https://www.google.com/search?q=${encodeURIComponent(randomHeadline)}`;

  return {
    id: generateId(),
    title: randomHeadline,
    source: sources[Math.floor(Math.random() * sources.length)],
    timestamp: timestamp,
    epochTime: date.getTime(),
    url: url,
    category,
    priority: Math.random() > 0.8 ? 'high' : 'normal'
  };
};

export const getInitialLayoffs = (): LayoffItem[] => {
  return Array.from({ length: 5 }).map(() => {
    const company = LAYOFF_COMPANIES[Math.floor(Math.random() * LAYOFF_COMPANIES.length)];
    return {
      id: generateId(),
      company: company.name,
      employees: (Math.floor(Math.random() * 2000) + 100).toString(),
      date: new Date().toLocaleDateString(),
      location: company.loc,
      industry: company.ind,
      sourceUrl: '#'
    };
  });
};

export const getInitialCurrency = (): CurrencyState => {
  const base = 83.5; // Approx INR to USD
  const history = Array.from({ length: 20 }).map((_, i) => ({
    time: i.toString(),
    value: base + (Math.random() - 0.5) * 0.5
  }));
  
  return {
    current: history[history.length - 1].value,
    change: (Math.random() - 0.5) * 0.2,
    history
  };
};

export const getHotspots = (): MapHotspot[] => [
  { id: '1', name: 'Ladakh Border', lat: 34.15, lon: 77.57, type: 'conflict', description: 'LAC Monitoring Zone', status: 'critical' },
  { id: '2', name: 'New Delhi', lat: 28.61, lon: 77.20, type: 'diplomacy', description: 'G20 Diplomatic Hub', status: 'active' },
  { id: '3', name: 'Bengaluru', lat: 12.97, lon: 77.59, type: 'tech', description: 'AI Research Center', status: 'monitoring' },
  { id: '4', name: 'Washington DC', lat: 38.90, lon: -77.03, type: 'diplomacy', description: 'Strategic Policy Center', status: 'active' },
  { id: '5', name: 'Silicon Valley', lat: 37.38, lon: -122.08, type: 'tech', description: 'GenAI Innovation Hub', status: 'monitoring' },
  { id: '6', name: 'Beijing', lat: 39.90, lon: 116.40, type: 'conflict', description: 'Policy Headquarters', status: 'active' },
  { id: '7', name: 'South China Sea', lat: 12.0, lon: 113.0, type: 'conflict', description: 'Maritime Dispute Zone', status: 'critical' },
  { id: '8', name: 'Mumbai', lat: 19.07, lon: 72.87, type: 'economic', description: 'Financial Capital', status: 'monitoring' }
];