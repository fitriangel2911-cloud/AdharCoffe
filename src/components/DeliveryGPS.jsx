import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Bike, Home, CheckCircle2 } from 'lucide-react';

export default function DeliveryGPS({ orderId, customerName }) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('searching'); // searching, picked_up, on_the_way, arrived
    
    useEffect(() => {
        const timer = setTimeout(() => setStatus('picked_up'), 2000);
        const timer2 = setTimeout(() => setStatus('on_the_way'), 5000);
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setStatus('arrived');
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 1500);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            clearInterval(interval);
        };
    }, []);

    const getStatusText = () => {
        switch(status) {
            case 'searching': return 'Mencari Kurir terdekat...';
            case 'picked_up': return 'Pesanan telah diambil kurir';
            case 'on_the_way': return 'Kurir sedang dalam perjalanan';
            case 'arrived': return 'Pesanan sampai tujuan!';
            default: return 'Memproses pengiriman';
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-sky-100 shadow-xl shadow-sky-100/50 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800">Pelacakan Pesanan</h3>
                    <p className="text-xs font-bold text-sky-500 uppercase tracking-widest">{getStatusText()}</p>
                </div>
                <div className="bg-sky-50 p-4 rounded-2xl">
                    <Bike className={`w-6 h-6 text-sky-500 ${status === 'on_the_way' ? 'animate-bounce' : ''}`} />
                </div>
            </div>

            {/* Peta Mockup */}
            <div className="relative h-48 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden mb-8 group">
                {/* Background Grid as Map Lines */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Router Line */}
                <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-200 rounded-full -translate-y-1/2">
                    <div 
                        className="h-full bg-sky-500 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Home Icon (Origin) */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 mb-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                </div>

                {/* Kurir Icon (Moving) */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-linear"
                    style={{ left: `${10 + (progress * 0.8)}%` }}
                >
                    <div className="relative">
                        <div className="absolute -inset-4 bg-sky-500/20 rounded-full animate-ping"></div>
                        <div className="relative bg-sky-500 p-2 rounded-xl shadow-lg shadow-sky-200">
                           <Navigation className="w-4 h-4 text-white rotate-90" />
                        </div>
                    </div>
                </div>

                {/* Destination Icon */}
                <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center">
                    <div className={`p-2 rounded-lg shadow-sm border transition-all ${status === 'arrived' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white border-slate-100 text-pink-500'}`}>
                        {status === 'arrived' ? <CheckCircle2 className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                    </div>
                </div>
            </div>

            {/* Detail Pesanan */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Penerima</p>
                    <p className="font-bold text-slate-700">{customerName}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Estimasi</p>
                    <p className="font-bold text-slate-700">{status === 'arrived' ? 'Tiba' : '15 - 20 Menit'}</p>
                </div>
            </div>
        </div>
    );
}
