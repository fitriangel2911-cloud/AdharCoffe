import React from 'react';
import {
    TrendingUp,
    Users,
    Coffee,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const data = [
    { name: 'Sen', sales: 4000, profit: 2400 },
    { name: 'Sel', sales: 3000, profit: 1398 },
    { name: 'Rab', sales: 2000, profit: 9800 },
    { name: 'Kam', sales: 2780, profit: 3908 },
    { name: 'Jum', sales: 1890, profit: 4800 },
    { name: 'Sab', sales: 2390, profit: 3800 },
    { name: 'Min', sales: 3490, profit: 4300 },
];

export default function DashboardStats() {
    const [statsData, setStatsData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                setStatsData(data);
            } catch (error) {
                console.error("Fetch stats error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-sky-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
    );

    const stats = statsData?.summary || [
        { label: 'Total Penjualan', value: 'Rp 0', icon: DollarSign, color: 'sky', trend: '0%' },
        { label: 'Pesanan Baru', value: '0', icon: Coffee, color: 'pink', trend: '0%' },
        { label: 'Pelanggan', value: '0', icon: Users, color: 'violet', trend: '0%' },
        { label: 'Pertumbuhan', value: '0%', icon: TrendingUp, color: 'green', trend: '0%' },
    ];

    const chartData = statsData?.chart_data || [];
    const iconMap = {
        'Total Penjualan': DollarSign,
        'Total Laba': TrendingUp,
        'Menu Terjual': Coffee,
        'Efisiensi': Users
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-sky-50 text-sky-500`}>
                                {React.createElement(iconMap[stat.label] || DollarSign, { size: 24 })}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-black ${stat.trend?.startsWith('+') ? 'text-green-500' : 'text-rose-500'}`}>
                                {stat.trend?.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Grafik Penjualan</h3>
                            <p className="text-sm font-bold text-slate-400">7 Hari Terakhir</p>
                        </div>
                        <select className="bg-slate-50 border-none rounded-xl text-sm font-black text-slate-600 focus:ring-0">
                            <option>Minggu Ini</option>
                            <option>Bulan Ini</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontWeight: 900
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#0ea5e9"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Efisiensi Menu</h3>
                            <p className="text-sm font-bold text-slate-400">Perbandingan Profit</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Target</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontWeight: 900
                                    }}
                                />
                                <Line
                                    type="stepAfter"
                                    dataKey="profit"
                                    stroke="#ec4899"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: '#ec4899', strokeWidth: 4, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
