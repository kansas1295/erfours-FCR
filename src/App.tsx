import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  TrendingUp, 
  RefreshCcw, 
  Scale, 
  Users, 
  Beef, 
  Info, 
  FileText,
  Save,
  Activity,
  ArrowUpRight,
  History,
  Trash2,
  Download,
  BarChart3,
  Calendar,
  Plus,
  X,
  Printer,
  Clock,
  Smartphone,
  Check,
  Share2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { format } from 'date-fns';

interface FlockRecord {
  id: string;
  date: string;
  initialPop: number;
  currentPop: number;
  totalWeight: number;
  totalFeed: number;
  age: number;
  fcr: number;
  ip: number;
  mortality: number;
  dailyFcr?: number | null;
  adg: number;
  dailyAdg?: number | null;
  dailyDeaths?: number;
  dailyFeed?: number;
  totalDeaths?: number;
  weeklyDeaths?: number;
}

interface WeighingDraft {
  id: string;
  birds: number;
  weight: number; // in kg
}

interface WeighingDraftInput {
  id: string;
  birds: number | string;
  weight: number | string;
}

interface HarvestRecord {
  id: string;
  date: string;
  birds: number;
  avgWeight: number;
  totalWeight: number;
  age: number;
  ip: number;
  notes?: string;
  weighingDrafts?: WeighingDraft[];
  dataTimbangNo?: string;
  spbNo?: string;
  timeArrived?: string;
  timeLoaded?: string;
  timeCompleted?: string;
  takenBy?: string;
  driverName?: string;
  plateNo?: string;
  driverSim?: string;
  stnkNo?: string;
  diserahkanNama?: string;
  diserahkanTgl?: string;
  diambilNama?: string;
  diambilTgl?: string;
  securityNama?: string;
  securityTgl?: string;
}

const parseWeight = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = val.toString().replace(/,/g, '.');
  return parseFloat(str) || 0;
};

