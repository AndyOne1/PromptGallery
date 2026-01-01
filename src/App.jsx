import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Image, Wand2, MessageSquare, Layout } from 'lucide-react';
import Gallery from './pages/Gallery';
import Generator from './pages/Generator';
import Prompts from './pages/Prompts';
import './App.css';

function App() {
  return (
    <Router>
      <header className="main-nav glass">
        <div className="nav-container">
          <div className="logo">
            <Layout className="logo-icon" />
            <span className="logo-text title-gradient">PromptFlow</span>
          </div>

          <nav>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Image size={18} />
              <span>Gallery</span>
            </NavLink>
            <NavLink to="/generator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Wand2 size={18} />
              <span>Generator</span>
            </NavLink>
            <NavLink to="/prompts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <MessageSquare size={18} />
              <span>Prompts</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="content-area">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/prompts" element={<Prompts />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2026 PromptFlow AI. Powered by Grok.</p>
      </footer>
    </Router>
  );
}

export default App;
