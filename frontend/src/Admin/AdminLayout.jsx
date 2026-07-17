import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import ServicesManagement from './ServicesManagement';
import StylesManagement from './StylesManagement';
import ReportsManagement from './ReportsManagement';
import BookingsManagement from './BookingsManagement';
import UserManagement from './UserManagement';
import MessagesManagement from './MessagesManagement';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subAction, setSubAction] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState({
    name: 'John Admin',
    email: 'admin@styleai.com',
    avatar: '/api/placeholder/150/150',
    role: 'Super Admin',
    lastLogin: '2024-01-20 09:30 AM',
  });

  const navigateToTab = (tab, action = null) => {
    setActiveTab(tab);
    setSubAction(action);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard navigateToTab={navigateToTab} />;
      case 'services':
        return <ServicesManagement initialSubAction={subAction} clearSubAction={() => setSubAction(null)} />;
      case 'styles':
        return <StylesManagement initialSubAction={subAction} clearSubAction={() => setSubAction(null)} />;
      case 'reports':
        return <ReportsManagement initialSubAction={subAction} clearSubAction={() => setSubAction(null)} />;
      case 'bookings':
        return <BookingsManagement />;
      case 'users':
        return <UserManagement initialSubAction={subAction} clearSubAction={() => setSubAction(null)} />;
      case 'messages':
        return <MessagesManagement />;
      default:
        return <AdminDashboard navigateToTab={navigateToTab} />;
    }
  };

  const getHeaderTitle = () => {
    const titles = {
      dashboard: 'Admin Dashboard',
      services: 'Services Management',
      styles: 'Styles Management',
      reports: 'Reports & Analytics',
      bookings: 'Bookings Management',
      users: 'User Management',
      messages: 'Messages & Inquiries',
    };
    return titles[activeTab] || 'Admin Panel';
  };

  return (
    <>
      <div className="al-container">
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          adminData={adminData}
        />
        
        <main className={`al-main ${isSidebarOpen ? 'al-sidebar-open' : 'al-sidebar-closed'}`}>
          <div className="al-header">
            <div className="al-header-left">
              <button 
                className="al-menu-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"} />
                </svg>
              </button>
              <div className="al-header-info">
                <h1 className="al-header-title">{getHeaderTitle()}</h1>
                <p className="al-header-breadcrumb">Admin / {getHeaderTitle()}</p>
              </div>
            </div>
            <div className="al-header-right">
              <div className="al-profile">
                <div className="al-avatar-fallback">
                  {adminData.name ? adminData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
                </div>
                <div className="al-profile-info">
                  <span className="al-name">{adminData.name}</span>
                  <span className="al-role">{adminData.role}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="al-content">
            {renderContent()}
          </div>
        </main>
      </div>

      <style>{`
        .al-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .al-main {
          flex: 1;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .al-main.al-sidebar-open {
          margin-left: 280px;
        }

        .al-main.al-sidebar-closed {
          margin-left: 0;
        }

        .al-header {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .al-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .al-menu-toggle {
          background: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          color: #475569 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .al-menu-toggle:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }

        .al-header-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }

        .al-header-breadcrumb {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .al-header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .al-header-search {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .al-header-search:focus-within {
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .al-header-search svg {
          color: #94a3b8;
        }

        .al-header-search input {
          border: none !important;
          background: none !important;
          outline: none !important;
          font-size: 13px;
          color: #1e293b !important;
          width: 180px;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .al-header-search input::placeholder {
          color: #94a3b8;
        }

        .al-notification-bell {
          position: relative;
          cursor: pointer;
          color: #475569;
          padding: 8px;
          background: #f1f5f9;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .al-notification-bell:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .al-notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          padding: 0 4px;
          border: 2px solid #fff;
        }

        .al-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .al-profile:hover {
          background: #fff;
          border-color: #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .al-avatar-fallback {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e2e8f0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .al-profile-info {
          display: flex;
          flex-direction: column;
        }

        .al-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.3;
        }

        .al-role {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
        }

        .al-content {
          padding: 32px;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .al-main.al-sidebar-open {
            margin-left: 0;
          }

          .al-header-search {
            display: none;
          }

          .al-content {
            padding: 24px;
          }
        }

        @media (max-width: 768px) {
          .al-header {
            padding: 12px 20px;
          }

          .al-header-title {
            font-size: 18px;
          }

          .al-profile-info {
            display: none;
          }

          .al-content {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminLayout;