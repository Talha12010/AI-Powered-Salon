import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api';

const BookingHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (_) {
      return null;
    }
  })();

  useEffect(() => {
    fetchJson('/api/bookings')
      .then(data => {
        const records = Array.isArray(data.bookings) ? data.bookings : [];
        const scoped = currentUser?.id
          ? records.filter((booking) => String(booking.userId || '') === String(currentUser.id))
          : records;

        setBookings(scoped.map(b => ({
          id: b.id,
          salon: b.salon,
          stylist: b.stylist,
          date: b.date,
          time: b.time,
          service: b.service,
          price: b.price || b.amount,
          status: String(b.status || '').toLowerCase(),
          rating: b.rating,
          image: b.image
        })));
      })
      .catch(() => {});
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.salon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.stylist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#374151';
      case 'upcoming': return '#111827';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'completed': return '#e5e7eb';
      case 'upcoming': return '#f3f4f6';
      case 'cancelled': return '#f9fafb';
      default: return '#f3f4f6';
    }
  };

  return (
    <>
      <div className="booking-history">
        <div className="booking-header">
          <div className="filter-tabs">
            {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                className={`filter-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-image">
                  <img src={booking.image} alt={booking.salon} />
                  <span 
                    className="booking-status"
                    style={{ 
                      background: getStatusBg(booking.status),
                      color: getStatusColor(booking.status)
                    }}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="booking-main">
                    <h3 className="booking-salon">{booking.salon}</h3>
                    <div className="booking-meta">
                      <span className="booking-stylist">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {booking.stylist}
                      </span>
                      <span className="booking-service">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {booking.service}
                      </span>
                    </div>
                  </div>
                  <div className="booking-info">
                    <div className="booking-date-time">
                      <div className="booking-date">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {booking.date}
                      </div>
                      <div className="booking-time">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {booking.time}
                      </div>
                    </div>
                    <div className="booking-price">${booking.price}</div>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'completed' && booking.rating && (
                      <div className="booking-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < booking.rating ? '#f59e0b' : '#d1d5db' }}>★</span>
                        ))}
                      </div>
                    )}
                    {booking.status === 'upcoming' && (
                      <>
                        <button className="btn-reschedule">Reschedule</button>
                        <button className="btn-cancel">Cancel</button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <button className="btn-rebook">Book Again</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No bookings found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .booking-history {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .booking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          background: white;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .filter-tab {
          padding: 8px 20px;
          border: none;
          background: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tab.active {
          background: #111827;
          color: white;
        }

        .filter-tab:hover:not(.active) {
          background: #f3f4f6;
          color: #374151;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          min-width: 250px;
        }

        .search-box svg {
          color: #9ca3af;
        }

        .search-box input {
          border: none;
          outline: none;
          font-size: 14px;
          width: 100%;
          color: #374151;
        }

        .search-box input::placeholder {
          color: #9ca3af;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .booking-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          display: flex;
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .booking-image {
          position: relative;
          width: 200px;
          min-height: 200px;
          background: #f3f4f6;
        }

        .booking-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .booking-status {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .booking-details {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .booking-main {
          flex: 1;
        }

        .booking-salon {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .booking-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .booking-stylist,
        .booking-service {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .booking-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .booking-date-time {
          display: flex;
          gap: 20px;
        }

        .booking-date,
        .booking-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .booking-price {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .booking-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .booking-rating {
          display: flex;
          gap: 2px;
          font-size: 18px;
        }

        .btn-reschedule,
        .btn-rebook {
          padding: 8px 20px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-reschedule:hover,
        .btn-rebook:hover {
          background: #374151;
        }

        .btn-cancel {
          padding: 8px 20px;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #f3f4f6;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #f3f4f6;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .booking-header {
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .booking-card {
            flex-direction: column;
          }

          .booking-image {
            width: 100%;
            height: 200px;
          }

          .booking-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .booking-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
};

export default BookingHistory;
