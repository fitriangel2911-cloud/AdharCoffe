import React, { useState, useEffect } from 'react';
import { 
    LogOut, 
    ChefHat, 
    Coffee, 
    ClipboardList,
    User,
    AlertTriangle,
    Package,
    RefreshCw
} from 'lucide-react';
import AdminOrderManager from './Admin/AdminOrderManager';

export default function StaffDashboard({ user, onLogout }) {
    const [lowStock, setLowStock] = useState([]);
    const [loadingStock, setLoadingStock] = useState(false);

    useEffect(() => {
        fetchLowStock();
    }, []);

    const fetchLowStock = async () => {
        setLoadingStock(true);
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            // Filter items with stock <= min_stok
            const low = data.filter(item => (item.stok || 0) <= (item.min_stok || 5));
            setLowStock(low);
        } catch (error) {
            console.error("Error fetching stock info:", error);
        } finally {
            setLoadingStock(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Header Khusus Pegawai */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
                        <ChefHat className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 italic tracking-tight flex items-center gap-2">
                            ADHAR KITCHEN
                            <span className="bg-sky-50 text-sky-500 text-[10px] px-2 py-0.5 rounded-full font-black uppercase not-italic">Operator Mode</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Antarmuka Operasional Pegawai</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchLowStock}
                        className="p-3 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-2xl transition-all"
                        title="Refresh Stok"
                    >
                        <RefreshCw className={`w-5 h-5 ${loadingStock ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="hidden md:flex flex-col items-end px-4 border-r border-slate-100">
                        <span className="text-sm font-black text-slate-700">{user?.nama || 'Pegawai'}</span>
                        <span className="text-[10px] font-bold text-sky-400 uppercase">Staff Dapur</span>
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

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto w-full">
                
                {/* Left: Queue Management (Main Focus) */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px]">
                        <div className="p-6 md:p-8">
                             <AdminOrderManager />
                        </div>
                    </div>
                </div>

                {/* Right: Operational Insights */}
                <div className="xl:col-span-1 space-y-8">
                    {/* Low Stock Alerts */}
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
                                        <div className="h-full bg-amber-500" style={{ width: `${(item.stok/5)*100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Operational Tips/Rules */}
                    <section className="bg-sky-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-sky-200">
                        <h3 className="font-black italic mb-4 flex items-center gap-2">
                             SOP DAPUR
                             <Coffee className="w-4 h-4" />
                        </h3>
                        <ul className="space-y-3 text-[11px] font-bold opacity-90 leading-relaxed">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0"></div>
                                Pastikan kebersihan alat sebelum mengolah menu.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0"></div>
                                Utamakan pesanan yang masuk lebih awal.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0"></div>
                                Klik "Selesaikan" HANYA jika menu sudah siap pickup.
                            </li>
                        </ul>
                    </section>
                </div>

            </main>

            {/* Footer */}
            <footer className="p-6 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Kitchen Operation Display • Adhar Coffe v2.0</p>
            </footer>
        </div>
    );
}
