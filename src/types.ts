export interface DocCheckIn {
  id: string;
  date: string;
  quantity: number;
  strain: string;
  initialWeight: number; // in grams
  pricePerHead: number; // in IDR
  totalCost: number; // in IDR
  notes?: string;
}

export interface FeedTransaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT'; // IN = feed purchase, OUT = feed used
  quantity: number; // in kg
  brand: string; // e.g., BR-1, BR-2, Pre-starter
  notes?: string;
}

export interface DailyRecord {
  id: string;
  age: number; // Day 1, Day 2, etc.
  date: string;
  mortality: number; // Number of birds died today
  feedConsumed: number; // Feed consumed today in kg
  avgWeight: number; // Average weight today in kg
  fcr?: number; // Cumulative FCR
  dailyFcr?: number; // Daily FCR
  ip?: number; // Performance Index (Indeks Performa)
  populationAtStart: number; // Population at the start of today
  populationAtEnd: number; // Population at the end of today
}

export interface HarvestDraft {
  id: string;
  date: string;
  buyerName: string;
  birdCount: number;
  avgWeight: number; // in kg
  pricePerKg: number; // in IDR
  totalWeight: number; // in kg
  totalRevenue: number; // in IDR
  underweightCount: number;
  standardCount: number;
  overweightCount: number;
  notes?: string;
}

export interface FlockStatus {
  initialPopulation: number;
  currentPopulation: number;
  age: number;
  totalMortality: number;
  totalFeedConsumed: number;
  currentAvgWeight: number;
  currentFcr: number;
  currentIp: number;
}
