import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

export default function MenuManager() {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        nama_menu: '',
        harga: '',
        hpp: '',
        kategori: '',
        stok: '',
        min_stok: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [menuRes, catRes] = await Promise.all([
                fetch('/api/menu'),
                fetch('/api/kategori')
            ]);
            setMenus(await menuRes.json());
            setCategories(await catRes.json());
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
        const method = editingItem ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setShowModal(false);
                setEditingItem(null);
                setFormData({ nama_menu: '', harga: '', hpp: '', kategori: '', stok: '', min_stok: '' });
                fetchData();
            } else {
                const errData = await response.json();
                alert('Gagal menyimpan: ' + (errData.detail || 'Terjadi kesalahan'));
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert('Gagal menghubungkan ke server');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus menu ini?')) {
            try {
                await fetch(`/api/menu/${id}`, { method: 'DELETE' });
                fetchData();
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    const filteredMenus = menus.filter(item =>
        item.nama_menu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white shadow-sm font-medium text-sm transition-all"
                    />
                </div>
                <button
                    onClick={() => { setEditingItem(null); setFormData({ nama_menu: '', harga: '', hpp: '', kategori: '', stok: '', min_stok: '' }); setShowModal(true); }}
                    className="w-full sm:w-auto bg-[#1ca3f4] hover:bg-[#1589d1] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-100 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Tambah Menu
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                    <Loader2 className="animate-spin text-sky-500" size={32} />
                    <p className="font-bold">Memuat data menu...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Nama Menu</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">HPP</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Harga Jual</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMenus.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-800">{item.nama_menu}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[11px] font-black uppercase">
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-500 text-xs">Rp {item.hpp || 0}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-600">Rp {item.harga}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { 
                                                        setEditingItem(item); 
                                                        setFormData({ 
                                                            nama_menu: item.nama_menu, 
                                                            harga: item.harga, 
                                                            hpp: item.hpp || '', 
                                                            kategori: item.kategori,
                                                            stok: item.stok || 0,
                                                            min_stok: item.min_stok || 5
                                                        }); 
                                                        setShowModal(true); 
                                                    }}
                                                    className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#1ca3f4] px-6 py-5 text-white flex items-center justify-between">
                            <h3 className="text-lg font-black">{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Menu</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama_menu}
                                    onChange={(e) => setFormData({ ...formData, nama_menu: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold"
                                    placeholder="Contoh: Kopi Susu Aren"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Kategori</label>
                                    <select
                                        required
                                        value={formData.kategori}
                                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold appearance-none bg-white"
                                    >
                                        <option value="">Pilih...</option>
                                        {categories.map(c => <option key={c.id} value={c.nama_kategori}>{c.nama_kategori}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">HPP (Modal)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.hpp}
                                        onChange={(e) => setFormData({ ...formData, hpp: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold"
                                        placeholder="10000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Harga Jual</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.harga}
                                        onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold"
                                        placeholder="15000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-[#f472b6] uppercase tracking-widest mb-1.5 ml-1">Stok Awal</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.stok}
                                        onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 font-bold"
                                        placeholder="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-amber-500 uppercase tracking-widest mb-1.5 ml-1">Min Stok</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.min_stok}
                                        onChange={(e) => setFormData({ ...formData, min_stok: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-bold"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-black hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`flex-1 px-4 py-3.5 rounded-xl text-white font-black transition-colors shadow-lg shadow-sky-100 ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1ca3f4] hover:bg-[#1589d1]'}`}
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function X({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}
