import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

const AdminDashboard = ({ navigateToTab }) => {
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJson('/api/admin/dashboard').then(data => {
      setStats(data.stats || []);
      setRecentBookings((data.recentBookings || []).map(item => ({
        id: item.id,
        user: item.user,
        service: item.service,
        date: item.date,
        amount: `$${Number(item.amount || item.price || 0)}`,
        status: item.status
      })));
      setRecentUsers((data.recentUsers || []).map(user => ({
        name: user.name,
        email: user.email,
        joined: user.joined || '',
        status: user.status || 'Active'
      })));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Completed':
      case 'Active':
        return { bg: '#d1fae5', color: '#065f46', dot: '#10b981' };
      case 'Pending':
        return { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' };
      case 'Cancelled':
      case 'Suspended':
        return { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' };
      default:
        return { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
    }
  };

  const getInitials = (name) => {
    return String(name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="db-loading-state">
        <div className="db-spinner" />
        <p>Loading dashboard metrics...</p>
        <style>{`
          .db-loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 20px;
            text-align: center;
          }
          .db-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: dbSpin .8s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes dbSpin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="db-dashboard">
        {/* Welcome Banner */}
        <div className="db-welcome-banner">
          <div className="db-welcome-text">
            <h2>Welcome Back, Admin 👋</h2>
            <p>Here is what's happening with your business today. Check out the latest stats, bookings, and user activity.</p>
          </div>
          <div className="db-welcome-date">
            <span className="db-date-tag">📅 Live Dashboard</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="db-stats-grid">
          {stats.map((stat, index) => {
            const isPositive = stat.change.includes('+');
            return (
              <div key={index} className="db-stat-card">
                <div className="db-stat-header">
                  <div className="db-stat-icon" style={{ background: stat.bgColor || '#e0e7ff' }}>
                    <span>{stat.icon}</span>
                  </div>
                  <span className={`db-stat-change ${isPositive ? 'db-pos' : 'db-neg'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="db-stat-body">
                  <span className="db-stat-value">{stat.value}</span>
                  <span className="db-stat-label">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="db-layout-grid">
          {/* Recent Bookings */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Recent Bookings</h3>
              <button className="db-btn-text" onClick={() => navigateToTab('bookings')}>View Bookings →</button>
            </div>
            <div className="db-table-container">
              <table className="db-data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th className="db-text-right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="db-empty-cell">No bookings found</td>
                    </tr>
                  ) : (
                    recentBookings.map((booking, index) => {
                      const style = getStatusStyle(booking.status);
                      return (
                        <tr key={index}>
                          <td className="db-booking-id">#{booking.id.slice(0, 8)}</td>
                          <td className="db-font-semibold">{booking.user}</td>
                          <td>{booking.service}</td>
                          <td>{booking.date}</td>
                          <td className="db-amount-cell db-text-right">{booking.amount}</td>
                          <td>
                            <span 
                              className="db-status-pill"
                              style={{ 
                                background: style.bg,
                                color: style.color
                              }}
                            >
                              <span className="db-status-dot" style={{ background: style.dot }} />
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Recent Users</h3>
              <button className="db-btn-text" onClick={() => navigateToTab('users')}>View Users →</button>
            </div>
            <div className="db-users-list">
              {recentUsers.length === 0 ? (
                <div className="db-empty-state">No users registered recently</div>
              ) : (
                recentUsers.map((user, index) => {
                  const style = getStatusStyle(user.status);
                  return (
                    <div key={index} className="db-user-item">
                      <div className="db-avatar-fallback">
                        {getInitials(user.name)}
                      </div>
                      <div className="db-user-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                      </div>
                      <div className="db-user-meta">
                        <span className="db-user-joined">{user.joined}</span>
                        <span 
                          className="db-status-pill small"
                          style={{ 
                            background: style.bg,
                            color: style.color
                          }}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="db-quick-actions">
          <h3>Quick Management Actions</h3>
          <div className="db-actions-grid">
            <button className="db-action-card" onClick={() => navigateToTab('services', 'add')}>
              <span className="db-action-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>➕</span>
              <div className="db-action-details">
                <span className="db-action-label">Add Service</span>
                <span className="db-action-sub">Create new pricing options</span>
              </div>
            </button>
            <button className="db-action-card" onClick={() => navigateToTab('styles', 'add')}>
              <span className="db-action-icon" style={{ background: '#ecfdf5', color: '#059669' }}>💇</span>
              <div className="db-action-details">
                <span className="db-action-label">Add Style</span>
                <span className="db-action-sub">Add a brand new hair fashion style</span>
              </div>
            </button>
            <button className="db-action-card" onClick={() => navigateToTab('reports', 'generate')}>
              <span className="db-action-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📊</span>
              <div className="db-action-details">
                <span className="db-action-label">Generate Report</span>
                <span className="db-action-sub">Download business statistics</span>
              </div>
            </button>
            <button className="db-action-card" onClick={() => navigateToTab('users', 'add')}>
              <span className="db-action-icon" style={{ background: '#fce7f3', color: '#db2777' }}>👤</span>
              <div className="db-action-details">
                <span className="db-action-label">Add User</span>
                <span className="db-action-sub">Register new administrative or stylist accounts</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .db-dashboard {
          animation: dbFadeIn 0.4s ease;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        @keyframes dbFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Welcome Banner */
        .db-welcome-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 24px 32px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.1);
        }

        .db-welcome-text h2 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 6px 0;
        }

        .db-welcome-text p {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          max-width: 600px;
          line-height: 1.5;
        }

        .db-date-tag {
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Stats Grid */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .db-stat-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          border: 1px solid #e2e8f0;
          transition: all 0.25s ease;
        }

        .db-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
          border-color: #cbd5e1;
        }

        .db-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .db-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .db-stat-change {
          font-size: 12px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
        }
        .db-stat-change.db-pos { background: #d1fae5; color: #065f46; }
        .db-stat-change.db-neg { background: #fee2e2; color: #991b1b; }

        .db-stat-body {
          display: flex;
          flex-direction: column;
        }

        .db-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
          line-height: 1.1;
        }

        .db-stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }

        /* Layout Grid */
        .db-layout-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
        }

        .db-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .db-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .db-card-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .db-btn-text {
          background: none !important;
          border: none !important;
          color: #4f46e5 !important;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0 !important;
          transition: all 0.2s ease;
        }

        .db-btn-text:hover {
          color: #3730a3 !important;
          text-decoration: underline;
        }

        .db-table-container {
          overflow-x: auto;
        }

        .db-data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .db-data-table th {
          padding: 12px 24px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .db-data-table td {
          padding: 14px 24px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .db-data-table tr:last-child td {
          border-bottom: none;
        }

        .db-data-table tr:hover td {
          background: #f8fafc;
        }

        .db-booking-id {
          font-weight: 600;
          color: #4f46e5;
          font-family: monospace;
        }

        .db-font-semibold {
          font-weight: 600;
          color: #0f172a;
        }

        .db-amount-cell {
          font-weight: 700;
          color: #0f172a;
        }

        .db-text-right {
          text-align: right;
        }

        .db-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }
        .db-status-pill.small {
          font-size: 10px;
          padding: 2px 6px;
        }

        .db-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .db-empty-cell {
          text-align: center;
          padding: 40px !important;
          color: #64748b;
          font-style: italic;
        }

        /* User list */
        .db-users-list {
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .db-user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .db-user-item:hover {
          background: #f8fafc;
        }

        .db-avatar-fallback {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 13px;
        }

        .db-user-info {
          flex: 1;
          min-width: 0;
        }

        .db-user-info h4 {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-user-info p {
          font-size: 11px;
          color: #64748b;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-user-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .db-user-joined {
          font-size: 10px;
          color: #94a3b8;
        }

        .db-empty-state {
          padding: 40px;
          text-align: center;
          color: #64748b;
          font-style: italic;
          font-size: 13px;
        }

        /* Quick Actions */
        .db-quick-actions {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          border: 1px solid #e2e8f0;
        }

        .db-quick-actions h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 18px 0;
        }

        .db-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .db-action-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }

        .db-action-card:hover {
          border-color: #6366f1 !important;
          background: #fff !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
          transform: translateY(-2px);
        }

        .db-action-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .db-action-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .db-action-label {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .db-action-sub {
          font-size: 10px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 1200px) {
          .db-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .db-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .db-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .db-stats-grid {
            grid-template-columns: 1fr;
          }
          .db-actions-grid {
            grid-template-columns: 1fr;
          }
          .db-welcome-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;
