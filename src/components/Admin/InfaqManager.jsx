import React, { useState, useEffect } from 'react';
import { 
    Heart, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    History, 
    Plus, 
    Loader2, 
    Search, 
    Calendar,
    User,
    FileText,
    Wallet
} from 'lucide-react';

export default function InfaqManager() {
    const [stats, setStats] = useState({ total_penerimaan: 0, total_penyaluran: 0, saldo_akhir: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        penerima: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, logsRes] = await Promise.all([
                fetch('/api/infaq/stats'),
                fetch('/api/infaq/logs')
            ]);
            setStats(await statsRes.json());
            setLogs(await logsRes.json());
        } catch (error) {
            console.error("Fetch infaq error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDisburse = async (e) => {
        e.preventDefault();
        if (Number(formData.nominal) > stats.saldo_akhir) {
            alert("Saldo infaq tidak mencukupi untuk jumlah penyaluran ini!");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/infaq/disburse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setShowModal(false);
                setFormData({
                    nominal: '',
                    tanggal: new Date().toISOString().split('T')[0],
                    keterangan: '',
                    penerima: ''
                });
                fetchData();
            } else {
                alert("Gagal mencatat penyaluran.");
            }
        } catch (error) {
            console.error("Disbursement error:", error);
        } finally {
            setSaving(false);
        }
    };

    const filteredLogs = logs.filter(log => 
        log.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.penerima.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4">
                <Loader2 className="animate-spin text-sky-500" size={32} />
                <p className="font-bold">Memuat laporan infaq...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Laporan Dana Infaq</h2>
                    <p className="text-sm font-bold text-slate-400 italic">Transparansi pengelolaan dana umat Adhar Coffe.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-pink-100 active:scale-95"
                >
                    <Plus size={18} />
                    Catat Penyaluran
                </button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                            <ArrowUpRight size={24} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full">Penerimaan</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase mb-1">Total Infaq Masuk</p>
                    <h3 className="text-2xl font-black text-slate-800">Rp {stats.total_penerimaan.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                            <ArrowDownRight size={24} />
                        </div>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-full">Penyaluran</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase mb-1">Total Infaq Disalurkan</p>
                    <h3 className="text-2xl font-black text-slate-800">Rp {stats.total_penyaluran.toLocaleString()}</h3>
                </div>

                <div className="bg-[#0c4a6e] p-6 rounded-[2rem] shadow-xl shadow-sky-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Heart size={80} className="text-white fill-white" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Wallet size={24} />
                        </div>
                        <span className="text-[10px] font-black text-sky-200 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-full">Saldo Saat Ini</span>
                    </div>
                    <p className="text-xs font-black text-sky-200 uppercase mb-1 relative z-10">Tersedia untuk Disalurkan</p>
                    <h3 className="text-2xl font-black text-white relative z-10">Rp {stats.saldo_akhir.toLocaleString()}</h3>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-50 text-sky-500 rounded-xl">
                            <History size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">Riwayat Mutasi Infaq</h3>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari transaksi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-sm font-bold"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penerima</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-4">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                            log.tipe === 'Penyaluran' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                        }`}>
                                            {log.tipe}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{log.tanggal}</td>
                                    <td className="px-8 py-4 text-sm font-black text-slate-700">{log.keterangan}</td>
                                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{log.penerima}</td>
                                    <td className={`px-8 py-4 text-sm font-black text-right ${
                                        log.tipe === 'Penyaluran' ? 'text-rose-500' : 'text-emerald-500'
                                    }`}>
                                        {log.tipe === 'Penyaluran' ? '-' : '+'} Rp {log.nominal.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold italic">
                                        Tidak ada riwayat mutasi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50/80">
                                <td colSpan="4" className="px-8 py-4 text-xs font-black text-slate-500 uppercase text-right">Saldo Akhir Infaq</td>
                                <td className="px-8 py-4 text-lg font-black text-slate-800 text-right">Rp {stats.saldo_akhir.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Modal Penyaluran */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                        <div className="bg-pink-500 px-8 py-6 text-white text-center">
                            <Heart size={32} className="mx-auto mb-2 fill-white animate-pulse" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Salurkan Infaq</h3>
                            <p className="text-xs font-bold opacity-80">Saldo Tersedia: Rp {stats.saldo_akhir.toLocaleString()}</p>
                        </div>
                        
                        <form onSubmit={handleDisburse} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nominal (Rp)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-black">Rp</div>
                                    <input 
                                        type="number" 
                                        required 
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-200 font-black text-slate-800"
                                        placeholder="50000"
                                        value={formData.nominal}
                                        onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-center">Tanggal</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            required 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-200 font-bold text-sm text-slate-600"
                                            value={formData.tanggal}
                                            onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-center">Penerima</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-200 font-bold text-sm"
                                        placeholder="Pihak Luar/Acara"
                                        value={formData.penerima}
                                        onChange={(e) => setFormData({...formData, penerima: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Keterangan Penyaluran</label>
                                <textarea 
                                    required 
                                    rows="3"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-200 font-bold text-sm"
                                    placeholder="Contoh: Bantuan Anak Yatim..."
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 text-slate-400 font-black text-sm hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? 'Proses...' : 'Konfirmasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
