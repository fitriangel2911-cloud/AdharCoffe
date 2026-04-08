import React, { useState, useEffect } from 'react';
import {
    Cloud,
    Flower2,
    ShieldCheck,
    HeartHandshake,
    Heart,
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
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
            setCart([...cart, { ...product, qty: 1, catatan: "" }]);
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

    const getMenuImage = (name, category) => {
        const lowerName = name.toLowerCase();
        
        // --- Minuman ---
        if (lowerName.includes('kopi susu aren')) return 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80'; 
        if (lowerName.includes('kopi susu')) return 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80'; 
        if (lowerName.includes('kopi hitam')) return 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&w=400&q=80'; 
        
        if (lowerName.includes('teh lemon') || lowerName.includes('lemon')) return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80';
        if (lowerName.includes('teh hijau')) return '/teh-hijau-final.png';
        if (lowerName.includes('matcha')) return 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?auto=format&fit=crop&w=400&q=80';
        if (lowerName.includes('teh jasmine') || lowerName.includes('jasmine')) return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80';
        if (lowerName.includes('teh tubruk')) return '/teh-tubruk-final.png';
        if (lowerName.includes('teh')) return 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80';
        
        if (lowerName.includes('air kosongan') || lowerName.includes('air')) return 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80';
        
        // --- Makanan ---
        if (lowerName.includes('mie lurus')) return 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=400&q=80';
        if (lowerName.includes('mie godog') || lowerName.includes('mie')) return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80';
        
        if (lowerName.includes('kentang') || lowerName.includes('krispy')) return 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=400&q=80';
        if (lowerName.includes('roti bakar') || lowerName.includes('roti')) return '/roti-bakar-new.png';
        if (lowerName.includes('tahu') || lowerName.includes('krispi')) return 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&w=400&q=80';
        if (lowerName.includes('bola') || lowerName.includes('ubi')) return '/bola-ubi-new.png'; 
        
        // Defaults by category
        if (category === 'Makanan') return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
        if (category === 'Minuman') return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80';
        return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80';
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
    
    const updateCatatan = (id, text) => {
        setCart(cart.map(item => item.id === id ? { ...item, catatan: text } : item));
    };
    const clearCart = () => {
        if (window.confirm("Hapus semua pesanan?")) {
            setCart([]);
            setNamaPembeli('');
            setKontak('');
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (isProcessing) return;
        if (tipePesanan === 'Makan Ditempat' && !selectedTable) {
            setShowTableModal(true);
            return;
        }

        setIsProcessing(true);
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
                    infaq: isInfaqEnabled ? Math.round(Number(item.harga) * 0.025) : 0,
                    catatan: item.catatan || null
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
                
                // Simpan snapshot pesanan untuk struk sebelum keranjang dihapus
                setCurrentOrder({
                    items: [...cart],
                    total: totalDebit,
                    infaq: infaqSedekah,
                    pembeli: namaPembeli || 'Umum',
                    kontak: kontak
                });
                
                setShowReceipt(true);
                setCart([]); // Reset keranjang setelah bayar
                fetchData();
                setSelectedTable(null);
            } else {
                const err = await response.json();
                alert("Gagal menyimpan transaksi: " + (err.detail || "Error"));
            }
        } catch (error) {
            alert("Gagal menghubungi server. Silakan cek koneksi Anda.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const handlePrint = () => {
        window.print();
    };

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
        <div className="min-h-screen bg-[#f3f9ff] flex flex-col font-outfit text-slate-800 antialiased">
            {/* Solid Sky Blue Header */}
            <nav className="h-24 bg-[#1ca3f4] flex items-center justify-between px-10 sticky top-0 z-[80] shadow-lg shadow-[#1ca3f4]/10">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/30">
                        <Coffee className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-white leading-none">Adhar Coffe</h1>
                            <span className="text-xl">🍵</span>
                        </div>
                        <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em] mt-1.5">Realtime Self Order</p>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="bg-[#0c4a6e]/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none mb-1">Selamat Datang</span>
                            <span className="text-[13px] font-black text-white leading-none">{user?.nama || 'Admin'}</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="bg-[#f472b6] hover:bg-pink-500 text-white px-8 py-3.5 rounded-full font-black text-[13px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20 active:scale-95">
                        <LogOut className="w-4 h-4" /> Keluar
                    </button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Main Content Area */}
                <section className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar scroll-smooth">
                    <div className="flex items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <Cloud className="w-10 h-10 text-[#1ca3f4]" />
                            <h2 className="text-3xl font-black text-[#0c4a6e] tracking-tight">Pilih Menu</h2>
                        </div>

                        <div className="relative w-[450px]">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-300" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari menu kopi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 rounded-full border border-slate-100 focus:outline-none focus:ring-4 focus:ring-[#1ca3f4]/10 focus:border-[#1ca3f4]/30 bg-white shadow-sm font-bold text-sm transition-all text-slate-800"
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12">
                            {filteredMenu.map((produk) => (
                                <button
                                    key={produk.id}
                                    onClick={() => addToCart(produk)}
                                    className="bg-white px-4 py-8 rounded-[4rem] border border-slate-100 hover:border-[#1ca3f4]/30 hover:shadow-2xl hover:shadow-sky-100/50 hover:-translate-y-2 transition-all group relative flex flex-col items-center text-center w-full max-w-[160px] mx-auto shadow-sm"
                                >
                                    {/* HALAL Tag */}
                                    <div className="absolute top-6 bg-[#ecfdf5] text-[#059669] text-[8px] font-black px-2.5 py-1 rounded-full border border-[#059669]/20 tracking-widest uppercase z-10 shadow-sm">
                                        HALAL
                                    </div>

                                    <div className="w-24 h-24 rounded-full mt-2 mb-4 shadow-xl overflow-hidden group-hover:scale-110 transition-transform relative ring-4 ring-slate-50 group-hover:ring-[#1ca3f4]/30 bg-slate-100 flex items-center justify-center">
                                        <img src={getMenuImage(produk.nama_menu, produk.kategori)} alt={produk.nama_menu} className="w-full h-full object-cover" loading="lazy" />
                                    </div>

                                    <h3 className="font-black text-[17px] text-[#0c4a6e] leading-tight mb-2 px-2 line-clamp-2 min-h-[40px]">
                                        {produk.nama_menu}
                                    </h3>
                                    
                                    <p className="text-[#f472b6] font-black text-xl mb-4">
                                        {formatRp(produk.harga).replace('Rp', 'Rp ')}
                                    </p>

                                    <div className="mt-auto px-4 py-1.5 bg-slate-50 text-slate-400 text-[11px] font-black rounded-full border border-slate-100 tracking-tighter shadow-inner">
                                        Stok: {produk.stok ?? 0}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Cart Sidebar */}
                <aside className={`fixed top-24 inset-x-0 bottom-0 z-[60] lg:relative lg:top-0 lg:inset-auto lg:flex ${showCartMobile ? 'flex' : 'hidden'} lg:w-[420px] bg-white flex flex-col shrink-0 border-l border-slate-100 shadow-2xl lg:shadow-none transition-all`}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                        {/* Sharia & AI Banners */}
                        <div className="p-6 space-y-4">
                            {/* Sharia Compliance */}
                            <div className="bg-[#ecfdf5] border border-[#10b981]/20 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-100">
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                    </div>
                                    <span className="text-[11px] font-black text-[#065f46] uppercase tracking-wider">SHARIA COMPLIANCE VERIFIED</span>
                                </div>
                                <span className="bg-white/60 text-[9px] font-black text-[#059669] px-2 py-1 rounded-lg border border-green-100 uppercase tracking-tighter">AUDIT AKTIF</span>
                            </div>

                            {/* Customer Info Form - RESTORED & REDESIGNED */}
                            <div className="space-y-5 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mt-2">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-black text-[#1ca3f4] uppercase tracking-widest ml-1">Nama Pembeli <span className="text-rose-500">*</span></label>
                                        <input 
                                            type="text" 
                                            placeholder="Nama..." 
                                            value={namaPembeli}
                                            onChange={(e) => setNamaPembeli(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f0f9ff] bg-[#f8fafc] text-[16px] font-bold text-[#0c4a6e] focus:border-[#1ca3f4]/30 focus:outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <label className="text-sm font-black text-[#f472b6] uppercase tracking-widest ml-1">Meja {tipePesanan === 'Makan Ditempat' && <span className="text-rose-500">*</span>}</label>
                                        <button 
                                            onClick={() => setShowTableModal(true)}
                                            className="w-full px-2 py-3.5 rounded-2xl border-2 border-[#f0f9ff] bg-[#f8fafc] flex items-center justify-center gap-2 group hover:border-[#f472b6]/30 transition-all"
                                        >
                                            <Monitor className={`w-4 h-4 ${selectedTable ? 'text-[#f472b6]' : 'text-[#f472b6] opacity-80'}`} />
                                            <span className={`text-[16px] font-black ${selectedTable ? 'text-[#f472b6]' : 'text-[#f472b6] opacity-80'}`}>
                                                {selectedTable ? `${selectedTable}` : 'Pilih'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-[#1ca3f4] uppercase tracking-widest ml-1">Email <span className="text-rose-500">*</span></label>
                                    <input 
                                        type="email" 
                                        placeholder="email@domain.com" 
                                        value={kontak}
                                        onChange={(e) => setKontak(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f0f9ff] bg-[#f8fafc] text-[16px] font-bold text-[#0c4a6e] focus:border-[#1ca3f4]/30 focus:outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[#1ca3f4] uppercase tracking-widest ml-1">Tipe Pesanan <span className="text-rose-500">*</span></label>
                                        <select 
                                            value={tipePesanan}
                                            onChange={(e) => setTipePesanan(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f0f9ff] bg-[#f8fafc] text-[16px] font-black text-[#0c4a6e] focus:border-[#1ca3f4]/30 focus:outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Makan Ditempat">Makan di Tempat</option>
                                            <option value="Bawa Pulang">Bawa Pulang</option>
                                            <option value="Diantar">Diantar</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[#1ca3f4] uppercase tracking-widest ml-1">Pembayaran <span className="text-rose-500">*</span></label>
                                        <select 
                                            value={metodePembayaran}
                                            onChange={(e) => setMetodePembayaran(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f0f9ff] bg-[#f8fafc] text-[16px] font-black text-[#0c4a6e] focus:border-[#1ca3f4]/30 focus:outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="QRIS">QRIS</option>
                                            <option value="Tunai">Tunai</option>
                                            <option value="Transfer">Transfer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* AI Audit Box */}
                            <div className="border-2 border-dashed border-[#1ca3f4]/20 bg-[#f0f9ff]/50 p-5 rounded-3xl relative overflow-hidden group">
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="w-1.5 h-1.5 bg-[#1ca3f4] rounded-full mt-1.5 animate-pulse"></div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-[#1ca3f4] uppercase tracking-[0.15em]">AI Audit System Analytics</p>
                                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                                            Menganalisis kejujuran harga dan ketersediaan stok produk secara realtime untuk transparansi transaksi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Sticky Header Section */}
                        <div className="px-8 py-8 border-y border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#f472b6] shadow-sm border border-pink-100">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#0c4a6e] leading-none">Pesanan Anda</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Ringkasan Belanja</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={clearCart} className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="bg-[#f472b6] text-white text-xs font-black w-8 h-8 flex items-center justify-center rounded-full shadow-lg shadow-pink-200">
                                    {cart.reduce((a, b) => a + b.qty, 0)}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-8 space-y-6">
                            {cart.length === 0 ? (
                                <div className="text-center py-24 text-slate-300">
                                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold text-sm">Keranjang masih kosong</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 group/item shadow-sm hover:shadow-md transition-all">
                                            <div className="w-16 h-16 rounded-2xl relative shadow-sm border-2 border-white overflow-hidden shrink-0 group-hover:ring-2 ring-slate-100 transition-all bg-slate-50">
                                                <div className="absolute top-0 right-0 w-6 h-6 bg-[#f472b6] text-white rounded-bl-xl flex items-center justify-center text-[11px] font-black shadow-lg z-10">{item.qty}</div>
                                                <img src={getMenuImage(item.nama_menu, item.kategori)} alt={item.nama_menu} className="w-full h-full object-cover relative z-0" loading="lazy" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-[20px] text-[#0c4a6e] truncate mb-0.5">{item.nama_menu}</h4>
                                                
                                                {/* Catatan Field */}
                                                <div className="mb-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Catatan (opsional)..."
                                                        value={item.catatan || ''}
                                                        onChange={(e) => updateCatatan(item.id, e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-500 focus:outline-none focus:border-sky-200 transition-all placeholder:text-slate-300"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-[#f472b6] font-black text-[18px]">{formatRp(item.harga * item.qty)}</p>
                                                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                                                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"><Minus className="w-4 h-4" strokeWidth={4} /></button>
                                                        <span className="text-[15px] font-black text-slate-600 w-6 text-center">{item.qty}</span>
                                                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#1ca3f4] hover:bg-white rounded-lg transition-all"><Plus className="w-4 h-4" strokeWidth={4} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Infaq Toggle section */}
                        <div className="px-6 py-6 bg-white border-t border-slate-50 space-y-4">
                            <div className="flex items-center justify-between p-5 bg-sky-50/50 border border-sky-100 rounded-[2rem] shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm border border-pink-50">
                                        <Heart className="w-5 h-5 fill-current" />
                                    </div>
                                    <p className="text-[14px] font-black text-[#0c4a6e] uppercase tracking-wider">Berinfaq 2.5%</p>
                                </div>
                                <button onClick={() => setIsInfaqEnabled(!isInfaqEnabled)} className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1.5 ${isInfaqEnabled ? 'bg-[#f472b6] shadow-lg shadow-pink-100' : 'bg-slate-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isInfaqEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            <div className="space-y-4 px-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sky-500 text-[17px]">Subtotal</span>
                                    <span className="font-black text-sky-600 text-[20px]">{formatRp(totalDebit)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-pink-400 text-[17px]">Infaq (2.5%)</span>
                                    <span className="font-black text-pink-500 text-[20px]">{formatRp(infaqSedekah)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Checkbox */}
                        <div className="px-6 pb-6 bg-white">
                            <button onClick={() => setIsAgreed(!isAgreed)} className={`w-full p-4 rounded-3xl border-2 flex items-center gap-4 transition-all ${isAgreed ? 'bg-pink-50 border-pink-200' : 'bg-white border-slate-100 hover:border-pink-200 shadow-sm'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${isAgreed ? 'bg-[#f472b6] border-[#f472b6] text-white shadow-lg shadow-pink-200' : 'bg-white border-pink-200 text-transparent'}`}>
                                    <Check className="w-5 h-5" strokeWidth={4} />
                                </div>
                                <span className={`text-[13px] font-black uppercase tracking-tighter text-left ${isAgreed ? 'text-[#f472b6]' : 'text-pink-900/60'}`}>
                                    SAYA KONFIRMASI PESANAN SUDAH BENAR & AMANAH
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Footer Block */}
                    <div className="p-8 bg-[#0c4a6e] border-t border-white/5 sticky bottom-0 z-[70] shadow-[0_-15px_40px_rgba(12,74,110,0.3)]">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-sky-300 uppercase tracking-[0.2em] mb-1">Total Bayar</span>
                                <span className="text-4xl font-black text-white tracking-tighter">{formatRp(totalDebit + infaqSedekah)}</span>
                            </div>
                            
                            <button 
                                disabled={isProcessing || cart.length === 0 || !isAgreed || !namaPembeli.trim() || (tipePesanan === 'Makan Ditempat' && !selectedTable) || !kontak || !kontak.includes('@')} 
                                onClick={handleCheckout} 
                                className={`flex-1 h-16 rounded-3xl font-black text-[15px] uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 border-b-4 ${isProcessing ? 'bg-slate-600 border-slate-700 text-slate-400' : 'bg-[#1ca3f4] border-sky-600 text-white hover:bg-sky-400 shadow-sky-900/20'}`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        Bayar Sekarang
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Receipt Modal */}
            {showReceipt && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#f472b6] p-8 text-center text-white relative shrink-0">
                            <button 
                                onClick={() => { setShowReceipt(false); window.dispatchEvent(new CustomEvent('navToWaiting')); }} 
                                className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-xl p-2 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
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
                                {currentOrder?.items.map(item => (
                                    <div key={item.id} className="flex justify-between text-[15px] py-1">
                                        <div className="flex-1"><p className="font-black text-slate-700">{item.nama_menu}</p><p className="text-slate-400 text-sm font-bold">{item.qty} x {formatRp(item.harga)}</p></div>
                                        <p className="font-black text-slate-800">{formatRp(item.harga * item.qty)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatRp(currentOrder?.total || 0)}</span></div>
                                <div className="flex justify-between text-sm text-sky-600"><span>Infaq (2.5%)</span><span>{formatRp(currentOrder?.infaq || 0)}</span></div>
                            </div>
                            <div className="bg-[#f472b6] p-5 rounded-2xl flex justify-between items-center shadow-lg shadow-pink-100">
                                <span className="font-black text-white text-xs uppercase tracking-widest">Total</span>
                                <span className="font-black text-white text-2xl">{formatRp((currentOrder?.total || 0) + (currentOrder?.infaq || 0))}</span>
                            </div>
                            <div className="mt-6 text-center text-slate-400 text-[10px] font-medium leading-relaxed">
                                <p>Pesanan telah diterima & masuk antrian.</p>
                                {currentOrder?.kontak && currentOrder?.kontak.includes('@') && (
                                    <p className="mt-2 text-sky-500 font-bold italic">
                                        *Salinan struk telah dikirim ke email Anda.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-white border-t border-slate-50 grid grid-cols-2 gap-3 shrink-0">
                            <button onClick={handlePrint} className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                                <Printer className="w-4 h-4" /> Cetak
                            </button>
                            <button 
                                onClick={() => { 
                                    setShowReceipt(false); 
                                    window.dispatchEvent(new CustomEvent('navToWaiting')); 
                                }} 
                                className="flex items-center justify-center gap-2 py-4 bg-[#1ca3f4] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 shadow-xl shadow-[#1ca3f4]/20 transition-all active:scale-95 border-b-4 border-sky-600"
                            >
                                <Clock className="w-4 h-4" /> LIHAT ANTRIAN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Modal */}
            {showTableModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#f472b6] p-8 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Layout className="w-8 h-8 text-white" />
                                <h3 className="font-black text-2xl uppercase tracking-tight">Manajemen Meja</h3>
                            </div>
                            <button onClick={() => setShowTableModal(false)} className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all"><X className="w-6 h-6" /></button>
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
                            <button onClick={() => setShowTableModal(false)} className="bg-sky-500 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-sky-100 hover:bg-sky-600">Selesai</button>
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