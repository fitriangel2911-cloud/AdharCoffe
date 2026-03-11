import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ nama_kategori: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kategori');
            setCategories(await res.json());
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
        const url = editingItem ? `/api/kategori/${editingItem.id}` : '/api/kategori';
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
                setFormData({ nama_kategori: '' });
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
        if (window.confirm('Hapus kategori ini?')) {
            try {
                await fetch(`/api/kategori/${id}`, { method: 'DELETE' });
                fetchData();
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => { setEditingItem(null); setFormData({ nama_kategori: '' }); setShowModal(true); }}
                    className="bg-[#1ca3f4] hover:bg-[#1589d1] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-sky-100 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Tambah Kategori
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                    <Loader2 className="animate-spin text-sky-500" size={32} />
                    <p className="font-bold">Memuat data kategori...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-sky-200 transition-all hover:shadow-md hover:shadow-sky-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                                    {item.nama_kategori.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="font-black text-slate-800">{item.nama_kategori}</h3>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingItem(item); setFormData({ nama_kategori: item.nama_kategori }); setShowModal(true); }}
                                    className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#1ca3f4] px-6 py-5 text-white flex items-center justify-between">
                            <h3 className="text-lg font-black">{editingItem ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Kategori</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama_kategori}
                                    onChange={(e) => setFormData({ nama_kategori: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold"
                                    placeholder="Contoh: Minuman Dingin"
                                />
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
