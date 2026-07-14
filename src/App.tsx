import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Package, 
  Scale, 
  Plus, 
  Activity, 
  Info, 
  ChevronRight, 
  RefreshCw,
  Heart,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';

import { DocCheckIn, DailyRecord, FeedTransaction, FlockStatus } from './types';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { DailyLogTable } from './components/DailyLogTable';
import { InventoryPanel } from './components/InventoryPanel';
import { WeighingDraftPanel } from './components/WeighingDraftPanel';
import { AiRecommendations } from './components/AiRecommendations';

// Pre-populated realistic sample data
const SAMPLE_DOC_CHECKIN: DocCheckIn = {
  id: 'doc-sample',
  date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 28 days ago
  quantity: 10000,
  strain: 'Cobb 500',
  initialWeight: 42,
  pricePerHead: 7200,
  totalCost: 72000000,
  notes: 'DOC Grade A dari Supplier CP Prima',
};

const SAMPLE_DAILY_RECORDS: Omit<DailyRecord, 'id' | 'populationAtStart' | 'populationAtEnd' | 'fcr' | 'ip'>[] = [
  { age: 1, date: '', mortality: 3, feedConsumed: 50, avgWeight: 0.046 },
  { age: 2, date: '', mortality: 2, feedConsumed: 68, avgWeight: 0.057 },
  { age: 3, date: '', mortality: 1, feedConsumed: 88, avgWeight: 0.071 },
  { age: 4, date: '', mortality: 1, feedConsumed: 110, avgWeight: 0.091 },
  { age: 5, date: '', mortality: 2, feedConsumed: 135, avgWeight: 0.116 },
  { age: 6, date: '', mortality: 2, feedConsumed: 168, avgWeight: 0.146 },
  { age: 7, date: '', mortality: 1, feedConsumed: 210, avgWeight: 0.186 },
  { age: 8, date: '', mortality: 3, feedConsumed: 260, avgWeight: 0.231 },
  { age: 9, date: '', mortality: 2, feedConsumed: 310, avgWeight: 0.282 },
  { age: 10, date: '', mortality: 1, feedConsumed: 370, avgWeight: 0.342 },
  { age: 11, date: '', mortality: 1, feedConsumed: 430, avgWeight: 0.407 },
  { age: 12, date: '', mortality: 2, feedConsumed: 500, avgWeight: 0.482 },
  { age: 13, date: '', mortality: 1, feedConsumed: 570, avgWeight: 0.567 },
  { age: 14, date: '', mortality: 2, feedConsumed: 640, avgWeight: 0.662 },
  { age: 15, date: '', mortality: 1, feedConsumed: 710, avgWeight: 0.763 },
  { age: 16, date: '', mortality: 2, feedConsumed: 780, avgWeight: 0.873 },
  { age: 17, date: '', mortality: 1, feedConsumed: 850, avgWeight: 0.988 },
  { age: 18, date: '', mortality: 2, feedConsumed: 920, avgWeight: 1.113 },
  { age: 19, date: '', mortality: 1, feedConsumed: 1000, avgWeight: 1.243 },
  { age: 20, date: '', mortality: 1, feedConsumed: 1080, avgWeight: 1.378 },
  { age: 21, date: '', mortality: 2, feedConsumed: 1160, avgWeight: 1.518 },
  { age: 22, date: '', mortality: 1, feedConsumed: 1240, avgWeight: 1.663 },
  { age: 23, date: '', mortality: 2, feedConsumed: 1320, avgWeight: 1.813 },
  { age: 24, date: '', mortality: 1, feedConsumed: 1400, avgWeight: 1.968 },
  { age: 25, date: '', mortality: 1, feedConsumed: 1480, avgWeight: 2.128 },
  { age: 26, date: '', mortality: 2, feedConsumed: 1560, avgWeight: 2.293 },
  { age: 27, date: '', mortality: 1, feedConsumed: 1640, avgWeight: 2.463 },
  { age: 28, date: '', mortality: 1, feedConsumed: 1720, avgWeight: 2.638 },
];

const SAMPLE_TRANSACTIONS: FeedTransaction[] = [
  { id: 'tx-1', date: '', type: 'IN', quantity: 15000, brand: 'BR-1 Pre-starter', notes: 'Pembelian pakan awal siklus' },
  { id: 'tx-2', date: '', type: 'IN', quantity: 10000, brand: 'BR-2 Starter', notes: 'Pembelian pakan lanjutan' },
];

