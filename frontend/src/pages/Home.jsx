import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Image as ImageIcon, ArrowRight, LogOut } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Explorer';

  useEffect(() => {
    if (!token) navigate('/');
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const tagline = "Architect the foundation of your next great idea.";

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      
      {/* Background Mesh */}
      <div className="mesh-gradient" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.3 }}></div>

      <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '800px', width: '100%' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px', color: 'var(--text-main)' }}>
          {getGreeting()}, <span style={{ color: 'var(--cyan)' }}>{username} 👋</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '50px', fontStyle: 'italic' }}>
          "{tagline}"
        </p>

        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          {/* Option 1: Code to Diagram */}
          <div 
            onClick={() => navigate('/code-to-diagram')}
            className="glass-card"
            style={{
              flex: '1 1 300px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 20px',
              textAlign: 'center',
              background: 'rgba(30, 41, 59, 0.7)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.borderColor = 'var(--cyan)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <Code size={48} color="var(--cyan)" style={{ marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '15px' }}>Code-to-Diagram</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px', lineHeight: '1.5' }}>
              Write raw SQL schemas and instantly generate beautiful, interactive Entity-Relationship graphs.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--cyan)', fontWeight: 'bold' }}>
              Launch Studio <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </div>
          </div>

          {/* Option 2: Diagram to Code */}
          <div 
            onClick={() => navigate('/diagram-to-code')}
            className="glass-card"
            style={{
              flex: '1 1 300px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 20px',
              textAlign: 'center',
              background: 'rgba(30, 41, 59, 0.7)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.borderColor = 'var(--magenta)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <ImageIcon size={48} color="var(--magenta)" style={{ marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '15px' }}>Diagram-to-Code</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px', lineHeight: '1.5' }}>
              Upload images of databases or visually draw tables to automatically generate perfect SQL code using AI.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--magenta)', fontWeight: 'bold' }}>
              Launch Studio <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </div>
          </div>

        </div>

        <button 
          onClick={handleLogout}
          style={{
            marginTop: '50px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            gap: '8px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default Home;
