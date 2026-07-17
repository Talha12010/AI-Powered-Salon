import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

const TryOnHistory = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [tryOns, setTryOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const token = localStorage.getItem('token') || '';
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (_) {
      return null;
    }
  })();

  const loadTryOns = async () => {
    setLoading(true);
    try {
      const data = await fetchJson('/api/tryons', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const records = Array.isArray(data.tryOns) ? data.tryOns : [];
      const scoped = currentUser?.id
        ? records.filter((tryOn) => String(tryOn.userId || '') === String(currentUser.id))
        : records;
      setTryOns(scoped);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { loadTryOns(); }, []);

  const deleteTryOn = async (id) => {
    setDeletingId(id);
    try {
      await fetchJson(`/api/tryons/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await loadTryOns();
    } catch (_) {}
    setDeletingId(null);
  };

  const categories = ['all', ...Array.from(new Set(tryOns.map(t => t.category).filter(Boolean)))];
  const filtered = filter === 'all' ? tryOns : tryOns.filter(t => t.category === filter);

  return (
    <>
      <div className="tryon-page">
        {/* Stats row */}
        <div className="tryon-stats-row">
          <div className="tryon-stat-card">
            <span className="tryon-stat-number">{tryOns.length}</span>
            <span className="tryon-stat-label">Total Try-Ons</span>
          </div>
          <div className="tryon-stat-card">
            <span className="tryon-stat-number">
              {tryOns.length > 0 ? Math.round(tryOns.reduce((s, t) => s + (t.accuracy || 0), 0) / tryOns.length) : 0}%
            </span>
            <span className="tryon-stat-label">Avg. Match Rate</span>
          </div>
          <div className="tryon-stat-card">
            <span className="tryon-stat-number">{categories.length - 1}</span>
            <span className="tryon-stat-label">Categories</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="tryon-toolbar">
          <div className="tryon-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
          <div className="view-toggles">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="tryon-loading">
            <div className="loading-spinner" />
            <p>Loading try-on history…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tryon-empty">
            <div className="empty-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>No try-ons yet</h3>
            <p>{filter === 'all' ? 'Your virtual try-on sessions will appear here.' : `No try-ons in the "${filter}" category.`}</p>
          </div>
        ) : (
          <div className={`tryon-grid-wrap ${viewMode}`}>
            {filtered.map((tryon) => (
              <div key={tryon.id} className="tryon-card">
                {(
                  tryon.image ||
                  tryon.originalImage ||
                  tryon.resultImage
                ) && (
                  <div className="tryon-card-image">
                    <img src={tryon.image || tryon.originalImage || tryon.resultImage} alt={tryon.styleName} />
                  </div>
                )}
                <div className="tryon-card-body">
                  <div className="tryon-card-top">
                    <div>
                      <h3 className="tryon-name">{tryon.styleName || 'Unnamed Style'}</h3>
                      {tryon.category && (
                        <span className="tryon-category-tag">{tryon.category}</span>
                      )}
                    </div>
                    {tryon.accuracy != null && (
                      <div className="tryon-accuracy-badge">
                        <span>{tryon.accuracy}%</span>
                        <small>match</small>
                      </div>
                    )}
                  </div>
                  {tryon.date && (
                    <div className="tryon-date">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {tryon.date}
                    </div>
                  )}
                  <div className="tryon-card-actions">
                    <button
                      className="btn-delete-tryon"
                      onClick={() => deleteTryOn(tryon.id)}
                      disabled={deletingId === tryon.id}
                    >
                      {deletingId === tryon.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .tryon-page { animation: fadeIn 0.4s ease; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Stats */
        .tryon-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .tryon-stat-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #f3f4f6;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .tryon-stat-number {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }

        .tryon-stat-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Toolbar */
        .tryon-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .tryon-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 7px 16px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          background: white;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-chip:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .filter-chip.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .view-toggles {
          display: flex;
          gap: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 4px;
        }

        .view-btn {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 7px;
          background: none;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: #111827;
          color: white;
        }

        /* Loading */
        .tryon-loading {
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

        /* Empty */
        .tryon-empty {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #f3f4f6;
        }

        .empty-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .tryon-empty h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .tryon-empty p {
          font-size: 14px;
          color: #6b7280;
        }

        /* Grid */
        .tryon-grid-wrap.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .tryon-grid-wrap.list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Card */
        .tryon-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f3f4f6;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.25s ease;
        }

        .tryon-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .tryon-grid-wrap.list .tryon-card {
          display: flex;
          flex-direction: row;
        }

        .tryon-card-image {
          height: 180px;
          background: #f3f4f6;
          overflow: hidden;
        }

        .tryon-grid-wrap.list .tryon-card-image {
          width: 140px;
          height: auto;
          flex-shrink: 0;
        }

        .tryon-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tryon-card-body {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tryon-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .tryon-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }

        .tryon-category-tag {
          font-size: 11px;
          font-weight: 600;
          background: #f3f4f6;
          color: #374151;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tryon-accuracy-badge {
          background: #111827;
          color: white;
          border-radius: 10px;
          padding: 6px 12px;
          text-align: center;
          flex-shrink: 0;
        }

        .tryon-accuracy-badge span {
          display: block;
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
        }

        .tryon-accuracy-badge small {
          font-size: 10px;
          opacity: 0.75;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tryon-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .tryon-card-actions {
          margin-top: auto;
        }

        .btn-delete-tryon {
          padding: 7px 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete-tryon:hover:not(:disabled) {
          background: #f3f4f6;
          color: #111827;
          border-color: #d1d5db;
        }

        .btn-delete-tryon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .tryon-stats-row { grid-template-columns: 1fr 1fr; }
          .tryon-grid-wrap.grid { grid-template-columns: 1fr; }
          .tryon-grid-wrap.list .tryon-card { flex-direction: column; }
          .tryon-grid-wrap.list .tryon-card-image { width: 100%; height: 180px; }
        }
      `}</style>
    </>
  );
};

export default TryOnHistory;
