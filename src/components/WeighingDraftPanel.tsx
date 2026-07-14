import React, { useState, useEffect } from 'react';
import { Scale, Plus, Trash2, Calculator, DollarSign, ChevronRight, HelpCircle } from 'lucide-react';

interface DraftRecord {
  id: string;
  count: number; // bird count
  weight: number; // total weight in kg
}

export const WeighingDraftPanel: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftRecord[]>([
    { id: '1', count: 15, weight: 26.25 },
    { id: '2', count: 15, weight: 27.00 },
    { id: '3', count: 12, weight: 22.20 },
    { id: '4', count: 16, weight: 29.60 },
  ]);

  // Pricing & Harvest Input
  const [pricePerKg, setPricePerKg] = useState<number>(21500); // IDR Rp 21.500
  const [totalFlockCount, setTotalFlockCount] = useState<number>(9500); // Estimasi populasi panen

  // New Draft Form
  const [newCount, setNewCount] = useState<number>(15);
  const [newWeight, setNewWeight] = useState<number>(27.5);

  const handleAddDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCount <= 0 || newWeight <= 0) return;
    setDrafts([
      ...drafts,
      {
        id: Date.now().toString(),
        count: Number(newCount),
        weight: Number(newWeight),
      }
    ]);
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter((d) => d.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Kosongkan lembar timbangan?")) {
      setDrafts([]);
    }
  };

  // Aggregate Calculations
  const totalBirdsWeighed = drafts.reduce((sum, d) => sum + d.count, 0);
  const totalWeightWeighed = drafts.reduce((sum, d) => sum + d.weight, 0);
  const avgBirdWeight = totalBirdsWeighed > 0 ? totalWeightWeighed / totalBirdsWeighed : 0;

  // Harvest Estimations
  const estimatedTotalWeight = totalFlockCount * avgBirdWeight;
  const estimatedRevenue = estimatedTotalWeight * pricePerKg;

  // Weight Distribution calculations (using mock normal-ish spread based on average weight)
  // Let's create a realistic distribution based on typical poultry statistics:
  // Underweight < avgWeight * 0.85
  // Overweight > avgWeight * 1.15
  // Standard is in between
  const underweightRatio = 0.12; // 12%
  const standardRatio = 0.73; // 73%
  const overweightRatio = 0.15; // 15%

  const estUnderweightBirds = Math.round(totalFlockCount * underweightRatio);
  const estStandardBirds = Math.round(totalFlockCount * standardRatio);
  const estOverweightBirds = Math.round(totalFlockCount * overweightRatio);

  const estUnderweightWeight = estUnderweightBirds * (avgBirdWeight * 0.82);
  const estStandardWeight = estStandardBirds * avgBirdWeight;
  const estOverweightWeight = estOverweightBirds * (avgBirdWeight * 1.18);

  return (
    <div id="harvest-weighing-draft" className="glass-card rounded-2xl border border-slate-800 p-6 mb-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-500" />
          Kalkulator Timbangan & Draft Panen (Harvest Calculator)
        </h2>
        <p className="text-xs text-slate-400">Simulasikan penimbangan sampel kelompok & proyeksikan hasil pendapatan panen secara detail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Weighing Draft Sheets */}
        <div className="lg:col-span-5 p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase">Lembar Timbang Kelompok</span>
            {drafts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] text-rose-400 hover:text-rose-300 underline font-mono cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Form to Add Draft */}
          <form onSubmit={handleAddDraft} className="grid grid-cols-3 gap-2 mb-4 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-mono text-slate-500">Jumlah Ayam</span>
              <input
                type="number"
                value={newCount}
                onChange={(e) => setNewCount(Number(e.target.value))}
                min="1"
                required
                className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/80"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-mono text-slate-500">Total Berat (Kg)</span>
              <input
                type="number"
                step="0.01"
                value={newWeight}
                onInput={(e: any) => setNewWeight(Number(e.target.value))}
                min="0.1"
                required
                className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/80"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Timbang
              </button>
            </div>
          </form>

          {/* Draft List */}
          <div className="max-h-[220px] overflow-y-auto flex flex-col gap-1.5 pr-1">
            {drafts.map((d, index) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-900/80 rounded-lg hover:border-slate-800 transition-all font-mono text-xs"
              >
                <span className="text-slate-500">Draft #{index + 1}</span>
                <div className="flex gap-4">
                  <span>
                    <span className="text-slate-400 font-bold">{d.count}</span> <span className="text-[10px] text-slate-600">ekor</span>
                  </span>
                  <span>
                    <span className="text-amber-400 font-bold">{d.weight.toFixed(2)}</span> <span className="text-[10px] text-slate-600">kg</span>
                  </span>
                  <span className="text-cyan-400">
                    ≈ {(d.weight / d.count).toFixed(3)} <span className="text-[9px] text-slate-600">kg/ekor</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDraft(d.id)}
                  className="text-slate-600 hover:text-rose-400 transition-all p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {drafts.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-xs">
                Belum ada draft timbangan harian. Masukkan sampel data di atas.
              </div>
            )}
          </div>

          {/* Draft Summary */}
          {drafts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 text-center font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[9px]">Total Sampel</span>
                <span className="text-slate-200 font-bold">{totalBirdsWeighed} ekor</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">Total Berat</span>
                <span className="text-slate-200 font-bold">{totalWeightWeighed.toFixed(2)} kg</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">Rata Bobot</span>
                <span className="text-amber-400 font-bold">{(avgBirdWeight).toFixed(3)} kg</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Financial Calculations & Distribution Projection */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input fields */}
            <div className="flex flex-col gap-1.5 p-4 bg-slate-900/30 border border-slate-850 rounded-xl">
              <label className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                Populasi Panen (ekor)
              </label>
              <input
                type="number"
                value={totalFlockCount}
                onInput={(e: any) => setTotalFlockCount(Number(e.target.value))}
                min="100"
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500/80"
              />
              <span className="text-[10px] text-slate-500">Jumlah estimasi ayam saat dipanen</span>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-slate-900/30 border border-slate-850 rounded-xl">
              <label className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                Harga Pakan/Bobot Ayam (Rp/Kg)
              </label>
              <input
                type="number"
                value={pricePerKg}
                onInput={(e: any) => setPricePerKg(Number(e.target.value))}
                min="1000"
                step="100"
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500/80"
              />
              <span className="text-[10px] text-slate-500">Harga pasar ayam hidup per kg</span>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="my-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <h4 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider mb-3">
              Proyeksi Hasil Panen Kumulatif
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">ESTIMASI TOTAL TONASE</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {estimatedTotalWeight.toLocaleString('id-ID', { maximumFractionDigits: 1 })} <span className="text-xs text-slate-400 font-normal">kg</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                  ≈ {(estimatedTotalWeight / 1000).toFixed(2)} Ton
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">ESTIMASI REVENUE (PENDAPATAN)</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  Rp {Math.round(estimatedRevenue).toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                  Berdasarkan rata-rata {(avgBirdWeight).toFixed(3)} kg/ekor
                </span>
              </div>
            </div>
          </div>

          {/* Weight Distribution Yield Estimates */}
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase block mb-3">Estimasi Distribusi Berat Ayam</span>
            <div className="flex flex-col gap-3">
              {/* Underweight */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Underweight (&lt; 1.3 kg)</span>
                  <span className="text-rose-400">{estUnderweightBirds.toLocaleString('id-ID')} ekor ({underweightRatio * 100}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${underweightRatio * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 text-right mt-0.5 font-mono">
                  Est. Berat: {estUnderweightWeight.toLocaleString('id-ID', { maximumFractionDigits: 0 })} kg
                </div>
              </div>

              {/* Standard */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Standard (1.3 - 1.8 kg)</span>
                  <span className="text-emerald-400">{estStandardBirds.toLocaleString('id-ID')} ekor ({standardRatio * 100}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${standardRatio * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 text-right mt-0.5 font-mono">
                  Est. Berat: {estStandardWeight.toLocaleString('id-ID', { maximumFractionDigits: 0 })} kg
                </div>
              </div>

              {/* Overweight */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Overweight (&gt; 1.8 kg)</span>
                  <span className="text-cyan-400">{estOverweightBirds.toLocaleString('id-ID')} ekor ({overweightRatio * 100}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${overweightRatio * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 text-right mt-0.5 font-mono">
                  Est. Berat: {estOverweightWeight.toLocaleString('id-ID', { maximumFractionDigits: 0 })} kg
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
