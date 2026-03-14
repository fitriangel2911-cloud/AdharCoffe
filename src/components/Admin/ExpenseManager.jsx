import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Search, 
    Calendar, 
    Wallet, 
    AlertCircle, 
    CheckCircle2,
    X,
    Filter
} from 'lucide-react';

export default function ExpenseManager() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [status, setStatus] = useState({ type: '', message: '' });

    const [formData, setFormData] = useState({
        akun: '',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0]
    });

    const categories = ['Semua', 'Gaji', 'Listrik', 'Sewa', 'Internet', 'Marketing', 'Lain-lain'];

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/pengeluaran');
            const data = await response.json();
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            showStatus('error', 'Gagal mengambil data pengeluaran');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/pengeluaran', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    akun: formData.akun,
                    nominal: parseInt(formData.nominal),
                    tanggal: formData.tanggal
                })
            });

            if (response.ok) {
                showStatus('success', 'Biaya operasional berhasil ditambahkan');
                setShowModal(false);
                setFormData({ akun: '', nominal: '', tanggal: new Date().toISOString().split('T')[0] });
                fetchExpenses();
            } else {
                const errData = await response.json();
                if (errData.detail && errData.detail.includes("Tabel 'biaya_operasional' belum dibuat")) {
                    alert(errData.detail);
                } else {
                    showStatus('error', errData.detail || 'Gagal menambahkan biaya');
                }
            }
        } catch (error) {
            showStatus('error', 'Terjadi kesalahan sistem');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        try {
            const response = await fetch(`/api/pengeluaran/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showStatus('success', 'Data berhasil dihapus');
                fetchExpenses();
            }
        } catch (error) {
            showStatus('error', 'Gagal menghapus data');
        }
    };

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    const filteredExpenses = Array.isArray(expenses) ? expenses.filter(exp => {
        const matchesSearch = exp.akun?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Semua' || exp.akun === filterCategory;
        return matchesSearch && matchesCategory;
    }) : [];

    const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Manajemen Biaya Operasional</h2>
                    <p className="text-slate-500 font-medium">Rekam dan pantau pengeluaran bisnis Anda</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-sky-100 active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} />
                    Tambah Pengeluaran
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Biaya Bulan Ini</p>
                        <p className="text-xl font-black text-slate-800">{formatRp(expenses.reduce((acc, curr) => acc + (curr.nominal || 0), 0))}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Biaya</p>
                        <p className="text-xl font-black text-slate-800">{expenses.length} Transaksi</p>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari akun biaya..." 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                                    filterCategory === cat 
                                    ? 'bg-slate-800 text-white shadow-md' 
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Akun / Kategori</th>
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Nominal</th>
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400 font-bold">Memuat data...</td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400 font-bold">Tidak ada data biaya ditemukan</td>
                                </tr>
                            ) : (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    <Calendar size={16} />
                                                </div>
                                                <span className="font-bold text-slate-700 text-sm">{exp.tanggal}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-black uppercase tracking-wider">
                                                {exp.akun}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right font-black text-slate-800 text-sm">
                                            {formatRp(exp.nominal)}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => handleDelete(exp.id)}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Catat Biaya</h3>
                                <p className="text-sm font-bold text-slate-400">Input pengeluaran operasional baru</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Akun Pengeluaran</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-slate-700 appearance-none"
                                    value={formData.akun}
                                    onChange={(e) => setFormData({...formData, akun: e.target.value})}
                                    required
                                >
                                    <option value="">Pilih Kategori...</option>
                                    {categories.slice(1).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Nominal (Rp)</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-slate-700"
                                    value={formData.nominal}
                                    onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal</label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-slate-700"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-slate-200 active:scale-95 mt-4"
                            >
                                Simpan Data
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Toast */}
            {status.message && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 ${
                    status.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-pink-500 text-white'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-black text-sm">{status.message}</span>
                </div>
            )}
        </div>
    );
}
