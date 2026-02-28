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
    LogOut
} from 'lucide-react';

const MENU_PRODUK = [
    { id: 1, name: 'Kopi Susu Langit', price: 20000, icon: <Coffee className="w-6 h-6 text-sky-500" /> },
    { id: 2, name: 'Sakura Blossom Latte', price: 25000, icon: <Flower2 className="w-6 h-6 text-pink-500" /> },
    { id: 3, name: 'Espresso Awan', price: 15000, icon: <Cloud className="w-6 h-6 text-sky-400" /> },
    { id: 4, name: 'Pink Rose Tea', price: 18000, icon: <Flower2 className="w-6 h-6 text-pink-400" /> },
    { id: 5, name: 'Cloud Croissant', price: 22000, icon: <Cloud className="w-6 h-6 text-sky-300" /> },
    { id: 6, name: 'Berry Peony Cake', price: 30000, icon: <Flower2 className="w-6 h-6 text-pink-600" /> },
];

export default function POSInput({ onLogout }) {
    const [cart, setCart] = useState([]);

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

    const totalDebit = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const zakatPerniagaan = totalDebit * 0.025;
    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans text-sky-900">
            <header className="bg-white border-b border-sky-100 p-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-sky-400 to-pink-400 p-2 rounded-xl">
                        <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-serif text-sky-800">SMART POS Adhar Coffe</h1>
                        <p className="text-xs text-pink-600 font-medium">Terminal Kasir #01</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-wide">Audit Syariah Lulus</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline font-medium">Keluar</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <section className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-sky-50/50 to-pink-50/50">
                    <h2 className="text-lg font-bold text-sky-800 mb-4 flex items-center gap-2">
                        <Flower2 className="w-5 h-5 text-pink-400" />
                        Menu Hari Ini
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {MENU_PRODUK.map((produk) => (
                            <button
                                key={produk.id}
                                onClick={() => addToCart(produk)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-sky-100 hover:shadow-md hover:border-pink-300 hover:-translate-y-1 transition-all flex flex-col items-center text-center group"
                            >
                                <div className="bg-sky-50 group-hover:bg-pink-50 p-4 rounded-full mb-3 transition-colors">
                                    {produk.icon}
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{produk.name}</h3>
                                <p className="text-pink-600 font-bold text-sm">{formatRp(produk.price)}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <aside className="w-full lg:w-96 bg-white border-l border-sky-100 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
                    <div className="p-4 border-b border-sky-100 bg-sky-50/50">
                        <h2 className="text-lg font-bold text-sky-800 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-sky-500" />
                            Pesanan Saat Ini
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-sky-300 space-y-3">
                                <Cloud className="w-16 h-16 opacity-50" />
                                <p className="text-sm">Belum ada pesanan (Kosong)</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-white border border-pink-100 p-3 rounded-xl shadow-sm">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm truncate pr-2">{item.name}</h4>
                                        <p className="text-pink-600 text-xs font-bold">{formatRp(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-1">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-1 text-sky-600 hover:bg-sky-200 rounded-md transition">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="p-1 text-sky-600 hover:bg-sky-200 rounded-md transition">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="ml-3 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-5 bg-gradient-to-t from-sky-50 to-white border-t border-sky-100 rounded-t-3xl shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between text-sky-700">
                                <span>Subtotal (Debit)</span>
                                <span className="font-semibold">{formatRp(totalDebit)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-pink-50 p-2 rounded-lg border border-pink-100">
                                <div className="flex items-center gap-2 text-pink-700">
                                    <HeartHandshake className="w-4 h-4" />
                                    <span>Alokasi Zakat (2.5%)</span>
                                </div>
                                <span className="font-bold text-pink-600">{formatRp(zakatPerniagaan)}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-sky-200 pt-3 mb-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sky-900 font-bold">Total Tagihan</span>
                                <span className="text-2xl font-black text-sky-600">{formatRp(totalDebit)}</span>
                            </div>
                            <p className="text-[10px] text-sky-500 text-right mt-1">*Zakat akan dipotong otomatis dari saldo Kredit/Pemasukan Vendor</p>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            className="w-full bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg"
                        >
                            Proses Pembayaran
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}