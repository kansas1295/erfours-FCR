import React from 'react';
import { Activity, Flame, Scale, Package, HelpCircle, Info } from 'lucide-react';
import { FlockStatus } from '../types';

interface DashboardStatsProps {
  stats: FlockStatus;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const getIpRating = (ip: number) => {
    if (ip === 0) return { label: 'Belum Ada Data', color: 'text-slate-400 bg-slate-900/50 border-slate-800' };
    if (ip >= 350) return { label: 'Istimewa (Sangat Baik)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (ip >= 325) return { label: 'Bagus (Di Atas Standar)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    if (ip >= 300) return { label: 'Cukup (Standar)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Kurang (Perlu Evaluasi)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const rating = getIpRating(stats.currentIp);
  const liveability = stats.initialPopulation > 0 
    ? (stats.currentPopulation / stats.initialPopulation) * 100 
    : 0;

  const totalBiomass = (stats.currentPopulation * stats.currentAvgWeight); // in kg

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Performance Index (IP) Card */}
      <div 
        id="stat-card-ip" 
        className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-slate-400 text-xs font-medium font-sans">Indeks Performa (IP)</span>
            <h3 id="stat-value-ip" className="text-3xl font-bold tracking-tight text-white font-mono mt-1.5">
              {stats.currentIp > 0 ? Math.round(stats.currentIp) : '-'}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-2">
          {stats.currentIp > 0 && (
            <div id="ip-rating-badge" className={`text-[10px] font-mono px-2 py-1 rounded-md border inline-block text-center ${rating.color}`}>
              {rating.label}
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-400 cursor-help group/tip">
            <Info className="w-3.5 h-3.5" />
            <span>Rumus: (SR% x BB x 100) / (FCR x Umur)</span>
            <div className="absolute hidden group-hover/tip:block bg-slate-950 border border-slate-800 text-[10px] text-slate-300 p-2.5 rounded-lg shadow-xl -bottom-24 left-4 right-4 z-20 font-sans leading-relaxed">
              <strong>SR (Survival Rate):</strong> Persentase ayam hidup harian. <br/>
              <strong>BB (Bobot Badan):</strong> Berat rata-rata per ekor (kg). <br/>
              <strong>FCR:</strong> Rasio konversi pakan kumulatif.
            </div>
          </div>
        </div>
      </div>

      {/* Feed Conversion Ratio (FCR) Card */}
      <div 
        id="stat-card-fcr" 
        className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-slate-400 text-xs font-medium font-sans">FCR Kumulatif</span>
            <h3 id="stat-value-fcr" className="text-3xl font-bold tracking-tight text-white font-mono mt-1.5">
              {stats.currentFcr > 0 ? stats.currentFcr.toFixed(3) : '-'}
            </h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-xs text-slate-400">
          <div className="flex justify-between items-center font-mono">
            <span>Total Pakan:</span>
            <span className="text-slate-200 font-semibold">{stats.totalFeedConsumed.toLocaleString('id-ID')} kg</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Standar target:</span>
            <span>~1.20 - 1.55</span>
          </div>
        </div>
      </div>

      {/* Liveability / Populasi Card */}
      <div 
        id="stat-card-pop" 
        className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-slate-400 text-xs font-medium font-sans">Liveability (SR)</span>
            <h3 id="stat-value-liveability" className="text-3xl font-bold tracking-tight text-white font-mono mt-1.5">
              {liveability.toFixed(2)}%
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-xs text-slate-400">
          <div className="flex justify-between items-center font-mono">
            <span>Ayam Hidup:</span>
            <span className="text-emerald-400 font-semibold">
              {stats.currentPopulation.toLocaleString('id-ID')} / {stats.initialPopulation.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center font-mono text-[10px] text-rose-400">
            <span>Mortalitas:</span>
            <span>{stats.totalMortality} ekor ({stats.initialPopulation > 0 ? ((stats.totalMortality / stats.initialPopulation) * 100).toFixed(2) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Average Weight / Biomass Card */}
      <div 
        id="stat-card-weight" 
        className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-slate-400 text-xs font-medium font-sans">Rata-rata Bobot</span>
            <h3 id="stat-value-weight" className="text-3xl font-bold tracking-tight text-white font-mono mt-1.5">
              {stats.currentAvgWeight > 0 ? `${stats.currentAvgWeight.toFixed(3)} kg` : '-'}
            </h3>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-xs text-slate-400">
          <div className="flex justify-between items-center font-mono">
            <span>Estimasi Biomass:</span>
            <span className="text-cyan-400 font-semibold">{totalBiomass.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg</span>
          </div>
          <div className="flex justify-between items-center font-mono text-[10px] text-slate-500">
            <span>Umur Saat Ini:</span>
            <span>{stats.age} Hari</span>
          </div>
        </div>
      </div>
    </div>
  );
};
