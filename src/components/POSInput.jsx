import React, { useState, useEffect } from 'react';
import {
    Cloud,
    Flower2,
    ShieldCheck,
    HeartHandshake,
    Coffee,
    Plus,
    Minus,
    Trash2,
    LogOut,
    Printer,
    X,
    Check,
    UserCircle,
    Loader2,
    Search,
    ShoppingBag,
    Leaf,
    Utensils,
    Monitor,
    Layout,
    ShoppingCart,
    Mail
} from 'lucide-react';

export default function POSInput({ user, onLogout }) {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [cart, setCart] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [namaPembeli, setNamaPembeli] = useState('');
    const [kontak, setKontak] = useState('');
    const [metodePembayaran, setMetodePembayaran] = useState('QRIS');
    const [tipePesanan, setTipePesanan] = useState('Makan Ditempat');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isInfaqEnabled, setIsInfaqEnabled] = useState(true);
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showTableModal, setShowTableModal] = useState(false);
    const [activeFloor, setActiveFloor] = useState(1);
    const [tableStatuses, setTableStatuses] = useState({});

    useEffect(() => {
        if (tipePesanan !== 'Diantar' && metodePembayaran === 'Tunai') {
            setMetodePembayaran('QRIS');
        }
    }, [tipePesanan, metodePembayaran]);

    const fetchData = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const [menuRes, catRes] = await Promise.all([
                fetch('/api/menu'),
                fetch('/api/kategori')
            ]);
            
            if (!menuRes.ok || !catRes.ok) {
                throw new Error("Gagal mengambil data dari server");
            }

            const menuData = await menuRes.json();
            const catData = await catRes.json();
            
            setMenuItems(menuData);
            setCategories(catData);
        } catch (error) {
            console.error("Fetch error:", error);
            setFetchError(error.message || "Gagal menghubungi server");
        } finally {
            setLoading(false);
        }
    };

    const fetchOccupiedTables = async () => {
        try {
            const res = await fetch('/api/tables/status');
            if (res.ok) {
                const data = await res.json();
                setTableStatuses(data);
            }
        } catch (error) {
            console.error("Fetch table status error:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchOccupiedTables();
        const interval = setInterval(fetchOccupiedTables, 5000);
        return () => clearInterval(interval);
    }, []);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (product.stok !== undefined && (existing ? existing.qty : 0) >= product.stok) {
            return;
        }
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const getMenuIcon = (name, category) => {
        const lowerName = name.toLowerCase();
        if (category === 'Makanan') {
            if (lowerName.includes('mie') || lowerName.includes('bakso')) return Utensils;
            if (lowerName.includes('kentang') || lowerName.includes('krispi')) return Utensils;
            return Utensils;
        }
        if (lowerName.includes('teh') || lowerName.includes('tea') || lowerName.includes('matcha') || lowerName.includes('lemon')) {
            return Leaf;
        }
        return Coffee;
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                if (delta > 0 && item.stok !== undefined && newQty > item.stok) return item;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
    const clearCart = () => {
        if (window.confirm("Hapus semua pesanan?")) {
            setCart([]);
            setNamaPembeli('');
            setKontak('');
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (tipePesanan === 'Makan Ditempat' && !selectedTable) {
            setShowTableModal(true);
            return;
        }

        const transaksiData = [];
        cart.forEach(item => {
            for (let i = 0; i < item.qty; i++) {
                transaksiData.push({
                    kuantitas_menu: item.id,
                    hpp: Number(item.hpp || 0),
                    harga: Number(item.harga),
                    nama_pembeli: namaPembeli || 'Umum',
                    no_meja: tipePesanan === 'Makan Ditempat' ? selectedTable : null,
                    metode_pembayaran: metodePembayaran,
                    kontak: kontak,
                    tipe_pesanan: tipePesanan,
                    infaq: isInfaqEnabled ? Math.round(Number(item.harga) * 0.025) : 0
                });
            }
        });

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaksiData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.data && result.data.length > 0) {
                    const firstItem = result.data[0];
                    sessionStorage.setItem('lastOrderKey', `${firstItem.nama_pembeli}_${firstItem.created_at}`);
                }
                setShowReceipt(true);
                fetchData();
                setSelectedTable(null);
            } else {
                const err = await response.json();
                alert("Gagal menyimpan transaksi: " + (err.detail || "Error"));
            }
        } catch (error) {
            alert("Gagal menghubungi server");
        }
    };

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const TableComponent = ({ table, selectedTable, tableStatuses, onSelect }) => {
        const status = tableStatuses[String(table.id)] || 'available';
        const isAvailable = status === 'available';
        const isSelected = selectedTable === table.id;
        const canSelect = isAvailable && !isSelected;
        const isBusy = !isAvailable;

        const chairColor = isSelected ? 'bg-sky-400' : isBusy ? 'bg-rose-100' : 'bg-slate-200 group-hover:bg-sky-200';
        const tableColor = isSelected ? 'bg-sky-500 text-white scale-125 shadow-xl ring-8 ring-sky-500/10' : isBusy ? 'bg-rose-50 border-2 border-rose-100 text-rose-300 opacity-60' : 'bg-white border-2 border-slate-100 text-slate-400 group-hover:border-sky-300 group-hover:text-sky-500';

        return (
            <div className="flex flex-col items-center justify-center">
                <div className={`relative group ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={() => canSelect && onSelect(table.id)}>
                    <div className="absolute -inset-2">
                        {table.seats === 4 ? (
                            <>
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-5 h-2.5 rounded-t-sm transition-colors ${chairColor}`}></div>
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-5 h-2.5 rounded-b-sm transition-colors ${chairColor}`}></div>
                                <div className={`absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-2.5 h-5 rounded-l-sm transition-colors ${chairColor}`}></div>
                                <div className={`absolute right-0 top-1/2 translate-x-full -translate-y-1/2 w-2.5 h-5 rounded-r-sm transition-colors ${chairColor}`}></div>
                            </>
                        ) : (
                            <>
                                <div className={`absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-2.5 h-6 rounded-l-full transition-colors ${chairColor}`}></div>
                                <div className={`absolute right-0 top-1/2 translate-x-full -translate-y-1/2 w-2.5 h-6 rounded-r-full transition-colors ${chairColor}`}></div>
                            </>
                        )}
                    </div>
                    <div className={`relative transition-all duration-300 flex items-center justify-center font-black text-sm shadow-[0_4px_10px_rgba(0,0,0,0.05)] ${table.seats === 4 ? 'w-16 h-12 rounded-xl' : 'w-10 h-10 rounded-full'} ${tableColor}`}>
                        {table.id}
                        {isSelected && <div className="absolute -top-1.5 -right-1.5 bg-pink-500 rounded-full p-0.5 border-2 border-white shadow-md"><ShieldCheck className="w-3 h-3 text-white" /></div>}
                        {isBusy && !isSelected && <div className="absolute -top-1.5 -right-1.5 bg-rose-500 rounded-full p-0.5 border-2 border-white shadow-md"><X className="w-2.5 h-2.5 text-white" /></div>}
                    </div>
                </div>
                <span className={`text-[7px] font-black mt-4 uppercase tracking-[0.1em] ${isBusy ? 'text-rose-300' : 'text-slate-400'}`}>{isBusy ? 'Penuh' : `${table.seats} Kursi`}</span>
            </div>
        );
    };

    const tables = {
        1: [...Array.from({ length: 6 }, (_, i) => ({ id: i + 1, seats: 4 })), ...Array.from({ length: 8 }, (_, i) => ({ id: i + 7, seats: 2 }))],
        2: [...Array.from({ length: 6 }, (_, i) => ({ id: i + 15, seats: 4 })), ...Array.from({ length: 8 }, (_, i) => ({ id: i + 21, seats: 2 }))]
    };

    const filteredMenu = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'Semua' || item.kategori === activeCategory;
        const matchesSearch = item.nama_menu.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalDebit = cart.reduce((sum, item) => sum + (Number(item.harga) * item.qty), 0);
    const infaqSedekah = isInfaqEnabled ? totalDebit * 0.025 : 0;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-outfit text-slate-800 antialiased">
            {/* Top Navigation */}
            <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50 transition-all">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <Coffee className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">ADHAR COFFE</h1>
                        <p className="text-[10px] font-bold text-sky-500 uppercase tracking-[0.3em] mt-1.5">Premium Experience</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black leading-none">{user?.nama || 'Admin'}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Staff'}</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-11 h-11 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Menu Section */}
                <section className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar scroll-smooth">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-sky-500 rounded-full"></div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Menu Utama</h2>
                                <p className="text-sm font-bold text-slate-400">Pilih menu favorit untuk pesanan baru.</p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-[350px] group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari menu terbaik..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-slate-100 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-300 bg-white shadow-sm font-bold text-sm transition-all text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-6 -mx-2 px-2 hide-scrollbar">
                        <button onClick={() => setActiveCategory('Semua')} className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeCategory === 'Semua' ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-100' : 'bg-white text-slate-400 border-slate-100 hover:border-sky-200 hover:text-sky-500 shadow-sm'}`}>
                            SEMUA MENU
                        </button>
                        {categories.map((cat) => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.nama_kategori)} className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat.nama_kategori ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-100' : 'bg-white text-slate-400 border-slate-100 hover:border-sky-200 hover:text-sky-500 shadow-sm'}`}>
                                {cat.nama_kategori}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-sky-200">
                            <Loader2 className="animate-spin w-12 h-12 mb-4" />
                            <p className="font-black text-slate-400">Menyiapkan menu terbaik...</p>
                        </div>
                    ) : filteredMenu.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                            <Flower2 className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-bold">Menu tidak ditemukan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                            {filteredMenu.map((produk) => (
                                <button key={produk.id} onClick={() => addToCart(produk)} className="bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-sky-200 hover:shadow-2xl hover:shadow-sky-100/50 hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col items-center text-center">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-3xl mb-4 flex items-center justify-center relative group-hover:scale-105 transition-transform overflow-hidden">
                                        <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                                            {React.createElement(getMenuIcon(produk.nama_menu, produk.kategori), { className: "w-8 h-8 md:w-10 md:h-10 text-sky-500" })}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-[15px] md:text-[17px] text-slate-800 line-clamp-2 min-h-[44px] leading-tight mb-2">{produk.nama_menu}</h3>
                                    <p className="text-sky-600 font-black text-lg mb-3">{formatRp(produk.harga)}</p>
                                    <div className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${produk.stok <= 0 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        Stok: {produk.stok ?? 0}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Cart Sidebar */}
                <aside className={`fixed inset-0 z-[60] lg:relative lg:inset-auto lg:flex ${showCartMobile ? 'flex' : 'hidden'} lg:w-[420px] bg-white flex flex-col shrink-0 border-l border-slate-100 shadow-2xl lg:shadow-none transition-all`}>
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800 leading-none">Keranjang</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pesanan Aktif</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {cart.length > 0 && <button onClick={clearCart} className="w-10 h-10 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>}
                            <div className="bg-sky-500 text-white text-xs font-black min-w-[32px] h-8 flex items-center justify-center rounded-xl px-2">{cart.reduce((a, b) => a + b.qty, 0)}</div>
                            <button onClick={() => setShowCartMobile(false)} className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl"><X className="w-6 h-6" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="m-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-5">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nama Pembeli</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center"><UserCircle className="w-4 h-4 text-slate-300" /></div>
                                        <input type="text" placeholder="Nama Pelanggan..." value={namaPembeli} onChange={(e) => setNamaPembeli(e.target.value)} className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-400 font-bold text-sm shadow-sm outline-none" />
                                    </div>
                                </div>
                                {tipePesanan === 'Makan Ditempat' && (
                                    <div className="w-[85px] space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase text-center block">Meja</label>
                                        <button onClick={() => setShowTableModal(true)} className={`w-full h-[46px] flex items-center justify-center gap-2 rounded-2xl border font-black text-sm transition-all ${selectedTable ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-sky-300'}`}>
                                            <Monitor className="w-4 h-4" />
                                            {selectedTable ? `#${selectedTable}` : '?'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kontak Konfirmasi (Email/WA)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center"><Mail className="w-4 h-4 text-slate-300" /></div>
                                        <input type="text" placeholder="email@... / 08..." value={kontak} onChange={(e) => setKontak(e.target.value)} className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-400 font-bold text-sm shadow-sm outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipe</label>
                                        <select value={tipePesanan} onChange={(e) => setTipePesanan(e.target.value)} className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 font-bold text-sm outline-none shadow-sm cursor-pointer">
                                            <option value="Makan Ditempat">Ditempat</option>
                                            <option value="Bawa Pulang">Bungkus</option>
                                            <option value="Diantar">Delivery</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Bayar</label>
                                        <select value={metodePembayaran} onChange={(e) => setMetodePembayaran(e.target.value)} className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 font-bold text-sm outline-none shadow-sm cursor-pointer">
                                            {tipePesanan === "Diantar" && <option value="Tunai">Tunai / COD</option>}
                                            <option value="QRIS">QRIS / Digital</option>
                                            <option value="Transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pb-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Detail Pesanan</h3>
                            {cart.length === 0 ? (
                                <div className="text-center py-20"><p className="text-sm font-bold text-slate-400">Belum ada menu pilihan</p></div>
                            ) : (
                                <div className="space-y-5">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 group/item">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center relative p-2">
                                                <div className="absolute -top-1 -left-1 w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">{item.qty}</div>
                                                {React.createElement(getMenuIcon(item.nama_menu, item.kategori), { className: "w-7 h-7 text-slate-400 group-hover/item:text-sky-500 transition-colors" })}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-slate-800 truncate mb-1">{item.nama_menu}</h4>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sky-600 font-black text-xs">{formatRp(item.harga * item.qty)}</p>
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"><Minus className="w-3 h-3" strokeWidth={4} /></button>
                                                        <span className="text-xs font-black text-slate-600 w-4 text-center">{item.qty}</span>
                                                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-white rounded-lg transition-all"><Plus className="w-3 h-3" strokeWidth={4} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="w-9 h-9 flex items-center justify-center text-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-8 pb-10 space-y-4">
                            <div className="p-5 bg-sky-50 rounded-[2rem] border border-sky-100/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-500 shadow-sm border border-sky-100"><HeartHandshake className="w-5 h-5" /></div>
                                        <p className="text-sm font-black text-sky-900">Infaq 2.5%</p>
                                    </div>
                                    <button onClick={() => setIsInfaqEnabled(!isInfaqEnabled)} className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${isInfaqEnabled ? 'bg-sky-500 shadow-lg shadow-sky-100' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isInfaqEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setIsAgreed(!isAgreed)} className={`w-full p-5 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${isAgreed ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-100' : 'bg-white border-slate-100 border-dashed hover:border-sky-300'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isAgreed ? 'bg-sky-500 text-white' : 'bg-slate-50 text-slate-300'}`}><Check className="w-5 h-5" strokeWidth={3} /></div>
                                <div className="text-left">
                                    <p className={`text-[11px] font-black uppercase ${isAgreed ? 'text-white' : 'text-slate-400'}`}>Konfirmasi Data</p>
                                    <p className={`text-[9px] font-bold ${isAgreed ? 'text-sky-300' : 'text-slate-300 italic'}`}>Pesanan sudah benar & amanah</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-white border-t border-slate-50 sticky bottom-0 z-30">
                        <div className="flex justify-between items-center px-1 mb-6">
                            <span className="text-[13px] font-bold text-slate-400">Total Tagihan</span>
                            <span className="text-xl font-black text-slate-800">{formatRp(totalDebit + infaqSedekah)}</span>
                        </div>
                        <button disabled={cart.length === 0 || !isAgreed} onClick={handleCheckout} className="w-full h-16 bg-sky-500 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all hover:bg-sky-400 active:scale-95 shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3">
                            <ShoppingCart className="w-5 h-5" />
                            Selesaikan Pesanan
                        </button>
                    </div>
                </aside>
            </main>

            {/* Receipt Modal */}
            {showReceipt && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-900 p-8 text-center text-white relative shrink-0">
                            <button onClick={() => setShowReceipt(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-xl p-2 transition-all"><X className="w-5 h-5" /></button>
                            <div className="w-16 h-16 bg-sky-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-sky-500/20"><Coffee className="w-8 h-8 text-white" strokeWidth={2.5} /></div>
                            <h3 className="font-black text-2xl tracking-tight mb-1 uppercase">Transaksi Berhasil</h3>
                            <p className="text-sky-400 text-[10px] font-bold uppercase tracking-[0.3em]">Adhar Coffe Premium</p>
                        </div>
                        <div className="p-8 bg-[#f8fafc] flex-1 overflow-y-auto">
                            <div className="text-center mb-6">
                                <p className="text-[#0ea5e9] font-serif italic text-lg mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Struk Pembayaran</p>
                            </div>
                            <div className="border-y border-dashed border-slate-300 py-4 mb-4 space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div className="flex-1"><p className="font-bold text-slate-700">{item.nama_menu}</p><p className="text-slate-400 text-xs">{item.qty} x {formatRp(item.harga)}</p></div>
                                        <p className="font-bold text-slate-800">{formatRp(item.harga * item.qty)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatRp(totalDebit)}</span></div>
                                <div className="flex justify-between text-sm text-sky-600"><span>Infaq (2.5%)</span><span>{formatRp(infaqSedekah)}</span></div>
                            </div>
                            <div className="bg-slate-900 p-5 rounded-2xl flex justify-between items-center shadow-lg">
                                <span className="font-black text-sky-300 text-xs uppercase tracking-widest">Total</span>
                                <span className="font-black text-white text-2xl">{formatRp(totalDebit + infaqSedekah)}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-white border-t border-slate-50 grid grid-cols-2 gap-3 shrink-0">
                            <button onClick={handlePrint} className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                                <Printer className="w-4 h-4" /> Cetak
                            </button>
                            <button onClick={() => { setShowReceipt(false); window.dispatchEvent(new CustomEvent('navToWaiting')); }} className="flex items-center justify-center gap-2 py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all active:scale-95">
                                Antrian
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Modal */}
            {showTableModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Layout className="w-8 h-8 text-sky-400" />
                                <h3 className="font-black text-2xl uppercase tracking-tight">Manajemen Meja</h3>
                            </div>
                            <button onClick={() => setShowTableModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-2">
                            {[1, 2].map(f => (
                                <button key={f} onClick={() => setActiveFloor(f)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeFloor === f ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>Lantai {f}</button>
                            ))}
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto bg-slate-50/50">
                            <div className="grid grid-cols-4 gap-8">
                                {tables[activeFloor].map(table => (
                                    <TableComponent key={table.id} table={table} selectedTable={selectedTable} tableStatuses={tableStatuses} onSelect={(id) => { setSelectedTable(id); setShowTableModal(false); }} />
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih meja yang tersedia</p>
                            <button onClick={() => setShowTableModal(false)} className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl hover:bg-slate-800">Selesai</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Bar */}
            {!showCartMobile && cart.length > 0 && (
                <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                    <button onClick={() => setShowCartMobile(true)} className="w-full h-16 bg-[#24a9f9] text-white rounded-[2rem] shadow-2xl flex items-center justify-between px-8 border-4 border-white active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest">Detail Pesanan</span>
                        </div>
                        <span className="font-black text-lg">{formatRp(totalDebit + infaqSedekah)}</span>
                    </button>
                </div>
            )}
        </div>
    );
}