import { useState, useMemo, useEffect } from 'react';
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
  Calendar
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

interface HarvestRecord {
  id: string;
  date: string;
  birds: number;
  avgWeight: number;
  totalWeight: number;
  age: number;
  ip: number;
  notes?: string;
}

export default function App() {
  // Input State
  const [initialPop, setInitialPop] = useState<string>('10000');
  const [currentPop, setCurrentPop] = useState<string>('9720');
  const [totalWeight, setTotalWeight] = useState<string>('20900');
  const [totalFeed, setTotalFeed] = useState<string>('30514');
  const [age, setAge] = useState<string>('35');
  
  // App State
  const [view, setView] = useState<'daily' | 'cumulative' | 'history' | 'harvest'>('daily');
  const [history, setHistory] = useState<FlockRecord[]>([]);
  const [harvestHistory, setHarvestHistory] = useState<HarvestRecord[]>([]);
  const [historySelectedWeek, setHistorySelectedWeek] = useState<number | null>(null);

  const availableWeeks = useMemo(() => {
    const weeks = new Set<number>();
    history.forEach(r => weeks.add(Math.ceil(r.age / 7)));
    return Array.from(weeks).sort((a, b) => b - a);
  }, [history]);

  const activeHistoryWeek = historySelectedWeek || (availableWeeks.length > 0 ? availableWeeks[0] : null);

  const historyWeeklyMortality = useMemo(() => {
    if (!activeHistoryWeek) return 0;
    return history
      .filter(r => Math.ceil(r.age / 7) === activeHistoryWeek)
      .reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
  }, [history, activeHistoryWeek]);

  const historyWeeklyFeed = useMemo(() => {
    if (!activeHistoryWeek) return 0;
    return history
      .filter(r => Math.ceil(r.age / 7) === activeHistoryWeek)
      .reduce((sum, r) => sum + (r.dailyFeed || 0), 0);
  }, [history, activeHistoryWeek]);

  const weeklySummaryData = useMemo(() => {
    const summary: Record<number, { deaths: number; feed: number }> = {};
    history.forEach(r => {
      const week = Math.ceil(r.age / 7);
      if (!summary[week]) {
        summary[week] = { deaths: 0, feed: 0 };
      }
      summary[week].deaths += (r.dailyDeaths || 0);
      summary[week].feed += (r.dailyFeed || 0);
    });
    return Object.entries(summary)
      .map(([week, data]) => ({ week: parseInt(week), ...data }))
      .sort((a, b) => b.week - a.week);
  }, [history]);

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

  // Sync harvest age & weight with daily/main state if empty
  useEffect(() => {
    if (!harvestAge && (dailyAge || age)) setHarvestAge(dailyAge || age);
    if (!harvestAvgWeight && dailyWeight) {
      setHarvestAvgWeight(dailyWeight);
      const b = parseFloat(harvestBirds) || 0;
      const aw = parseFloat(dailyWeight) || 0;
      if (b > 0 && aw > 0) {
        setHarvestTotalWeight((b * aw / 1000).toFixed(2));
      }
    }
  }, [age, harvestAge, dailyAge, dailyWeight, harvestAvgWeight, harvestBirds]);

  const stats = useMemo(() => {
    const p1 = parseFloat(initialPop) || 0;
    const p2 = parseFloat(currentPop) || 0;
    const w = parseFloat(totalWeight) || 0;
    const f = parseFloat(totalFeed) || 0;
    const a = parseFloat(age) || 0;

    const df = (parseFloat(dailyFeedSak) || 0) * 50; 
    const dw = parseFloat(dailyWeight) || 0;
    const pw = parseFloat(prevWeight) || 0;
    
    // Dynamic opening population from history
    const histDeaths = history.reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
    const openingPopToday = p1 - histDeaths;
    const pp = openingPopToday;

    if (p1 === 0 || a === 0) return null;

    const mortality = ((p1 - p2) / p1) * 100;
    const avgWeightKg = p2 > 0 ? (w / p2) : 0;
    const fcr = w > 0 ? (f / w) : 0;
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

    const currentDay = parseFloat(dailyAge) || 0;
    const currentWeek = Math.ceil(currentDay / 7);
    
    const weeklyDeathsHistory = history
      .filter(r => Math.ceil(r.age / 7) === currentWeek)
      .reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
    const totalWeeklyDeaths = weeklyDeathsHistory + dailyDeaths;

    const statsWeeklyFeed = history
      .filter(r => Math.ceil(r.age / 7) === currentWeek)
      .reduce((sum, r) => sum + (r.dailyFeed || 0), 0) + df;

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
      mortality: mortality.toFixed(2),
      avgWeight: avgWeightKg.toFixed(3),
      fcr: fcr.toFixed(2),
      ip: ip.toFixed(1),
      ipStatus: getIpStatus(ip),
      statusType: getStatusType(ip),
      feedEfficiency: fcr > 0 ? ((1 / fcr) * 100).toFixed(1) : '0',
      dailyFcr,
      adg: cumulativeAdg.toFixed(1),
      dailyAdg: currentDailyAdg > 0 ? currentDailyAdg.toFixed(1) : null,
      dailyMortality: dailyMortalityRate.toFixed(3),
      dailyDeaths,
      weeklyDeaths: totalWeeklyDeaths,
      weeklyFeed: statsWeeklyFeed.toFixed(1),
      weeklyFeedRaw: statsWeeklyFeed, // for SAK calculation
      currentWeek: currentWeek || '-'
    };
  }, [initialPop, currentPop, totalWeight, totalFeed, age, dailyFeedSak, dailyWeight, prevWeight, history, dailyAge]);

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

  const saveFlock = () => {
    if (!stats) return;
    
    // Choose the appropriate age based on input context
    const finalAge = (view === 'daily' && dailyAge) ? parseFloat(dailyAge) : parseFloat(age);
    
    const p1 = parseFloat(initialPop) || 0;
    const p2 = parseFloat(currentPop) || 0;
    const w = parseFloat(totalWeight) || 0;
    const f = parseFloat(totalFeed) || 0;

    const newRecord: FlockRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      initialPop: p1,
      currentPop: p2,
      totalWeight: w,
      totalFeed: f,
      age: finalAge,
      fcr: parseFloat(stats.fcr),
      ip: parseFloat(stats.ip),
      mortality: parseFloat(stats.mortality),
      dailyFcr: stats.dailyFcr ? parseFloat(stats.dailyFcr) : null,
      adg: parseFloat(stats.adg),
      dailyAdg: stats.dailyAdg ? parseFloat(stats.dailyAdg.toString()) : null,
      dailyDeaths: stats.dailyDeaths,
      dailyFeed: (parseFloat(dailyFeedSak) || 0) * 50,
      totalDeaths: p1 - p2,
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
    const aw = parseFloat(harvestAvgWeight) || 0;
    const tw = parseFloat(harvestTotalWeight) || 0;
    const hAge = parseFloat(harvestAge) || parseFloat(age) || 0;

    if (b <= 0 || (aw <= 0 && tw <= 0) || hAge <= 0) {
      alert('Mohon lengkapi data panen dan umur harian.');
      return;
    }

    // Auto calculate if one is missing
    let finalTw = tw;
    let finalAw = aw;

    if (tw === 0 && aw > 0) finalTw = b * aw / 1000;
    if (aw === 0 && tw > 0) finalAw = (tw * 1000) / b;

    // Calculate IP for this specific harvest
    // Using current flock FCR and Mortality if available, 
    // or deriving it from current total stats
    const currentFcr = stats ? parseFloat(stats.fcr) : 0;
    const currentMortality = stats ? parseFloat(stats.mortality) : 0;
    
    // IP = ((100 - Mortality) * AvgWeightKG) / (FCR * Age) * 100
    const avgWeightKg = finalAw / 1000;
    const calculatedIp = (currentFcr > 0 && hAge > 0) 
      ? (((100 - currentMortality) * avgWeightKg) / (currentFcr * hAge)) * 100 
      : 0;

    const newRecord: HarvestRecord = {
      id: crypto.randomUUID(),
      date: harvestDate,
      birds: b,
      avgWeight: finalAw,
      totalWeight: finalTw,
      age: hAge,
      ip: calculatedIp
    };

    setHarvestHistory(prev => [newRecord, ...prev]);
    setHarvestBirds('');
    setHarvestAvgWeight('');
    setHarvestTotalWeight('');
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
      'Rata-rata Bobot (gr)',
      'Total Bobot (kg)',
      'Indeks Performa (IP)'
    ];

    const rows = harvestHistory.map(r => [
      r.date,
      r.age,
      r.birds,
      r.avgWeight.toFixed(0),
      r.totalWeight.toFixed(2),
      r.ip.toFixed(2)
    ]);

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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-emerald-800 text-white flex items-center justify-between px-8 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-400 rounded-sm flex items-center justify-center font-bold text-emerald-900 text-lg italic">B</div>
          <h1 className="text-xl font-bold tracking-tight uppercase">BroilerPro <span className="font-light opacity-80">Analytics v2.5</span></h1>
        </div>
        
        <nav className="flex items-center bg-emerald-900/50 rounded-lg p-1">
          <button 
            onClick={() => setView('daily')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'daily' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Harian
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
          <button 
            onClick={() => setView('harvest')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'harvest' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Panen
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-2">
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
                            
                            const p1 = parseFloat(initialPop) || 0;
                            const histDeaths = history.reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
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
                            
                            const p1 = parseFloat(initialPop) || 0;
                            const histDeaths = history.reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
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
                      onClick={saveFlock} 
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
                      <h3 className="text-8xl font-black tracking-tighter italic leading-none">{stats?.dailyFcr || '0.00'}</h3>
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
                              return perBirdGr.toFixed(1);
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
                          <span className="text-[10px] font-black text-rose-400">({stats?.dailyMortality || '0.000'}%)</span>
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
                              ({((stats?.weeklyFeedRaw || 0) / 50).toFixed(1)} SAK)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
                      <input type="number" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Pakan Terpakai (kg)</label>
                      <input type="number" value={totalFeed} onChange={(e) => setTotalFeed(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto space-y-3 pt-6 border-t border-slate-100">
                  <button 
                    onClick={saveFlock} 
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
                      <div className="z-10 flex items-center gap-3 mt-6">
                        <span className="px-4 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase">
                          {stats?.ipStatus || '---'}
                        </span>
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
                </div>
              </section>
            </motion.div>
          ) : view === 'harvest' ? (
            <motion.div 
              key="harvest"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden"
            >
              <section className="w-full md:w-96 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 shrink-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Beef size={18} className="text-emerald-600" />
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Input Data Panen</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Tanggal Panen</label>
                      <input 
                        type="date" 
                        value={harvestDate} 
                        onChange={(e) => setHarvestDate(e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Umur Panen (Hari)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={harvestAge} 
                          onChange={(e) => setHarvestAge(e.target.value)} 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">HARI</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Jumlah Ekor Ayam</label>
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
                                setHarvestTotalWeight((b * aw / 1000).toFixed(2));
                              } else if (tw > 0) {
                                setHarvestAvgWeight((tw * 1000 / b).toFixed(0));
                              }
                            }
                          }} 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">EKOR</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-rose-500 uppercase tracking-tight">Bobot Rata-rata Panen (gr/ekor)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={harvestAvgWeight} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setHarvestAvgWeight(val);
                            const b = parseFloat(harvestBirds) || 0;
                            const aw = parseFloat(val) || 0;
                            if (b > 0 && aw > 0) {
                              setHarvestTotalWeight((b * aw / 1000).toFixed(2));
                            }
                          }} 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">gr/ekor</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Berat Panen (kg)</label>
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
                               setHarvestAvgWeight((tw * 1000 / b).toFixed(0));
                            }
                          }} 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">KG</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={saveHarvest}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                  >
                    <Save size={14} /> Simpan Data Panen
                  </button>
                </div>
              </section>

              <section className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Riwayat Panen Per Hari</h4>
                    <button 
                      onClick={exportHarvestToCSV}
                      className="flex items-center gap-1.5 transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest"
                    >
                      <Download size={10} /> Export CSV
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div className="flex flex-col">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Total Birds</p>
                      <p className="text-sm font-black text-slate-900">{harvestHistory.reduce((s, r) => s + r.birds, 0).toLocaleString()} <span className="text-[9px] text-slate-400">EKOR</span></p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Cumulative Mass</p>
                      <p className="text-sm font-black text-emerald-600">{harvestHistory.reduce((s, r) => s + r.totalWeight, 0).toFixed(1)} <span className="text-[9px]">KG</span></p>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 pl-6">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Weighted Avg Weight</p>
                      <p className="text-sm font-black text-slate-900">
                        {(() => {
                          const totalB = harvestHistory.reduce((s, r) => s + r.birds, 0);
                          const totalW = harvestHistory.reduce((s, r) => s + r.totalWeight, 0);
                          return totalB > 0 ? (totalW * 1000 / totalB).toFixed(0) : '0';
                        })()}
                        <span className="text-[9px] text-slate-400 ml-1">GR/EKOR</span>
                      </p>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 pl-6">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Avg IP Panen</p>
                      <p className="text-sm font-black text-emerald-700">
                        {(() => {
                          const count = harvestHistory.length;
                          return count > 0 ? (harvestHistory.reduce((s, r) => s + r.ip, 0) / count).toFixed(1) : '0.0';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-[9px] uppercase font-black tracking-widest text-slate-400">
                      <tr>
                        <th className="py-4 px-6 border-b border-slate-100">Tanggal</th>
                        <th className="py-4 px-6 border-b border-slate-100">Umur</th>
                        <th className="py-4 px-6 border-b border-slate-100">Jumlah Ekor</th>
                        <th className="py-4 px-6 border-b border-slate-100">Rata-rata Bobot</th>
                        <th className="py-4 px-6 border-b border-slate-100">Total Bobot (kg)</th>
                        <th className="py-4 px-6 border-b border-slate-100 font-black text-emerald-600">IP PANEN</th>
                        <th className="py-4 px-6 border-b border-slate-100 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-slate-600">
                      {harvestHistory.map((record) => (
                        <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-slate-400" />
                              {record.date}
                            </div>
                          </td>
                          <td className="py-4 px-6">{record.age} <span className="text-[9px]">hari</span></td>
                          <td className="py-4 px-6 text-slate-900 font-black">{record.birds.toLocaleString()} <span className="text-[9px]">ekor</span></td>
                          <td className="py-4 px-6">{record.avgWeight.toFixed(0)} <span className="text-[9px]">gr</span></td>
                          <td className="py-4 px-6 text-slate-600">{record.totalWeight.toFixed(2)} <span className="text-[9px]">kg</span></td>
                          <td className="py-4 px-6">
                             <div className="flex flex-col">
                               <span className="text-emerald-700 font-black text-lg">{record.ip.toFixed(1)}</span>
                               <span className="text-[8px] font-black uppercase text-slate-400 -mt-1">
                                 {record.ip >= 400 ? 'PREMIUM' : record.ip >= 350 ? 'EXCELLENT' : record.ip >= 300 ? 'STANDARD' : 'UNDER'}
                               </span>
                             </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => deleteHarvestRecord(record.id)}
                              className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {harvestHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                            Belum ada data panen
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                                 <p className="text-lg font-black text-emerald-700 leading-none">{historyWeeklyFeed.toFixed(1)}</p>
                                 <span className="text-[10px] font-black text-emerald-400 mr-1">KG</span>
                                 <span className="text-sm font-black text-emerald-600 leading-none">({(historyWeeklyFeed / 50).toFixed(1)} SAK)</span>
                               </div>
                             </div>
                          </motion.div>
                        </div>
                      )}

                      <button 
                        onClick={exportToCSV}
                        className="text-[10px] font-black text-emerald-600 flex items-center gap-2 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                      >
                        <Download size={14} /> EXPORT CSV
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[9px] uppercase font-black tracking-widest text-slate-400">
                          <tr>
                            <th className="py-4 px-6 border-b border-slate-100">Date/ID</th>
                            <th className="py-4 px-6 border-b border-slate-100">IP</th>
                            <th className="py-4 px-6 border-b border-slate-100">FCR (C/D)</th>
                            <th className="py-4 px-6 border-b border-slate-100">Pop Awal</th>
                            <th className="py-4 px-6 border-b border-slate-100">Pop Akhir</th>
                            <th className="py-4 px-6 border-b border-slate-100">Mati Harian</th>
                            <th className="py-4 px-6 border-b border-slate-100">Mati Minggu</th>
                            <th className="py-4 px-6 border-b border-slate-100">% Mort</th>
                            <th className="py-4 px-6 border-b border-slate-100">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-600">
                          {history.map((record) => (
                            <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
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
                                  {record.ip}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="font-mono text-slate-800">{record.fcr}</span>
                                  {record.dailyFcr && (
                                    <span className="text-[9px] text-emerald-600 font-black uppercase">D: {record.dailyFcr}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-500">{record.initialPop.toLocaleString()} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-slate-900 font-black">{record.currentPop.toLocaleString()} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-rose-500 font-bold">{record.dailyDeaths?.toLocaleString() || 0} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-rose-600 font-bold">{record.weeklyDeaths?.toLocaleString() || 0} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-rose-600">{record.mortality.toFixed(2)}%</td>
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
                              <td colSpan={6} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
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
                          {history.length > 0 ? (history.reduce((a, b) => a + b.ip, 0) / history.length).toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Avg FCR</span>
                        <span className="text-2xl font-black italic">
                          {history.length > 0 ? (history.reduce((a, b) => a + b.fcr, 0) / history.length).toFixed(2) : '0.00'}
                        </span>
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

                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Historical Insight</h3>
                      <div className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Top Performing Flock</p>
                          <p className="text-lg font-black text-slate-900">
                            {history.length > 0 ? Math.max(...history.map(r => r.ip)) : '---'}
                            <span className="text-[10px] text-emerald-500 ml-2">RECORD</span>
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Cycles Logged</p>
                          <p className="text-lg font-black text-slate-900">{history.length}</p>
                        </div>
                      </div>
                      
                      <div className="mt-12 p-4 border-2 border-dashed border-slate-100 rounded-xl text-center">
                         <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                           Data comparison helps optimize feed formula and environmental controls.
                         </p>
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
          <span>&copy; {new Date().getFullYear()} BroilerPro Systems LP</span>
        </div>
      </footer>
    </div>
  );
}
