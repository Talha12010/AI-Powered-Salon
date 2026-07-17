import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Profile from './Profile';
import BookingHistory from './BookingHistory';
import TryOnHistory from './TryOnHistory';
import Favorites from './Favorites';
import Settings from './Settings';
import Analytics from './Analytics';

const API = 'http://localhost:5000';

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${API}${image.startsWith('/') ? image : '/' + image}`;
};

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: null,
    memberSince: '',
    plan: 'Free',
    totalTryOns: 0,
    totalBookings: 0,
    favorites: 0,
  });

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserData(prev => ({
          ...prev,
          name: u.username || u.name || 'User',
          email: u.email || '',
          avatar: u.image ? getImageUrl(u.image) : null,
          plan: u.plan || 'Free',
        }));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
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
      case 'profile':
        return <Profile userData={userData} setUserData={setUserData} />;
      case 'booking-history':
        return <BookingHistory />;
      case 'tryon-history':
        return <TryOnHistory />;
      case 'favorites':
        return <Favorites />;
      case 'analytics':
        return <Analytics userData={userData} />;
      case 'settings':
        return <Settings userData={userData} setUserData={setUserData} />;
      default:
        return <Profile userData={userData} setUserData={setUserData} />;
    }
  };

  return (
    <>
      <div className="dashboard-container">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          userData={userData}
        />
        
        <main className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="dashboard-header">
            <button 
              className="menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"} />
              </svg>
            </button>
            <div className="header-info">
              <h1 className="header-title">
                {activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h1>
              <p className="header-welcome">Welcome back, {userData.name.split(' ')[0]}! 👋</p>
            </div>
            <div className="header-actions">
              <div className="header-user">
                {userData.avatar
                  ? <img src={userData.avatar} alt={userData.name} className="header-avatar" />
                  : <div className="header-avatar-initials">{userData.name?.charAt(0).toUpperCase() || 'U'}</div>
                }
              </div>
            </div>
          </div>
          <div className="dashboard-content">
            {renderContent()}
          </div>
        </main>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }

        .dashboard-main {
          flex: 1;
          transition: margin-left 0.3s ease;
          min-width: 0;
        }

        .dashboard-main.sidebar-open {
          margin-left: 280px;
        }

        .dashboard-main.sidebar-closed {
          margin-left: 0;
        }

        .dashboard-header {
          background: white;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          color: #374151;
          transition: all 0.2s ease;
        }

        .menu-toggle:hover {
          background: #f3f4f6;
        }

        .header-info {
          flex: 1;
        }

        .header-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .header-welcome {
          font-size: 14px;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification-bell {
          position: relative;
          cursor: pointer;
          color: #374151;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .notification-bell:hover {
          background: #f3f4f6;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          background: #111827;
          color: white;
          font-size: 11px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .header-user {
          cursor: pointer;
        }

        .header-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          object-fit: cover;
          border: 2px solid #e5e7eb;
        }

        .header-avatar-initials {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          border: 2px solid #e5e7eb;
        }

        .dashboard-content {
          padding: 32px;
        }

        @media (max-width: 1024px) {
          .dashboard-main.sidebar-open {
            margin-left: 0;
          }

          .menu-toggle {
            display: block;
          }

          .dashboard-content {
            padding: 24px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 16px;
          }

          .header-title {
            font-size: 20px;
          }

          .header-welcome {
            display: none;
          }

          .dashboard-content {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default DashboardLayout;