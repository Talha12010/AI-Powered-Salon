import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

const Favorites = () => {
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await fetchJson('/api/favorites');
      setFavorites(data.favorites || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { loadFavorites().catch(() => {}); }, []);

  const categories = ['all', 'Trending', 'Popular', 'Classic'];
  const filteredFavorites = filter === 'all' ? favorites : favorites.filter(fav => fav.category === filter);

  const removeFavorite = async (id) => {
    try {
      await fetchJson(`/api/favorites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      await loadFavorites();
    } catch (_) {}
  };

  return (
    <>
      <div className="favorites-page">
        {/* Stats Row */}
        <div className="fav-stats-row">
          <div className="fav-stat-card">
            <span className="fav-stat-number">{favorites.length}</span>
            <span className="fav-stat-label">Saved Styles</span>
          </div>
          <div className="fav-stat-card">
            <span className="fav-stat-number">
              {favorites.length > 0 ? Math.round(favorites.reduce((s, f) => s + (f.matchRate || 90), 0) / favorites.length) : 0}%
            </span>
            <span className="fav-stat-label">Avg. Match Rate</span>
          </div>
          <div className="fav-stat-card">
            <span className="fav-stat-number">
              {new Set(favorites.map(f => f.category).filter(Boolean)).size}
            </span>
            <span className="fav-stat-label">Unique Categories</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="fav-toolbar">
          <div className="category-filters">
            {categories.map((cat) => (
              <button 
                key={cat} 
                className={`category-btn ${filter === cat ? 'active' : ''}`} 
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All Styles' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="fav-loading">
            <div className="loading-spinner" />
            <p>Loading favorites…</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="fav-empty">
            <div className="empty-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3>No favorites saved</h3>
            <p>{filter === 'all' ? 'Find and save your favorite styles to see them here.' : `No styles found in "${filter}" category.`}</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="favorite-card">
                <div className="favorite-image-wrapper">
                  <img src={favorite.image} alt={favorite.styleName} />
                  <button className="favorite-heart active" onClick={() => removeFavorite(favorite.id)} title="Remove from favorites">
                    ♥
                  </button>
                  {favorite.matchRate && (
                    <div className="match-badge">
                      {favorite.matchRate}% Match
                    </div>
                  )}
                </div>
                <div className="favorite-info">
                  <div className="favorite-main">
                    <h3 className="favorite-name">{favorite.styleName || 'Unnamed Style'}</h3>
                    <span className="favorite-category">{favorite.category || 'General'}</span>
                  </div>
                  <div className="favorite-meta">
                    <span className="favorite-date">Saved {favorite.savedDate || 'recently'}</span>
                    {favorite.notes && <p className="favorite-notes">{favorite.notes}</p>}
                  </div>
                  <div className="favorite-actions">
                    <button className="btn-fav-action primary" onClick={() => removeFavorite(favorite.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .favorites-page {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Stats Row */
        .fav-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .fav-stat-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #f3f4f6;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .fav-stat-number {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }

        .fav-stat-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Toolbar */
        .fav-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .category-btn {
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

        .category-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .category-btn.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        /* Loading */
        .fav-loading {
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

        /* Empty State */
        .fav-empty {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .empty-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .fav-empty h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .fav-empty p {
          font-size: 14px;
          color: #6b7280;
        }

        /* Favorites Grid */
        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .favorite-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f3f4f6;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .favorite-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .favorite-image-wrapper {
          position: relative;
          height: 240px;
          background: #f3f4f6;
          overflow: hidden;
        }

        .favorite-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .favorite-card:hover .favorite-image-wrapper img {
          transform: scale(1.05);
        }

        .favorite-heart {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border: none;
          background: white;
          color: #e11d48;
          font-size: 20px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }

        .favorite-heart:hover {
          transform: scale(1.1);
        }

        .match-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(17, 24, 39, 0.85);
          color: white;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        .favorite-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .favorite-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .favorite-name {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }

        .favorite-category {
          font-size: 11px;
          font-weight: 600;
          background: #f3f4f6;
          color: #374151;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .favorite-meta {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .favorite-notes {
          background: #f9fafb;
          border-left: 2px solid #111827;
          padding: 8px 12px;
          border-radius: 0 6px 6px 0;
          font-style: italic;
          margin-top: 4px;
        }

        .favorite-actions {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .btn-fav-action {
          width: 100%;
          padding: 9px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-fav-action.primary {
          background: #111827;
          color: white;
          border: 1px solid #111827;
        }

        .btn-fav-action.primary:hover {
          background: #374151;
          border-color: #374151;
        }

        @media (max-width: 768px) {
          .fav-stats-row {
            grid-template-columns: 1fr;
          }
          .favorites-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default Favorites;
