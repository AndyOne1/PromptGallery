import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Image, Wand2, MessageSquare, Layout } from 'lucide-react';
import Gallery from './pages/Gallery';
import Generator from './pages/Generator';
import Prompts from './pages/Prompts';
import Auth from './pages/Auth';
import './App.css';

import { DataProvider } from './context/DataContext';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <DataProvider user={user}>
      <Router>
        <header className="main-nav glass">
          <div className="nav-container">
            <div className="logo">
              <Layout className="logo-icon" />
              <span className="logo-text title-gradient">PromptFlow</span>
            </div>

            <nav>
              <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Image size={20} />
                <span>Gallery</span>
              </NavLink>
              <NavLink to="/generator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Wand2 size={20} />
                <span>Generator</span>
              </NavLink>
              <NavLink to="/prompts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <MessageSquare size={20} />
                <span>Prompts</span>
              </NavLink>
              {user ? (
                <button onClick={handleLogout} className="nav-link btn-logout">
                  <Layout size={20} />
                  <span>Logout ({user.name})</span>
                </button>
              ) : (
                <NavLink to="/auth" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Layout size={20} />
                  <span>Login</span>
                </NavLink>
              )}
            </nav>
          </div>
        </header>

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Gallery user={user} />} />
            <Route path="/gallery" element={<Gallery user={user} />} />
            <Route path="/generator" element={<Generator user={user} />} />
            <Route path="/prompts" element={<Prompts user={user} />} />
            <Route path="/auth" element={<Auth onLogin={setUser} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 PromptFlow AI. Powered by Grok.</p>
        </footer>
      </Router>
    </DataProvider>
  );
}

export default App;
