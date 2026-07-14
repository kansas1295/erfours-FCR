import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Lightbulb, TrendingUp, CheckSquare } from 'lucide-react';
import Markdown from 'react-markdown';
import { DailyRecord } from '../types';

interface AiRecommendationsProps {
  dailyRecords: DailyRecord[];
  currentStatus: {
    age: number;
    avgWeight: number;
    fcr: number;
    totalMortality: number;
  };
}

export const AiRecommendations: React.FC<AiRecommendationsProps> = ({
  dailyRecords,
  currentStatus,
}) => {
  const [recommendation, setRecommendation] = useState<string>(() => {
    return localStorage.getItem('erfours_broiler_ai_rec') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadingSteps = [
    "Menganalisis tren FCR harian vs standar FCR kumulatif...",
    "Mengevaluasi grafik kenaikan bobot badan ayam harian...",
    "Mengkalkulasi persentase kelangsungan hidup (Liveability)...",
    "Memformulasikan rekomendasi pakan terbaik menggunakan model Gemini AI...",
    "Menyusun saran lapangan taktis, bio-sekuriti & tata cahaya..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const fetchRecommendations = async () => {
    if (dailyRecords.length === 0) {
      setError("Catatan performa harian masih kosong. Harap tambahkan setidaknya 1 log harian sebelum berkonsultasi.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: dailyRecords,
          currentStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghubungi asisten AI.");
      }

      const data = await response.json();
      setRecommendation(data.recommendation);
      localStorage.setItem('erfours_broiler_ai_rec', data.recommendation);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat rekomendasi AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-recommendations-panel" className="glass-card rounded-2xl border border-slate-800 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            Asisten AI Ahli Broiler (Gemini Consultant)
          </h2>
          <p className="text-xs text-slate-400">Analisis cerdas performa pakan harian & rekomendasi perbaikan biosekuriti kandang</p>
        </div>

        <button
          id="btn-trigger-ai-rec"
          onClick={fetchRecommendations}
          disabled={isLoading || dailyRecords.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 text-xs font-bold rounded-xl transition-all duration-200 shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? 'Menganalisis Performa...' : 'Dapatkan Rekomendasi AI'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h5 className="font-bold">Tidak Dapat Memuat Rekomendasi</h5>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Block */}
      {isLoading ? (
        <div className="p-12 border border-slate-800 bg-slate-900/10 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-amber-500/10 rounded-full animate-pulse border border-amber-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <p className="text-sm font-semibold text-white mb-2 font-mono">
            Memproses Konsultasi...
          </p>
          <p className="text-xs text-slate-400 animate-fade-in font-sans max-w-md h-8 transition-all duration-500">
            {loadingSteps[loadingStep]}
          </p>
        </div>
      ) : recommendation ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-300">
          {/* Quick Stats Evaluated Card */}
          <div className="xl:col-span-3 p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col gap-4 font-mono text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Metrik yang Dievaluasi AI</span>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Umur Analisis</span>
              <span className="text-white font-semibold">{currentStatus.age} Hari</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Rata Bobot</span>
              <span className="text-white font-semibold">{currentStatus.avgWeight.toFixed(3)} kg</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Rasio FCR</span>
              <span className="text-amber-400 font-bold">{currentStatus.fcr.toFixed(3)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Mortalitas</span>
              <span className="text-rose-400 font-semibold">{currentStatus.totalMortality} ekor</span>
            </div>

            <div className="mt-auto p-3 bg-amber-500/5 rounded-lg border border-amber-500/10 text-[10px] text-slate-400 leading-relaxed font-sans">
              Rekomendasi di-generate menggunakan model canggih <strong>Gemini 3.5 Flash</strong> dengan mengawinkan riwayat pakan harian Anda vs standar industri modern.
            </div>
          </div>

          {/* AI Response Display Block */}
          <div className="xl:col-span-9 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
            
            {/* Custom Styling for the Markdown Body */}
            <div className="markdown-body text-slate-300 text-xs leading-relaxed space-y-4">
              <Markdown>{recommendation}</Markdown>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
          <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Asisten AI Siap Melakukan Analisis.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Klik tombol "Dapatkan Rekomendasi AI" untuk menganalisis data FCR, tren bobot badan, dan biosekuriti kandang broiler harian Anda secara real-time.
          </p>
        </div>
      )}
    </div>
  );
};
