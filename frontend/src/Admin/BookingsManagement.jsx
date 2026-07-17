import React, { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../api';

const STATUS_CFG = {
  Pending:   { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: 'rgba(245, 158, 11, 0.15)', dot: '#f59e0b' },
  Confirmed: { bg: 'rgba(59, 130, 246, 0.08)',  color: '#2563eb', border: 'rgba(59, 130, 246, 0.15)',  dot: '#3b82f6' },
  Completed: { bg: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: 'rgba(16, 185, 129, 0.15)', dot: '#10b981' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.08)',  color: '#dc2626', border: 'rgba(239, 68, 68, 0.15)',  dot: '#ef4444' },
};

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const ALL_FILTERS = ['all', ...STATUSES];

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
  return (
    <span className="bm-status-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className="bm-dot" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}

const BookingsManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [updating,     setUpdating]     = useState(null);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  const loadBookings = async () => {
    setLoading(true);
    try { const d = await fetchJson('/api/admin/bookings'); setBookings(d.bookings || []); }
    catch (_) {}
    setLoading(false);
  };
  useEffect(() => { loadBookings(); }, []);

  const filtered = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchQ = String(b.user || '').toLowerCase().includes(q)
      || String(b.id || '').toLowerCase().includes(q)
      || String(b.service || '').toLowerCase().includes(q);
    const matchS = filterStatus === 'all' || b.status === filterStatus;
    return matchQ && matchS;
  });

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await fetchJson(`/api/admin/bookings/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ status }) });
      await loadBookings();
    } catch (_) {}
    setUpdating(null);
  };

  const counts = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    revenue:   bookings.filter(b => b.status === 'Completed').reduce((s, b) => s + (Number(b.amount) || 0), 0),
  };

  const statsRow = [
    { label: 'Total Appts', value: counts.total,     emoji: '📋', bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', color: '#4f46e5' },
    { label: 'Pending',     value: counts.pending,   emoji: '⏳', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#d97706' },
    { label: 'Confirmed',   value: counts.confirmed, emoji: '📅', bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#2563eb' },
    { label: 'Completed',   value: counts.completed, emoji: '✅', bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#059669' },
    { label: 'Cancelled',   value: counts.cancelled, emoji: '❌', bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#dc2626' },
    { label: 'Est. Revenue', value: `$${counts.revenue.toFixed(2)}`, emoji: '💰', bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#059669' },
  ];

  return (
    <div className="bm-super-container">

      {/* ── Header ── */}
      <div className="bm-glass-header">
        <div className="bm-header-info">
          <div className="bm-sparkle-badge">📅 Bookings Feed</div>
          <h2 className="bm-main-title">Appointment Management</h2>
          <p className="bm-main-desc">Review scheduling requests, verify payment status, and assign client status</p>
        </div>
        <div className="bm-header-actions">
          <span className="bm-count-chip">Found {filtered.length} matches</span>
        </div>
      </div>

      {/* ── Stats Indicators ── */}
      <div className="bm-stats-grid">
        {statsRow.map(s => (
          <div key={s.label} className="bm-stat-card" style={{ background: s.bg }}>
            <span className="bm-stat-emoji">{s.emoji}</span>
            <div className="bm-stat-body">
              <span className="bm-stat-val" style={{ color: s.color }}>{s.value}</span>
              <span className="bm-stat-lbl">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bm-filter-glass">
        <div className="bm-search-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="bm-search-input" placeholder="Search by customer name, booking ID, or salon service..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="bm-tabs-row">
          {ALL_FILTERS.map(s => {
            const cfg = s !== 'all' ? STATUS_CFG[s] : null;
            return (
              <button key={s}
                className={`bm-filter-tab${filterStatus === s ? ' bm-filter-active' : ''}`}
                style={filterStatus === s && cfg ? { background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' } : {}}
                onClick={() => setFilterStatus(s)}>
                {s === 'all' ? 'All Bookings' : s}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table Container ── */}
      {loading ? (
        <div className="bm-loading-box"><div className="bm-spin-loader"/><p>Pulling salon calendar...</p></div>
      ) : filtered.length === 0 ? (
        <div className="bm-empty-state">
          <div className="bm-empty-icon">📅</div>
          <h3>No bookings matching filters</h3>
          <p>Try modifying your query or selecting another booking category.</p>
        </div>
      ) : (
        <div className="bm-table-glass">
          <table className="bm-table">
            <thead>
              <tr className="bm-thead-row">
                <th className="bm-th">Reference ID</th>
                <th className="bm-th">Client</th>
                <th className="bm-th">Service</th>
                <th className="bm-th">Date & Time</th>
                <th className="bm-th">Stylist</th>
                <th className="bm-th bm-th-right">Amount Due</th>
                <th className="bm-th">Status</th>
                <th className="bm-th">Action Panel</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="bm-row">
                  <td className="bm-td">
                    <span className="bm-id-chip">#{b.id.slice(0, 8)}</span>
                  </td>
                  <td className="bm-td">
                    <div className="bm-customer-cell">
                      <img
                        src={b.image || '/api/placeholder/40/40'} alt={b.user}
                        className="bm-customer-img"
                        onError={e => { e.target.src = '/api/placeholder/40/40'; }}
                      />
                      <span className="bm-customer-name">{b.user || '—'}</span>
                    </div>
                  </td>
                  <td className="bm-td">
                    <span className="bm-service-name">{b.service || '—'}</span>
                  </td>
                  <td className="bm-td">
                    <div className="bm-datetime">
                      <span className="bm-date">{b.date || '—'}</span>
                      <span className="bm-time">{b.time || ''}</span>
                    </div>
                  </td>
                  <td className="bm-td">
                    <span className="bm-stylist-tag">{b.stylist || '—'}</span>
                  </td>
                  <td className="bm-td bm-td-right">
                    <span className="bm-amount">${Number(b.amount || 0).toFixed(2)}</span>
                  </td>
                  <td className="bm-td">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="bm-td">
                    <select
                      className="bm-status-select"
                      value={b.status}
                      disabled={updating === b.id}
                      onChange={e => updateStatus(b.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .bm-super-container {
          animation: bmFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1e293b;
        }

        @keyframes bmFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Glass Header Design */
        .bm-glass-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
          border: 1px solid #e2e8f0;
          padding: 24px 32px;
          border-radius: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
          backdrop-filter: blur(10px);
          gap: 16px;
          flex-wrap: wrap;
        }

        .bm-sparkle-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.1);
          color: #4f46e5;
          font-size: 11px;
          font-weight: 700;
          border-radius: 12px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .bm-main-title {
          font-size: 26px;
          font-weight: 850;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .bm-main-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .bm-count-chip {
          padding: 8px 16px;
          background: #f1f5f9;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        /* Stats Panels flex */
        .bm-stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .bm-stat-card {
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }

        .bm-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }

        .bm-stat-emoji {
          font-size: 20px;
          background: #ffffff;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
          flex-shrink: 0;
        }

        .bm-stat-body {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .bm-stat-val {
          font-size: 18px;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bm-stat-lbl {
          font-size: 10px;
          color: #475569;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Filter Toolbar */
        .bm-filter-glass {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 16px 24px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.01);
        }

        .bm-search-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 16px;
          flex: 1;
          min-width: 280px;
          transition: all 0.25s ease;
        }

        .bm-search-wrapper:focus-within {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
        }

        .bm-search-input {
          border: none !important;
          background: transparent !important;
          outline: none !important;
          font-size: 14px;
          color: #0f172a !important;
          width: 100%;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .bm-search-input::placeholder {
          color: #94a3b8;
        }

        .bm-tabs-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .bm-filter-tab {
          padding: 9px 16px;
          border: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #475569 !important;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bm-filter-tab:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }

        .bm-filter-active {
          background: #0f172a !important;
          color: #ffffff !important;
          border-color: #0f172a !important;
        }

        /* Glass Table Design */
        .bm-table-glass {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 25px rgba(0,0,0,0.02);
        }

        .bm-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bm-thead-row {
          background: #f8fafc;
        }

        .bm-th {
          padding: 16px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .bm-th-right {
          text-align: right;
        }

        .bm-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .bm-row:last-child {
          border-bottom: none;
        }

        .bm-row:hover {
          background: #f8fafc;
        }

        .bm-td {
          padding: 16px 20px;
          vertical-align: middle;
          font-size: 14px;
          color: #334155;
        }

        .bm-td-right {
          text-align: right;
        }

        .bm-id-chip {
          font-family: monospace;
          font-size: 12px;
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 8px;
          font-weight: 700;
          border: 1px solid #cbd5e1;
        }

        .bm-customer-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bm-customer-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          flex-shrink: 0;
          border: 2px solid #fff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
        }

        .bm-customer-name {
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
        }

        .bm-service-name {
          font-weight: 600;
          color: #0f172a;
        }

        .bm-datetime {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .bm-date {
          font-weight: 700;
          color: #0f172a;
          font-size: 13.5px;
        }

        .bm-time {
          font-size: 11.5px;
          color: #94a3b8;
          font-weight: 500;
        }

        .bm-stylist-tag {
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .bm-amount {
          font-weight: 800;
          color: #0f172a;
          font-size: 15px;
        }

        /* Status badges */
        .bm-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .bm-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Select styling */
        .bm-status-select {
          padding: 8px 12px !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 10px !important;
          font-size: 13px;
          font-weight: 600;
          background: #f8fafc !important;
          color: #1e293b !important;
          outline: none !important;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .bm-status-select:focus {
          border-color: #6366f1 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12) !important;
        }

        .bm-status-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading / Empty Panels */
        .bm-loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .bm-spin-loader {
          width: 38px;
          height: 38px;
          border: 4px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: bmSpinPulse 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes bmSpinPulse { to { transform: rotate(360deg); } }

        .bm-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .bm-empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .bm-empty-state h3 {
          font-size: 18px;
          font-weight: 750;
          margin: 0 0 6px 0;
          color: #0f172a;
        }

        .bm-empty-state p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        @media(max-width: 1400px) {
          .bm-stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media(max-width: 900px) {
          .bm-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .bm-table-glass { overflow-x: auto; }
          .bm-table { min-width: 950px; }
        }
        @media(max-width: 600px) {
          .bm-glass-header { flex-direction: column; align-items: stretch; padding: 20px; }
          .bm-filter-glass { flex-direction: column; align-items: stretch; }
          .bm-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default BookingsManagement;
