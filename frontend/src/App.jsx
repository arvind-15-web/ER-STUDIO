import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import VisualBuilder from './components/VisualBuilder';
import CVNestLanding from './pages/CVNestLanding';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'var(--red, #ef4444)',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 99999,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          ⚠️ For the best experience, please view this app on a Desktop or Tablet.
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/code-to-diagram" element={<Dashboard />} />
          <Route path="/diagram-to-code" element={<VisualBuilder />} />
          <Route path="/cvnest" element={<CVNestLanding />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
