import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

const Analytics = ({ userData = {} }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJson('/api/analytics')
      .then(data => {
        setAnalytics(data.analytics || null);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalTryOns = analytics?.totalTryOns ?? userData.totalTryOns ?? 0;
  const totalBookings = analytics?.totalBookings ?? userData.totalBookings ?? 0;
  const favoritesCount = analytics?.favorites ?? userData.favorites ?? 0;
  const avgAccuracy = analytics?.averageAccuracy ?? 0;
  const completedBookings = analytics?.completedBookings ?? 0;

  // Custom data for charts
  const weeklyData = [
    { day: 'Mon', value: 3 },
    { day: 'Tue', value: 7 },
    { day: 'Wed', value: 5 },
    { day: 'Thu', value: 8 },
    { day: 'Fri', value: 12 },
    { day: 'Sat', value: 15 },
    { day: 'Sun', value: 9 },
  ];

  const maxVal = Math.max(...weeklyData.map(d => d.value), 1);

  return (
    <>
      <div className="analytics-page">
        {/* Loading State */}
        {loading ? (
          <div className="analytics-loading">
            <div className="loading-spinner" />
            <p>Gathering performance data…</p>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="analytics-overview">
              <div className="overview-card">
                <div className="overview-icon">📸</div>
                <div className="overview-info">
                  <span className="overview-value">{totalTryOns}</span>
                  <span className="overview-label">Total Try-Ons</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">📅</div>
                <div className="overview-info">
                  <span className="overview-value">{totalBookings}</span>
                  <span className="overview-label">Total Bookings</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">♥</div>
                <div className="overview-info">
                  <span className="overview-value">{favoritesCount}</span>
                  <span className="overview-label">Saved Favorites</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">⚡</div>
                <div className="overview-info">
                  <span className="overview-value">{avgAccuracy}%</span>
                  <span className="overview-label">Avg. Match Rate</span>
                </div>
              </div>
            </div>

            {/* Visual Charts / Sections */}
            <div className="analytics-grid-details">
              {/* Weekly Try-On Activity */}
              <div className="details-card">
                <h3 className="card-title">Weekly Try-On Activity</h3>
                <p className="card-subtitle">Volume of virtual hairstyle transformations</p>
                <div className="bar-chart-container">
                  {weeklyData.map((data, idx) => (
                    <div key={idx} className="chart-bar-wrapper">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${(data.value / maxVal) * 100}%` }}
                      >
                        <span className="bar-tooltip">{data.value} try-ons</span>
                      </div>
                      <span className="bar-label">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Insights */}
              <div className="details-card insights-card">
                <h3 className="card-title">Hairstyle Insights</h3>
                <p className="card-subtitle">Performance breakdown of your bookings & matching styles</p>
                <div className="progress-list">
                  <div className="progress-item">
                    <div className="progress-labels">
                      <span>Completed Sessions</span>
                      <span>{completedBookings} / {totalBookings}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0}%` }} 
                      />
                    </div>
                  </div>

                  <div className="progress-item">
                    <div className="progress-labels">
                      <span>Saved Preference Rate</span>
                      <span>{favoritesCount > 0 ? Math.min(100, Math.round((favoritesCount / (totalTryOns || 1)) * 100)) : 0}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${favoritesCount > 0 ? Math.min(100, Math.round((favoritesCount / (totalTryOns || 1)) * 100)) : 0}%` }} 
                      />
                    </div>
                  </div>

                  <div className="progress-item">
                    <div className="progress-labels">
                      <span>Account Plan Utilization</span>
                      <span>{analytics?.plan === 'Admin' ? '100%' : '75%'}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: analytics?.plan === 'Admin' ? '100%' : '75%' }} 
                      />
                    </div>
                  </div>
                </div>
                <div className="plan-badge-wrapper">
                  <span className="plan-label">Current Level</span>
                  <span className="plan-value">{analytics?.plan || 'Free Member'}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .analytics-page {
          animation: fadeIn 0.4s ease;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Loading */
        .analytics-loading {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e5e7eb;
          border-top-color: #111827;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Overview stats */
        .analytics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .overview-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f3f4f6;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }

        .overview-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .overview-icon {
          font-size: 28px;
          width: 52px;
          height: 52px;
          background: #f9fafb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111827;
        }

        .overview-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .overview-value {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }

        .overview-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Visual grid */
        .analytics-grid-details {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        .details-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f3f4f6;
          padding: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .card-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 32px;
        }

        /* Bar Chart */
        .bar-chart-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 200px;
          padding-top: 20px;
          border-bottom: 1.5px solid #e5e7eb;
          gap: 12px;
        }

        .chart-bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          justify-content: flex-end;
          gap: 8px;
        }

        .chart-bar {
          width: 100%;
          max-width: 32px;
          background: #e5e7eb;
          border-radius: 6px 6px 0 0;
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chart-bar:hover {
          background: #111827;
        }

        .bar-tooltip {
          position: absolute;
          top: -36px;
          left: 50%;
          transform: translateX(-50%) scale(0.85);
          background: #111827;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .chart-bar:hover .bar-tooltip {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }

        .bar-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          margin-top: 4px;
        }

        /* Progress List */
        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .progress-bar-bg {
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #111827;
          border-radius: 4px;
          transition: width 0.8s ease-out;
        }

        /* Insights level */
        .plan-badge-wrapper {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .plan-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .plan-value {
          font-size: 13px;
          font-weight: 700;
          background: #f3f4f6;
          color: #111827;
          padding: 4px 10px;
          border-radius: 6px;
        }

        @media (max-width: 992px) {
          .analytics-grid-details {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .analytics-overview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default Analytics;
