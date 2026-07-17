import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, adminData }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'services',
      label: 'Services',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'styles',
      label: 'Styles',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <>
      <aside className={`as-sidebar ${isSidebarOpen ? 'as-open' : 'as-closed'}`}>
        <div className="as-sidebar-header">
          <div className="as-sidebar-logo">
            <div className="as-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="as-logo-text">
              <h2>StyleAI</h2>
              <span>Admin Panel</span>
            </div>
          </div>
          <button 
            className="as-sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="as-profile-card">
          <div className="as-profile-fallback">
            {adminData.name ? adminData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
          </div>
          <div className="as-user-info">
            <h3 className="as-user-name">{adminData.name}</h3>
            <span className="as-user-role">{adminData.role}</span>
          </div>
        </div>

        <nav className="as-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`as-nav-item ${activeTab === item.id ? 'as-active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth <= 1024) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <span className="as-nav-icon">{item.icon}</span>
              <span className="as-nav-label">{item.label}</span>
            </button>
          ))}
          
          <button
            className="as-nav-item as-go-back"
            onClick={() => navigate('/')}
            style={{ marginTop: 'auto' }}
          >
            <span className="as-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            <span className="as-nav-label">Go Back to Site</span>
          </button>
        </nav>

        <div className="as-sidebar-footer">
          <button className="as-logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="as-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <style>{`
        .as-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 280px;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(15, 23, 42, 0.15);
        }

        .as-sidebar.as-closed {
          transform: translateX(-100%);
        }

        .as-sidebar.as-open {
          transform: translateX(0);
        }

        .as-sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 40;
        }

        .as-sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1e293b;
        }

        .as-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .as-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        .as-logo-text h2 {
          font-size: 18px;
          font-weight: 800;
          color: white;
          margin: 0 0 1px 0;
          line-height: 1.2;
        }

        .as-logo-text span {
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .as-sidebar-close {
          display: none;
          background: #1e293b !important;
          border: none !important;
          cursor: pointer;
          color: #94a3b8 !important;
          padding: 6px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
        }

        .as-sidebar-close:hover {
          background: #334155 !important;
          color: white !important;
        }

        .as-profile-card {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #1e293b;
        }

        .as-profile-fallback {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: white;
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #4f46e5;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
          flex-shrink: 0;
        }

        .as-user-info {
          flex: 1;
          min-width: 0;
        }

        .as-user-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .as-user-role {
          font-size: 11px;
          color: #818cf8;
          font-weight: 600;
        }

        .as-sidebar-nav {
          flex: 1;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .as-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          border: none !important;
          background: none !important;
          width: 100%;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8 !important;
          font-size: 13.5px;
          font-weight: 600;
          text-align: left;
        }

        .as-nav-item:hover {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }

        .as-nav-item.as-go-back {
          margin-top: auto;
          border-top: 1px solid #1e293b !important;
          border-radius: 0;
          padding-top: 16px;
        }

        .as-nav-item.as-active {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .as-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .as-nav-label {
          flex: 1;
        }

        .as-sidebar-footer {
          padding: 16px;
          border-top: 1px solid #1e293b;
        }

        .as-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 11px 16px;
          background: rgba(239, 68, 68, 0.05) !important;
          border: 1px solid rgba(239, 68, 68, 0.1) !important;
          border-radius: 10px;
          cursor: pointer;
          color: #f87171 !important;
          font-size: 13.5px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .as-logout-btn:hover {
          background: #ef4444 !important;
          color: white !important;
          border-color: #ef4444 !important;
        }

        @media (max-width: 1024px) {
          .as-sidebar-overlay {
            display: block;
          }

          .as-sidebar-close {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .as-sidebar {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;