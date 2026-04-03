import React, { useState, useEffect } from 'react';
import { Users, UserCog, Shield, ShieldCheck, Mail, RefreshCw, Loader2, Save, AlertCircle } from 'lucide-react';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const availableRoles = ['Admin', 'Pelanggan', 'Staff'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Gagal mengambil data user');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        setUpdatingUserId(userId);
        setError(null);
        setSuccessMsg(null);
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.detail || 'Gagal update role');
            }
            
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setSuccessMsg(`Role user ID ${userId} berhasil diperbarui ke ${newRole}`);
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-rose-100 text-rose-600 border-rose-200';
            case 'Staff':
                return 'bg-sky-100 text-sky-600 border-sky-200';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 p-2">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Manajemen User & Role</h2>
                    <p className="text-sm font-bold text-slate-400">Atur hak akses staf dan admin Adhar Coffe.</p>
                </div>
                <button 
                    onClick={fetchUsers}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-sky-500 hover:bg-sky-50 shadow-sm transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    {successMsg}
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identitas User</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Role Saat Ini</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ganti Hak Akses</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-sky-200 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-slate-300">Memuat data user...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                        Tidak ada data user ditemukan.
                                    </td>
                                </tr>
                            ) : users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 font-black">
                                                {u.nama ? u.nama.substring(0, 2).toUpperCase() : '??'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">{u.nama}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                            <Mail className="w-4 h-4 text-slate-300" />
                                            {u.email}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getRoleBadge(u.role)}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <select 
                                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-300 transition-all appearance-none cursor-pointer pr-10 relative"
                                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                                                value={u.role}
                                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                disabled={updatingUserId === u.id}
                                            >
                                                {availableRoles.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            {updatingUserId === u.id && <Loader2 className="w-4 h-4 animate-spin text-sky-500" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <section className="bg-amber-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-200">
                <h3 className="font-black italic mb-4 flex items-center gap-2 text-lg">
                    PERINGATAN SISTEM
                    <Shield className="w-5 h-5" />
                </h3>
                <p className="text-sm font-bold opacity-90 leading-relaxed max-w-2xl">
                    Perubahan role pengguna akan langsung berdampak pada akses antarmuka (UI). Pastikan Anda memberikan role yang sesuai: 
                    <span className="bg-white/20 px-1 rounded ml-1">Admin</span> untuk akses penuh, 
                    <span className="bg-white/20 px-1 rounded ml-1">Staff</span> untuk akses operasional, dan 
                    <span className="bg-white/20 px-1 rounded ml-1">Pelanggan</span> untuk akses POS publik.
                </p>
            </section>
        </div>
    );
}
