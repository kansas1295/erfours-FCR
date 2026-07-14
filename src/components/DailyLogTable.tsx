import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, X, Calendar, Scale, Weight, Eye } from 'lucide-react';
import { DailyRecord } from '../types';

interface DailyLogTableProps {
  records: DailyRecord[];
  initialPopulation: number;
  onAddRecord: (record: Omit<DailyRecord, 'id' | 'populationAtStart' | 'populationAtEnd' | 'fcr' | 'ip'>) => void;
  onEditRecord: (id: string, updatedFields: Partial<DailyRecord>) => void;
  onDeleteRecord: (id: string) => void;
}

export const DailyLogTable: React.FC<DailyLogTableProps> = ({
  records,
  initialPopulation,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new record
  const lastAge = records.length > 0 ? Math.max(...records.map(r => r.age)) : 0;
  const [newAge, setNewAge] = useState(lastAge + 1);
  const [newDate, setNewDate] = useState(() => {
    if (records.length > 0) {
      const lastRecordDate = new Date(records[records.length - 1].date);
      lastRecordDate.setDate(lastRecordDate.getDate() + 1);
      return lastRecordDate.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [newMortality, setNewMortality] = useState(0);
  const [newFeed, setNewFeed] = useState(0);
  const [newWeight, setNewWeight] = useState(0);

  // Edit states
  const [editMortality, setEditMortality] = useState(0);
  const [editFeed, setEditFeed] = useState(0);
  const [editWeight, setEditWeight] = useState(0);

  const handleOpenAddForm = () => {
    const nextAge = records.length > 0 ? Math.max(...records.map(r => r.age)) + 1 : 1;
    setNewAge(nextAge);
    
    if (records.length > 0) {
      const lastRecordDate = new Date(records[records.length - 1].date);
      lastRecordDate.setDate(lastRecordDate.getDate() + 1);
      setNewDate(lastRecordDate.toISOString().split('T')[0]);
    } else {
      setNewDate(new Date().toISOString().split('T')[0]);
    }
    setNewMortality(0);
    setNewFeed(0);
    setNewWeight(0);
    setShowAddForm(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAge <= 0 || newFeed < 0 || newWeight <= 0 || newMortality < 0) {
      alert("Harap masukkan nilai yang valid.");
      return;
    }
    onAddRecord({
      age: newAge,
      date: newDate,
      mortality: Number(newMortality),
      feedConsumed: Number(newFeed),
      avgWeight: Number(newWeight),
    });
    setShowAddForm(false);
  };

  const startEditing = (record: DailyRecord) => {
    setEditingId(record.id);
    setEditMortality(record.mortality);
    setEditFeed(record.feedConsumed);
    setEditWeight(record.avgWeight);
  };

  const saveEdit = (id: string) => {
    onEditRecord(id, {
      mortality: Number(editMortality),
      feedConsumed: Number(editFeed),
      avgWeight: Number(editWeight),
    });
    setEditingId(null);
  };

  // Sort records by age ascending
  const sortedRecords = [...records].sort((a, b) => a.age - b.age);

  return (
    <div id="daily-records-panel" className="glass-card rounded-2xl border border-slate-800 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Catatan Performa Harian
          </h2>
          <p className="text-xs text-slate-400">Log harian berat badan, mortalitas, dan pakan</p>
        </div>
        
        {!showAddForm && (
          <button
            id="btn-add-record-toggle"
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-semibold rounded-xl transition-all duration-200 shadow-md shadow-emerald-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Data Harian
          </button>
        )}
      </div>

      {/* Add Form Block */}
      {showAddForm && (
        <form 
          id="add-record-form" 
          onSubmit={handleAddSubmit}
          className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Umur (Hari ke-)</label>
            <input
              type="number"
              value={newAge}
              onChange={(e) => setNewAge(Number(e.target.value))}
              required
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/80 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Tanggal Log</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/80 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Mati Hari Ini (Ekor)</label>
            <input
              type="number"
              min="0"
              value={newMortality}
              onChange={(e) => setNewMortality(Number(e.target.value))}
              required
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/80 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Konsumsi Pakan (Kg)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newFeed}
              onChange={(e) => setNewFeed(Number(e.target.value))}
              required
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/80 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Rata-rata Bobot (Kg)</label>
            <input
              type="number"
              step="0.001"
              min="0.01"
              value={newWeight}
              onChange={(e) => setNewWeight(Number(e.target.value))}
              required
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/80 font-mono"
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
              className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/10"
            >
              Simpan Record
            </button>
          </div>
        </form>
      )}

      {/* Daily Records List */}
      <div className="overflow-x-auto w-full">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">Belum ada catatan harian.</p>
            <p className="text-xs text-slate-500 mt-1">Gunakan tombol "Tambah Data Harian" di atas untuk menambahkan data.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono font-medium uppercase tracking-wider bg-slate-900/30">
                <th className="py-3.5 px-4 text-center">Hari</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4 text-right">Populasi Sisa</th>
                <th className="py-3.5 px-4 text-right text-rose-400">Kematian</th>
                <th className="py-3.5 px-4 text-right text-indigo-400">Pakan Harian (kg)</th>
                <th className="py-3.5 px-4 text-right text-cyan-400">Rata Bobot (kg)</th>
                <th className="py-3.5 px-4 text-right text-amber-300">FCR Kum.</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">Indeks Performa (IP)</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {sortedRecords.map((rec) => {
                const isEditing = editingId === rec.id;

                return (
                  <tr 
                    key={rec.id} 
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    {/* Age / Day */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                      {rec.age}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-sans">
                      {new Date(rec.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>

                    {/* Population */}
                    <td className="py-3.5 px-4 text-right text-slate-200">
                      {rec.populationAtEnd.toLocaleString('id-ID')}
                      <span className="text-[10px] text-slate-500 block">
                        SR: {((rec.populationAtEnd / initialPopulation) * 100).toFixed(1)}%
                      </span>
                    </td>

                    {/* Mortality */}
                    <td className="py-3.5 px-4 text-right text-rose-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editMortality}
                          onChange={(e) => setEditMortality(Number(e.target.value))}
                          className="w-16 px-1.5 py-1 bg-slate-950 border border-slate-700 text-right text-slate-200 rounded"
                        />
                      ) : (
                        <span>+{rec.mortality}</span>
                      )}
                    </td>

                    {/* Daily Feed consumed */}
                    <td className="py-3.5 px-4 text-right text-indigo-300">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editFeed}
                          onChange={(e) => setEditFeed(Number(e.target.value))}
                          className="w-20 px-1.5 py-1 bg-slate-950 border border-slate-700 text-right text-slate-200 rounded"
                        />
                      ) : (
                        <span>{rec.feedConsumed.toLocaleString('id-ID')} kg</span>
                      )}
                    </td>

                    {/* Avg Weight */}
                    <td className="py-3.5 px-4 text-right text-cyan-300 font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editWeight}
                          onChange={(e) => setEditWeight(Number(e.target.value))}
                          className="w-20 px-1.5 py-1 bg-slate-950 border border-slate-700 text-right text-slate-200 rounded"
                        />
                      ) : (
                        <span>{rec.avgWeight.toFixed(3)} kg</span>
                      )}
                    </td>

                    {/* FCR */}
                    <td className="py-3.5 px-4 text-right text-amber-300 font-bold">
                      {rec.fcr ? rec.fcr.toFixed(3) : '-'}
                    </td>

                    {/* Performance Index (IP) */}
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                      {rec.ip ? Math.round(rec.ip) : '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(rec.id)}
                              className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded border border-emerald-500/30 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(rec)}
                              className="p-1.5 bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 rounded transition-all hover:border-slate-700"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan hari ke-${rec.age}?`)) {
                                  onDeleteRecord(rec.id);
                                }
                              }}
                              className="p-1.5 bg-rose-950/30 text-rose-400 hover:text-rose-300 border border-rose-900/30 hover:border-rose-800/80 rounded transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