export default function App() {
  // PWA Install States & Hook
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [isWebAppInstalled, setIsWebAppInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Automatically prompt or show badge on load on Android
      console.log('[PWA] beforeinstallprompt event captured');
    };
    const handleAppInstalled = () => {
      setIsWebAppInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Erfours Android App was successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check for standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsWebAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Input State
  const [initialPop, setInitialPop] = useState<string>('10000');
  const [currentPop, setCurrentPop] = useState<string>('9720');
  const [totalWeight, setTotalWeight] = useState<string>('20900');
  const [totalFeed, setTotalFeed] = useState<string>('30514');
  const [age, setAge] = useState<string>('35');
  
  // App State
  const [view, setView] = useState<'daily' | 'cumulative' | 'history' | 'harvest' | 'weighing'>('daily');
  const [history, setHistory] = useState<FlockRecord[]>([]);
  const [harvestHistory, setHarvestHistory] = useState<HarvestRecord[]>([]);
  const [harvestActiveTab, setHarvestActiveTab] = useState<'sheet' | 'history'>('sheet');
  const [historySelectedWeek, setHistorySelectedWeek] = useState<number | null>(null);

  const availableWeeks = useMemo(() => {
    const weeks = new Set<number>();
    history.forEach(r => weeks.add(Math.ceil(r.age / 7)));
    return Array.from(weeks).sort((a, b) => b - a);
  }, [history]);

  const activeHistoryWeek = historySelectedWeek || (availableWeeks.length > 0 ? availableWeeks[0] : null);

  const historyWeeklyMortality = useMemo(() => {
    if (!activeHistoryWeek) return 0;
    const sorted = [...history].sort((a, b) => a.age - b.age);
    const weekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) === activeHistoryWeek).pop();
    const prevWeekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) < activeHistoryWeek).pop();
    
    if (!weekLastRecord) return 0;
    
    const currentTotalDeaths = weekLastRecord.totalDeaths || (weekLastRecord.initialPop - weekLastRecord.currentPop);
    const prevTotalDeaths = prevWeekLastRecord ? (prevWeekLastRecord.totalDeaths || (prevWeekLastRecord.initialPop - prevWeekLastRecord.currentPop)) : 0;
    
    return currentTotalDeaths - prevTotalDeaths;
  }, [history, activeHistoryWeek]);

  const historyWeeklyFeed = useMemo(() => {
    if (!activeHistoryWeek) return 0;
    const sorted = [...history].sort((a, b) => a.age - b.age);
    const weekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) === activeHistoryWeek).pop();
    const prevWeekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) < activeHistoryWeek).pop();
    
    if (!weekLastRecord) return 0;
    
    const currentTotalFeed = weekLastRecord.totalFeed;
    const prevTotalFeed = prevWeekLastRecord ? prevWeekLastRecord.totalFeed : 0;
    
    return currentTotalFeed - prevTotalFeed;
  }, [history, activeHistoryWeek]);

  const weeklySummaryData = useMemo(() => {
    const summary: Record<number, { deaths: number; feed: number }> = {};
    
    // Sort history by age to correctly identify week-over-week changes
    const sortedHistory = [...history].sort((a, b) => a.age - b.age);
    
    availableWeeks.forEach(week => {
      const weekLastRecord = sortedHistory.filter(r => Math.ceil(r.age / 7) === week).pop();
      const prevWeekLastRecord = sortedHistory.filter(r => Math.ceil(r.age / 7) < week).pop();
      
      if (weekLastRecord) {
        const currentTotalFeed = weekLastRecord.totalFeed;
        const prevTotalFeed = prevWeekLastRecord ? prevWeekLastRecord.totalFeed : 0;
        
        const currentTotalDeaths = weekLastRecord.totalDeaths || (weekLastRecord.initialPop - weekLastRecord.currentPop);
        const prevTotalDeaths = prevWeekLastRecord ? (prevWeekLastRecord.totalDeaths || (prevWeekLastRecord.initialPop - prevWeekLastRecord.currentPop)) : 0;
        
        summary[week] = {
          feed: currentTotalFeed - prevTotalFeed,
          deaths: currentTotalDeaths - prevTotalDeaths
        };
      }
    });

    return Object.entries(summary)
      .map(([week, data]) => ({ week: parseInt(week), ...data }))
      .sort((a, b) => b.week - a.week);
  }, [history, availableWeeks]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('broiler_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
    
    const savedHarvest = localStorage.getItem('broiler_harvest_history');
    if (savedHarvest) {
      try {
        setHarvestHistory(JSON.parse(savedHarvest));
      } catch (e) {
        console.error('Failed to load harvest history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('broiler_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('broiler_harvest_history', JSON.stringify(harvestHistory));
  }, [harvestHistory]);

  // Daily Monitoring State
  const [dailyFeedSak, setDailyFeedSak] = useState<string>(''); // Sak (1 sak = 50kg)
  const [dailyWeight, setDailyWeight] = useState<string>(''); // gr/bird (Current weight)
  const [prevWeight, setPrevWeight] = useState<string>(''); // gr/bird (Yesterday's weight)
  const [dailyDeathsInput, setDailyDeathsInput] = useState<string>(''); // birds (Deaths today)
  const [dailyAge, setDailyAge] = useState<string>('');

  // Harvest State
  const [harvestBirds, setHarvestBirds] = useState<string>('');
  const [harvestAvgWeight, setHarvestAvgWeight] = useState<string>('');
  const [harvestTotalWeight, setHarvestTotalWeight] = useState<string>('');
  const [harvestDate, setHarvestDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [harvestAge, setHarvestAge] = useState<string>('');

  // Weighing drafts state (Data Timbang Panen - fixed 90 entries table)
  const [activeDrafts, setActiveDrafts] = useState<WeighingDraftInput[]>(() => 
    Array.from({ length: 90 }, (_, i) => ({
      id: `draft-${i}`,
      birds: '',
      weight: ''
    }))
  );
  const [draftBirds, setDraftBirds] = useState<string>('15'); // default 15 ekor per crate
  const [draftWeight, setDraftWeight] = useState<string>(''); // kg weight on single draft
  const [crateTare, setCrateTare] = useState<string>('1.5'); // default empty crate tare weight (e.g. 1.5kg)
  const [selectedRecordDrafts, setSelectedRecordDrafts] = useState<HarvestRecord | null>(null);

  // Document Metadata States (Data Timbang Form fields mimicking paper)
  const [dataTimbangNo, setDataTimbangNo] = useState<string>('PFL 109282');
  const [spbNo, setSpbNo] = useState<string>('');
  const [timeArrived, setTimeArrived] = useState<string>('');
  const [timeLoaded, setTimeLoaded] = useState<string>('');
  const [timeCompleted, setTimeCompleted] = useState<string>('');
  const [takenBy, setTakenBy] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [plateNo, setPlateNo] = useState<string>('');
  const [driverSim, setDriverSim] = useState<string>('');
  const [stnkNo, setStnkNo] = useState<string>('');
  
  // Signatures
  const [diserahkanNama, setDiserahkanNama] = useState<string>('');
  const [diserahkanTgl, setDiserahkanTgl] = useState<string>('');
  const [diambilNama, setDiambilNama] = useState<string>('');
  const [diambilTgl, setDiambilTgl] = useState<string>('');
  const [securityNama, setSecurityNama] = useState<string>('');
  const [securityTgl, setSecurityTgl] = useState<string>('');

  // Sync active weighing drafts calculations directly to main harvest inputs
  useEffect(() => {
    const validDrafts = activeDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
    if (validDrafts.length > 0) {
      const totalB = validDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
      const totalW_ons = validDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
      const totalW_kg = totalW_ons / 10;
      setHarvestBirds(totalB.toString());
      setHarvestTotalWeight(totalW_kg.toFixed(2));
      const avgW_kg = totalB > 0 ? (totalW_kg / totalB) : 0;
      setHarvestAvgWeight(avgW_kg.toFixed(3));
    }
  }, [activeDrafts]);

  // Handle adding raw draft to drafts list
  const handleAddDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const b = parseInt(draftBirds) || 0;
    const grossVal = parseFloat(draftWeight) || 0;
    const tareVal = parseFloat(crateTare) || 0;

    if (b <= 0 || grossVal <= 0) {
      alert('Masukkan jumlah ekor dan berat kotor keranjang yang valid.');
      return;
    }

    if (grossVal <= tareVal) {
      alert('Berat kotor harus lebih besar dari berat tara keranjang.');
      return;
    }

    const netWeight = parseFloat((grossVal - tareVal).toFixed(2));

    const newDraft: WeighingDraft = {
      id: crypto.randomUUID(),
      birds: b,
      weight: netWeight
    };

    setActiveDrafts(prev => {
      // Find the first empty slot
      const idx = prev.findIndex(d => (parseInt(d.birds as any) || 0) === 0 && parseWeight(d.weight) === 0);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          birds: b,
          weight: netWeight
        };
        return next;
      }
      alert('Semua 90 slot timbangan di lembar ini sudah penuh!');
      return prev;
    });
    setDraftWeight('');

    // Quick auto-focus support for rapid entry
    setTimeout(() => {
      const el = document.getElementById('draft-weight-input');
      if (el) el.focus();
    }, 50);
  };

  const handleRemoveDraft = (id: string) => {
    setActiveDrafts(prev => {
      const next = prev.map(d => d.id === id ? { ...d, birds: '', weight: '' } : d);
      const activeCount = next.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0).length;
      if (activeCount === 0) {
        setHarvestBirds('');
        setHarvestTotalWeight('');
        setHarvestAvgWeight('');
      }
      return next;
    });
  };

  const handleCellChange = (index: number, field: 'birds' | 'weight', val: string) => {
    setActiveDrafts(prev => {
      const next = [...prev];
      let sanitizedVal = val;
      if (field === 'weight') {
        // Replace comma with dot
        sanitizedVal = val.replace(/,/g, '.');
        // Prevent typing multiple dots or non-digits
        sanitizedVal = sanitizedVal.replace(/[^0-9.]/g, '');
        const parts = sanitizedVal.split('.');
        if (parts.length > 2) {
          sanitizedVal = parts[0] + '.' + parts.slice(1).join('');
        }
      } else if (field === 'birds') {
        sanitizedVal = val.replace(/[^0-9]/g, '');
      }
      next[index] = {
        ...next[index],
        [field]: sanitizedVal
      };
      
      // If we cleared both birds and weight to empty, we check if we should reset harvest inputs
      const activeCount = next.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0).length;
      if (activeCount === 0) {
        setHarvestBirds('');
        setHarvestTotalWeight('');
        setHarvestAvgWeight('');
      }
      return next;
    });
  };

  // Projection Simulation State
  const [customProjectionAdg, setCustomProjectionAdg] = useState<string>('');
  const [customProjectionFcr, setCustomProjectionFcr] = useState<string>('');

  // Sync harvest age & weight with daily/main state if empty
  useEffect(() => {
    const hasWeighings = activeDrafts.some(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
    if (hasWeighings) return; // Skip if scale calculator is active
    if (!harvestAge && (dailyAge || age)) setHarvestAge(dailyAge || age);
    if (!harvestAvgWeight && dailyWeight) {
      setHarvestAvgWeight(dailyWeight);
      const b = parseFloat(harvestBirds) || 0;
      const aw = parseFloat(dailyWeight) || 0;
      if (b > 0 && aw > 0) {
        setHarvestTotalWeight((b * aw / 1000).toFixed(2));
      }
    }
  }, [age, harvestAge, dailyAge, dailyWeight, harvestAvgWeight, harvestBirds, activeDrafts]);

  // Auto-fetch previous weight from history
  useEffect(() => {
    const currentDay = parseFloat(dailyAge || age) || 0;
    if (currentDay > 0 && !prevWeight && history.length > 0) {
      // Find the record for the most recent day before current day
      const prevRecord = [...history]
        .filter(r => r.age < currentDay)
        .sort((a, b) => b.age - a.age)[0];
      
      if (prevRecord) {
        const weightKg = prevRecord.totalWeight / prevRecord.currentPop;
        setPrevWeight(Math.round(weightKg * 1000).toString());
      }
    }
  }, [dailyAge, age, history, prevWeight]);

  const stats = useMemo(() => {
    const p1 = parseFloat(initialPop) || 0;
    const p2 = parseFloat(currentPop) || 0;
    const a = parseFloat(age) || 0;
    const dw = parseFloat(dailyWeight) || 0;
    const pw = parseFloat(prevWeight) || 0;
    const df = (parseFloat(dailyFeedSak) || 0) * 50; 
    
    const currentDay = parseFloat(dailyAge || age) || 0;
    const currentWeek = Math.ceil(currentDay / 7);
    
    // Derived from history - specifically for records PRIOR to the current age being viewed
    const lastRecordBeforeToday = [...history]
      .filter(r => r.age < currentDay)
      .sort((a, b) => b.age - a.age)[0];
    
    const histFeedBeforeToday = lastRecordBeforeToday ? lastRecordBeforeToday.totalFeed : 0;
    const histDeathsBeforeToday = lastRecordBeforeToday ? (lastRecordBeforeToday.initialPop - lastRecordBeforeToday.currentPop) : 0;
    
    const openingPopToday = p1 - histDeathsBeforeToday;
    const pp = openingPopToday;

    if (p1 === 0 || a === 0) return null;

    // Smartly derive total feed if not explicitly set
    let fValue = parseFloat(totalFeed);
    if (isNaN(fValue) || (view === 'daily' && df > 0)) {
      fValue = histFeedBeforeToday + df;
    }

    // Smartly derive total weight if not explicitly set
    let wValue = parseFloat(totalWeight);
    if (isNaN(wValue) || (view === 'daily' && dw > 0)) {
      wValue = (dw * p2) / 1000;
    }

    const mortality = ((p1 - p2) / p1) * 100;
    const avgWeightKg = p2 > 0 ? (wValue / p2) : 0;
    const fcr = wValue > 0 ? (fValue / wValue) : 0;
    const ip = (p2 > 0 && fcr > 0 && a > 0) ? (((100 - mortality) * avgWeightKg) / (fcr * a)) * 100 : 0;

    // Daily Calculations
    const currentDailyAdg = (dw > 0 && pw > 0) ? (dw - pw) : 0;
    const cumulativeAdg = (avgWeightKg / a) * 1000;
    
    let dailyFcr: string | null = null;
    if (df > 0 && currentDailyAdg > 0 && p2 > 0) {
      const feedPerBirdKg = df / p2;
      const gainPerBirdKg = currentDailyAdg / 1000;
      dailyFcr = (feedPerBirdKg / gainPerBirdKg).toFixed(2);
    }

    const dailyDeaths = (pp > 0 && p2 > 0) ? (pp - p2) : 0;
    const dailyMortalityRate = (pp > 0) ? (dailyDeaths / pp) * 100 : 0;

    // Weekly Calculations (End of week logic)
    const endOfWeekToday = Math.ceil(currentDay / 7) * 7;
    const startOfWeekToday = endOfWeekToday - 6;

    const findLastRecordBeforeWeek = (weekNum: number) => {
      const weekStartTime = (weekNum - 1) * 7 + 1;
      return [...history]
        .filter(r => r.age < weekStartTime)
        .sort((a, b) => b.age - a.age)[0];
    };

    const prevWeekRecord = findLastRecordBeforeWeek(currentWeek);
    const feedAtStartOfWeek = prevWeekRecord ? prevWeekRecord.totalFeed : 0;
    const deathsAtStartOfWeek = prevWeekRecord ? (prevWeekRecord.totalDeaths ?? (prevWeekRecord.initialPop - prevWeekRecord.currentPop)) : 0;

    const statsWeeklyFeed = fValue - feedAtStartOfWeek;
    const totalWeeklyDeaths = (p1 - p2) - deathsAtStartOfWeek;

    const getIpStatus = (val: number) => {
      if (val >= 400) return 'PREMIUM GRADE';
      if (val >= 350) return 'EXCELLENT';
      if (val >= 300) return 'STANDARD';
      return 'UNDERPERFORM';
    };

    const getStatusType = (val: number) => {
      if (val >= 400) return 'excellent';
      if (val >= 350) return 'good';
      if (val >= 300) return 'fair';
      return 'poor';
    };

    return {
      mortality: Math.round(mortality).toString(),
      avgWeight: Math.round(avgWeightKg * 1000).toString(),
      fcr: fcr.toFixed(1),
      ip: Math.round(ip).toString(),
      ipStatus: getIpStatus(ip),
      statusType: getStatusType(ip),
      feedEfficiency: fcr > 0 ? Math.round((1 / fcr) * 100).toString() : '0',
      dailyFcr: dailyFcr ? parseFloat(dailyFcr).toFixed(1) : null,
      adg: Math.round(cumulativeAdg).toString(),
      dailyAdg: currentDailyAdg > 0 ? Math.round(currentDailyAdg).toString() : null,
      dailyMortality: dailyMortalityRate.toFixed(2),
      dailyDeaths,
      weeklyDeaths: totalWeeklyDeaths,
      weeklyFeed: Math.round(statsWeeklyFeed).toLocaleString(),
      weeklyFeedRaw: statsWeeklyFeed, // for SAK calculation
      cumulativeFeed: Math.round(fValue).toLocaleString(),
      cumulativeFeedRaw: fValue,
      cumulativeWeight: Math.round(wValue).toLocaleString(),
      cumulativeWeightRaw: wValue,
      currentWeek: currentWeek || '-'
    };
  }, [initialPop, currentPop, totalWeight, totalFeed, age, dailyFeedSak, dailyWeight, prevWeight, history, dailyAge]);

  // Production and growth projection logic
  const projectionData = useMemo(() => {
    const pop = parseFloat(currentPop || initialPop) || 10000;
    const startAge = parseFloat(dailyAge || age) || 30;
    const startWeight = stats ? parseFloat(stats.avgWeight) : (parseFloat(dailyWeight) || 1500);
    
    // Live average ADG
    const defaultAdg = stats ? parseFloat(stats.dailyAdg || stats.adg || '50') : 50;
    const activeAdg = parseFloat(customProjectionAdg) || defaultAdg;
    
    // Live FCR
    const defaultFcr = stats ? parseFloat(stats.fcr) : 1.55;
    const activeFcr = parseFloat(customProjectionFcr) || defaultFcr;
    
    // Generate projection for the next 7 days
    const rows = [];
    let currentProjWeight = startWeight;
    
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const projAge = startAge + dayOffset;
      
      // Calculate projected weight (gr)
      const weightGain = activeAdg;
      currentProjWeight += weightGain;
      
      // Total flock weight in kg
      const totalFlockWeightKg = (currentProjWeight * pop) / 1000;
      
      // Calculate estimated cumulative feed based on active FCR
      // Cumulative feed = total flock weight * FCR
      const estCumulativeFeedKg = totalFlockWeightKg * activeFcr;
      const estCumulativeFeedSak = estCumulativeFeedKg / 50;
      
      rows.push({
        dayOffset,
        age: projAge,
        avgWeight: Math.round(currentProjWeight),
        gain: Math.round(weightGain),
        totalFlockWeight: Math.round(totalFlockWeightKg),
        estCumulativeFeedKg: Math.round(estCumulativeFeedKg),
        estCumulativeFeedSak: Math.round(estCumulativeFeedSak * 10) / 10,
      });
    }
    
    return {
      activeAdg: Math.round(activeAdg),
      activeFcr: Math.round(activeFcr * 100) / 100,
      defaultAdg: Math.round(defaultAdg),
      defaultFcr: Math.round(defaultFcr * 100) / 100,
      rows
    };
  }, [stats, currentPop, initialPop, dailyAge, age, dailyWeight, customProjectionAdg, customProjectionFcr]);

  const renderGrowthProjection = () => {
    if (!projectionData) return null;

    const { rows, activeAdg, activeFcr, defaultAdg, defaultFcr } = projectionData;

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-emerald-600" size={18} />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Proyeksi Pertumbuhan Ayam (7 Hari ke Depan)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Model prediksi pertumbuhan harian &amp; estimasi konsumsi pakan kumulatif berdasarkan rata-rata performa kandang saat ini.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            {(customProjectionAdg || customProjectionFcr) && (
              <button
                onClick={() => {
                  setCustomProjectionAdg('');
                  setCustomProjectionFcr('');
                }}
                className="text-[10px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider"
              >
                Reset Simulasi
              </button>
            )}
            <span className="text-[10px] bg-slate-100 font-black text-slate-600 px-3 py-1.5 rounded-lg uppercase tracking-wider">
              AUTO-PROJECTION
            </span>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase">
              <span>Simulasi ADG (g/hari)</span>
              {customProjectionAdg ? (
                <span className="text-emerald-600 font-bold">Kustom: {customProjectionAdg}g</span>
              ) : (
                <span className="text-slate-400">Otomatis: {defaultAdg}g</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={customProjectionAdg}
                onChange={(e) => setCustomProjectionAdg(e.target.value)}
                placeholder={`${defaultAdg}`}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <p className="text-[9px] text-slate-400">
              Default diambil dari performa riil Anda ({defaultAdg}g). Ubah untuk menghitung pertumbuhan dengan kecepatan lain.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase">
              <span>Simulasi FCR Target</span>
              {customProjectionFcr ? (
                <span className="text-emerald-600 font-bold">Kustom: {customProjectionFcr}</span>
              ) : (
                <span className="text-slate-400">Otomatis: {defaultFcr}</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={customProjectionFcr}
                onChange={(e) => setCustomProjectionFcr(e.target.value)}
                placeholder={`${defaultFcr}`}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <p className="text-[9px] text-slate-400">
              Rasio efisiensi seberapa banyak pakan dikonversi menjadi daging (FCR: {defaultFcr}).
            </p>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[9px] uppercase font-black tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4 border-b border-slate-100">Proyeksi</th>
                <th className="py-3 px-4 border-b border-slate-100">Umur Ayam</th>
                <th className="py-3 px-4 border-b border-slate-100 text-center">Form ADG</th>
                <th className="py-3 px-4 border-b border-slate-100 text-emerald-700 font-black">Estimasi Bobot Rata-rata</th>
                <th className="py-3 px-4 border-b border-slate-100">Est. Total Berat Kandang</th>
                <th className="py-3 px-4 border-b border-slate-100 bg-emerald-50/45 text-emerald-800">Est. Pakan Terpakai</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-600">
              {rows.map((row) => (
                <tr key={row.dayOffset} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-black text-slate-400">+{row.dayOffset} Hari</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black">
                      {row.age} Hari
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-blue-600">
                    +{row.gain} gr
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-black text-sm">
                    {row.avgWeight.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">gr</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {row.totalFlockWeight.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">kg</span>
                  </td>
                  <td className="py-3 px-4 bg-emerald-50/10 font-black text-emerald-700">
                    <div>
                      {row.estCumulativeFeedKg.toLocaleString()} <span className="text-[10px] font-normal text-emerald-500">kg</span>
                    </div>
                    <div className="text-[10px] font-black text-emerald-500 mt-0.5">
                      ≈ {row.estCumulativeFeedSak.toLocaleString()} SAK
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Informative Tip */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 text-[11px] text-blue-800 leading-relaxed">
          <span className="text-base">💡</span>
          <div>
            <p className="font-bold mb-0.5 uppercase tracking-wide">Tips Perencanaan Logistik &amp; Pakan</p>
            <p className="text-blue-700 font-medium">
              Gunakan proyeksi pakan kumulatif ini untuk mengantisipasi sisa stok pakan sebelum hari panen tiba. Mengetahui estimasi kebutuhan karung (SAK) membantu Anda menjadwalkan pembelian pakan tambahan tepat waktu, menghindari keterlambatan yang bisa mengganggu performa pertumbuhan (FCR).
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleReset = () => {
    setInitialPop('');
    setCurrentPop('');
    setTotalWeight('');
    setTotalFeed('');
    setAge('');
    setDailyFeedSak('');
    setDailyWeight('');
    setPrevWeight('');
    setDailyDeathsInput('');
    setDailyAge('');
  };

  const saveRecord = () => {
    if (!stats) return;
    
    // Choose the appropriate age based on input context
    const finalAge = (view === 'daily' && dailyAge) ? parseFloat(dailyAge) : parseFloat(age);
    
    const p1 = parseFloat(initialPop) || 0;
    const p2 = parseFloat(currentPop) || 0;
    
    const currentDay = finalAge;
    const prevRecord = [...history]
      .filter(r => r.age < currentDay)
      .sort((a, b) => b.age - a.age)[0];
    
    const prevTotalFeed = prevRecord ? prevRecord.totalFeed : 0;
    const prevPop = prevRecord ? prevRecord.currentPop : p1;
    const prevTotalDeaths = prevRecord ? (prevRecord.totalDeaths ?? (prevRecord.initialPop - prevRecord.currentPop)) : 0;

    let f = 0;
    let dailyF = 0;
    let d = 0;
    let dailyD = 0;

    // Smartly derive values based on active view to maintain sync
    if (view === 'daily') {
      dailyF = (parseFloat(dailyFeedSak) || 0) * 50;
      f = prevTotalFeed + dailyF;
      dailyD = parseFloat(dailyDeathsInput) || 0;
      d = prevTotalDeaths + dailyD;
    } else if (view === 'cumulative') {
      f = parseFloat(totalFeed) || 0;
      dailyF = f - prevTotalFeed;
      d = p1 - p2;
      dailyD = d - prevTotalDeaths;
    } else {
      // Fallback
      f = stats ? stats.cumulativeFeedRaw : (parseFloat(totalFeed) || 0);
      dailyF = (parseFloat(dailyFeedSak) || 0) * 50;
      d = p1 - p2;
      dailyD = stats.dailyDeaths;
    }

    const w = stats ? stats.cumulativeWeightRaw : (parseFloat(totalWeight) || 0);

    const newRecord: FlockRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      age: finalAge,
      initialPop: p1,
      currentPop: p2,
      totalWeight: w,
      totalFeed: f,
      fcr: parseFloat(stats.fcr),
      ip: parseFloat(stats.ip),
      mortality: parseFloat(stats.mortality),
      dailyFcr: stats.dailyFcr ? parseFloat(stats.dailyFcr) : null,
      adg: parseFloat(stats.adg),
      dailyAdg: stats.dailyAdg ? parseFloat(stats.dailyAdg.toString()) : null,
      dailyDeaths: dailyD,
      dailyFeed: dailyF,
      totalDeaths: d,
      weeklyDeaths: stats.weeklyDeaths
    };

    setHistory(prev => [newRecord, ...prev]);
    alert('Data berhasil disimpan ke riwayat.');
  };

  const deleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setHistory(prev => prev.filter(r => r.id !== id));
    }
  };

  const deleteHarvestRecord = (id: string) => {
    if (confirm('Hapus data panen ini?')) {
      setHarvestHistory(prev => prev.filter(r => r.id !== id));
    }
  };

  const saveHarvest = () => {
    const b = parseFloat(harvestBirds) || 0;
    const aw = parseFloat(harvestAvgWeight) || 0; // aw is in kg (e.g. 1.234)
    const tw = parseFloat(harvestTotalWeight) || 0; // tw is in kg (e.g. 15000)
    const hAge = parseFloat(harvestAge) || parseFloat(age) || 0;

    if (b <= 0 || (aw <= 0 && tw <= 0) || hAge <= 0) {
      alert('Mohon lengkapi data panen dan umur harian.');
      return;
    }

    // Auto calculate if one is missing
    let finalTw = tw;
    let finalAw = aw > 0 ? aw : 0; // store internally in kg

    if (tw === 0 && aw > 0) finalTw = b * aw;
    if (aw === 0 && tw > 0) finalAw = tw / b; // in kg

    // Calculate IP for this specific harvest
    const currentFcr = stats ? parseFloat(stats.fcr) : 0;
    const currentMortality = stats ? parseFloat(stats.mortality) : 0;
    
    // IP = ((100 - Mortality) * AvgWeightKG) / (FCR * Age) * 100
    const avgWeightKg = finalAw;
    const calculatedIp = (currentFcr > 0 && hAge > 0) 
      ? (((100 - currentMortality) * avgWeightKg) / (currentFcr * hAge)) * 100 
      : 0;

    const hasWeighing = activeDrafts.some(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
    const validDrafts: WeighingDraft[] = activeDrafts
      .filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0)
      .map(d => ({
        id: d.id,
        birds: parseInt(d.birds as any) || 0,
        weight: parseWeight(d.weight)
      }));

    const newRecord: HarvestRecord = {
      id: crypto.randomUUID(),
      date: harvestDate,
      birds: b,
      avgWeight: finalAw,
      totalWeight: finalTw,
      age: hAge,
      ip: calculatedIp,
      weighingDrafts: hasWeighing ? validDrafts : undefined,
      dataTimbangNo,
      spbNo,
      timeArrived,
      timeLoaded,
      timeCompleted,
      takenBy,
      driverName,
      plateNo,
      driverSim,
      stnkNo,
      diserahkanNama,
      diserahkanTgl,
      diambilNama,
      diambilTgl,
      securityNama,
      securityTgl
    };

    setHarvestHistory(prev => [newRecord, ...prev]);
    setHarvestBirds('');
    setHarvestAvgWeight('');
    setHarvestTotalWeight('');
    
    // Reset weighing document block states
    setActiveDrafts(Array.from({ length: 90 }, (_, i) => ({
      id: `draft-${i}`,
      birds: '',
      weight: ''
    })));
    setDataTimbangNo(`PFL ${Math.floor(100000 + Math.random() * 900000)}`);
    setSpbNo('');
    setTimeArrived('');
    setTimeLoaded('');
    setTimeCompleted('');
    setTakenBy('');
    setDriverName('');
    setPlateNo('');
    setDriverSim('');
    setStnkNo('');
    setDiserahkanNama('');
    setDiserahkanTgl('');
    setDiambilNama('');
    setDiambilTgl('');
    setSecurityNama('');
    setSecurityTgl('');
    alert('Data panen berhasil disimpan dengan Indeks Performa.');
  };

  const exportHarvestToCSV = () => {
    if (harvestHistory.length === 0) {
      alert('Belum ada data panen untuk diekspor.');
      return;
    }

    const headers = [
      'Tanggal',
      'Umur (Hari)',
      'Jumlah Ekor (Ekor)',
      'Rata-rata Bobot (kg)',
      'Total Bobot (kg)',
      'Total Seluruh Berat (kg)',
      'Indeks Performa (IP)'
    ];

    const rows = harvestHistory.map((r, idx) => {
      const runningTotalWeight = harvestHistory
        .slice(idx)
        .reduce((sum, item) => sum + item.totalWeight, 0);
      return [
        r.date,
        r.age,
        r.birds,
        r.avgWeight.toFixed(3),
        r.totalWeight.toFixed(2),
        runningTotalWeight.toFixed(2),
        Math.round(r.ip).toString()
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `harvest_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    if (history.length === 0) {
      alert('Belum ada data untuk diekspor.');
      return;
    }

    const headers = [
      'Tanggal',
      'ID',
      'Umur (Hari)',
      'Populasi Awal',
      'Populasi Akhir',
      'Total Bobot (kg)',
      'Total Pakan (kg)',
      'FCR Kumulatif',
      'IP',
      'Mortalitas (%)',
      'Daily FCR',
      'ADG Kumulatif (g)',
      'Daily ADG (g)',
      'Mati Harian',
      'Total Pakan Harian (kg)',
      'Total Kematian',
      'Kematian Mingguan'
    ];

    const rows = history.map(r => [
      format(new Date(r.date), 'yyyy-MM-dd HH:mm'),
      r.id,
      r.age,
      r.initialPop,
      r.currentPop,
      r.totalWeight,
      r.totalFeed,
      r.fcr,
      r.ip,
      r.mortality,
      r.dailyFcr ?? '',
      r.adg,
      r.dailyAdg ?? '',
      r.dailyDeaths ?? '',
      r.dailyFeed ?? '',
      r.totalDeaths ?? '',
      r.weeklyDeaths ?? ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `broiler_history_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    return [...history].reverse().map(r => ({
      name: format(new Date(r.date), 'dd/MM'),
      ip: r.ip,
      fcr: r.fcr,
      mort: r.mortality,
      adg: r.adg
    }));
  }, [history]);

  const validActiveDrafts = useMemo(() => activeDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0), [activeDrafts]);
  const hasWeighings = useMemo(() => validActiveDrafts.length > 0, [validActiveDrafts]);

  const headerTableData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, c) => {
      const colDrafts = activeDrafts.slice(c * 15, (c + 1) * 15);
      const validColDrafts = colDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
      const birds = validColDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
      const weight = validColDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
      const avg = birds > 0 ? (weight / birds) : 0;
      return {
        name: `Kolom ${c + 1}`,
        birds,
        weight,
        avg: avg > 0 ? avg.toFixed(3) : '0.000'
      };
    });
  }, [activeDrafts]);

  const grandTotalBirds = useMemo(() => {
    return validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
  }, [validActiveDrafts]);

  const grandTotalWeight = useMemo(() => {
    return validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
  }, [validActiveDrafts]);

  const grandAvgWeight = useMemo(() => {
    return grandTotalBirds > 0 ? grandTotalWeight / grandTotalBirds : 0;
  }, [grandTotalBirds, grandTotalWeight]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-emerald-800 text-white flex items-center justify-between px-8 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4L32 16L20 28L8 16L20 4Z" fill="#60a5fa" />
              <path d="M20 12L32 24L20 36L8 24L20 12Z" fill="#2563eb" fillOpacity="0.9" />
              <path d="M20 12L26 18L20 24L14 18L20 12Z" fill="white" fillOpacity="0.3" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Erfours BroilerPro</h1>
        </div>
        
        <nav className="flex items-center bg-emerald-900/50 rounded-lg p-1">
          <button 
            onClick={() => setView('daily')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'daily' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Harian
          </button>
          <button 
            onClick={() => setView('harvest')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'harvest' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Panen
          </button>
          <button 
            onClick={() => setView('weighing')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'weighing' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Lembar Timbang
          </button>
          <button 
            onClick={() => setView('cumulative')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'cumulative' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Indeks IP
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Riwayat
          </button>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          <button 
            onClick={() => setShowAndroidModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 active:scale-95 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-900/30 transition-all cursor-pointer animate-pulse"
          >
            <Smartphone size={13} className="animate-bounce" />
            <span>ID: Android App</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 
            System Active
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'daily' ? (
            <motion.div 
              key="daily"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden"
            >
              {/* Sidebar: Daily Input */}
              <section className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Monitoring Harian</h2>
                    <button onClick={handleReset} className="text-slate-400 hover:text-emerald-600 transition-colors"><RefreshCcw size={14} /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Umur Hari (Hari Ke-X)</label>
                      <div className="relative">
                        <input type="number" value={dailyAge} onChange={(e) => setDailyAge(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black">HARI</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Pakan Hari Ini (SAK)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={dailyFeedSak} 
                          onChange={(e) => setDailyFeedSak(e.target.value)} 
                          placeholder="0"
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-bold italic">(@50KG)</span>
                      </div>
                      {dailyFeedSak && (
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">
                          ≈ {(parseFloat(dailyFeedSak) * 50).toFixed(1)} KG TOTAL
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Bobot Hari Ini</label>
                      <div className="relative">
                        <input type="number" value={dailyWeight} onChange={(e) => setDailyWeight(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black">GRAM</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Bobot Kemarin</label>
                      <div className="relative">
                        <input type="number" value={prevWeight} onChange={(e) => setPrevWeight(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black">GRAM</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Awal DOC</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={initialPop} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setInitialPop(val);
                          }} 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">EKOR</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-rose-500 uppercase tracking-tight">Mati Harian (Jumlah)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={dailyDeathsInput} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setDailyDeathsInput(val);
                            
                            const currentDay = parseFloat(dailyAge || age) || 0;
                            const p1 = parseFloat(initialPop) || 0;
                            const histDeaths = history
                              .filter(r => r.age < currentDay)
                              .reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
                            const d = parseFloat(val) || 0;
                            if (p1 > 0) {
                              const c = p1 - histDeaths - d;
                              setCurrentPop(c.toString());
                            }
                          }} 
                          placeholder="0"
                          className="w-full border border-rose-200 bg-rose-50/30 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-lg font-black text-rose-700 tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-rose-400 text-[10px] font-black">MATI</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Saat Ini</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={currentPop} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentPop(val);
                            
                            const currentDay = parseFloat(dailyAge || age) || 0;
                            const p1 = parseFloat(initialPop) || 0;
                            const histDeaths = history
                               .filter(r => r.age < currentDay)
                               .reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
                            const openingPopToday = p1 - histDeaths;
                            
                            const c = parseFloat(val) || 0;
                            if (openingPopToday > 0) {
                              setDailyDeathsInput((openingPopToday - c).toString());
                            }
                          }} 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">EKOR</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <button 
                      onClick={saveRecord} 
                      disabled={!stats}
                      className={`w-full ${stats ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} text-white font-black py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] transition-all`}
                    >
                      <Save size={14} /> Simpan Data Hari Ini
                    </button>
                    {!stats && (
                      <p className="text-[9px] text-center text-rose-500 font-bold mt-2 uppercase tracking-tighter leading-tight">
                        *LENGKAPI DATA DASAR UNTUK MENYIMPAN
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Dashboard: Daily Results */}
              <section className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-emerald-900 text-white rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[220px]">
                    <div>
                      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Daily FCR (Efisiensi Harian)</p>
                      <h3 className="text-8xl font-black tracking-tighter italic leading-none">{stats?.dailyFcr || '0.0'}</h3>
                    </div>
                    <div className="z-10 flex items-center gap-3 mt-6">
                      <span className="px-4 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase">
                        HARI KE-{dailyAge || '-'}
                      </span>
                      <p className="text-emerald-400/50 text-[10px] font-bold uppercase tracking-widest">ADG: {stats?.dailyAdg || 0} g/hari</p>
                    </div>
                    <Activity size={200} className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transform rotate-12" />
                  </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pakan/Ekor</p>
                        <p className="text-2xl font-black text-slate-900">
                          {dailyFeedSak && currentPop ? (
                            (() => {
                              const p2 = parseFloat(currentPop) || 0;
                              const df = (parseFloat(dailyFeedSak) * 50); // kg
                              const perBirdGr = (df / p2) * 1000;
                              return Math.round(perBirdGr).toLocaleString();
                            })()
                          ) : '0'}
                          <span className="text-xs ml-1 font-bold text-slate-300">gr</span>
                        </p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={12} className="text-rose-500" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kematian Harian</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-rose-600">
                            {stats?.dailyDeaths || '0'}
                          </p>
                          <span className="text-[10px] font-black text-rose-400">({stats?.dailyMortality || '0.00'}%)</span>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <History size={12} className="text-rose-600" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kematian Mingguan</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-rose-700">
                            {stats?.weeklyDeaths || '0'}
                          </p>
                          <span className="text-[10px] font-black text-rose-400">W{stats?.currentWeek || '-'}</span>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Beef size={12} className="text-emerald-600" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pakan Mingguan</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-emerald-700">
                            {stats?.weeklyFeed || '0'}
                          </p>
                          <span className="text-[10px] font-black text-emerald-400 uppercase">KG</span>
                          {stats?.weeklyFeed && (
                            <span className="text-base font-black text-emerald-600 ml-2">
                              ({Math.round((stats?.weeklyFeedRaw || 0) / 50).toLocaleString()} SAK)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {renderGrowthProjection()}
                </div>
              </section>
            </motion.div>
          ) : view === 'cumulative' ? (
            <motion.div 
              key="cumulative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden"
            >
              <section className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Data Kumulatif Flock</h2>
                    <button onClick={handleReset} className="text-slate-400 hover:text-emerald-600 transition-colors"><RefreshCcw size={14} /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Umur Panen / Hari Ini</label>
                      <div className="relative">
                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black">HARI</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Awal DOC</label>
                      <input 
                        type="number" 
                        value={initialPop} 
                        onChange={(e) => setInitialPop(e.target.value)} 
                        placeholder="e.g. 10000"
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Akhir</label>
                      <input 
                        type="number" 
                        value={currentPop} 
                        onChange={(e) => setCurrentPop(e.target.value)} 
                        placeholder="e.g. 9720"
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Bobot Panen (kg)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={totalWeight} 
                          onChange={(e) => setTotalWeight(e.target.value)} 
                          placeholder={stats?.cumulativeWeight || "0"}
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                          {totalWeight ? 'KG' : stats ? `AUTO: ${stats.cumulativeWeight} KG` : 'KG'}
                        </span>
                      </div>
                      {!totalWeight && stats && (
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">
                          *BOBOT TOTAL BERDASARKAN POPULASI & RATA-RATA
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Pakan Terpakai (kg)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={totalFeed} 
                          onChange={(e) => setTotalFeed(e.target.value)} 
                          placeholder={stats?.cumulativeFeed || "0"}
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                          {totalFeed ? `≈ ${Math.round(parseFloat(totalFeed) / 50).toLocaleString()} SAK` : stats ? `AUTO: ${Math.round(stats.cumulativeFeedRaw / 50).toLocaleString()} SAK` : 'KG'}
                        </span>
                      </div>
                      {!totalFeed && stats && (
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">
                          *MENGGUNAKAN DATA DARI RIWAYAT: {stats.cumulativeFeed} KG
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-auto space-y-3 pt-6 border-t border-slate-100">
                  <button 
                    onClick={saveRecord} 
                    disabled={!stats}
                    className={`w-full ${stats ? 'bg-slate-900 hover:bg-black active:scale-95 shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} text-white font-black py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] transition-all`}
                  >
                    <Save size={14} /> Arsipkan Data Kumulatif
                  </button>
                  {!stats && (
                    <p className="text-[9px] text-center text-rose-500 font-bold uppercase tracking-tighter italic">
                      *DATA PENDUKUNG BELUM LENGKAP
                    </p>
                  )}
                </div>
              </section>

              <section className="flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-emerald-900 text-white rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[220px]">
                      <div>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Indeks Performans (IP)</p>
                        <h3 className="text-8xl font-black tracking-tighter italic leading-none">{stats?.ip || '0'}</h3>
                      </div>
                      <div className="z-10 flex items-center justify-between gap-3 mt-6">
                        <span className="px-4 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase">
                          {stats?.ipStatus || '---'}
                        </span>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tight">Rata-rata Bobot</p>
                          <p className="text-base font-black text-white">
                            {stats?.avgWeight ? parseInt(stats.avgWeight).toLocaleString() : '0'} <span className="text-[10px] font-medium text-emerald-300">gr</span>
                          </p>
                        </div>
                      </div>
                      <TrendingUp size={200} className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transform rotate-12" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between shadow-sm min-h-[220px]">
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Feed Conversion Ratio (FCR)</p>
                        <h3 className="text-8xl font-black tracking-tighter text-slate-800 leading-none">{stats?.fcr || '0.00'}</h3>
                      </div>
                      <div className="space-y-3 mt-6">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${stats ? Math.min(100, (1.8 / parseFloat(stats.fcr)) * 80) : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {renderGrowthProjection()}
                </div>
              </section>
            </motion.div>
          ) : (view === 'harvest' || view === 'weighing') ? (
            <motion.div 
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden"
            >
              {view === 'harvest' && (
                <section className="w-full md:w-60 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Beef size={15} className="text-emerald-600" />
                      <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Input Data Panen</h2>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Tanggal Panen</label>
                        <input 
                          type="date" 
                          value={harvestDate} 
                          onChange={(e) => setHarvestDate(e.target.value)} 
                          className="w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold text-slate-800" 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Umur Panen (Hari)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={harvestAge} 
                            onChange={(e) => setHarvestAge(e.target.value)} 
                            className="w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-bold text-slate-800 tracking-tighter" 
                          />
                          <span className="absolute right-2.5 top-1.5 text-slate-400 text-[8px] font-black uppercase">HARI</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Jumlah Ekor Ayam</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={harvestBirds} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setHarvestBirds(val);
                              const b = parseFloat(val) || 0;
                              const aw = parseFloat(harvestAvgWeight) || 0;
                              const tw = parseFloat(harvestTotalWeight) || 0;
                              
                              if (b > 0) {
                                if (aw > 0) {
                                  setHarvestTotalWeight((b * aw).toFixed(2));
                                } else if (tw > 0) {
                                  setHarvestAvgWeight((tw / b).toFixed(3));
                                }
                              }
                            }} 
                            className={`w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/55 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-bold text-slate-800 tracking-tighter ${hasWeighings ? 'bg-slate-100/80 cursor-not-allowed opacity-80' : ''}`}
                            disabled={hasWeighings}
                          />
                          <span className="absolute right-2.5 top-1.5 text-slate-400 text-[8px] font-black uppercase">EKOR</span>
                        </div>
                        {hasWeighings && (
                          <p className="text-[7.5px] text-emerald-600 font-bold uppercase tracking-tight -mt-0.5">*Kunci: dihitung dari Lembar Timbang</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Total Berat Panen (kg)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={harvestTotalWeight} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setHarvestTotalWeight(val);
                              const b = parseFloat(harvestBirds) || 0;
                              const tw = parseFloat(val) || 0;
                              if (b > 0 && tw > 0) {
                                 setHarvestAvgWeight((tw / b).toFixed(3));
                              }
                            }} 
                            className={`w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/55 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-black text-slate-800 tracking-tighter ${hasWeighings ? 'bg-slate-100/80 cursor-not-allowed opacity-80' : ''}`}
                            disabled={hasWeighings}
                          />
                          <span className="absolute right-2.5 top-1.5 text-slate-400 text-[8px] font-black uppercase">KG</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-rose-500 uppercase tracking-tight">Bobot Rata-rata (kg/ekor)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={harvestAvgWeight} 
                            step="0.001"
                            onChange={(e) => {
                              const val = e.target.value;
                              setHarvestAvgWeight(val);
                              const b = parseFloat(harvestBirds) || 0;
                              const aw = parseFloat(val) || 0;
                              if (b > 0 && aw > 0) {
                                setHarvestTotalWeight((b * aw).toFixed(2));
                              }
                            }} 
                            className={`w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/55 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-bold text-slate-800 tracking-tighter ${hasWeighings ? 'bg-slate-100/80 cursor-not-allowed opacity-80' : ''}`}
                            disabled={hasWeighings}
                          />
                          <span className="absolute right-2.5 top-1.5 text-slate-400 text-[8px] font-black uppercase">KG/EKR</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={saveHarvest}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer mt-2"
                    >
                      <Save size={12} /> Simpan Data Panen
                    </button>

                    <div className="border-t border-slate-100 pt-3 flex flex-col gap-1 text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                      <p className="uppercase font-black text-slate-500">Petunjuk:</p>
                      <p>&bull; Klik <strong className="text-emerald-600">Lembar Timbang</strong> di tab atas untuk mengisi baris nota timbang secara detail.</p>
                      <p>&bull; Data panen akan otomatis terhitung dan tersinkronisasi dari Lembar Timbang jika terisi.</p>
                    </div>
                  </div>
                </section>
              )}
              <section className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Dynamic Title and Header Actions based on view */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sticky top-0 bg-white z-10">
                  {view === 'weighing' ? (
                    <>
                      <div className="flex items-center gap-2 shrink-0">
                        <Scale size={16} className="text-emerald-600" />
                        <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest">Lembar Timbang Digital</h3>
                      </div>
                      
                      {/* Summary Table directly in the Header for the Weighing Sheet */}
                      <div className="hidden xl:flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg max-w-xl text-[9px] font-mono leading-tight flex-1 mx-4">
                        {headerTableData.map((col, idx) => (
                          <div key={idx} className={`flex-1 px-1.5 py-0.5 text-center ${idx < 5 ? 'border-r border-slate-200' : ''}`}>
                            <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{col.name}</p>
                            <div className="flex flex-col font-bold">
                              <span className="text-slate-700 whitespace-nowrap">{col.birds || 0} ekr</span>
                              <span className="text-emerald-700 whitespace-nowrap">{col.weight ? `${col.weight.toFixed(1)} ons` : '-'}</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex-1 px-1.5 py-0.5 text-center border-l-2 border-slate-300 bg-emerald-50/70 rounded">
                          <p className="text-[7.5px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-0.5">TOTAL</p>
                          <div className="flex flex-col font-black">
                            <span className="text-slate-800 whitespace-nowrap">
                              {validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0)} Ekr
                            </span>
                            <span className="text-emerald-800 text-[8.5px] whitespace-nowrap">
                              {(() => {
                                const totalW_ons = validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
                                return `${totalW_ons.toFixed(1)} Ons (${(totalW_ons / 10).toFixed(2)} Kg)`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasWeighings && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Hapus semua data nota timbang aktif?')) {
                                setActiveDrafts(Array.from({ length: 90 }, (_, i) => ({
                                  id: `draft-${i}`,
                                  birds: '',
                                  weight: ''
                                })));
                                setHarvestBirds('');
                                setHarvestTotalWeight('');
                                setHarvestAvgWeight('');
                              }
                            }}
                            className="flex items-center gap-1.5 transition-colors bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer"
                          >
                            <Trash2 size={11} /> Hapus Data Timbang
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const printContents = document.getElementById('print-only-weighing-sheet')?.innerHTML;
                            if (printContents) {
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Cetak Lembar Timbang Panen</title>
                                      <script src="https://cdn.tailwindcss.com"></script>
                                      <style>
                                        body { padding: 40px; background: white; color: black; font-family: monospace; }
                                        input { border: none !important; border-bottom: 1px dashed #ccc !important; background: transparent !important; pointer-events: none; }
                                        input::placeholder { color: transparent; }
                                        button, .no-print { display: none !important; }
                                      </style>
                                    </head>
                                    <body>
                                      ${printContents}
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                setTimeout(() => {
                                  printWindow.print();
                                  printWindow.close();
                                }, 500);
                              }
                            }
                          }}
                          className="flex items-center gap-1.5 transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer"
                        >
                          <Printer size={11} /> Cetak Lembar Timbang
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 text-right">
                      <button 
                        type="button"
                        onClick={exportHarvestToCSV}
                        className="flex items-center gap-1.5 transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest self-start"
                      >
                        <Download size={10} /> Export CSV
                      </button>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Total Birds</p>
                          <p className="text-sm font-black text-slate-900">{harvestHistory.reduce((s, r) => s + r.birds, 0).toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">EKOR</span></p>
                        </div>
                        <div className="flex flex-col pl-4 border-l border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Cumulative Mass</p>
                          <p className="text-sm font-black text-emerald-600">{harvestHistory.reduce((s, r) => s + r.totalWeight, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] font-normal text-slate-400">KG</span></p>
                        </div>
                        {(() => {
                          const withWeighings = harvestHistory.filter(r => r.weighingDrafts && r.weighingDrafts.length > 0);
                          const ttlWeighingBirds = withWeighings.reduce((sum, r) => sum + (r.weighingDrafts?.reduce((s, d) => s + d.birds, 0) || 0), 0);
                          const ttlWeighingKg = withWeighings.reduce((sum, r) => sum + (r.weighingDrafts?.reduce((s, d) => s + d.weight, 0) || 0), 0);
                          
                          if (withWeighings.length > 0) {
                            return (
                              <div className="flex flex-col border-l border-slate-100 pl-4">
                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-wider">Total Timbangan</p>
                                <p className="text-sm font-black text-blue-600">
                                  {ttlWeighingBirds.toLocaleString()} <span className="text-[9px] text-slate-400 font-bold">Ekor</span> / {ttlWeighingKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] font-bold text-slate-400">Kg</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div className="flex flex-col border-l border-slate-100 pl-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Weighted Avg Weight</p>
                          <p className="text-xs font-black text-slate-900">
                            {(() => {
                              const totalB = harvestHistory.reduce((s, r) => s + r.birds, 0);
                              const totalW = harvestHistory.reduce((s, r) => s + r.totalWeight, 0);
                              return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                            })()}
                            <span className="text-[8px] text-slate-400 ml-1 font-normal">KG</span>
                          </p>
                        </div>
                        <div className="flex flex-col border-l border-slate-100 pl-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Avg IP Panen</p>
                          <p className="text-xs font-black text-emerald-700">
                            {(() => {
                              const count = harvestHistory.length;
                              return count > 0 ? Math.round(harvestHistory.reduce((s, r) => s + r.ip, 0) / count).toLocaleString() : '0';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {view === 'weighing' ? (
                  /* Interactive Paper Sheet Representation mimicking picture */
                  <div className="flex-1 overflow-auto bg-slate-50/50 p-6 scrollbar-thin">
                    <div 
                      id="print-only-weighing-sheet"
                      className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-lg p-6 font-sans text-slate-800 shadow-md relative group/paper bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:16px_16px]"
                    >
                      {/* Paper Watermark Stamp style */}
                      <div className="absolute right-4 top-16 border-2 border-dashed border-emerald-600/20 text-emerald-600/20 px-4 py-1 rounded text-2xl font-black uppercase tracking-widest pointer-events-none select-none transform rotate-12">
                        Digital Twin
                      </div>

                      {/* Header Layout */}
                      <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-800 pb-4 mb-4 gap-4">
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-base font-black text-slate-900 tracking-wider">DATA TIMBANG NO :</h3>
                            <input 
                              type="text" 
                              value={dataTimbangNo} 
                              onChange={(e) => setDataTimbangNo(e.target.value)} 
                              placeholder="Tulis No Nota"
                              className="border-b-2 border-slate-300 focus:border-slate-800 bg-transparent text-sm font-mono font-black focus:outline-none w-44 px-1"
                            />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-black text-slate-500 tracking-wider">SPB NO :</span>
                            <input 
                              type="text" 
                              value={spbNo} 
                              onChange={(e) => setSpbNo(e.target.value)} 
                              placeholder="Tulis No SPB"
                              className="border-b border-slate-300 focus:border-slate-800 bg-transparent text-xs font-mono font-black focus:outline-none w-44 px-1"
                            />
                          </div>
                        </div>
                        
                        {/* Interactive Scale Totals Display on Paper */}
                        <div className="border border-slate-800 p-3 bg-white flex items-center justify-around gap-4 font-mono self-stretch md:self-auto rounded flex-wrap">
                          <div className="text-center border-r border-slate-200 pr-4">
                            <p className="text-[8px] font-black uppercase text-slate-450">Ekor (Total)</p>
                            <p className="text-xs md:text-sm font-black text-slate-900">
                              {validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">EKR</span>
                            </p>
                          </div>
                          <div className="text-center border-r border-slate-200 pr-4">
                            <p className="text-[8px] font-black uppercase text-slate-450">Berat (Total)</p>
                            <p className="text-xs md:text-sm font-black text-emerald-700">
                              {(() => {
                                const totalW_ons = validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
                                return (
                                  <>
                                    {totalW_ons.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{" "}
                                    <span className="text-[9px] font-normal text-slate-400">ONS</span>
                                    <span className="text-[8px] font-normal text-slate-500 block">({(totalW_ons / 10).toFixed(2)} KG)</span>
                                  </>
                                );
                              })()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-black uppercase text-slate-450">Rata-rata (kg)</p>
                            <p className="text-xs md:text-sm font-black text-rose-700">
                              {(() => {
                                const totalB = validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
                                const totalW_ons = validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
                                const totalW_kg = totalW_ons / 10;
                                return totalB > 0 ? (totalW_kg / totalB).toFixed(3) : '0.000';
                              })()} <span className="text-[9px] font-normal text-slate-400">KG</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Metadata Form Fields Mimicking Photo layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 p-4 bg-slate-50/20 rounded-md mb-6 text-[11px]">
                        {/* Left Info Column */}
                        <div className="space-y-2 border-r-0 md:border-r border-slate-200 md:pr-4">
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Tanggal :</span>
                            <input 
                              type="date" 
                              value={harvestDate} 
                              onChange={(e) => setHarvestDate(e.target.value)} 
                              className="bg-transparent font-black text-slate-850 border-none p-0 focus:ring-0 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Jam Tiba :</span>
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                              <Clock size={11} className="text-slate-400" />
                              <input 
                                type="text" 
                                value={timeArrived} 
                                onChange={(e) => setTimeArrived(e.target.value)} 
                                placeholder="08:30"
                                className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-mono font-black py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Jam Muat :</span>
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                              <Clock size={11} className="text-slate-400" />
                              <input 
                                type="text" 
                                value={timeLoaded} 
                                onChange={(e) => setTimeLoaded(e.target.value)} 
                                placeholder="09:15"
                                className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-mono font-black py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Jam Selesai :</span>
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                              <Clock size={11} className="text-slate-400" />
                              <input 
                                type="text" 
                                value={timeCompleted} 
                                onChange={(e) => setTimeCompleted(e.target.value)} 
                                placeholder="11:45"
                                className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-mono font-black py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Info Column */}
                        <div className="space-y-2 md:pl-4">
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">Diambil Oleh :</span>
                            <input 
                              type="text" 
                              value={takenBy} 
                              onChange={(e) => setTakenBy(e.target.value)} 
                              placeholder="Nama Pembeli / Broker"
                              className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-black text-slate-850 py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">Nama Sopir :</span>
                            <input 
                              type="text" 
                              value={driverName} 
                              onChange={(e) => setDriverName(e.target.value)} 
                              placeholder="Tulis nama sopir"
                              className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-black text-slate-850 py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">No. Polisi :</span>
                            <input 
                              type="text" 
                              value={plateNo} 
                              onChange={(e) => setPlateNo(e.target.value)} 
                              placeholder="AD 8741 XY"
                              className="bg-transparent border-b border-dashed border-slate-300 font-mono font-black w-36 py-0.5 text-slate-850 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">No. SIM :</span>
                            <input 
                              type="text" 
                              value={driverSim} 
                              onChange={(e) => setDriverSim(e.target.value)} 
                              placeholder="Tulis SIM Sopir"
                              className="bg-transparent border-b border-dashed border-slate-300 font-mono font-black w-36 py-0.5 text-slate-850 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">No. STNK :</span>
                            <input 
                              type="text" 
                              value={stnkNo} 
                              onChange={(e) => setStnkNo(e.target.value)} 
                              placeholder="Tulis STNK Kendaraan"
                              className="bg-transparent border-b border-dashed border-slate-300 font-mono font-black w-36 py-0.5 text-slate-850 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Giant Weighing Grid Table */}
                      <div className="overflow-x-auto border-2 border-slate-850 rounded">
                        <table className="w-full min-w-[950px] border-collapse text-center font-mono text-xs bg-white">
                          <thead>
                            <tr className="bg-slate-100 border-b-2 border-slate-800 text-[11px]">
                              <th className="py-3 px-1 border-r-2 border-slate-800 font-black text-center w-10 bg-slate-100" rowSpan={2}>No</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 1</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 2</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 3</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 4</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 5</th>
                              <th className="py-1.5 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 6</th>
                            </tr>
                            <tr className="bg-slate-50 border-b-2 border-slate-800 text-[10px] font-black">
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Ons</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Ons</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Ons</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Ons</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Ons</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-slate-800 w-[9%] text-emerald-800">Ons</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 15 }).map((_, r) => (
                              <tr key={r} className="border-b border-slate-200 hover:bg-slate-50/70">
                                <td className="py-1 border-r-2 border-slate-800 font-black bg-slate-50/50 text-slate-500 font-mono text-[10px]">{r + 1}</td>
                                {Array.from({ length: 6 }).map((_, c) => {
                                  const idx = c * 15 + r;
                                  const draft = activeDrafts[idx];
                                  return (
                                    <React.Fragment key={c}>
                                      {/* Ekr Cell */}
                                      <td className="p-0 border-r border-slate-200 col-ekor">
                                        <input 
                                          type="number"
                                          value={draft?.birds === 0 || draft?.birds === '' ? '' : draft?.birds}
                                          onChange={(e) => handleCellChange(idx, 'birds', e.target.value)}
                                          placeholder="-"
                                          className="w-full bg-transparent border-none text-center font-bold font-mono text-[13px] md:text-sm py-2 px-1 focus:bg-amber-50 focus:ring-1 focus:ring-amber-300 focus:outline-none cursor-pointer"
                                        />
                                      </td>
                                      {/* Kg Cell */}
                                      <td className={`p-0 ${c < 5 ? 'border-r-2 border-slate-800' : ''} col-kg`}>
                                        <input 
                                          type="text"
                                          inputMode="decimal"
                                          value={draft?.weight === 0 || draft?.weight === '' ? '' : draft?.weight}
                                          onChange={(e) => handleCellChange(idx, 'weight', e.target.value)}
                                          placeholder="-"
                                          className="w-full bg-transparent border-none text-center font-mono font-black text-emerald-700 text-[13px] md:text-sm py-2 px-1 focus:bg-amber-50 focus:ring-1 focus:ring-amber-300 focus:outline-none cursor-pointer"
                                        />
                                      </td>
                                    </React.Fragment>
                                  );
                                })}
                              </tr>
                            ))}
                            {/* Programmatic Totals Row per Column pair */}
                            <tr className="bg-slate-100 border-t-2 border-slate-800 font-black text-xs">
                              <td className="py-2.5 border-r-2 border-slate-800 font-black uppercase text-center bg-slate-100">TTL</td>
                              {Array.from({ length: 6 }).map((_, c) => {
                                const colDrafts = activeDrafts.slice(c * 15, (c + 1) * 15);
                                const validColDrafts = colDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
                                const totalCColBirds = validColDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
                                const totalCColWeight = validColDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
                                return (
                                  <React.Fragment key={c}>
                                    <td className="py-2.5 border-r border-slate-200 bg-slate-100/50 text-slate-800 font-black text-[12px]">{totalCColBirds || '-'}</td>
                                    <td className={`py-2.5 ${c < 5 ? 'border-r-2 border-slate-800' : ''} bg-slate-100/50 text-emerald-700 font-black font-mono text-[12px]`}>
                                      {totalCColWeight ? totalCColWeight.toFixed(2) : '-'}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Paper footer block mimicking driver, farm rep and receiver signature spots */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-4 border-t border-slate-350 text-[10px] bg-slate-50/50 p-4 rounded border border-slate-200">
                        {/* Diambil Oleh Column */}
                        <div className="flex flex-col justify-between h-36 border-b md:border-b-0 pb-4 md:pb-0 text-center md:border-r border-slate-200 md:pr-4">
                          <div className="space-y-1">
                            <p className="font-black text-slate-700 uppercase tracking-wide">Diambil Oleh :</p>
                            <span className="text-[9px] font-bold text-slate-400 block italic leading-tight">Merah: Pengambilan barang / Customer</span>
                          </div>
                          <div className="space-y-1 bg-white p-2 rounded border border-slate-200/50">
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Nama:</span>
                              <input 
                                type="text" 
                                value={diambilNama} 
                                onChange={(e) => setDiambilNama(e.target.value)} 
                                placeholder="Nama Sopir/Kernet"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-bold text-xs focus:outline-none w-32 text-slate-800 py-0.5 opacity-90"
                              />
                            </div>
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Tgl/Jam:</span>
                              <input 
                                type="text" 
                                value={diambilTgl} 
                                onChange={(e) => setDiambilTgl(e.target.value)} 
                                placeholder="Tanggal"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-mono focus:outline-none w-32 text-slate-800 py-0.5 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Check Security Column */}
                        <div className="flex flex-col justify-between h-36 text-center">
                          <div className="space-y-1">
                            <p className="font-black text-slate-700 uppercase tracking-wide">Check / Security :</p>
                            <span className="text-[9px] font-bold text-slate-400 block italic leading-tight">Kuning: Pemberi barang / Farm</span>
                          </div>
                          <div className="space-y-1 bg-white p-2 rounded border border-slate-200/50">
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Nama:</span>
                              <input 
                                type="text" 
                                value={securityNama} 
                                onChange={(e) => setSecurityNama(e.target.value)} 
                                placeholder="Check / Security"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-bold text-xs focus:outline-none w-32 text-slate-800 py-0.5"
                              />
                            </div>
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Tgl/Jam:</span>
                              <input 
                                type="text" 
                                value={securityTgl} 
                                onChange={(e) => setSecurityTgl(e.target.value)} 
                                placeholder="Tanggal"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-mono focus:outline-none w-32 text-slate-800 py-0.5 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Original Harvest History Table and Logs */
                  <>
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <div className="min-w-[1000px] w-full">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 sticky top-0 z-20 shadow-sm">
                            <tr>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 w-12 text-center">No</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Tanggal</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Umur</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Jumlah Ekor</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Rata-rata Bobot</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Total Bobot (kg)</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 text-emerald-600">Total Seluruh Ekor (ekor)</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 text-emerald-600">Rerata Bobot Seluruh (kg)</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 text-emerald-600">Total Seluruh Berat (kg)</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 font-black text-emerald-600">IP PANEN</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-bold text-slate-600">
                            {harvestHistory.map((record, idx) => {
                              const runningTotalWeight = harvestHistory
                                .slice(idx)
                                .reduce((sum, r) => sum + r.totalWeight, 0);
                              const runningTotalBirds = harvestHistory
                                .slice(idx)
                                .reduce((sum, r) => sum + r.birds, 0);
                              const runningAvgWeight = runningTotalBirds > 0
                                ? (runningTotalWeight / runningTotalBirds).toFixed(3)
                                : '0.000';
                              return (
                                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 px-6 text-center text-slate-400 font-mono text-[10px]">
                                    {harvestHistory.length - idx}
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                      <Calendar size={12} className="text-slate-400" />
                                      {record.date}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">{record.age} <span className="text-[9px]">hari</span></td>
                                  <td className="py-4 px-6">
                                    <span className="text-slate-900 font-black">{record.birds.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">ekor</span></span>
                                  </td>
                                  <td className="py-4 px-6">{record.avgWeight.toFixed(3)} <span className="text-[9px]">kg/ekor</span></td>
                                  <td className="py-4 px-6 text-slate-600">{record.totalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px]">kg</span></td>
                                  <td className="py-4 px-6 text-emerald-600 font-black">{runningTotalBirds.toLocaleString()} <span className="text-[9px] font-normal text-slate-450">ekor</span></td>
                                  <td className="py-4 px-6 text-emerald-600 font-black">{runningAvgWeight} <span className="text-[9px] font-normal text-slate-450">kg</span></td>
                                  <td className="py-4 px-6 text-emerald-600 font-black">{runningTotalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px]">kg</span></td>
                                  <td className="py-4 px-6">
                                     <div className="flex flex-col">
                                       <span className="text-emerald-700 font-black text-lg">{Math.round(record.ip).toLocaleString()}</span>
                                       <span className="text-[8px] font-black uppercase text-slate-400 -mt-1">
                                         {record.ip >= 400 ? 'PREMIUM' : record.ip >= 350 ? 'EXCELLENT' : record.ip >= 300 ? 'STANDARD' : 'UNDER'}
                                       </span>
                                     </div>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <button 
                                      type="button"
                                      onClick={() => deleteHarvestRecord(record.id)}
                                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {harvestHistory.length === 0 && (
                              <tr>
                                <td colSpan={11} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                  Belum ada data panen
                                </td>
                              </tr>
                            )}
                          </tbody>
                          {harvestHistory.length > 0 && (
                            <tfoot className="bg-slate-100/90 text-slate-900 border-t-2 border-slate-300 font-black text-xs sticky bottom-0 z-20">
                              <tr className="bg-slate-50/90 border-t border-slate-200">
                                <td className="py-4 px-6 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">TOTAL</td>
                                <td className="py-4 px-6"></td>
                                <td className="py-4 px-6"></td>
                                <td className="py-4 px-6">
                                  <span className="text-slate-900 font-black">
                                    {harvestHistory.reduce((sum, r) => sum + r.birds, 0).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ekor</span>
                                  </span>
                                </td>
                                <td className="py-4 px-6 font-mono text-slate-800">
                                  {(() => {
                                    const totalB = harvestHistory.reduce((sum, r) => sum + r.birds, 0);
                                    const totalW = harvestHistory.reduce((sum, r) => sum + r.totalWeight, 0);
                                    return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                                  })()} <span className="text-[10px] text-slate-500 font-normal">kg/ekor</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-slate-900">
                                  {harvestHistory.reduce((sum, r) => sum + r.totalWeight, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-500 font-normal">kg</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-emerald-800 bg-emerald-50/50">
                                  {harvestHistory.reduce((sum, r) => sum + r.birds, 0).toLocaleString()} <span className="text-[10px] text-emerald-700 font-normal">ekor</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-emerald-800 bg-emerald-50/50">
                                  {(() => {
                                    const totalB = harvestHistory.reduce((sum, r) => sum + r.birds, 0);
                                    const totalW = harvestHistory.reduce((sum, r) => sum + r.totalWeight, 0);
                                    return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                                  })()} <span className="text-[10px] text-emerald-700 font-normal">kg</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-emerald-800 bg-emerald-50/50">
                                  {harvestHistory.reduce((sum, r) => sum + r.totalWeight, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-emerald-700 font-normal">kg</span>
                                </td>
                                <td className="py-4 px-6 text-emerald-700 font-black text-sm">
                                  {(() => {
                                    const count = harvestHistory.length;
                                    return count > 0 ? Math.round(harvestHistory.reduce((sum, r) => sum + r.ip, 0) / count).toLocaleString() : '0';
                                  })()}
                                </td>
                                <td className="py-4 px-6"></td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full flex flex-col p-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
                {/* Visualizations */}
                <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <TrendingUp size={14} className="text-emerald-500" /> IP Trend
                        </h3>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorIp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                            />
                            <Tooltip />
                            <Area type="monotone" dataKey="ip" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Beef size={14} className="text-rose-500" /> FCR Trend
                        </h3>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                            />
                            <Tooltip />
                            <Line type="monotone" dataKey="fcr" stroke="#f43f5e" strokeWidth={2} dot={{r: 3, fill: '#f43f5e'}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Activity size={14} className="text-blue-500" /> ADG Trend
                        </h3>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorAdg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                            />
                            <Tooltip />
                            <Area type="monotone" dataKey="adg" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAdg)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Data Table */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col mb-6 lg:mb-0">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 transition-all">
                      <div className="flex flex-col">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Archived Flock Data</h4>
                        {availableWeeks.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-slate-400">SELECT WEEK:</span>
                            <select 
                              value={activeHistoryWeek || ''} 
                              onChange={(e) => setHistorySelectedWeek(parseInt(e.target.value))}
                              className="text-[10px] font-black text-emerald-600 bg-emerald-50 border-none outline-none rounded-md px-2 py-0.5 cursor-pointer appearance-none hover:bg-emerald-100 transition-colors"
                            >
                              {availableWeeks.map(w => (
                                <option key={w} value={w}>WEEK {w}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      
                       {activeHistoryWeek && (
                        <div className="flex items-center gap-2">
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hidden sm:flex items-center gap-4 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl"
                          >
                             <div className="p-2 bg-rose-500 text-white rounded-lg shadow-sm shadow-rose-200">
                               <Users size={16} />
                             </div>
                             <div>
                               <p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] mb-0.5">W{activeHistoryWeek} Total Mortality</p>
                               <div className="flex items-baseline gap-1">
                                 <p className="text-lg font-black text-rose-700 leading-none">{historyWeeklyMortality}</p>
                                 <span className="text-[10px] font-black text-rose-400">EKOR</span>
                               </div>
                             </div>
                          </motion.div>

                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hidden sm:flex items-center gap-4 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl"
                          >
                             <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-200">
                               <Beef size={16} />
                             </div>
                             <div>
                               <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-0.5">W{activeHistoryWeek} Total Feed</p>
                               <div className="flex items-baseline gap-1">
                                 <p className="text-lg font-black text-emerald-700 leading-none">{Math.round(historyWeeklyFeed).toLocaleString()}</p>
                                 <span className="text-[10px] font-black text-emerald-400 mr-1">KG</span>
                                 <span className="text-sm font-black text-emerald-600 leading-none">({Math.round(historyWeeklyFeed / 50).toLocaleString()} SAK)</span>
                               </div>
                             </div>
                          </motion.div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            if (window.confirm('Hapus semua riwayat flock? Tindakan ini tidak dapat dibatalkan.')) {
                              setHistory([]);
                              localStorage.removeItem('flock_history');
                            }
                          }}
                          className="text-[10px] font-black text-rose-600 flex items-center gap-2 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                        >
                          CLEAR ALL
                        </button>
                        <button 
                          onClick={exportToCSV}
                          className="text-[10px] font-black text-emerald-600 flex items-center gap-2 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                        >
                          <Download size={14} /> EXPORT CSV
                        </button>
                      </div>
                    </div>
                    <div className="h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 sticky top-0 z-20 shadow-sm">
                          <tr>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 w-12 text-center">No</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Date/ID</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">IP</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">FCR (C/D)</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 text-blue-600">Bobot</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Pop Awal</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Pop Akhir</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Mati Harian</th>
                             <th className="py-4 px-6 border-b border-slate-100 text-rose-600 bg-slate-50">Total Mati</th>
                             <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">% Mort</th>
                             <th className="py-4 px-6 border-b border-slate-100 text-emerald-600 bg-slate-50">Pakan</th>
                            <th className="py-4 px-6 border-b border-slate-100 text-right bg-slate-50">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-600">
                          {[...history].sort((a, b) => b.age - a.age).map((record, idx) => (
                            <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6 text-center text-slate-400 font-mono text-[10px]">
                                {history.length - idx}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-slate-900 font-black flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-400" />
                                    {format(new Date(record.date), 'MMM dd, yyyy')}
                                  </span>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">#{record.id.split('-')[0]}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${record.ip >= 350 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {Math.round(record.ip)}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="font-mono text-slate-800">{record.fcr.toFixed(1)}</span>
                                  {record.dailyFcr !== null && record.dailyFcr !== undefined && (
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-emerald-600 font-black uppercase">D: {record.dailyFcr.toFixed(1)}</span>
                                      {record.dailyAdg && (
                                        <span className="text-[8px] text-blue-500 font-bold -mt-0.5">+{Math.round(record.dailyAdg)}g</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-slate-900 font-black uppercase">
                                    {Math.round((record.totalWeight / record.currentPop) * 1000).toLocaleString()} <span className="text-[9px]">gr/ekor</span>
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                                    Total: {Math.round(record.totalWeight).toLocaleString()} kg
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-500">{record.initialPop.toLocaleString()} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-slate-900 font-black">{record.currentPop.toLocaleString()} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-rose-500 font-bold">{record.dailyDeaths?.toLocaleString() || 0} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-rose-700 font-black">
                                {(record.totalDeaths || 0).toLocaleString()} <span className="text-[9px]">ekor</span>
                              </td>
                              <td className="py-4 px-6 text-rose-600">{Math.round(record.mortality)}%</td>
                               <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-emerald-700 font-black">
                                    {Math.round(record.dailyFeed || 0).toLocaleString()} <span className="text-[9px]">kg</span>
                                    <span className="ml-1 text-[8px] text-emerald-500 font-bold">({Math.round((record.dailyFeed || 0) / 50).toLocaleString()} SAK)</span>
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <button 
                                  onClick={() => deleteRecord(record.id)}
                                  className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {history.length === 0 && (
                            <tr>
                              <td colSpan={12} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                No archives found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-1 pb-6 lg:pb-0">
                  <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <BarChart3 size={14} /> Average Performance
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Mean IP</span>
                        <span className="text-2xl font-black italic">
                          {history.length > 0 ? Math.round(history.reduce((a, b) => a + b.ip, 0) / history.length).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Avg FCR</span>
                        <span className="text-2xl font-black italic">
                          {history.length > 0 ? (history.reduce((a, b) => a + b.fcr, 0) / history.length).toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Avg Daily FCR</span>
                        <span className="text-2xl font-black italic text-emerald-500">
                          {(() => {
                            const dailyRecords = history.filter(r => r.dailyFcr !== null && r.dailyFcr !== undefined);
                            return dailyRecords.length > 0 
                              ? (dailyRecords.reduce((a, b) => a + (b.dailyFcr || 0), 0) / dailyRecords.length).toFixed(1)
                              : '0.0';
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                        <span className="text-xs font-bold text-slate-400">Total Mortality (Overall)</span>
                        <div className="text-right">
                          <p className="text-2xl font-black italic text-rose-400">
                             {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? (latest.totalDeaths || (latest.initialPop - latest.currentPop)).toLocaleString() : '0';
                             })()} <span className="text-[10px]">EKOR</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? Math.round(latest.mortality).toString() : '0';
                             })()} % TOTAL
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                        <span className="text-xs font-bold text-slate-400">Total Feed (All Time)</span>
                        <div className="text-right">
                          <p className="text-2xl font-black italic text-emerald-400">
                             {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? latest.totalFeed.toLocaleString() : '0';
                             })()} <span className="text-[10px]">KG</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            ≈ {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? Math.round(latest.totalFeed / 50).toLocaleString() : '0';
                             })()} SAK
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Akumulasi Panen</p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Total Panen Seluruh Ekor</span>
                            <span className="text-xl font-black italic text-emerald-400">
                              {harvestHistory.reduce((s, r) => s + r.birds, 0).toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">EKOR</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Rerata Bobot Panen</span>
                            <span className="text-xl font-black italic text-emerald-400">
                              {(() => {
                                const totalB = harvestHistory.reduce((s, r) => s + r.birds, 0);
                                const totalW = harvestHistory.reduce((s, r) => s + r.totalWeight, 0);
                                return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                              })()} <span className="text-[9px] text-slate-500 font-normal">KG</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Total Seluruh Berat Panen</span>
                            <span className="text-xl font-black italic text-emerald-400">
                              {harvestHistory.reduce((s, r) => s + r.totalWeight, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-normal">KG</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-500" /> Summary Mingguan
                      </h3>
                      <div className="space-y-3">
                        {weeklySummaryData.map((data) => (
                          <motion.div 
                            key={data.week}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">MINGGU</span>
                              <span className="text-xl font-black text-slate-900 leading-none">{data.week}</span>
                            </div>
                            <div className="flex gap-4">
                              <div className="text-right">
                                <p className="text-[8px] font-black text-rose-400 uppercase leading-none mb-1">MATI</p>
                                <p className="text-sm font-black text-rose-600 leading-none">{data.deaths}<span className="text-[8px] ml-0.5">EKOR</span></p>
                              </div>
                              <div className="text-right border-l border-slate-200 pl-4">
                                <p className="text-[8px] font-black text-emerald-400 uppercase leading-none mb-1">PAKAN</p>
                                <p className="text-sm font-black text-emerald-700 leading-none">{data.feed.toFixed(1)}<span className="text-[8px] ml-0.5 uppercase">KG</span></p>
                                <p className="text-xs font-black text-emerald-600 leading-none mt-1">{(data.feed / 50).toFixed(1)} SAK</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {weeklySummaryData.length === 0 && (
                          <p className="text-[10px] text-center text-slate-400 font-bold uppercase italic py-4">Belum ada data mingguan</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mini Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">Node: AIS-PHT2-05</span>
          <span className="flex items-center gap-2">Data Source: LOCALSTORAGE_DRIVE</span>
        </div>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 text-emerald-500"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> DB PERSISTED</span>
          <span>&copy; {new Date().getFullYear()} Erfours BroilerPro Systems LP</span>
        </div>
      </footer>

      {/* Weighing Drafts Details Modal */}
      <AnimatePresence>
        {selectedRecordDrafts && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-slate-800"
            onClick={() => setSelectedRecordDrafts(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Scale size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Laporan Detil Lembar Timbang</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    DATA TIMBANG NO: <span className="font-mono text-emerald-300 font-black">{selectedRecordDrafts.dataTimbangNo || 'MANUAL'}</span>
                    {selectedRecordDrafts.spbNo && ` | SPB NO: ${selectedRecordDrafts.spbNo}`}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRecordDrafts(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 grid grid-cols-4 gap-2 text-center shrink-0">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Total Ekor</p>
                  <p className="text-xs font-black text-slate-800">{selectedRecordDrafts.birds.toLocaleString()} <span className="text-[8px] font-normal text-slate-400">EKR</span></p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Total Netto</p>
                  <p className="text-xs font-black text-emerald-600">{selectedRecordDrafts.totalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[8px] font-normal text-slate-400">KG</span></p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Rata-rata</p>
                  <p className="text-xs font-black text-slate-800">{selectedRecordDrafts.avgWeight.toFixed(3)} <span className="text-[8px] font-normal text-slate-400">KG</span></p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Umur Panen</p>
                  <p className="text-xs font-black text-blue-600">{selectedRecordDrafts.age} <span className="text-[8px] font-normal text-slate-400">HARI</span></p>
                </div>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
                {/* Left side: Metadata & Signature Info */}
                <div className="md:col-span-7 space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2.5 text-xs">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 border-b border-slate-200 pb-1">
                      Informasi Logistik &amp; Transportasi
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">Tanggal Panen</span>
                        <span className="font-bold text-slate-700">{selectedRecordDrafts.date}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">Penerima / Broker</span>
                        <span className="font-bold text-slate-700">{selectedRecordDrafts.takenBy || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">Nama Sopir</span>
                        <span className="font-bold text-slate-700">{selectedRecordDrafts.driverName || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">No. Polisi Kendaraan</span>
                        <span className="font-mono font-bold text-slate-700">{selectedRecordDrafts.plateNo || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">No. SIM Sopir</span>
                        <span className="font-mono font-bold text-slate-700">{selectedRecordDrafts.driverSim || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">No. STNK</span>
                        <span className="font-mono font-bold text-slate-700">{selectedRecordDrafts.stnkNo || '-'}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[7px] text-slate-400 font-bold uppercase">Tiba</span>
                        <span className="font-black font-mono text-slate-700">{selectedRecordDrafts.timeArrived || '-'}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[7px] text-slate-400 font-bold uppercase">Muat</span>
                        <span className="font-black font-mono text-slate-700">{selectedRecordDrafts.timeLoaded || '-'}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[7px] text-slate-400 font-bold uppercase">Selesai</span>
                        <span className="font-black font-mono text-slate-700">{selectedRecordDrafts.timeCompleted || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures Status */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 text-[10px]">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 border-b border-slate-200 pb-1">
                      Verifikasi &amp; Tanda Tangan
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="bg-emerald-50/45 p-2 rounded border border-emerald-100/55 flex flex-col justify-between h-24">
                        <span className="font-black text-slate-500 uppercase tracking-tight block">Diambil :</span>
                        <span className="font-black text-emerald-800 text-[11px] block truncate">{selectedRecordDrafts.diambilNama || 'Penerima'}</span>
                        <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">{selectedRecordDrafts.diambilTgl || '-'}</span>
                      </div>

                      <div className="bg-emerald-50/45 p-2 rounded border border-emerald-100/55 flex flex-col justify-between h-24">
                        <span className="font-black text-slate-500 uppercase tracking-tight block">Keamanan/Sec :</span>
                        <span className="font-black text-emerald-800 text-[11px] block truncate">{selectedRecordDrafts.securityNama || 'Security'}</span>
                        <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">{selectedRecordDrafts.securityTgl || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Weighing Draft List */}
                <div className="md:col-span-5 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden max-h-[360px]">
                  <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-250 flex justify-between items-center text-[10px] font-bold text-slate-600">
                    <span className="uppercase tracking-wider">Lembar Draft Timbang</span>
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[8px] font-mono">
                      {selectedRecordDrafts.weighingDrafts?.length || 0} BARIS
                    </span>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100 text-xs">
                    {selectedRecordDrafts.weighingDrafts && selectedRecordDrafts.weighingDrafts.length > 0 ? (
                      selectedRecordDrafts.weighingDrafts.map((draft, idx) => (
                        <div key={draft.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-50 transition-all font-mono">
                          <span className="text-[9px] text-slate-400 font-bold">Baris #{idx+1}</span>
                          <span className="text-slate-700 font-bold">{draft.birds} <span className="text-[9px] font-normal text-slate-400">ekr</span></span>
                          <span className="text-emerald-700 font-black text-right">
                            {draft.weight.toFixed(1)} <span className="text-[9px] font-normal text-slate-450">ons</span>{" "}
                            <span className="text-[9px] text-slate-400 font-normal">({(draft.weight / 10).toFixed(2)} kg)</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 italic text-[11px]">
                        Tidak ada lembar digital yang disimpan.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = `
                      <div style="font-family: monospace; padding: 40px; color: black;">
                        <h2 style="text-align: center; margin-bottom: 20px;">NOTA TIMBANG PANEN</h2>
                        <hr style="border: 1px solid black;" />
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px;">
                          <tr>
                            <td><strong>TANGGAL PANEN:</strong></td><td>${selectedRecordDrafts.date}</td>
                            <td><strong>DATA TIMBANG NO:</strong></td><td>${selectedRecordDrafts.dataTimbangNo || 'MANUAL'}</td>
                          </tr>
                          <tr>
                            <td><strong>SPB NO:</strong></td><td>${selectedRecordDrafts.spbNo || '-'}</td>
                            <td><strong>BROKER/DIAMBIL OLEH:</strong></td><td>${selectedRecordDrafts.takenBy || '-'}</td>
                          </tr>
                          <tr>
                            <td><strong>SOPIR:</strong></td><td>${selectedRecordDrafts.driverName || '-'} / ${selectedRecordDrafts.plateNo || '-'}</td>
                            <td><strong>TOTAL:</strong></td><td>${selectedRecordDrafts.birds.toLocaleString()} EKR (${selectedRecordDrafts.totalWeight.toFixed(2)} KG)</td>
                          </tr>
                        </table>
                        <h3 style="margin-top: 30px; border-bottom: 1px solid black; padding-bottom: 5px;">DRAFT TIMBANGAN:</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 11px;">
                          ${selectedRecordDrafts.weighingDrafts?.map((d, i) => `
                            <div>[#${i+1}] ${d.birds} Ekr: <strong>${d.weight.toFixed(1)} ons</strong> <span style="font-size: 9px; color: gray;">(${(d.weight / 10).toFixed(2)} kg)</span></div>
                          `).join('') || '<div>Input Manual</div>'}
                        </div>
                        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px;">
                          <div>Diambil Oleh:<br/><br/><br/>( ${selectedRecordDrafts.diambilNama || '..................'} )</div>
                          <div>Keamanan/Security:<br/><br/><br/>( ${selectedRecordDrafts.securityNama || '..................'} )</div>
                        </div>
                      </div>
                    `;
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(
                        '<html>' +
                          '<head><title>Nota Timbang Panen - ' + (selectedRecordDrafts.dataTimbangNo || 'Manual') + '</title></head>' +
                          '<body>' + printContents + '<script>window.print(); window.close();</script></body>' +
                        '</html>'
                      );
                      printWindow.document.close();
                    }
                  }}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded transition-colors flex items-center gap-1.5"
                >
                  <Printer size={11} /> Cetak Nota
                </button>
                <button 
                  onClick={() => setSelectedRecordDrafts(null)}
                  className="bg-slate-955 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded transition-colors active:scale-95"
                >
                  Tutup Laporan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Android PWA Install Onboarding Modal */}
        {showAndroidModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 text-slate-800"
            onClick={() => setShowAndroidModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side: Stunning interactive Android Mockup */}
              <div className="bg-slate-950 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 shrink-0 md:w-80">
                <div className="relative w-48 h-96 bg-slate-900 rounded-[40px] border-[6px] border-slate-700 shadow-2xl p-2 flex flex-col overflow-hidden">
                  {/* Android Top notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-700 rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                  </div>
                  
                  {/* Android Screen Content Mockup */}
                  <div className="w-full h-full flex flex-col bg-slate-950 rounded-[32px] overflow-hidden relative p-4 pt-6">
                    {/* Stat Bar */}
                    <div className="flex justify-between items-center text-[8px] text-emerald-400 font-mono mb-6 pt-1">
                      <span>LTE / 4G</span>
                      <span>12:30</span>
                      <span>100% 🔋</span>
                    </div>

                    {/* App Icon container */}
                    <div className="flex flex-col items-center justify-center flex-1 my-2">
                      <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl shadow-xl p-0.5 flex items-center justify-center mb-3">
                        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center overflow-hidden">
                          <img src="/icon.svg" className="w-16 h-16" referrerPolicy="no-referrer" alt="Erfours logo" />
                        </div>
                      </div>
                      <h4 className="text-white text-xs font-black tracking-wider text-center">ERFOURS</h4>
                      <p className="text-[7px] text-emerald-400 font-bold uppercase tracking-widest mt-1">BroilerPro APK</p>
                    </div>

                    {/* Mock Launcher App Drawer */}
                    <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-2.5 border border-slate-800/60 flex flex-col gap-1.5 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center">
                          <Check size={10} className="text-emerald-400" />
                        </div>
                        <span className="text-[7px] text-slate-300 font-black">Offline-First Logging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center">
                          <Check size={10} className="text-emerald-400" />
                        </div>
                        <span className="text-[7px] text-slate-300 font-black">Automatic FCR & IP</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-4 text-center select-none">Paket Distribusi Android PWA</p>
              </div>

              {/* Right Side: Install Onboarding details */}
              <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto text-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
                      <Smartphone size={11} /> Android App Edition
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Pasang Aplikasi Erfours</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Bawa sistem pencatatan ayam pedaging Anda kemana saja dengan performa maksimal.</p>
                  </div>
                  <button 
                    onClick={() => setShowAndroidModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Android App Key Advantages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-emerald-400 font-black text-sm mb-1">📶 Bebas Offline</div>
                    <p className="text-[10px] text-slate-400 leading-normal font-bold">Tetap catat timbangan, pakan mati di kandang tanpa sinyal internet.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-emerald-400 font-black text-sm mb-1">⚡ Instant Launch</div>
                    <p className="text-[10px] text-slate-400 leading-normal font-bold">Membuka secepat kilat dengan ikon pintasan resmi di layar utama ponsel.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-emerald-400 font-black text-sm mb-1">📲 Tanpa Ruang Besar</div>
                    <p className="text-[10px] text-slate-400 leading-normal font-bold">Ukuran sangat kecil (di bawah 1MB) dibandingkan aplikasi PlayStore konvensional.</p>
                  </div>
                </div>

                {/* Installation Flow */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 mb-6 flex-1">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-3.5">Petunjuk Pemasangan Aplikasi:</h4>
                  
                  {deferredPrompt ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-300 font-bold leading-relaxed">
                        Browser Anda mendeteksi bahwa aplikasi Erfours siap dipasang secara langsung sebagai aplikasi Android asli yang didukung oleh integrasi WebAPK Google.
                      </p>
                      <button
                        onClick={() => {
                          deferredPrompt.prompt();
                          deferredPrompt.userChoice.then((choiceResult: any) => {
                            if (choiceResult.outcome === 'accepted') {
                              setIsWebAppInstalled(true);
                              setShowAndroidModal(false);
                            }
                            setDeferredPrompt(null);
                          });
                        }}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all rounded-xl font-bold text-sm tracking-wide text-white shadow-xl shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Smartphone size={18} /> PASANG APLIKASI SEKARANG
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-xs text-slate-300">
                      <p className="font-bold text-amber-400">Ponsel Anda dapat memasangnya lewat petunjuk sederhana berikut:</p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <span className="leading-relaxed">Buka halaman situs ini dari aplikasi browser <strong>Google Chrome</strong> di HP Android Anda.</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <span className="leading-relaxed">Ketuk menu setelan di kanan atas browser Chrome Anda (<strong>ikon titik tiga ⁝</strong>).</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <span className="leading-relaxed">Pilih tulisan <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">4</span>
                          <span className="leading-relaxed">Tekan tombol <strong>"Instal"</strong>. Selesai! Erfours siap berjalan di HP Anda dengan ikon mandiri.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between border-t border-slate-800 text-[10px] text-slate-500 font-mono mt-auto pt-4">
                  <span>PWA Versi 1.0.0 (API v2)</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isWebAppInstalled ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span>Status: {isWebAppInstalled ? 'Terpasang di Perangkat' : 'Siap Dipasang'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
