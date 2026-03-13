import React, { useState } from 'react';
import {
    LogOut,
    ChevronRight,
    Menu as MenuIcon,
    X,
    Coffee as CoffeeIcon,
    LayoutDashboard,
    Tags,
    BarChart3,
    LineChart,
    Wallet,
    Coffee
} from 'lucide-react';
import MenuManager from './MenuManager';
import CategoryManager from './CategoryManager';
import DashboardStats from './DashboardStats';
import FinancialReports from './FinancialReports';
import ExpenseManager from './ExpenseManager';

export default function AdminDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Laporan Keuangan', icon: LineChart },
        { id: 'operasional', label: 'Biaya Operasional', icon: Wallet },
        { id: 'menu', label: 'Kelola Menu', icon: Coffee },
        { id: 'kategori', label: 'Kelola Kategori', icon: Tags },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats />;
            case 'reports':
                return <FinancialReports />;
            case 'operasional':
                return <ExpenseManager />;
            case 'menu':
                return <MenuManager />;
            case 'kategori':
                return <CategoryManager />;
            default:
                return <DashboardStats />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Overlay for Mobile */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#1ca3f4] text-white p-4 rounded-full shadow-lg"
                >
                    <MenuIcon />
                </button>
            )}

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative z-40 w-72 h-screen bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col`}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1ca3f4] rounded-xl flex items-center justify-center shadow-lg shadow-sky-100">
                            <CoffeeIcon className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-800 leading-tight">ADMIN</h1>
                            <p className="text-xs font-bold text-sky-500 uppercase tracking-wider">Adhar Coffe</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-sky-50 text-sky-600 shadow-sm shadow-sky-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon size={20} className={activeTab === item.id ? 'text-sky-500' : 'text-slate-400'} />
                                <span className="font-bold text-[15px]">{item.label}</span>
                            </div>
                            {activeTab === item.id && <ChevronRight size={16} className="text-sky-400" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-bold text-[15px]"
                    >
                        <LogOut size={20} />
                        <span>Keluar Sistem</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-xl font-black text-slate-800">
                        {menuItems.find(i => i.id === activeTab)?.label}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-slate-800">{user?.nama || 'Administrator'}</p>
                            <p className="text-[11px] font-bold text-green-500 uppercase tracking-widest">Sistem Online</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                            <span className="font-black text-slate-500">
                                {user?.nama ? user.nama.substring(0, 2).toUpperCase() : 'AD'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
