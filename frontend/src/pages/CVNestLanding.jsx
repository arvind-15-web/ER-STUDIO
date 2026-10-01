import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Layout, 
  Download, 
  Save, 
  Copy, 
  Briefcase 
} from 'lucide-react';
import './CVNestLanding.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`cvnest-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="cvnest-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/cvnest')}>
        <FileText color="#60a5fa" size={28} />
        CVNest
      </div>
      <div className="cvnest-nav-links">
        <a href="#home">Home</a>
        <a href="#templates">Templates</a>
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#about">About</a>
      </div>
      <div className="cvnest-nav-right">
        <a href="#" className="cvnest-login-btn">Log In</a>
        <button className="cvnest-primary-btn" onClick={() => navigate('/cvnest')}>
          Create Resume
        </button>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="cvnest-hero" id="home">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="hero-video"
      >
        <source src="/landing-page-animate.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay"></div>
      
      <div className="cvnest-hero-content">
        <span className="cvnest-hero-brand animate-fade-in-up">CVNest</span>
        <h1 className="cvnest-hero-title animate-fade-in-up delay-100">
          Build a Resume That<br/>Opens Doors.
        </h1>
        <p className="cvnest-hero-desc animate-fade-in-up delay-200">
          Create a professional resume in minutes with elegant templates, simple customization, and effortless PDF export.
        </p>
        <div className="cvnest-hero-ctas animate-fade-in-up delay-300">
          <button className="cvnest-primary-btn">
            Create My Resume
          </button>
          <button className="cvnest-secondary-btn">
            Explore Templates
          </button>
        </div>
        <p className="cvnest-hero-trust animate-fade-in-up delay-300">
          Professional templates • Easy customization • PDF export
        </p>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="cvnest-feature-card">
    <div className="cvnest-feature-icon">
      <Icon size={24} />
    </div>
    <h3 className="cvnest-feature-title">{title}</h3>
    <p className="cvnest-feature-desc">{desc}</p>
  </div>
);

const Features = () => {
  const featuresList = [
    { icon: Layout, title: "Professional Templates", desc: "Choose from carefully designed resume templates." },
    { icon: FileText, title: "Easy Customization", desc: "Edit your information, sections, colors, and layout effortlessly." },
    { icon: Download, title: "Instant PDF Export", desc: "Download your completed resume as a polished PDF." },
    { icon: Save, title: "Save Your Work", desc: "Keep your resumes organized and accessible." },
    { icon: Copy, title: "Multiple Resume Versions", desc: "Create different resumes for different career opportunities." },
    { icon: Briefcase, title: "Career Ready", desc: "Build resumes designed to present your skills professionally." }
  ];

  return (
    <section className="cvnest-section" id="features">
      <div className="cvnest-section-header">
        <h2 className="cvnest-section-title">Everything You Need to Build a Better Resume</h2>
        <p className="cvnest-section-subtitle">A powerful, intuitive toolkit to showcase your professional journey.</p>
      </div>
      <div className="cvnest-features-grid">
        {featuresList.map((f, i) => (
          <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
        ))}
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { num: "01", title: "Choose a Template", desc: "Start with a professionally designed template." },
    { num: "02", title: "Build Your Resume", desc: "Add your education, experience, projects, skills, certifications, and achievements." },
    { num: "03", title: "Download & Apply", desc: "Export your finished resume as a professional PDF." }
  ];

  return (
    <section className="cvnest-how-it-works" id="how-it-works">
      <div className="cvnest-section-header">
        <h2 className="cvnest-section-title">How It Works</h2>
      </div>
      <div className="cvnest-steps-container">
        {steps.map((step, i) => (
          <div key={i} className="cvnest-step">
            <div className="cvnest-step-number">{step.num}</div>
            <h3 className="cvnest-step-title">{step.num.replace('0', '')} — {step.title}</h3>
            <p className="cvnest-step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const TemplatePreview = () => {
  // Dummy visual wireframes for templates
  const renderTemplateWireframe = () => (
    <div className="cvnest-template-body">
      <div className="cvnest-wireframe-line title"></div>
      <div className="cvnest-wireframe-line subtitle" style={{ marginBottom: '32px' }}></div>
      <div className="cvnest-wireframe-line text"></div>
      <div className="cvnest-wireframe-line text"></div>
      <div className="cvnest-wireframe-line text-short" style={{ marginBottom: '24px' }}></div>
      <div className="cvnest-wireframe-line subtitle"></div>
      <div className="cvnest-wireframe-line text"></div>
      <div className="cvnest-wireframe-line text-short"></div>
    </div>
  );

  return (
    <section className="cvnest-templates" id="templates">
      <div className="cvnest-section-header">
        <h2 className="cvnest-section-title">Designed to Make You Stand Out</h2>
        <p className="cvnest-section-subtitle">Premium designs tailored for modern professionals.</p>
      </div>
      <div className="cvnest-templates-grid">
        {[1, 2, 3].map((item) => (
          <div key={item} className="cvnest-template-item">
            <div className="cvnest-template-header">
              <div className="cvnest-template-dot"></div>
              <div className="cvnest-template-dot"></div>
              <div className="cvnest-template-dot"></div>
            </div>
            {renderTemplateWireframe()}
          </div>
        ))}
      </div>
      <button className="cvnest-primary-btn">View All Templates</button>
    </section>
  );
};

const Footer = () => (
  <footer className="cvnest-footer">
    <div className="cvnest-footer-logo">
      <FileText color="#60a5fa" size={24} /> CVNest
    </div>
    <p className="cvnest-footer-text">© {new Date().getFullYear()} CVNest. All rights reserved.</p>
  </footer>
);

export default function CVNestLanding() {
  return (
    <div className="cvnest-app">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <TemplatePreview />
      <Footer />
    </div>
  );
}
