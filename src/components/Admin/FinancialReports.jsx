import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    PieChart,
    FileText,
    Activity,
    Wallet,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Calculator,
    Download
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

export default function FinancialReports() {
    const [activeTab, setActiveTab] = useState('pnl');
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                setStatsData(data);
            } catch (error) {
                console.error("Fetch financial stats error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ca3f4]"></div>
            <p className="text-slate-400 font-bold animate-pulse text-sm">Menyusun Laporan Keuangan...</p>
        </div>
    );

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const handleDownload = async (type) => {
        try {
            const endpoint = type === 'transactions' ? '/api/export/transactions' : '/api/export/financials';
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = type === 'transactions' ? `transaksi_${new Date().getTime()}.csv` : `laporan_keuangan_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Gagal mengunduh laporan");
        }
    };

    const chartData = statsData?.chart_data || [];
    
    // Calculate totals for reports based on chart data
    const totalRevenue = statsData?.total_sales || 0;
    const totalHPP = statsData?.total_hpp || 0;
    const totalOperational = statsData?.total_operasional || 0;
    const totalProfit = statsData?.total_profit || 0;

    const reportTabs = [
        { id: 'pnl', label: 'Laba Rugi', icon: TrendingUp },
        { id: 'balance', label: 'Neraca', icon: Calculator },
        { id: 'cashflow', label: 'Arus Kas', icon: Activity },
        { id: 'equity', label: 'Perubahan Modal', icon: Wallet },
    ];

    const renderReportContent = () => {
        switch (activeTab) {
            case 'pnl':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* P&L Header Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Pendapatan Kotor', value: totalRevenue, icon: TrendingUp },
                                { label: 'Harga Pokok (HPP)', value: totalHPP, icon: TrendingDown },
                                { label: 'Beban Operasional', value: totalOperational, icon: Calculator },
                                { label: 'Laba Bersih', value: totalProfit, icon: PieChart },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                    <h4 className="text-xl font-black text-slate-800">{formatRp(stat.value)}</h4>
                                </div>
                            ))}
                        </div>

                        {/* P&L Detailed Table */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-sky-500" />
                                    LAPORAN LABA RUGI PERIODE BERJALAN
                                </h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between font-bold text-slate-700">
                                        <span>Pendapatan Penjualan</span>
                                        <span>{formatRp(totalRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 text-sm italic pl-4">
                                        <span>Penjualan Bersih</span>
                                        <span>{formatRp(totalRevenue)}</span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-6 space-y-3">
                                    <div className="flex justify-between font-bold text-slate-700">
                                        <span>Harga Pokok Penjualan (HPP)</span>
                                        <span className="text-rose-500">({formatRp(totalHPP)})</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 text-sm italic pl-4">
                                        <span>Biaya Bahan Baku</span>
                                        <span>{formatRp(totalHPP)}</span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-6 space-y-3">
                                    <div className="flex justify-between font-bold text-slate-700">
                                        <span>Beban Operasional</span>
                                        <span className="text-rose-500">({formatRp(totalOperational)})</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 text-sm italic pl-4">
                                        <span>Gaji, Listrik, Sewa, dll.</span>
                                        <span>{formatRp(totalOperational)}</span>
                                    </div>
                                </div>
                                <div className="bg-sky-500 p-5 rounded-2xl flex justify-between items-center text-white">
                                    <span className="font-black text-lg">LABA BERSIH OPERASIONAL</span>
                                    <span className="font-black text-2xl">{formatRp(totalProfit)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'balance':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                        {/* Aktiva (Assets) */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 bg-sky-50 text-sky-600">
                                <h3 className="font-black flex items-center gap-2">AKTIVA (ASSETS)</h3>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                    <span className="font-bold text-slate-600">Kas & Bank</span>
                                    <span className="font-black text-slate-800">{formatRp(totalRevenue)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50 text-slate-400">
                                    <span className="font-bold">Persediaan Barang</span>
                                    <span className="font-black tracking-widest italic text-[10px]">TBA</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 font-black text-sky-600 text-lg">
                                    <span>TOTAL AKTIVA</span>
                                    <span>{formatRp(totalRevenue)}</span>
                                </div>
                            </div>
                        </div>
                        {/* Pasiva (Liabilities & Equity) */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 bg-pink-50 text-pink-600">
                                <h3 className="font-black flex items-center gap-2">PASIVA (EQUITY)</h3>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                    <span className="font-bold text-slate-600">Laba Berjalan</span>
                                    <span className="font-black text-slate-800">{formatRp(totalProfit)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                    <span className="font-bold text-slate-600">Modal HPP (Harga Pokok)</span>
                                    <span className="font-black text-slate-800">{formatRp(totalHPP)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 font-black text-pink-600 text-lg">
                                    <span>TOTAL PASIVA</span>
                                    <span>{formatRp(totalRevenue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'cashflow':
                return (
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in zoom-in-95 duration-500">
                        <div className="p-8 flex justify-between items-start border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 mb-1">ARUS KAS OPERASIONAL</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aktivitas Periode Ini</p>
                            </div>
                            <div className="bg-green-50 text-green-600 px-4 py-2 rounded-full font-black text-xs">POSITIVE CASHFLOW</div>
                        </div>
                        <div className="p-10">
                            <div className="relative border-l-4 border-sky-100 pl-8 ml-4 space-y-12">
                                <div className="relative">
                                    <div className="absolute -left-[42px] top-0 w-5 h-5 bg-sky-500 rounded-full border-4 border-white shadow-md"></div>
                                    <h4 className="font-black text-sky-600 text-sm mb-2 uppercase tracking-tight">Penerimaan Kas</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-600">Pendapatan Penjualan Tunai</span>
                                        <span className="text-lg font-black text-slate-800">{formatRp(totalRevenue)}</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[42px] top-0 w-5 h-5 bg-pink-500 rounded-full border-4 border-white shadow-md"></div>
                                    <h4 className="font-black text-pink-600 text-sm mb-2 uppercase tracking-tight">Pengeluaran Kas</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-600">Terbayar ke Suplier (HPP)</span>
                                            <span className="text-md font-black text-rose-500">({formatRp(totalHPP)})</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-600">Beban Operasional (Gaji/Listrik/dll)</span>
                                            <span className="text-md font-black text-rose-500">({formatRp(totalOperational)})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t-2 border-slate-50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black text-slate-800 italic">Net Cash Increased</span>
                                        <span className="text-3xl font-black text-[#1ca3f4]">{formatRp(totalProfit)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'equity':
                return (
                    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-gradient-to-br from-[#1ca3f4] to-[#0ea5e9] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                             <h3 className="text-2xl font-black mb-8 italic">LAPORAN PERUBAHAN EKUITAS</h3>
                             <div className="space-y-6 relative z-10">
                                <div className="flex justify-between border-b border-white/20 pb-4">
                                    <span className="font-bold opacity-80">Modal Terserap (HPP)</span>
                                    <span className="font-black text-xl">{formatRp(totalHPP)}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/20 pb-4">
                                    <span className="font-bold opacity-80">Laba Bersih Operasional</span>
                                    <span className="font-black text-xl">{formatRp(totalProfit)}</span>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <span className="text-xl font-black uppercase tracking-widest">Modal Akhir</span>
                                    <span className="text-4xl font-black">{formatRp(totalRevenue)}</span>
                                </div>
                             </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Combined Financial Chart */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Tren Keuangan</h3>
                        <p className="text-sm font-bold text-slate-400">Arus Masuk vs Arus Keluar (HPP)</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button 
                            onClick={() => handleDownload('financials')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-sky-50 text-sky-600 rounded-xl font-black text-xs hover:bg-sky-100 transition-all"
                        >
                            <Download size={14} />
                            Unduh Laporan
                        </button>
                        <button 
                            onClick={() => handleDownload('transactions')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-pink-50 text-pink-600 rounded-xl font-black text-xs hover:bg-pink-100 transition-all"
                        >
                            <Download size={14} />
                            Unduh Detail Transaksi
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
                             <span className="font-black text-slate-500 text-[11px] uppercase tracking-wider">Pendapatan</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div>
                             <span className="font-black text-slate-500 text-[11px] uppercase tracking-wider">HPP</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                             <span className="font-black text-slate-500 text-[11px] uppercase tracking-wider">Biaya Ops</span>
                        </div>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                                tickFormatter={(value) => `Rp ${value/1000}k`}
                            />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}} 
                                contentStyle={{ 
                                    borderRadius: '20px', 
                                    border: 'none', 
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                                    fontWeight: 900
                                }} 
                                formatter={(value) => formatRp(value)}
                            />
                            <Bar dataKey="sales" name="Pendapatan" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={16} />
                            <Bar dataKey="expense" name="HPP" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={16} />
                            <Bar dataKey="operasional" name="Biaya Operasional" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Financial Tabs Navigation */}
            <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                {reportTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${
                            activeTab === tab.id 
                            ? 'bg-[#1ca3f4] text-white shadow-lg shadow-sky-200' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Report Content */}
            <div className="min-h-[400px]">
                {renderReportContent()}
            </div>
        </div>
    );
}
