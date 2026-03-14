import React, { useState, useEffect, useMemo } from 'react';
import { 
    Clock, 
    ChefHat, 
    CheckCircle2, 
    Coffee, 
    Users, 
    Loader2,
    ArrowLeft,
    BellRing,
    MapPin,
    Bike
} from 'lucide-react';
import DeliveryGPS from './DeliveryGPS';

export default function WaitingOrders({ onBack }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders/public');
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching queue:", error);
        } finally {
            setLoading(false);
        }
    };

    // Grouping logic: Group by customer name + created_at to identify a single unique checkout
    const groupedOrders = useMemo(() => {
        const groups = {};
        
        // Sort by time first
        const sorted = [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        sorted.forEach(order => {
            // Use a combination of identity markers
            const key = `${order.nama_pembeli}_${order.created_at}`;
            if (!groups[key]) {
                groups[key] = {
                    ...order,
                    items_count: 0
                };
            }
            groups[key].items_count += 1;
        });

        return Object.values(groups);
    }, [orders]);

    // Calculate dynamic queue number based on today's order sequence
    const getQueueNumber = (order) => {
        const dateStr = new Date(order.created_at).toDateString();
        const todayOrders = groupedOrders
            .filter(o => new Date(o.created_at).toDateString() === dateStr)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        const index = todayOrders.findIndex(o => o.created_at === order.created_at && o.nama_pembeli === order.nama_pembeli);
        return (index + 1).toString().padStart(3, '0');
    };

    const waitingOrders = groupedOrders.filter(o => o.status === 'waiting');
    const processingOrders = groupedOrders.filter(o => o.status === 'processing');
    
    // Detection for user's own order from localStorage
    const myOrder = useMemo(() => {
        const savedKey = localStorage.getItem('lastOrderKey');
        if (!savedKey) return null;
        return groupedOrders.find(g => {
            const currentKey = `${g.nama_pembeli}_${g.created_at}`;
            return currentKey === savedKey;
        });
    }, [groupedOrders]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#fdf2f8] p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <button 
                        onClick={onBack}
                        className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-sky-500 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-4xl font-black text-[#0c4a6e] italic tracking-tight flex items-center gap-3">
                            <Coffee className="w-10 h-10 text-[#24a9f9]" />
                            STATUS PESANAN
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Adhar Coffe • Real Time Tracking</p>
                    </div>
                    <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-200 animate-pulse">
                        <BellRing className="w-6 h-6" />
                    </div>
                </header>

                {loading && orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-sky-400 animate-spin mb-4" />
                        <p className="font-black text-slate-300 italic">Meyelaraskan antrian...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        
                        {/* Section 1: My Order & GPS Tracking */}
                        <div className="lg:col-span-1 space-y-8">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
                                Pesanan Saya
                            </h2>
                            
                            {myOrder ? (
                                <div className="space-y-6">
                                    <div className="bg-[#0c4a6e] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Coffee className="w-24 h-24" />
                                        </div>
                                        <p className="text-sky-300 font-black uppercase tracking-widest text-[10px] mb-2">Nomor Antrian</p>
                                        <h3 className="text-6xl font-black mb-6 italic">#{getQueueNumber(myOrder)}</h3>
                                        <div className="flex items-center justify-between py-4 border-t border-sky-800">
                                            <div>
                                                <p className="text-sky-300 text-[10px] font-black uppercase">Status</p>
                                                <p className="font-bold capitalize">{myOrder.status}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sky-300 text-[10px] font-black uppercase">Meja/Tipe</p>
                                                <p className="font-bold">{myOrder.no_meja ? `Meja ${myOrder.no_meja}` : myOrder.tipe_pesanan}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {myOrder.tipe_pesanan === 'Diantar' && (
                                        <DeliveryGPS customerName={myOrder.nama_pembeli} />
                                    )}

                                    <button
                                        onClick={() => {
                                            if (window.confirm("Apakah Anda yakin ingin menyelesaikan sesi pesanan ini? Antrean tidak akan tampil lagi di perangkat Anda.")) {
                                                localStorage.removeItem('lastOrderKey');
                                                onBack();
                                            }
                                        }}
                                        className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-rose-50 text-rose-500 rounded-2xl font-bold hover:bg-rose-100 hover:text-rose-600 border border-rose-100 transition-colors"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Selesai & Tutup Sesi
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400 font-bold italic">
                                    Belum ada pesanan aktif
                                </div>
                            )}
                        </div>

                        {/* Section 2: Global Queue (Privacy Focused) */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Sedang Diproses */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-pink-600 flex items-center gap-2 uppercase tracking-widest text-xs">
                                            <ChefHat className="w-4 h-4" />
                                            Sedang Dikerjakan
                                        </h3>
                                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[10px] font-black">
                                            {processingOrders.length}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {processingOrders.length === 0 ? (
                                            <div className="p-8 bg-slate-50 rounded-[2rem] text-center text-slate-300 font-bold italic text-sm">Kosong</div>
                                        ) : processingOrders.map(order => (
                                            <div key={order.id} className="bg-white p-5 rounded-3xl border border-pink-50 shadow-sm flex items-center justify-between group hover:border-pink-200 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-pink-100">
                                                        {getQueueNumber(order).slice(-2)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-700">Antrian #{getQueueNumber(order)}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 capitalize">{order.tipe_pesanan}</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border-2 border-pink-100 flex items-center justify-center border-t-pink-500 animate-spin"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Menunggu */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-sky-600 flex items-center gap-2 uppercase tracking-widest text-xs">
                                            <Clock className="w-4 h-4" />
                                            Daftar Tunggu
                                        </h3>
                                        <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-[10px] font-black">
                                            {waitingOrders.length}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {waitingOrders.length === 0 ? (
                                            <div className="p-8 bg-slate-50 rounded-[2rem] text-center text-slate-300 font-bold italic text-sm">Kosong</div>
                                        ) : waitingOrders.map(order => (
                                            <div key={order.id} className="bg-white/60 p-5 rounded-3xl border border-slate-100 flex items-center justify-between grayscale opacity-60">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center font-black text-lg">
                                                        {getQueueNumber(order).slice(-2)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-500">Antrian #{getQueueNumber(order)}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 italic">Menunggu...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Footer Info */}
                <footer className="mt-16 text-center space-y-4 border-t border-slate-100 pt-10">
                    <div className="inline-flex items-center gap-6">
                         <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Real-Time Aktif</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Koki Sedang Bekerja</span>
                         </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
