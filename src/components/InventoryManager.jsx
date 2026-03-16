import React, { useState, useEffect } from 'react';
import { 
    Package, 
    AlertTriangle, 
    RefreshCw, 
    Plus, 
    Minus, 
    Save, 
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    ShoppingCart,
    X
} from 'lucide-react';

export default function InventoryManager() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Purchase Modal State
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseForm, setPurchaseForm] = useState({
        qty: '',
        total_nominal: '',
        metode_pembayaran: 'Tunai'
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            setInventory(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            showFeedback("Gagal mengambil data inventaris", "error");
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handlePurchaseSubmit = async (e) => {
        e.preventDefault();
        setPurchaseLoading(true);
        try {
            const response = await fetch('/api/inventory/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: selectedItem.id,
                    qty: parseInt(purchaseForm.qty),
                    total_nominal: parseInt(purchaseForm.total_nominal),
                    metode_pembayaran: purchaseForm.metode_pembayaran
                })
            });

            if (response.ok) {
                const data = await response.json();
                setInventory(inventory.map(item => 
                    item.id === selectedItem.id ? { ...item, stok: data.new_stok } : item
                ));
                showFeedback("Pembelian berhasil dicatat dan stok diperbarui!", "success");
                setShowPurchaseModal(false);
                setPurchaseForm({ qty: '', total_nominal: '', metode_pembayaran: 'Tunai' });
            } else {
                showFeedback("Gagal mencatat pembelian", "error");
            }
        } catch (error) {
            console.error("Purchase error:", error);
            showFeedback("Kesalahan koneksi", "error");
        } finally {
            setPurchaseLoading(false);
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        setUpdatingId(id);
        try {
            const response = await fetch(`/api/menu/${id}/stok`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stok: parseInt(newStock) })
            });

            if (response.ok) {
                setInventory(inventory.map(item => 
                    item.id === id ? { ...item, stok: parseInt(newStock) } : item
                ));
                showFeedback("Stok berhasil diperbarui", "success");
            } else {
                showFeedback("Gagal memperbarui stok", "error");
            }
        } catch (error) {
            console.error("Update error:", error);
            showFeedback("Kesalahan koneksi", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredItems = inventory.filter(item => 
        item.nama_menu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockItems = inventory.filter(item => item.stok <= (item.min_stok || 5));

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#0c4a6e] flex items-center gap-3">
                            <Package className="w-8 h-8 text-[#24a9f9]" strokeWidth={2.5} />
                            Manajemen Inventaris
                        </h1>
                        <p className="text-slate-500 font-medium">Pantau dan kelola stok bahan baku serta produk.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari barang..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white shadow-sm font-bold text-sm w-64"
                            />
                        </div>
                        <button 
                            onClick={fetchInventory}
                            className="p-2.5 bg-white border border-sky-100 rounded-xl text-sky-500 hover:bg-sky-50 shadow-sm transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Total Produk</span>
                        <div className="text-3xl font-black text-[#0c4a6e]">{inventory.length}</div>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-3xl shadow-sm border border-emerald-100">
                        <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest block mb-1">Stok Aman</span>
                        <div className="text-3xl font-black text-emerald-600">
                            {inventory.filter(item => item.stok > (item.min_stok || 5)).length}
                        </div>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                        <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest block mb-1">Stok Menipis</span>
                        <div className="text-3xl font-black text-amber-600 flex items-center gap-2 relative z-10">
                            {lowStockItems.length}
                            {lowStockItems.length > 0 && <AlertTriangle className="w-6 h-6 animate-pulse" />}
                        </div>
                    </div>
                    <div className="bg-rose-50 p-6 rounded-3xl shadow-sm border border-rose-100">
                        <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest block mb-1">Habis / Kosong</span>
                        <div className="text-3xl font-black text-rose-600">
                            {inventory.filter(item => item.stok <= 0).length}
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-sky-50/50 text-[#0c4a6e]">
                                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest">Barang</th>
                                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-center">Stok Saat Ini</th>
                                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-center">Batas Minimum</th>
                                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-right">Aksi Cepat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-sky-200 mx-auto mb-4" />
                                        <p className="font-bold text-slate-300">Memuat data...</p>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <p className="font-bold text-slate-300">Tidak ada barang ditemukan</p>
                                    </td>
                                </tr>
                            ) : filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-500 shrink-0">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-black text-[#0c4a6e]">{item.nama_menu}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.kategori}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-lg ${
                                            item.stok <= 0 ? 'bg-rose-100 text-rose-600' :
                                            item.stok <= (item.min_stok || 5) ? 'bg-amber-100 text-amber-600' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {item.stok ?? 0}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center font-bold text-slate-400">
                                        {item.min_stok || 5}
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                             <button 
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowPurchaseModal(true);
                                                }}
                                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                            >
                                                <ShoppingCart className="w-3 h-3" />
                                                Catat Pembelian
                                            </button>
                                            <div className="h-4 w-px bg-slate-100 mx-1"></div>
                                            <button 
                                                onClick={() => handleUpdateStock(item.id, (item.stok || 0) + 10)}
                                                disabled={updatingId === item.id}
                                                className="px-4 py-2 bg-sky-500 text-white rounded-xl font-bold text-xs hover:bg-sky-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {updatingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                                Tambah 10
                                            </button>
                                            <div className="h-4 w-px bg-slate-100 mx-1"></div>
                                            <div className="flex items-center bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                                <button 
                                                    onClick={() => handleUpdateStock(item.id, Math.max(0, (item.stok || 0) - 1))}
                                                    className="p-2 hover:bg-slate-50 text-slate-400"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <input 
                                                    type="number"
                                                    value={item.stok ?? 0}
                                                    onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                                                    className="w-12 text-center font-bold text-xs focus:outline-none"
                                                />
                                                <button 
                                                    onClick={() => handleUpdateStock(item.id, (item.stok || 0) + 1)}
                                                    className="p-2 hover:bg-slate-50 text-slate-400"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 <div className="mt-8 text-center text-slate-400 text-xs font-medium">
                    * Stok otomatis berkurang setiap kali ada penjualan di halaman POS. Gunakan "Catat Pembelian" untuk menambah stok secara formal.
                </div>

                {/* Purchase Modal */}
                {showPurchaseModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                                <div>
                                    <h2 className="text-2xl font-black text-[#0c4a6e]">Catat Pembelian</h2>
                                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{selectedItem?.nama_menu}</p>
                                </div>
                                <button onClick={() => setShowPurchaseModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handlePurchaseSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-1">Jumlah (Qty)</label>
                                    <div className="relative">
                                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input 
                                            type="number" 
                                            required
                                            value={purchaseForm.qty}
                                            onChange={e => setPurchaseForm({...purchaseForm, qty: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 font-black text-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-1">Total Harga Beli (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-500">Rp</span>
                                        <input 
                                            type="number" 
                                            required
                                            value={purchaseForm.total_nominal}
                                            onChange={e => setPurchaseForm({...purchaseForm, total_nominal: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 font-black text-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-1">Metode Pembayaran</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Tunai', 'Transfer'].map(method => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPurchaseForm({...purchaseForm, metode_pembayaran: method})}
                                                className={`py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                                                    purchaseForm.metode_pembayaran === method 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-100'
                                                }`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit"
                                        disabled={purchaseLoading}
                                        className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {purchaseLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                        Simpan Pembelian
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
