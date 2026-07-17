import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, userData }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'booking-history',
      label: 'Booking History',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'tryon-history',
      label: 'Try-On History',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="logo-text">
              <h2>StyleAI</h2>
              <span>Dashboard</span>
            </div>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="user-profile-card">
          <img src={userData.avatar} alt={userData.name} className="user-profile-img" />
          <div className="user-info">
            <h3 className="user-name">{userData.name}</h3>
            <span className="user-plan">{userData.plan} Plan</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth <= 768) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
          
          <button
            className="nav-item go-back"
            onClick={() => navigate('/')}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            <span className="nav-label">Go Back to Site</span>
          </button>

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="nav-label">Log Out</span>
          </button>
        </nav>


      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 280px;
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .sidebar.closed {
          transform: translateX(-100%);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f3f4f6;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text h2 {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2px;
        }

        .logo-text span {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sidebar-close {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #374151;
          padding: 8px;
          border-radius: 8px;
        }

        .sidebar-close:hover {
          background: #f3f4f6;
        }

        .user-profile-card {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .user-profile-img {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          object-fit: cover;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-plan {
          font-size: 12px;
          color: #374151;
          font-weight: 500;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: none;
          width: 100%;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          position: relative;
        }

        .nav-item:hover {
          background: #f9fafb;
          color: #374151;
        }

        .nav-item.active {
          background: #111827;
          color: white;
        }

        .nav-item.active .nav-icon {
          color: white;
        }


        .nav-item.go-back {
          margin-top: 12px;
          border-top: 1px solid #f3f4f6;
          border-radius: 0;
          padding-top: 16px;
        }

        .nav-item.logout {
          color: #ef4444;
        }

        .nav-item.logout:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .nav-label {
          flex: 1;
          text-align: left;
        }

        .nav-badge {
          background: #374151;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid #f3f4f6;
        }

        .upgrade-card {
          background: #111827;
          padding: 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }

        .upgrade-icon {
          font-size: 24px;
        }

        .upgrade-text {
          flex: 1;
        }

        .upgrade-text h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .upgrade-text p {
          font-size: 11px;
          opacity: 0.8;
        }

        .upgrade-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .upgrade-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 1024px) {
          .sidebar-overlay {
            display: block;
          }

          .sidebar-close {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;