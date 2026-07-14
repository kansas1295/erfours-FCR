import React, { useState } from 'react';
import { Package, Plus, TrendingUp, ArrowDownRight, ArrowUpRight, FileText, ClipboardList } from 'lucide-react';
import { FeedTransaction, DailyRecord } from '../types';

interface InventoryPanelProps {
  transactions: FeedTransaction[];
  dailyRecords: DailyRecord[];
  onAddTransaction: (transaction: Omit<FeedTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  transactions,
  dailyRecords,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN');
  const [txQuantity, setTxQuantity] = useState(500); // 10 bags default (500kg)
  const [txBrand, setTxBrand] = useState('BR-1 Pre-starter');
  const [txNotes, setTxNotes] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Calculations
  const totalIn = transactions
    .filter((t) => t.type === 'IN')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalOutManual = transactions
    .filter((t) => t.type === 'OUT')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalOutDaily = dailyRecords.reduce((sum, r) => sum + r.feedConsumed, 0);
  const totalOut = totalOutManual + totalOutDaily;

  const currentStock = totalIn - totalOut;
  const currentStockBags = currentStock / 50; // 50kg per bag

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txQuantity <= 0 || !txBrand.trim()) {
      alert("Harap masukkan data transaksi yang valid.");
      return;
    }
    onAddTransaction({
      date: txDate,
      type: txType,
      quantity: Number(txQuantity),
      brand: txBrand,
      notes: txNotes || undefined,
    });
    setTxNotes('');
    setShowAddForm(false);
  };

  return (
    <div id="inventory-management-panel" className="glass-card rounded-2xl border border-slate-800 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Manajemen Inventaris Pakan
          </h2>
          <p className="text-xs text-slate-400">Kelola stok pakan masuk dan melacak sisa ketersediaan gudang</p>
        </div>

        {!showAddForm && (
          <button
            id="btn-add-tx-toggle"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Catat Transaksi Pakan
          </button>
        )}
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-500">Stok Gudang Saat Ini</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {currentStock.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 mt-1 block">
            ≈ {currentStockBags.toFixed(1)} Karung (50kg)
          </span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-500">Total Pakan Masuk (IN)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {totalIn.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
            Dari log transaksi pakan masuk
          </span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-500">Total Pakan Keluar / Terpakai</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {totalOut.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
            {totalOutDaily.toLocaleString('id-ID')} kg (Log Harian) + {totalOutManual.toLocaleString('id-ID')} kg (Manual)
          </span>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <form 
          id="add-tx-form" 
          onSubmit={handleSubmit}
          className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Tipe Transaksi</label>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value as 'IN' | 'OUT')}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/80"
            >
              <option value="IN">Masuk Gudang (IN)</option>
              <option value="OUT">Pengeluaran Lainnya (OUT)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Tanggal</label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              required
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/80 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Jumlah Pakan (Kg)</label>
            <input
              type="number"
              value={txQuantity}
              onChange={(e) => setTxQuantity(Number(e.target.value))}
              required
              min="1"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/80 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Merek / Jenis Pakan</label>
            <input
              type="text"
              value={txBrand}
              onChange={(e) => setTxBrand(e.target.value)}
              required
              placeholder="e.g. BR-1 Pre-starter, BR-2"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Catatan</label>
            <input
              type="text"
              value={txNotes}
              onChange={(e) => setTxNotes(e.target.value)}
              placeholder="Keterangan tambahan"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/80"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex justify-end gap-3 mt-2 border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-slate-800 rounded-lg transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/10"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      )}

      {/* Transactions History List */}
      <div className="max-h-[300px] overflow-y-auto border border-slate-800/80 rounded-xl">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono font-medium uppercase tracking-wider bg-slate-900/30 sticky top-0">
              <th className="py-2.5 px-4">Tanggal</th>
              <th className="py-2.5 px-4 text-center">Tipe</th>
              <th className="py-2.5 px-4">Jenis Pakan</th>
              <th className="py-2.5 px-4 text-right">Jumlah</th>
              <th className="py-2.5 px-4">Catatan</th>
              <th className="py-2.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {/* Display Daily Records Consumptions as OUT transactions automatically too */}
            {dailyRecords.map((r) => (
              <tr key={`daily-${r.id}`} className="opacity-70 bg-slate-900/10">
                <td className="py-2.5 px-4 text-slate-500 font-sans">
                  {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ArrowDownRight className="w-2.5 h-2.5" /> OUT
                  </span>
                </td>
                <td className="py-2.5 px-4 text-slate-400">
                  Konsumsi Pakan Ayam (Hari {r.age})
                </td>
                <td className="py-2.5 px-4 text-right text-amber-400 font-bold">
                  -{r.feedConsumed.toLocaleString('id-ID')} kg
                </td>
                <td className="py-2.5 px-4 text-slate-500 italic font-sans">
                  Dihitung otomatis dari log harian
                </td>
                <td className="py-2.5 px-4 text-center text-slate-600 font-sans italic">
                  Sistem
                </td>
              </tr>
            ))}

            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-4 text-slate-400 font-sans">
                  {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </td>
                <td className="py-2.5 px-4 text-center">
                  {tx.type === 'IN' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ArrowUpRight className="w-2.5 h-2.5" /> IN (Masuk)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <ArrowDownRight className="w-2.5 h-2.5" /> OUT (Manual)
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-slate-200">
                  {tx.brand}
                </td>
                <td className={`py-2.5 px-4 text-right font-bold ${tx.type === 'IN' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  {tx.type === 'IN' ? '+' : '-'}{tx.quantity.toLocaleString('id-ID')} kg
                </td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">
                  {tx.notes || '-'}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <button
                    onClick={() => {
                      if (confirm("Hapus transaksi inventaris ini?")) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-all"
                  >
                    <ArrowDownRight className="hidden" /> {/* just placeholder */}
                    <span className="text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer">Hapus</span>
                  </button>
                </td>
              </tr>
            ))}

            {transactions.length === 0 && dailyRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 font-sans">
                  Belum ada catatan aktivitas inventaris pakan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
