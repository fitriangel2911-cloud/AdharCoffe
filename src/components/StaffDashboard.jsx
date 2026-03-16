import React, { useState, useEffect } from 'react';
import { 
    LogOut, 
    ChefHat, 
    Coffee, 
    AlertTriangle,
    Package,
    RefreshCw,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import AdminOrderManager from './Admin/AdminOrderManager';

export default function StaffDashboard({ user, onLogout, dbStatus }) {
    const [lowStock, setLowStock] = useState([]);
    const [loadingStock, setLoadingStock] = useState(false);
    const [tableStatuses, setTableStatuses] = useState({});
    const [clearingTable, setClearingTable] = useState(null);

    useEffect(() => {
        fetchLowStock();
        fetchTableStatuses();
        const interval = setInterval(fetchTableStatuses, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchLowStock = async () => {
        setLoadingStock(true);
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            const low = data.filter(item => (item.stok || 0) <= (item.min_stok || 5));
            setLowStock(low);
        } catch (error) {
            console.error("Error fetching stock info:", error);
        } finally {
            setLoadingStock(false);
        }
    };

    const fetchTableStatuses = async () => {
        try {
            const res = await fetch('/api/tables/status');
            if (res.ok) {
                const data = await res.json();
                setTableStatuses(data);
            }
        } catch (e) {
            console.error("Error fetching table statuses:", e);
        }
    };

    const markTableAvailable = async (tableId) => {
        setClearingTable(tableId);
        try {
            await fetch(`/api/tables/${tableId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'available' })
            });
            await fetchTableStatuses();
        } catch (e) {
            console.error("Error clearing table:", e);
        } finally {
            setClearingTable(null);
        }
    };

    const markTableServed = async (tableId) => {
        setClearingTable(`served_${tableId}`);
        try {
            await fetch(`/api/tables/${tableId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'served' })
            });
            await fetchTableStatuses();
        } catch (e) {
            console.error("Error marking table served:", e);
        } finally {
            setClearingTable(null);
        }
    };

    // Tables by state
    const servedTables = Object.entries(tableStatuses)
        .filter(([, s]) => s === 'served')
        .map(([id]) => id)
        .sort((a, b) => Number(a) - Number(b));

    const occupiedTables = Object.entries(tableStatuses)
        .filter(([, s]) => s === 'occupied')
        .map(([id]) => id)
        .sort((a, b) => Number(a) - Number(b));

    const statusColor = (status) => {
        if (status === 'served')    return 'bg-amber-50 border-amber-200 text-amber-600';
        if (status === 'occupied')  return 'bg-rose-50 border-rose-200 text-rose-500';
        return 'bg-emerald-50 border-emerald-200 text-emerald-600';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">

            {/* ── Header ── */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
                        <ChefHat className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 italic tracking-tight flex items-center gap-2">
                            ADHAR OPERASIONAL
                            <span className="bg-sky-50 text-sky-500 text-[10px] px-2 py-0.5 rounded-full font-black uppercase not-italic">Mode Staf</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Antarmuka Operasional Staf</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { fetchLowStock(); fetchTableStatuses(); }}
                        className="p-3 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-2xl transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loadingStock ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="hidden md:flex flex-col items-end px-4 border-r border-slate-100">
                        <span className="text-sm font-black text-slate-700">{user?.nama || 'Pegawai'}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${dbStatus === 'online' ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                            Sistem {dbStatus === 'online' ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 group"
                        title="Keluar"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </header>

            {/* ── Content ── */}
            <main className="flex-1 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto w-full">
                
                {/* Left: Order Queue */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px]">
                        <div className="p-6 md:p-8">
                            <AdminOrderManager />
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar panels */}
                <div className="xl:col-span-1 space-y-8">

                    {/* ── Table Status Panel ── */}
                    <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-sky-500" />
                            Status Meja
                        </h3>

                        {/* Legend */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>Tersedia
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500">
                                <div className="w-3 h-3 rounded-full bg-rose-400"></div>Terisi
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500">
                                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>Perlu Bersih
                            </div>
                        </div>

                        {/* Occupied tables: staff manually marks done eating */}
                        {occupiedTables.length > 0 && (
                            <div className="mb-4 p-3 bg-rose-50 rounded-2xl border border-rose-100">
                                <p className="text-[10px] font-black uppercase text-rose-500 tracking-wider mb-2">
                                    🍽 Sedang Makan – Tandai Selesai?
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {occupiedTables.map(tid => (
                                        <button
                                            key={tid}
                                            onClick={() => markTableServed(tid)}
                                            disabled={clearingTable === `served_${tid}`}
                                            className="flex flex-col items-center justify-center p-2.5 bg-white border-2 border-rose-200 rounded-2xl hover:bg-rose-100 hover:border-rose-400 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                                            title={`Tandai pelanggan Meja ${tid} sudah selesai makan`}
                                        >
                                            <span className="text-base font-black text-rose-600">{tid}</span>
                                            {clearingTable === `served_${tid}`
                                                ? <RefreshCw className="w-3 h-3 text-rose-400 animate-spin mt-0.5" />
                                                : <CheckCircle2 className="w-3 h-3 text-rose-400 mt-0.5" />
                                            }
                                            <span className="text-[7px] font-black text-rose-400 uppercase mt-0.5">Selesai Makan</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Served tables: staff cleans and marks available */}
                        {servedTables.length > 0 && (
                            <div className="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider mb-2">
                                    🧹 Sudah Selesai Makan – Bersihkan Meja
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {servedTables.map(tid => (
                                        <button
                                            key={tid}
                                            onClick={() => markTableAvailable(tid)}
                                            disabled={clearingTable === tid}
                                            className="flex flex-col items-center justify-center p-2.5 bg-white border-2 border-amber-200 rounded-2xl hover:bg-amber-100 hover:border-amber-400 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                                            title={`Tandai Meja ${tid} sudah bersih`}
                                        >
                                            <span className="text-base font-black text-amber-600">{tid}</span>
                                            {clearingTable === tid
                                                ? <RefreshCw className="w-3 h-3 text-amber-400 animate-spin mt-0.5" />
                                                : <CheckCircle2 className="w-3 h-3 text-amber-400 mt-0.5" />
                                            }
                                            <span className="text-[7px] font-black text-amber-400 uppercase mt-0.5">Bersihkan</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All-tables compact grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                            {Array.from({ length: 28 }, (_, i) => i + 1).map(tid => {
                                const st = tableStatuses[String(tid)] || 'available';
                                return (
                                    <div
                                        key={tid}
                                        className={`flex items-center justify-center h-9 rounded-xl border text-xs font-black transition-all ${statusColor(st)}`}
                                    >
                                        {tid}
                                    </div>
                                );
                            })}
                        </div>

                        {servedTables.length === 0 && occupiedTables.length === 0 && (
                            <div className="mt-4 p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                                <p className="text-[11px] font-black text-emerald-600">Semua meja bersih!</p>
                            </div>
                        )}
                    </section>

                    {/* ── Stok Kritis ── */}
                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Stok Kritis
                        </h3>
                        <div className="space-y-4">
                            {lowStock.length === 0 ? (
                                <div className="p-6 bg-emerald-50 text-emerald-600 rounded-3xl text-center border border-emerald-100">
                                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="font-bold text-xs uppercase">Semua Stok Aman</p>
                                </div>
                            ) : lowStock.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-700 text-sm truncate">{item.nama_menu}</h4>
                                        <p className="text-[10px] font-black text-amber-600 uppercase">Sisa: {item.stok}</p>
                                    </div>
                                    <div className="w-8 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (item.stok / (item.min_stok || 5)) * 100)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── SOP ── */}
                    <section className="bg-sky-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-sky-200">
                        <h3 className="font-black italic mb-4 flex items-center gap-2">
                            SOP STAF
                            <Coffee className="w-4 h-4" />
                        </h3>
                        <ul className="space-y-3 text-[11px] font-bold opacity-90 leading-relaxed">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0"></div>Pastikan kebersihan alat sebelum mengolah menu.</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0"></div>Utamakan pesanan yang masuk lebih awal.</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0"></div>Klik &ldquo;Selesaikan&rdquo; HANYA jika menu sudah siap pickup.</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0"></div>Setelah meja dibersihkan, tekan tombol <span className="bg-white/20 px-1 rounded">Bersihkan</span> di panel meja.</li>
                        </ul>
                    </section>
                </div>

            </main>

            <footer className="p-6 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Operasional Staf • Adhar Coffe v2.0</p>
            </footer>
        </div>
    );
}
