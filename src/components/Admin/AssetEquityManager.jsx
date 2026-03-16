import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Shield, 
    Box, 
    TrendingUp, 
    Database, 
    Calendar, 
    FileText,
    Loader2,
    DollarSign,
    PieChart
} from 'lucide-react';

export default function AssetEquityManager() {
    const [assets, setAssets] = useState([]);
    const [equity, setEquity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('assets'); // 'assets' or 'equity'

    const [newAsset, setNewAsset] = useState({
        nama_aset: '',
        kategori_aset: 'Tetap',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: ''
    });

    const [newEquity, setNewEquity] = useState({
        nama_modal: '',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetRes, equityRes] = await Promise.all([
                fetch('/api/aset'),
                fetch('/api/ekuitas')
            ]);
            setAssets(await assetRes.json());
            setEquity(await equityRes.json());
        } catch (error) {
            console.error("Error fetching financial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/aset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAsset)
            });
            if (res.ok) {
                setNewAsset({
                    nama_aset: '',
                    kategori_aset: 'Tetap',
                    nominal: '',
                    tanggal: new Date().toISOString().split('T')[0],
                    keterangan: ''
                });
                fetchData();
            }
        } catch (error) {
            console.error("Error adding asset:", error);
        }
    };

    const handleAddEquity = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/ekuitas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEquity)
            });
            if (res.ok) {
                setNewEquity({
                    nama_modal: '',
                    nominal: '',
                    tanggal: new Date().toISOString().split('T')[0],
                    keterangan: ''
                });
                fetchData();
            }
        } catch (error) {
            console.error("Error adding equity:", error);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm("Hapus data ini?")) return;
        try {
            const endpoint = type === 'asset' ? `/api/aset/${id}` : `/api/ekuitas/${id}`;
            await fetch(endpoint, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const totalAssets = assets.reduce((sum, item) => sum + item.nominal, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.nominal, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#1ca3f4] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
                        <Database className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 italic tracking-tight uppercase">Manajemen Aset & Modal</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pencatatan Aktiva & Perubahan Ekuitas</p>
                    </div>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button 
                        onClick={() => setActiveTab('assets')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'assets' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-400 opacity-60'}`}
                    >
                        <Box size={14} /> ASET (AKTIVA)
                    </button>
                    <button 
                        onClick={() => setActiveTab('equity')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'equity' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-400 opacity-60'}`}
                    >
                        <Shield size={14} /> MODAL (EKUITAS)
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Form Input */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-sky-500" />
                            Tambah {activeTab === 'assets' ? 'Aset Baru' : 'Modal Baru'}
                        </h3>
                        
                        {activeTab === 'assets' ? (
                            <form onSubmit={handleAddAsset} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Nama Aset</label>
                                    <input 
                                        type="text" required placeholder="Contoh: Mesin Espresso, Meja Kayu"
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-sky-500"
                                        value={newAsset.nama_aset} onChange={e => setNewAsset({...newAsset, nama_aset: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Kategori</label>
                                        <select 
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-sky-500"
                                            value={newAsset.kategori_aset} onChange={e => setNewAsset({...newAsset, kategori_aset: e.target.value})}
                                        >
                                            <option value="Tetap">Aset Tetap</option>
                                            <option value="Lancar">Aset Lancar</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Tanggal</label>
                                        <input 
                                            type="date" required
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-sky-500"
                                            value={newAsset.tanggal} onChange={e => setNewAsset({...newAsset, tanggal: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Nominal (Rp)</label>
                                    <input 
                                        type="number" required placeholder="0"
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-sky-500"
                                        value={newAsset.nominal} onChange={e => setNewAsset({...newAsset, nominal: e.target.value})}
                                    />
                                </div>
                                <button className="w-full bg-[#1ca3f4] text-white p-4 rounded-2xl font-black text-sm shadow-lg shadow-sky-100 hover:scale-[1.02] transition-all">
                                    SIMPAN ASET
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleAddEquity} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Sumber Modal</label>
                                    <input 
                                        type="text" required placeholder="Contoh: Modal Awal Pemilik"
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-sky-500"
                                        value={newEquity.nama_modal} onChange={e => setNewEquity({...newEquity, nama_modal: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Tanggal</label>
                                    <input 
                                        type="date" required
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-sky-500"
                                        value={newEquity.tanggal} onChange={e => setNewEquity({...newEquity, tanggal: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Nominal (Rp)</label>
                                    <input 
                                        type="number" required placeholder="0"
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-sky-500"
                                        value={newEquity.nominal} onChange={e => setNewEquity({...newEquity, nominal: e.target.value})}
                                    />
                                </div>
                                <button className="w-full bg-[#1ca3f4] text-white p-4 rounded-2xl font-black text-sm shadow-lg shadow-sky-100 hover:scale-[1.02] transition-all">
                                    SIMPAN MODAL
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-sky-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-sky-200/50">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total {activeTab === 'assets' ? 'Aset' : 'Modal'}</p>
                        <h2 className="text-3xl font-black italic">{formatRp(activeTab === 'assets' ? totalAssets : totalEquity)}</h2>
                        <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold opacity-60 uppercase">Daftar Item</p>
                                <p className="font-black text-xl">{activeTab === 'assets' ? assets.length : equity.length}</p>
                            </div>
                            <PieChart className="w-8 h-8 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* List View */}
                <div className="xl:col-span-8 space-y-6">
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center bg-white rounded-[2.5rem] border border-slate-100">
                            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-sky-500" />
                                    RIWAYAT {activeTab === 'assets' ? 'ASET' : 'MODAL'}
                                </h3>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Total {activeTab === 'assets' ? assets.length : equity.length} Records
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                                            <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(activeTab === 'assets' ? assets : equity).length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center text-slate-300 font-bold italic">Belum ada data tercatat</td>
                                            </tr>
                                        ) : (activeTab === 'assets' ? assets : equity).map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'assets' ? 'bg-sky-50 text-sky-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                            {activeTab === 'assets' ? <Box size={18} /> : <Shield size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-700">{activeTab === 'assets' ? item.nama_aset : item.nama_modal}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.kategori_aset || 'Modal Pemilik'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                        <Calendar size={14} className="opacity-40" />
                                                        {item.tanggal}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <p className="font-black text-slate-800">{formatRp(item.nominal)}</p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button 
                                                        onClick={() => handleDelete(activeTab === 'assets' ? 'asset' : 'equity', item.id)}
                                                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
