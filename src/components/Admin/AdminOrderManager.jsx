import React, { useState, useEffect, useMemo } from 'react';
import { 
    Clock, 
    ChefHat, 
    CheckCircle2, 
    Coffee, 
    RefreshCw, 
    Loader2,
    CheckCircle,
    ArrowRightCircle,
    ShoppingBag,
    Bike,
    Mail,
    Send
} from 'lucide-react';

export default function AdminOrderManager() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingGroupKey, setUpdatingGroupKey] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(null);

    useEffect(() => {
        fetchOrders();
        
        // Auto-refresh orders every 5 seconds
        const intervalId = setInterval(() => {
            fetchOrders(true);
        }, 5000);
        
        return () => clearInterval(intervalId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch('/api/orders/active');
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching active orders:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Grouping by Order Identity
    const groupedOrders = useMemo(() => {
        const groups = {};
        const sorted = [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        sorted.forEach(order => {
            const key = `${order.nama_pembeli}_${order.created_at}`;
            if (!groups[key]) {
                groups[key] = {
                    ...order,
                    items: [],
                    groupKey: key
                };
            }
            groups[key].items.push(order);
        });

        return Object.values(groups);
    }, [orders]);

    const handleUpdateGroupStatus = async (group, newStatus) => {
        setUpdatingGroupKey(group.groupKey);
        try {
            // Update all items in this group
            const promises = group.items.map(item => 
                fetch(`/api/orders/${item.id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                })
            );
            
            await Promise.all(promises);
            
            // Local state update
            if (newStatus === 'completed') {
                setOrders(orders.filter(o => !group.items.some(gi => gi.id === o.id)));
                // Auto-update table to 'served' (waiting to be cleared)
                if (group.no_meja) {
                    fetch(`/api/tables/${group.no_meja}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'served' })
                    }).catch(err => console.error("Table status update failed:", err));
                }
            } else {
                setOrders(orders.map(o => 
                    group.items.some(gi => gi.id === o.id) ? { ...o, status: newStatus } : o
                ));
            }
        } catch (error) {
            console.error("Error updating group status:", error);
        } finally {
            setUpdatingGroupKey(null);
        }
    };

    const handleResendEmail = async (group) => {
        const orderId = group.items[0].id; // Any item from the group works for the backend to find all related ones
        setSendingEmail(group.groupKey);
        try {
            const res = await fetch(`/api/orders/${orderId}/resend-email`, {
                method: 'POST'
            });
            if (res.ok) {
                alert("Email konfirmasi telah dikirim ulang!");
            } else {
                const err = await res.json();
                alert(err.detail || "Gagal mengirim email");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Terjadi kesalahan teknis saat mengirim email.");
        } finally {
            setSendingEmail(null);
        }
    };

    const waitingGroups = groupedOrders.filter(g => g.status === 'waiting');
    const processingGroups = groupedOrders.filter(g => g.status === 'processing');

    return (
        <div className="space-y-8 p-2">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Manajemen Antrian</h2>
                    <p className="text-sm font-bold text-slate-400">Proses pesanan per transaksi (Grouped Mode).</p>
                </div>
                <button 
                    onClick={fetchOrders}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-[#f472b6] hover:bg-pink-50 shadow-sm transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-50">
                    <Loader2 className="w-10 h-10 animate-spin text-pink-200 mb-4" />
                    <p className="font-black text-slate-300">Memuat antrian...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* Kolom: Pesanan Menunggu */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-[#0c4a6e] flex items-center gap-2 uppercase tracking-widest text-xs">
                                <Clock className="w-4 h-4" />
                                Pesanan Masuk ({waitingGroups.length})
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            {waitingGroups.length === 0 ? (
                                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                                    <p className="text-slate-400 font-bold italic">Tidak ada pesanan menunggu</p>
                                </div>
                            ) : waitingGroups.map(group => (
                                <div key={group.groupKey} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-sky-100">
                                                {group.no_meja || '??'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-slate-800">{group.nama_pembeli}</h4>
                                                    {group.kontak && group.kontak.includes('@') && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleResendEmail(group); }}
                                                            disabled={sendingEmail === group.groupKey}
                                                            className="p-1.5 text-[#f472b6] hover:bg-pink-50 rounded-lg transition-all"
                                                            title="Kirim ulang email konfirmasi"
                                                        >
                                                            {sendingEmail === group.groupKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{new Date(group.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">
                                            {group.items.length} Item
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                            {group.tipe_pesanan === 'Diantar' ? <Bike className="w-4 h-4 text-sky-500" /> : <ShoppingBag className="w-4 h-4" />}
                                            {group.tipe_pesanan}
                                        </div>
                                        <button 
                                            onClick={() => handleUpdateGroupStatus(group, 'processing')}
                                            disabled={updatingGroupKey === group.groupKey}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#1ca3f4] text-white rounded-xl font-black text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 active:scale-95 disabled:opacity-50"
                                        >
                                            {updatingGroupKey === group.groupKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightCircle className="w-4 h-4" />}
                                            Proses Antrian
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kolom: Sedang Diolah */}
                    <div className="space-y-6">
                         <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-pink-600 flex items-center gap-2 uppercase tracking-widest text-xs">
                                <ChefHat className="w-4 h-4" />
                                Sedang Disiapkan ({processingGroups.length})
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {processingGroups.length === 0 ? (
                                <div className="p-10 bg-pink-50/30 border-2 border-dashed border-pink-100 rounded-[2rem] text-center">
                                    <p className="text-pink-300 font-bold italic">Meja persiapan kosong</p>
                                </div>
                            ) : processingGroups.map(group => (
                                <div key={group.groupKey} className="bg-white p-6 rounded-[2rem] border-2 border-pink-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                                    
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-pink-200">
                                                {group.no_meja || '??'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-slate-800">{group.nama_pembeli}</h4>
                                                    {group.kontak && group.kontak.includes('@') && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleResendEmail(group); }}
                                                            disabled={sendingEmail === group.groupKey}
                                                            className="p-1.5 text-pink-500 hover:bg-pink-50 rounded-lg transition-all"
                                                            title="Kirim ulang email konfirmasi"
                                                        >
                                                            {sendingEmail === group.groupKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-tight">Diproses sejak {new Date(group.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                         <div className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                            <div className="w-1 h-1 bg-pink-600 rounded-full animate-ping"></div>
                                            Staf
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-6 relative z-10">
                                        <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                            <Coffee className="w-4 h-4 text-pink-400" />
                                            {group.items.length} Menu Pesanan
                                        </div>
                                        <button 
                                            onClick={() => handleUpdateGroupStatus(group, 'completed')}
                                            disabled={updatingGroupKey === group.groupKey}
                                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50"
                                        >
                                            {updatingGroupKey === group.groupKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Selesaikan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
