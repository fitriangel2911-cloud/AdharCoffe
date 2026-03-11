import React, { useState, useEffect } from 'react';
import {
    Cloud,
    Flower2,
    ShieldCheck,
    HeartHandshake,
    Coffee,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    LogOut,
    Printer,
    X,
    User,
    Loader2,
    Search
} from 'lucide-react';

export default function POSInput({ user, onLogout }) {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [namaPembeli, setNamaPembeli] = useState('');

    const colors = [
        'bg-[#8b5cf6]', 'bg-[#5b21b6]', 'bg-[#7c3aed]',
        'bg-[#6d28d9]', 'bg-[#d97706]', 'bg-[#16a34a]',
        'bg-[#ec4899]', 'bg-[#0ea5e9]'
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [menuRes, catRes] = await Promise.all([
                    fetch('/api/menu'),
                    fetch('/api/kategori')
                ]);
                setMenuItems(await menuRes.json());
                setCategories(await catRes.json());
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Map cart to transaksi model: one row per item quantity
        const transaksiData = [];
        cart.forEach(item => {
            for (let i = 0; i < item.qty; i++) {
                transaksiData.push({
                    id_menu: item.id,
                    hpp: Number(item.hpp || 0),
                    harga: Number(item.harga),
                    nama_pembeli: namaPembeli || 'Umum'
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
                setShowReceipt(true);
                // We keep the cart and name for receipt, 
                // but usually you'd clear on close or start new order
            } else {
                const err = await response.json();
                alert("Gagal menyimpan transaksi: " + (err.detail || "Error"));
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Gagal menghubungi server");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredMenu = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'Semua' || item.kategori === activeCategory;
        const matchesSearch = item.nama_menu.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalDebit = cart.reduce((sum, item) => sum + (Number(item.harga) * item.qty), 0);
    const zakatPerniagaan = totalDebit * 0.025;
    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <div className="h-screen bg-[#f8fafc] flex flex-col font-sans text-sky-900 overflow-hidden">

            {/* Solid Top Header */}
            <header className="bg-[#24a9f9] px-6 py-3 flex justify-between items-center text-white z-20 shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <div className="bg-white/20 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                        <Coffee className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-wide leading-tight flex items-center gap-2">
                            SMART POS
                            <Flower2 className="w-4 h-4 text-pink-300" strokeWidth={3} />
                        </h1>
                        <p className="text-[12px] font-medium opacity-90 flex items-center gap-1.5 mt-0.5">
                            Adhar Coffe <ShieldCheck className="w-3.5 h-3.5" /> 100% Halal
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] cursor-default px-4 py-2.5 rounded-full transition-colors shadow-inner">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-wide">{user?.nama || 'Kasir'}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-[#f472b6] hover:bg-[#ec4899] text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all active:scale-95"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        <span className="text-sm">Keluar</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Menu Section */}
                <section className="flex-1 p-6 overflow-y-auto bg-[#f8fafc]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pr-2">
                        <h2 className="text-2xl font-black text-[#0c4a6e] flex items-center gap-2.5">
                            <Cloud className="w-7 h-7 text-[#24a9f9]" strokeWidth={2.5} />
                            Pilih Menu
                        </h2>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari menu kopi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#bae6fd] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 bg-white shadow-sm font-bold text-sm transition-all text-[#0c4a6e]"
                            />
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-6 -mx-2 px-2 hide-scrollbar">
                        <button
                            onClick={() => setActiveCategory('Semua')}
                            className={`px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all ${activeCategory === 'Semua'
                                ? 'bg-[#24a9f9] text-white shadow-lg shadow-sky-100'
                                : 'bg-white text-slate-500 hover:bg-sky-50 border border-slate-100 shadow-sm'
                                }`}
                        >
                            Semua Menu
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.nama_kategori)}
                                className={`px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all ${activeCategory === cat.nama_kategori
                                    ? 'bg-[#24a9f9] text-white shadow-lg shadow-sky-100'
                                    : 'bg-white text-slate-500 hover:bg-sky-50 border border-slate-100 shadow-sm'
                                    }`}
                            >
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
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pr-2 pb-8">
                            {filteredMenu.map((produk, idx) => (
                                <button
                                    key={produk.id}
                                    onClick={() => addToCart(produk)}
                                    className="bg-white p-6 rounded-[2.5rem] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.06)] border-2 border-transparent hover:border-[#bae6fd] hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col items-center text-center relative group"
                                >
                                    <div className="absolute top-5 right-5 bg-green-50 text-green-600 text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase border border-green-100 shadow-sm">
                                        HALAL
                                    </div>

                                    <div className={`w-20 h-20 ${colors[idx % colors.length]} rounded-full mb-5 flex items-center justify-center shadow-inner mt-2 opacity-90 group-hover:opacity-100 transition-opacity`}>
                                        <Coffee className="w-8 h-8 text-white/50" />
                                    </div>

                                    <h3 className="font-black text-[15px] mb-2 text-[#0c4a6e] group-hover:text-[#0284c7] line-clamp-2 min-h-[40px] leading-tight px-1">
                                        {produk.nama_menu}
                                    </h3>
                                    <p className="text-[#f472b6] font-black text-[17px]">{formatRp(produk.harga)}</p>

                                    <div className="mt-4 w-full h-1 bg-slate-50 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="h-full bg-sky-200 w-1/2 mx-auto rounded-full"></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Vertical Divider / Scrollbar space mock */}
                <div className="w-2.5 bg-[#e2e8f0] mx-1 rounded-full my-6 opacity-30 hidden lg:block"></div>

                {/* Cart Section */}
                <aside className="w-full lg:w-[400px] bg-white flex flex-col z-10 shrink-0 border-l border-slate-100 shadow-xl">
                    <div className="px-6 py-5 border-b border-[#fce7f3] bg-white flex justify-between items-center">
                        <h2 className="text-[19px] font-black text-[#0c4a6e] flex items-center gap-3">
                            <ShoppingCart className="w-[22px] h-[22px] text-[#f472b6]" strokeWidth={2.5} />
                            Pesanan Anda
                        </h2>
                        <div className="bg-[#f472b6] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-sm">
                            {cart.length} item
                        </div>
                    </div>

                    {/* Customer Name Input */}
                    <div className="px-6 py-4 bg-sky-50 border-b border-sky-100">
                        <label className="block text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1 ml-1">Nama Pembeli</label>
                        <input
                            type="text"
                            placeholder="Contoh: Budi"
                            value={namaPembeli}
                            onChange={(e) => setNamaPembeli(e.target.value)}
                            className="w-full bg-white px-4 py-2 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold text-sm text-sky-900 group"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto w-full bg-white relative">
                        {cart.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#e0f2fe] pointer-events-none">
                                <ShoppingCart className="w-24 h-24 mb-4" />
                                <p className="text-[16px] font-bold text-[#0ea5e9]">Belum ada pesanan</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex-1 mr-4 border-b border-dashed border-slate-200 pb-3">
                                            <h4 className="font-bold text-[15px] text-[#0c4a6e] truncate">{item.nama_menu}</h4>
                                            <p className="text-[#f472b6] text-[14px] font-black">{formatRp(item.harga)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 border border-slate-200 rounded-full px-2 py-1 shadow-sm shrink-0">
                                            <button onClick={() => updateQty(item.id, -1)} className="p-1.5 text-slate-400 hover:text-[#0284c7] hover:bg-slate-50 rounded-full transition">
                                                <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                                            </button>
                                            <span className="text-[14px] font-black w-4 text-center text-[#0c4a6e]">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="p-1.5 text-slate-400 hover:text-[#0284c7] hover:bg-slate-50 rounded-full transition">
                                                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Checkout Footer Area */}
                    <div className="p-6 bg-white border-t border-slate-100 z-20">
                        <div className="flex justify-between text-[#0284c7] text-[15px] mb-4">
                            <span>Subtotal</span>
                            <span className="font-bold">{formatRp(totalDebit)}</span>
                        </div>

                        <div className="border border-[#e0f2fe] rounded-2xl p-4 flex justify-between items-center mb-6 shadow-sm">
                            <span className="text-[#0c4a6e] font-black text-lg">Total Tagihan</span>
                            <span className="text-2xl font-black text-[#0284c7]">{formatRp(totalDebit)}</span>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                            className="w-full bg-[#e2e8f0] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] hover:enabled:bg-[#ec4899] enabled:bg-[#f472b6] enabled:text-white enabled:shadow-lg font-black py-4 rounded-xl transition-all text-lg flex items-center justify-center tracking-wide"
                        >
                            Proses Pembayaran
                        </button>
                    </div>
                </aside>
            </main>

            {/* Receipt Modal */}
            {showReceipt && (
                <div className="fixed inset-0 bg-[#0c4a6e]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[380px] overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Receipt Header */}
                        <div className="bg-[#24a9f9] p-6 text-center text-white relative">
                            <button onClick={() => setShowReceipt(false)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full p-1">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto flex items-center justify-center mb-3">
                                <Coffee className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-black text-xl mb-1">SMART POS</h3>
                            <p className="text-sm font-medium opacity-90">Adhar Coffe (Syariah)</p>
                            <div className="mt-2 bg-white/20 px-3 py-1 rounded-full text-[12px] font-bold inline-block">
                                Pembeli: {namaPembeli || 'Umum'}
                            </div>
                        </div>

                        {/* Receipt Content (Scrollable) */}
                        <div className="p-6 bg-[#f8fafc] flex-1 overflow-y-auto print:bg-white text-[#0f172a]">
                            <div className="text-center mb-5">
                                <p className="text-[#0ea5e9] font-arabic italic text-lg mb-1">
                                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                                </p>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Bukti Pembayaran</p>
                            </div>

                            <div className="border-t border-b border-dashed border-slate-300 py-4 mb-4 space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-start text-[13px]">
                                        <div className="max-w-[180px]">
                                            <p className="font-bold text-slate-700 leading-tight">{item.nama_menu}</p>
                                            <p className="text-slate-500">{item.qty} x {formatRp(item.harga)}</p>
                                        </div>
                                        <p className="font-bold text-slate-800">{formatRp(Number(item.harga) * item.qty)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 text-[13px] mb-4">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold">{formatRp(totalDebit)}</span>
                                </div>
                                <div className="flex justify-between text-[#db2777]">
                                    <span>Zakat Perniagaan (2.5%)</span>
                                    <span className="font-bold">{formatRp(zakatPerniagaan)}</span>
                                </div>
                            </div>

                            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-slate-800 text-[15px]">Total Pembayaran</span>
                                    <span className="font-black text-[#24a9f9] text-xl">{formatRp(totalDebit)}</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center text-slate-400 text-[11px] font-medium leading-relaxed">
                                <p>Terima kasih atas kunjungannya.</p>
                                <p>Semoga rezeki yang diperoleh membawa keberkahan.</p>
                            </div>
                        </div>

                        {/* Print Button */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <button
                                onClick={handlePrint}
                                className="w-full bg-[#f472b6] hover:bg-[#ec4899] text-white font-bold py-3.5 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
                            >
                                <Printer className="w-5 h-5" />
                                <span>Cetak Struk</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}