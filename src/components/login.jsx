import React, { useState } from 'react';
import { Coffee, Mail, Lock } from 'lucide-react';

export default function Login({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.user);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || `Server merespon dengan status ${response.status}`);
      }
    } catch (err) {
      console.error("Login Fetch Error:", err);
      if (err.name === 'AbortError' || err.message.includes('fetch')) {
        setError('Gagal menghubungkan ke server. Pastikan backend aktif.');
      } else {
        setError('Terjadi kesalahan koneksi: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2e8f0] to-[#fce7f3] flex items-center justify-center p-4">

      {/* Main Card */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[400px] overflow-hidden border border-white/40">

        {/* Top Header Section (Sky Blue) extending deeper */}
        <div className="bg-[#1ca3f4] pt-14 pb-12 rounded-b-[2rem] flex flex-col items-center justify-center text-white relative z-10">
          {/* Logo Icon */}
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-5 backdrop-blur-sm">
            <Coffee className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-black tracking-wide mb-1">SMART POS</h1>
          <p className="text-sm font-semibold opacity-90">Adhar Coffe (Syariah)</p>
        </div>

        {/* Content Section */}
        <div className="px-8 pt-8 pb-10">

          <div className="text-center mb-6">
            <p className="text-[#0284c7] font-arabic italic text-[1.1rem] mb-2 font-bold tracking-wider">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <h2 className="text-[#0c4a6e] text-[1.7rem] font-black tracking-tight mt-1">Masuk Akun</h2>
            <div className="mt-4 p-4 bg-sky-50 rounded-2xl border-l-4 border-sky-400 text-left">
              <p className="text-[11px] font-bold text-sky-800 leading-relaxed italic">
                "Sempurnakanlah takaran dan timbangan dengan adil. Kami tidak membebani seseorang melainkan menurut kesanggupannya." (QS. Al-An'am: 152)
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] font-black text-white bg-sky-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Amanah & Shiddiq</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200 text-center font-medium shadow-sm">
              {error}
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-[#0c4a6e] mb-1.5 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-[18px] w-[18px] text-[#f472b6]" strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#bae6fd] bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:border-transparent transition-all text-sm font-medium shadow-sm hover:border-[#7dd3fc]"
                  placeholder="pelanggan@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-[13px] font-bold text-[#0c4a6e] mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-[18px] w-[18px] text-[#f472b6]" strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#bae6fd] bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:border-transparent transition-all text-sm font-medium shadow-sm hover:border-[#7dd3fc]"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#f472b6] hover:bg-[#ec4899]'} text-white font-black text-[15px] py-4 rounded-xl shadow-[0_4px_14px_0_rgba(244,114,182,0.39)] transition-all transform active:scale-[0.98] mt-2`}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-[13px] text-[#0c4a6e] font-medium">
            Belum punya akun? {' '}
            <button onClick={onGoRegister} className="font-extrabold text-[#f472b6] hover:text-[#ec4899] transition-colors">
              Daftar di sini
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}