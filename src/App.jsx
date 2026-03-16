import React, { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/Register';
import POSInput from './components/POSInput';
import AdminDashboard from './components/Admin/AdminDashboard';
import WaitingOrders from './components/WaitingOrders';
import StaffDashboard from './components/StaffDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState(() => {
    const savedUserStr = localStorage.getItem('authUser');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.role === 'Admin' || savedUser?.email === 'admin@gmail.com') return 'admin';
        if (['Staff', 'Dapur', 'Kasir'].includes(savedUser?.role)) return 'staff';
        const savedKey = sessionStorage.getItem('lastOrderKey');
        if (savedKey) return 'waiting';
        return 'pos';
      } catch (e) {
        return 'login';
      }
    }
    return 'login';
  });

  const [dbStatus, setDbStatus] = useState('checking'); // 'checking', 'online', 'offline'

    useEffect(() => {
        let isChecking = false;
        let retryCount = 0;
        const maxRetries = 3;

        const checkConnection = async () => {
            if (isChecking) return;
            isChecking = true;
            try {
                // Gunakan signal timeout agar tidak menunggu selamanya
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch('/api/db-check', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === 'connected') {
                    setDbStatus('online');
                    retryCount = 0; // Reset on success
                } else {
                    throw new Error(data.message || "Database disconnected");
                }
            } catch (error) {
                console.error("Connection check failed:", error);
                retryCount++;
                
                // Hanya set offline jika sudah gagal berkali-kali
                if (retryCount >= maxRetries) {
                    setDbStatus('offline');
                }
            } finally {
                isChecking = false;
            }
        };
        
        checkConnection();
        const interval = setInterval(checkConnection, 15000); // Check every 15s instead of 30s but with retry logic
        
        const handleNavWaiting = () => setCurrentView('waiting');
        window.addEventListener('navToWaiting', handleNavWaiting);

        return () => {
            clearInterval(interval);
            window.removeEventListener('navToWaiting', handleNavWaiting);
        };
    }, []);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('authUser', JSON.stringify(userObj));
    // If user has role admin, or for now just check if email is admin@gmail.com
    if (userObj?.role === 'Admin' || userObj?.email === 'admin@gmail.com') {
      setCurrentView('admin');
    } else if (['Staff', 'Dapur', 'Kasir'].includes(userObj?.role)) {
      setCurrentView('staff');
    } else {
      // Check if they have an active order saved in localStorage
      const savedKey = sessionStorage.getItem('lastOrderKey');
      if (savedKey) {
          // You might want to optionally check against the API if it's still active, 
          // but just routing to 'waiting' lets `WaitingOrders.jsx` handle it via its logic.
          setCurrentView('waiting');
      } else {
          setCurrentView('pos');
      }
    }
  };

  const handleRegister = () => {
    // Usually passes data, but skipping for demo
    setCurrentView('login');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    setCurrentView('login');
  };

  return (
    <>
      {/* DB Connection Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        backgroundColor: dbStatus === 'online' ? '#dcfce7' : dbStatus === 'offline' ? '#fee2e2' : '#f3f4f6',
        color: dbStatus === 'online' ? '#166534' : dbStatus === 'offline' ? '#991b1b' : '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        zIndex: 1000,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dbStatus === 'online' ? '#22c55e' : dbStatus === 'offline' ? '#ef4444' : '#94a3b8'
        }}></div>
        {dbStatus === 'online' ? 'System Online' : dbStatus === 'offline' ? 'System Offline' : 'Checking...'}
      </div>

      {currentView === 'login' && (
        <Login onLogin={handleLogin} onGoRegister={() => setCurrentView('register')} />
      )}
      {currentView === 'register' && (
        <Register onRegister={handleRegister} onGoLogin={() => setCurrentView('login')} />
      )}
      {currentView === 'pos' && (
        <POSInput user={user} onLogout={handleLogout} />
      )}
      {currentView === 'admin' && (
        <AdminDashboard user={user} onLogout={handleLogout} dbStatus={dbStatus} />
      )}
      {currentView === 'staff' && (
        <StaffDashboard user={user} onLogout={handleLogout} dbStatus={dbStatus} />
      )}
      {currentView === 'waiting' && (
        <WaitingOrders onBack={() => setCurrentView('pos')} />
      )}
    </>
  );
}

export default App;