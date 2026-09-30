import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Lock, User, Activity, Key } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "529017952828-b6bfjknq1bmndt9sv7t9is3v1i5acp6q.apps.googleusercontent.com";

function Login() {
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    localStorage.setItem('token', 'google_dummy_token');
    localStorage.setItem('username', 'Google User');
    navigate('/dashboard');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-container">
        
        {/* Fullscreen Background Animation */}
        <div className="mesh-gradient"></div>

        {/* Left Side: Mock Dashboard Art */}
        <div className="login-art">
          <div className="art-overlay-text">
            <h2>ER Studio</h2>
            <p>Architect and analyze your database schemas with intuitive visual dashboards.</p>
          </div>

          <div className="creative-er-animation">
            <div className="floating-table table-1">
              <div className="t-header">Users</div>
              <div className="t-row"><Key size={12} className="t-icon" color="#fcd34d" /> id <span>UUID</span></div>
              <div className="t-row"><User size={12} className="t-icon" /> email <span>VARCHAR</span></div>
            </div>
            
            <div className="floating-table table-2">
              <div className="t-header magenta">Orders</div>
              <div className="t-row"><Key size={12} className="t-icon" color="#fcd34d" /> id <span>SERIAL</span></div>
              <div className="t-row"><Lock size={12} className="t-icon" color="#94a3b8" /> user_id <span>UUID</span></div>
              <div className="t-row"><Database size={12} className="t-icon" /> total <span>INT</span></div>
            </div>

            <div className="floating-table table-3">
              <div className="t-header cyan">Products</div>
              <div className="t-row"><Key size={12} className="t-icon" color="#fcd34d" /> id <span>SERIAL</span></div>
              <div className="t-row"><Activity size={12} className="t-icon" /> price <span>DECIMAL</span></div>
            </div>

            {/* Glowing Connecting Lines using SVG */}
            <svg className="connecting-lines" width="100%" height="100%">
              <path d="M 180 120 C 250 120, 250 200, 320 200" className="neon-line magenta" />
              <path d="M 480 220 C 550 220, 550 120, 620 120" className="neon-line cyan" />
            </svg>
          </div>
        </div>

        {/* Right Side: Simple Google Auth */}
        <div className="login-form-container">
          <div className="glass-card">
            <h2 className="form-title">Get Started</h2>
            <p className="form-subtitle">
              Sign in with your Google account to start mapping your database schemas.
            </p>

            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert('Google Sign In was unsuccessful.')}
                theme="outline"
                shape="rectangular"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
