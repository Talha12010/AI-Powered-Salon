import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ChatBot from './ChatBot';

const API = 'http://localhost:5000';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveLink('home');
    else if (path === '/try-now') setActiveLink('try-now');
    else if (path === '/gallery') setActiveLink('gallery');
    else if (path === '/pricing') setActiveLink('pricing');
    else if (path === '/contact') setActiveLink('contact');
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${API}${image.startsWith('/') ? image : '/' + image}`;
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo */}
          <a href="/" className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="url(#gradient)" />
                <path d="M8 16C8 12 12 10 16 10C20 10 24 12 24 16C24 20 20 22 16 22"
                  stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="16" r="3" fill="white" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">Style<span className="logo-highlight">AI</span></span>
          </a>

          {/* Navigation Links */}
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li className="nav-item">
              <a href="/" className={`nav-link ${activeLink === 'home' ? 'active' : ''}`} onClick={() => handleLinkClick('home')}>Home</a>
            </li>
            <li className="nav-item">
              <a href="/try-now" className={`nav-link ${activeLink === 'try-now' ? 'active' : ''}`} onClick={() => handleLinkClick('try-now')}>Try AI Stylist</a>
            </li>
            <li className="nav-item">
              <a href="/gallery" className={`nav-link ${activeLink === 'gallery' ? 'active' : ''}`} onClick={() => handleLinkClick('gallery')}>Transformations</a>
            </li>
            <li className="nav-item">
              <a href="/pricing" className={`nav-link ${activeLink === 'pricing' ? 'active' : ''}`} onClick={() => handleLinkClick('pricing')}>Pricing</a>
            </li>
            <li className="nav-item">
              <a href="/contact" className={`nav-link ${activeLink === 'contact' ? 'active' : ''}`} onClick={() => handleLinkClick('contact')}>Contact</a>
            </li>

            {/* Mobile only buttons */}
            {!user && (
              <>
                <li className="nav-item mobile-only">
                  <a href="/login" className="btn-login-mobile">Sign In</a>
                </li>
                <li className="nav-item mobile-only">
                  <a href="/signup" className="btn-signup-mobile">Get Started Free</a>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item mobile-only">
                  <a href={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-login-mobile">Dashboard</a>
                </li>
                <li className="nav-item mobile-only">
                  <button onClick={handleLogout} className="btn-signup-mobile" style={{ border: 'none', cursor: 'pointer', width: '100%' }}>Logout</button>
                </li>
              </>
            )}
          </ul>

          {/* CTA Buttons or Avatar */}
          <div className="nav-actions">
            {user ? (
              <div className="avatar-wrap" ref={dropdownRef}>
                <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {user.image
                    ? <img src={getImageUrl(user.image)} alt="avatar" className="avatar-img" />
                    : <div className="avatar-initials">{user.username?.charAt(0).toUpperCase()}</div>
                  }
                </button>

                {dropdownOpen && (
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.username}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <a href={user.role === 'admin' ? '/admin' : '/dashboard'} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      Dashboard
                    </a>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className="btn-login">Sign In</a>
                <a href="/signup" className="btn-signup">
                  <span>Try Free</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </nav>

      <ChatBot />

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .navbar {
          position: sticky;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          z-index: 2;
        }

        .logo-icon { display: flex; align-items: center; }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.5px;
        }

        .logo-highlight {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          list-style: none;
          gap: 8px;
        }

        .nav-link {
          text-decoration: none;
          color: #4b5563;
          font-size: 15px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-link:hover { color: #111827; background: #f3f4f6; }
        .nav-link.active { color: #6366f1; background: #eef2ff; font-weight: 600; }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-login {
          text-decoration: none;
          color: #374151;
          font-size: 15px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .btn-login:hover { color: #111827; background: #f3f4f6; }

        .btn-signup {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 15px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .btn-signup:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
        }

        .btn-signup svg { transition: transform 0.3s ease; }
        .btn-signup:hover svg { transform: translateX(3px); }

        /* Avatar */
        .avatar-wrap { position: relative; }

        .avatar-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          background: none;
          padding: 0;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .avatar-btn:hover { border-color: #6366f1; }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
        }

        /* Dropdown */
        .dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          min-width: 200px;
          overflow: hidden;
          animation: fadeIn 0.15s ease;
          z-index: 100;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 14px 16px;
          background: #f9fafb;
        }

        .dropdown-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .dropdown-email {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          transition: background 0.15s ease;
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }

        .dropdown-item:hover { background: #f3f4f6; color: #111827; }
        .dropdown-item.logout { color: #ef4444; }
        .dropdown-item.logout:hover { background: #fef2f2; }

        /* Hamburger */
        .hamburger {
          display: none;
          cursor: pointer;
          background: none;
          border: none;
          padding: 8px;
          z-index: 2;
        }

        .bar {
          display: block;
          width: 24px;
          height: 2px;
          margin: 5px auto;
          background: #374151;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .mobile-only { display: none; }

        @media (max-width: 1024px) {
          .nav-container { padding: 0 20px; }

          .nav-menu {
            position: fixed;
            left: -100%;
            top: 72px;
            flex-direction: column;
            background: white;
            width: 100%;
            height: calc(100vh - 72px);
            text-align: left;
            padding: 32px;
            gap: 4px;
            transition: 0.3s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            overflow-y: auto;
          }

          .nav-menu.active { left: 0; }
          .nav-item { width: 100%; }

          .nav-link {
            display: block;
            padding: 12px 16px;
            font-size: 16px;
            border-radius: 8px;
          }

          .hamburger { display: block; }

          .hamburger.active .bar:nth-child(2) { opacity: 0; }
          .hamburger.active .bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
          .hamburger.active .bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

          .nav-actions { display: none; }

          .mobile-only {
            display: block;
            width: 100%;
            margin-top: 16px;
          }

          .btn-login-mobile {
            display: block;
            text-align: center;
            text-decoration: none;
            color: #374151;
            font-size: 16px;
            font-weight: 500;
            padding: 12px 24px;
            border-radius: 8px;
            background: #f3f4f6;
            transition: all 0.2s ease;
          }

          .btn-login-mobile:hover { background: #e5e7eb; }

          .btn-signup-mobile {
            display: block;
            text-align: center;
            text-decoration: none;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            font-size: 16px;
            font-weight: 600;
            padding: 14px 24px;
            border-radius: 10px;
            margin-top: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .btn-signup-mobile:hover {
            box-shadow: 0 4px 12px rgba(99,102,241,0.3);
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
          }
        }

        @media (max-width: 480px) {
          .nav-container { height: 64px; padding: 0 16px; }
          .nav-menu { top: 64px; height: calc(100vh - 64px); }
          .logo-text { font-size: 20px; }
          .logo-icon svg { width: 28px; height: 28px; }
        }
      `}</style>
    </>
  );
};

export default Navbar;