export default function App() {
  // Core Persistence States
  const [docCheckIn, setDocCheckIn] = useState<DocCheckIn | null>(() => {
    const saved = localStorage.getItem('erfours_broiler_doc');
    return saved ? JSON.parse(saved) : null;
  });

  const [rawRecords, setRawRecords] = useState<DailyRecord[]>(() => {
    const saved = localStorage.getItem('erfours_broiler_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<FeedTransaction[]>(() => {
    const saved = localStorage.getItem('erfours_broiler_tx');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'charts' | 'logs' | 'inventory' | 'harvest' | 'ai'>('charts');

  // Chick Form Setup State
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [docQty, setDocQty] = useState(10000);
  const [docStrain, setDocStrain] = useState('Cobb 500');
  const [docWt, setDocWt] = useState(42);
  const [docPrice, setDocPrice] = useState(7200);
  const [docNotes, setDocNotes] = useState('');

  // 1. Math State Derived Engine
  const processedRecords = useMemo(() => {
    if (!docCheckIn) return [];

    // Sort records by age ascending
    const sorted = [...rawRecords].sort((a, b) => a.age - b.age);
    let cumulativeMortality = 0;
    let cumulativeFeed = 0;

    return sorted.map((r, index) => {
      cumulativeMortality += r.mortality;
      cumulativeFeed += r.feedConsumed;

      const populationAtStart = index === 0 
        ? docCheckIn.quantity 
        : docCheckIn.quantity - (cumulativeMortality - r.mortality);
      
      const populationAtEnd = docCheckIn.quantity - cumulativeMortality;
      const liveability = (populationAtEnd / docCheckIn.quantity) * 100;

      // FCR Cumulative = cumulative feed consumed / cumulative biomass
      // Biomass = populationAtEnd * avgWeight
      const totalBiomass = populationAtEnd * r.avgWeight;
      const fcr = totalBiomass > 0 ? cumulativeFeed / totalBiomass : 0;

      // Performance Index (IP) = (SR% * AverageWeight * 100) / (FCR * Age)
      const ip = (fcr > 0 && r.age > 0) 
        ? (liveability * r.avgWeight * 100) / (fcr * r.age) 
        : 0;

      return {
        ...r,
        populationAtStart,
        populationAtEnd,
        fcr,
        ip
      };
    });
  }, [rawRecords, docCheckIn]);

  // Derived Overall Flock Stats
  const flockStats = useMemo<FlockStatus>(() => {
    if (!docCheckIn) {
      return {
        initialPopulation: 0,
        currentPopulation: 0,
        age: 0,
        totalMortality: 0,
        totalFeedConsumed: 0,
        currentAvgWeight: 0,
        currentFcr: 0,
        currentIp: 0
      };
    }

    const latestRecord = processedRecords[processedRecords.length - 1];
    const totalMortality = rawRecords.reduce((sum, r) => sum + r.mortality, 0);
    const totalFeedConsumed = rawRecords.reduce((sum, r) => sum + r.feedConsumed, 0);

    return {
      initialPopulation: docCheckIn.quantity,
      currentPopulation: docCheckIn.quantity - totalMortality,
      age: latestRecord ? latestRecord.age : 0,
      totalMortality,
      totalFeedConsumed,
      currentAvgWeight: latestRecord ? latestRecord.avgWeight : 0,
      currentFcr: latestRecord ? (latestRecord.fcr || 0) : 0,
      currentIp: latestRecord ? (latestRecord.ip || 0) : 0
    };
  }, [docCheckIn, processedRecords, rawRecords]);

  // Standard Cobb-500 Growth Comparison Data for chart
  const growthChartData = useMemo(() => {
    return processedRecords.map((r) => {
      // Cobb 500 standard weights at days (approximate linear interpolation)
      // D1: 0.045, D7: 0.180, D14: 0.480, D21: 0.950, D28: 1.550, D35: 2.250
      let stdWeight = 0;
      if (r.age === 1) stdWeight = 0.045;
      else if (r.age <= 7) stdWeight = 0.045 + ((r.age - 1) / 6) * (0.180 - 0.045);
      else if (r.age <= 14) stdWeight = 0.180 + ((r.age - 7) / 7) * (0.480 - 0.180);
      else if (r.age <= 21) stdWeight = 0.480 + ((r.age - 14) / 7) * (0.950 - 0.480);
      else if (r.age <= 28) stdWeight = 0.950 + ((r.age - 21) / 7) * (1.550 - 0.950);
      else stdWeight = 1.550 + ((r.age - 28) / 7) * (2.250 - 1.550);

      return {
        hari: `Hari ${r.age}`,
        'Berat Aktual (kg)': Number(r.avgWeight.toFixed(3)),
        'Standar Cobb-500 (kg)': Number(stdWeight.toFixed(3)),
        'FCR Kumulatif': Number((r.fcr || 0).toFixed(3)),
        'Mati Harian': r.mortality
      };
    });
  }, [processedRecords]);

  // Handlers for Data Mutation
  const handleLoadSample = () => {
    const now = new Date();
    
    // Setup sample DOC Check-in with date offset
    const sampleDoc: DocCheckIn = {
      ...SAMPLE_DOC_CHECKIN,
      date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    // Setup sample Daily Records with appropriate dates
    const sampleRecords = SAMPLE_DAILY_RECORDS.map((r, index) => {
      const recDate = new Date(now.getTime() - (28 - index - 1) * 24 * 60 * 60 * 1000);
      return {
        ...r,
        id: `rec-${index + 1}`,
        date: recDate.toISOString().split('T')[0]
      } as DailyRecord;
    });

    // Setup sample transactions with dates
    const sampleTransactions = SAMPLE_TRANSACTIONS.map((tx, index) => {
      const txDate = new Date(now.getTime() - (28 - index * 10) * 24 * 60 * 60 * 1000);
      return {
        ...tx,
        date: txDate.toISOString().split('T')[0]
      };
    });

    setDocCheckIn(sampleDoc);
    setRawRecords(sampleRecords);
    setTransactions(sampleTransactions);

    localStorage.setItem('erfours_broiler_doc', JSON.stringify(sampleDoc));
    localStorage.setItem('erfours_broiler_records', JSON.stringify(sampleRecords));
    localStorage.setItem('erfours_broiler_tx', JSON.stringify(sampleTransactions));
    localStorage.removeItem('erfours_broiler_ai_rec'); // clear sample AI recommendations to allow fresh fetch
  };

  const handleStartBlank = (e: React.FormEvent) => {
    e.preventDefault();
    const docData: DocCheckIn = {
      id: `doc-${Date.now()}`,
      date: docDate,
      quantity: Number(docQty),
      strain: docStrain,
      initialWeight: Number(docWt),
      pricePerHead: Number(docPrice),
      totalCost: docQty * docPrice,
      notes: docNotes || undefined
    };

    setDocCheckIn(docData);
    setRawRecords([]);
    setTransactions([]);

    localStorage.setItem('erfours_broiler_doc', JSON.stringify(docData));
    localStorage.setItem('erfours_broiler_records', JSON.stringify([]));
    localStorage.setItem('erfours_broiler_tx', JSON.stringify([]));
    localStorage.removeItem('erfours_broiler_ai_rec');
  };

  const handleAddRecord = (record: Omit<DailyRecord, 'id' | 'populationAtStart' | 'populationAtEnd' | 'fcr' | 'ip'>) => {
    const newRec: DailyRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      populationAtStart: 0, // derived
      populationAtEnd: 0, // derived
    };

    const updated = [...rawRecords, newRec].sort((a, b) => a.age - b.age);
    setRawRecords(updated);
    localStorage.setItem('erfours_broiler_records', JSON.stringify(updated));
  };

  const handleEditRecord = (id: string, updatedFields: Partial<DailyRecord>) => {
    const updated = rawRecords.map((r) => {
      if (r.id === id) {
        return { ...r, ...updatedFields };
      }
      return r;
    });
    setRawRecords(updated);
    localStorage.setItem('erfours_broiler_records', JSON.stringify(updated));
  };

  const handleDeleteRecord = (id: string) => {
    const updated = rawRecords.filter((r) => r.id !== id);
    setRawRecords(updated);
    localStorage.setItem('erfours_broiler_records', JSON.stringify(updated));
  };

  const handleAddTransaction = (tx: Omit<FeedTransaction, 'id'>) => {
    const newTx: FeedTransaction = {
      ...tx,
      id: `tx-${Date.now()}`
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('erfours_broiler_tx', JSON.stringify(updated));
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('erfours_broiler_tx', JSON.stringify(updated));
  };

  const handleResetFlock = () => {
    setDocCheckIn(null);
    setRawRecords([]);
    setTransactions([]);
    localStorage.removeItem('erfours_broiler_doc');
    localStorage.removeItem('erfours_broiler_records');
    localStorage.removeItem('erfours_broiler_tx');
    localStorage.removeItem('erfours_broiler_ai_rec');
  };

  const handleExportData = () => {
    const exportObj = {
      docCheckIn,
      rawRecords,
      transactions
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_Erfours_BroilerPro_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.docCheckIn) {
        setDocCheckIn(parsed.docCheckIn);
        setRawRecords(parsed.rawRecords || []);
        setTransactions(parsed.transactions || []);

        localStorage.setItem('erfours_broiler_doc', JSON.stringify(parsed.docCheckIn));
        localStorage.setItem('erfours_broiler_records', JSON.stringify(parsed.rawRecords || []));
        localStorage.setItem('erfours_broiler_tx', JSON.stringify(parsed.transactions || []));
        alert("Restorasi data backup berhasil!");
      } else {
        alert("Format file tidak valid. Pastikan file backup diunduh dari aplikasi Erfours BroilerPro.");
      }
    } catch (e) {
      alert("Gagal mengurai file JSON backup. File corrupt.");
    }
  };

  return (
    <div className="min-h-screen bg-[#060a13] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-white">
      {/* 2. Onboarding/Setup state */}
      {!docCheckIn ? (
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div id="flock-setup-onboarding" className="max-w-2xl w-full glass-card border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -ml-24 -mt-12" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mb-12" />

            <div className="text-center mb-8 relative">
              <div className="p-3 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-2xl w-max mx-auto shadow-xl">
                <Heart className="w-8 h-8 text-slate-950 animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-4 tracking-tight">Selamat Datang di Erfours BroilerPro</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Kelola pencatatan harian FCR, monitoring bobot badan, biosekuriti kandang, kalkulator panen, dan konsultasi kecerdasan buatan Gemini AI.
              </p>
            </div>

            {/* Quick action: Load Sample vs Start New */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div 
                id="onboard-load-sample"
                onClick={handleLoadSample}
                className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all duration-300 group cursor-pointer active:scale-98"
              >
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500/20 transition-all">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold">Rekomendasi</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-4 font-sans">Mulai Dengan Contoh Performa</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Gunakan data simulasi peternakan (10,000 ekor, umur 28 hari) untuk mencoba grafik pertumbuhan, log pakan, inventaris, dan Gemini AI langsung.
                </p>
              </div>

              <div 
                id="onboard-start-new"
                className="p-5 bg-slate-900/30 border border-slate-800/60 rounded-2xl text-left"
              >
                <span className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl inline-block">
                  <Plus className="w-5 h-5" />
                </span>
                <h4 className="text-sm font-bold text-slate-300 mt-4 font-sans">Mulai Siklus Baru (Kosong)</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Inisiasi peternakan ayam baru Anda dari awal. Masukkan detail DOC harian Anda di formulir pendaftaran di bawah ini.
                </p>
              </div>
            </div>

            {/* Initial Registration Form */}
            <form onSubmit={handleStartBlank} className="border-t border-slate-800/80 pt-6">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono block mb-4">Formulir Check-in DOC Baru</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Tanggal Tiba DOC</label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/80 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Strain / Bibit DOC</label>
                  <input
                    type="text"
                    value={docStrain}
                    onChange={(e) => setDocStrain(e.target.value)}
                    required
                    placeholder="e.g. Cobb 500, Ross 308, CP 707"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/80"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Jumlah Populasi (Ekor)</label>
                  <input
                    type="number"
                    value={docQty}
                    onChange={(e) => setDocQty(Number(e.target.value))}
                    required
                    min="100"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/80 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Bobot Rata-rata DOC (gram)</label>
                  <input
                    type="number"
                    value={docWt}
                    onChange={(e) => setDocWt(Number(e.target.value))}
                    required
                    min="10"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/80 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Harga Per Ekor (IDR)</label>
                  <input
                    type="number"
                    value={docPrice}
                    onChange={(e) => setDocPrice(Number(e.target.value))}
                    required
                    min="100"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/80 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Keterangan / Notes</label>
                  <input
                    type="text"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="e.g. Vaksin ND-IB lengkap, lincah"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/80"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/15 active:scale-99 cursor-pointer"
                >
                  Daftarkan & Inisiasi Siklus Peternakan
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Active Dashboard Workspace */
        <>
          <Header
            docCheckIn={docCheckIn}
            onImportData={handleImportData}
            onExportData={handleExportData}
            onResetFlock={handleResetFlock}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-y-auto">
            {/* Key KPI Stats Header */}
            <DashboardStats stats={flockStats} />

            {/* Dashboard Workspace navigation menu */}
            <div className="flex border-b border-slate-800 mb-6 gap-1 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'charts'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Grafik & Analisis Performa
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'logs'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Catatan Harian
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                Gudang Pakan (Inventaris)
              </button>

              <button
                onClick={() => setActiveTab('harvest')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'harvest'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Scale className="w-4 h-4" />
                Kalkulator Panen
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'ai'
                    ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Konsultasi AI (Gemini)
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                {/* Chart 1: Actual Body Weight vs Standard Cobb-500 */}
                <div id="chart-weight-panel" className="glass-card rounded-2xl border border-slate-800 p-5">
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">Pertumbuhan Fisik</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Bobot Badan Aktual vs Standar Cobb-500</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Membandingkan target genetik optimal dengan hasil riil lapangan</p>
                  </div>

                  <div className="h-[300px] w-full font-mono text-[10px]">
                    {growthChartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                        Belum ada data harian untuk di-grafikkan.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                          <XAxis dataKey="hari" stroke="#475569" />
                          <YAxis stroke="#475569" unit=" kg" />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <Legend verticalAlign="top" height={36}/>
                          <Area type="monotone" dataKey="Berat Aktual (kg)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                          <Area type="monotone" dataKey="Standar Cobb-500 (kg)" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorStd)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Chart 2: Cumulative FCR Trend */}
                <div id="chart-fcr-panel" className="glass-card rounded-2xl border border-slate-800 p-5">
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">Konversi Nutrisi</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Tren Perkembangan FCR Kumulatif</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Melacak keefektifan pakan untuk diubah menjadi bobot daging harian</p>
                  </div>

                  <div className="h-[300px] w-full font-mono text-[10px]">
                    {growthChartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                        Belum ada data harian untuk di-grafikkan.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                          <XAxis dataKey="hari" stroke="#475569" />
                          <YAxis stroke="#475569" domain={['auto', 'auto']} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <Legend verticalAlign="top" height={36}/>
                          <Line type="monotone" dataKey="FCR Kumulatif" stroke="#f59e0b" strokeWidth={2.5} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Mortality Trend and Liveability card summary */}
                <div id="quick-biosecurity-bento" className="lg:col-span-2 glass-card rounded-2xl border border-slate-800 p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-rose-400 font-bold block">Kematian Kumulatif</span>
                    <h3 className="text-xl font-extrabold text-white mt-1">{flockStats.totalMortality} ekor</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Tingkat kematian kumulatif harus dijaga di bawah <strong className="text-rose-400">4%</strong> hingga panen untuk menjamin keuntungan maksimal.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">Survival Rate (SR)</span>
                    <h3 className="text-xl font-extrabold text-emerald-400 mt-1">
                      {docCheckIn ? ((flockStats.currentPopulation / docCheckIn.quantity) * 100).toFixed(2) : 0}%
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Persentase kelangsungan hidup ternak saat ini. Angka di atas <strong className="text-emerald-400">95%</strong> menandakan biosekuriti kandang berjalan kondusif.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold block">Indeks Efisiensi Pakan (FCR)</span>
                    <h3 className="text-xl font-extrabold text-white mt-1">
                      {flockStats.currentFcr > 0 ? flockStats.currentFcr.toFixed(3) : '-'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Rasio konversi pakan kumulatif akhir. Menghabiskan total <strong className="text-indigo-400">{flockStats.totalFeedConsumed.toLocaleString('id-ID')} kg</strong> pakan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <DailyLogTable
                records={processedRecords}
                initialPopulation={docCheckIn.quantity}
                onAddRecord={handleAddRecord}
                onEditRecord={handleEditRecord}
                onDeleteRecord={handleDeleteRecord}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryPanel
                transactions={transactions}
                dailyRecords={rawRecords}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {activeTab === 'harvest' && (
              <WeighingDraftPanel />
            )}

            {activeTab === 'ai' && (
              <AiRecommendations
                dailyRecords={processedRecords}
                currentStatus={{
                  age: flockStats.age,
                  avgWeight: flockStats.currentAvgWeight,
                  fcr: flockStats.currentFcr,
                  totalMortality: flockStats.totalMortality,
                }}
              />
            )}
          </main>
        </>
      )}

      {/* Elegant minimalist footer */}
      <footer className="mt-auto border-t border-slate-900/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
        <span>© {new Date().getFullYear()} Erfours BroilerPro. Made for Professional Broiler Farms.</span>
        <div className="flex gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Panduan Budidaya</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Standar Cobb-500</span>
        </div>
      </footer>
    </div>
  );
}
