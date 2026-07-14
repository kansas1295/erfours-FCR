import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Download, Upload, RefreshCw, Feather } from 'lucide-react';
import { DocCheckIn } from '../types';

interface HeaderProps {
  docCheckIn: DocCheckIn | null;
  onImportData: (data: string) => void;
  onExportData: () => void;
  onResetFlock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  docCheckIn,
  onImportData,
  onExportData,
  onResetFlock,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImportData(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-xl shadow-lg shadow-amber-500/10">
          <Feather className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              Erfours BroilerPro
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
              v1.2.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Sistem Monitoring Performa & FCR Ayam Broiler Harian
          </p>
        </div>
      </div>

      {docCheckIn && (
        <div className="hidden lg:flex items-center gap-6 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Strain / Supplier</span>
            <span className="text-emerald-400 font-semibold">{docCheckIn.strain}</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Check-in DOC</span>
            <span className="text-slate-200">{new Date(docCheckIn.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Populasi Awal</span>
            <span className="text-amber-400 font-semibold">{docCheckIn.quantity.toLocaleString('id-ID')} ekor</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800/80 rounded-lg text-xs font-mono">
          {isOnline ? (
            <>
              <Cloud className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Online</span>
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 font-medium">Offline Mode</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Backup */}
          <button
            onClick={onExportData}
            title="Backup Data ke File"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-all duration-200 active:scale-95"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Restore */}
          <label className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg cursor-pointer transition-all duration-200 active:scale-95">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Reset */}
          <div className="relative">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-900/50 rounded-lg text-xs font-medium transition-all duration-200"
              >
                Reset Siklus
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-950 px-2 py-1 border border-rose-800 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[10px] text-rose-200 font-mono">Yakin reset?</span>
                <button
                  onClick={() => {
                    onResetFlock();
                    setShowResetConfirm(false);
                  }}
                  className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded"
                >
                  Ya
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
