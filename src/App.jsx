import React, { useState } from 'react';
import Login from './components/login';
import Register from './components/Register';
import POSInput from './components/POSInput';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'pos'
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('pos');
  };

  const handleRegister = () => {
    // Usually passes data, but skipping for demo
    setCurrentView('login');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <>
      {currentView === 'login' && (
        <Login onLogin={handleLogin} onGoRegister={() => setCurrentView('register')} />
      )}
      {currentView === 'register' && (
        <Register onRegister={handleRegister} onGoLogin={() => setCurrentView('login')} />
      )}
      {currentView === 'pos' && (
        <POSInput user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;