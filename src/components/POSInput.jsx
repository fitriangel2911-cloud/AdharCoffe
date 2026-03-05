import React, { useState } from 'react';
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
    User
} from 'lucide-react';

const MENU_PRODUK = [
    { id: 1, name: 'Kopi Susu', price: 15000, color: 'bg-[#8b5cf6]', icon: <Coffee className="w-8 h-8 text-white/50" /> },
    { id: 2, name: 'Kopi Hitam', price: 18000, color: 'bg-[#5b21b6]', icon: <Coffee className="w-8 h-8 text-white/50" /> },
    { id: 3, name: 'Cappuccino', price: 22000, color: 'bg-[#7c3aed]', icon: <Coffee className="w-8 h-8 text-white/50" /> },
    { id: 4, name: 'Caffe Latte', price: 24000, color: 'bg-[#6d28d9]', icon: <Coffee className="w-8 h-8 text-white/50" /> },
    { id: 5, name: 'Kopi Susu Gula Aren', price: 20000, color: 'bg-[#d97706]', icon: <Coffee className="w-8 h-8 text-white/50" /> },
    { id: 6, name: 'Matcha Latte', price: 25000, color: 'bg-[#16a34a]', icon: <Flower2 className="w-8 h-8 text-white/50" /> },
];

export default function POSInput({ onLogout }) {
    const [cart, setCart] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);

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

    const handleCheckout = () => {
        if (cart.length > 0) setShowReceipt(true);
    };

    const handlePrint = () => {
        window.print();
        // In a real app, clear cart after successful print/checkout
        // setCart([]);
        // setShowReceipt(false);
    };

    const totalDebit = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
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
                        <span className="text-sm font-bold tracking-wide">Kasir Shift Pagi</span>
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
                    <div className="flex items-center justify-between mb-6 pr-2">
                        <h2 className="text-2xl font-black text-[#0c4a6e] flex items-center gap-2.5">
                            <Cloud className="w-7 h-7 text-[#24a9f9]" strokeWidth={2.5} />
                            Pilih Menu
                        </h2>
                        <div className="flex items-center gap-2 border border-[#fce7f3] bg-white px-4 py-1.5 rounded-full shadow-sm text-[#f472b6]">
                            <ShieldCheck className="w-[18px] h-[18px]" strokeWidth={2.5} />
                            <span className="text-sm font-bold">Transaksi Tanpa Riba</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pr-2 pb-8">
                        {MENU_PRODUK.map((produk) => (
                            <button
                                key={produk.id}
                                onClick={() => addToCart(produk)}
                                className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-transparent hover:border-[#bae6fd] hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center relative group"
                            >
                                {/* Halal Badge */}
                                <div className="absolute top-4 right-4 bg-[#dcfce7] text-[#16a34a] text-[10px] font-black px-2 py-1 rounded bg-opacity-70 tracking-widest uppercase">
                                    HALAL
                                </div>

                                <div className={`w-20 h-20 ${produk.color} rounded-full mb-5 flex items-center justify-center shadow-inner mt-2 opacity-90 group-hover:opacity-100 transition-opacity`}>
                                    {produk.icon}
                                </div>

                                <h3 className="font-bold text-[16px] mb-2 text-[#0c4a6e] group-hover:text-[#0284c7]">{produk.name}</h3>
                                <p className="text-[#f472b6] font-black text-[16px]">{formatRp(produk.price)}</p>
                            </button>
                        ))}
                    </div>
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
                                            <h4 className="font-bold text-[15px] text-[#0c4a6e] truncate">{item.name}</h4>
                                            <p className="text-[#f472b6] text-[14px] font-black">{formatRp(item.price)}</p>
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
                                        <div>
                                            <p className="font-bold text-slate-700">{item.name}</p>
                                            <p className="text-slate-500">{item.qty} x {formatRp(item.price)}</p>
                                        </div>
                                        <p className="font-bold text-slate-800">{formatRp(item.price * item.qty)}</p>
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