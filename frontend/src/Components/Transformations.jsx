import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson } from '../api';

const API = 'http://localhost:5000';

function getImageUrl(image) {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${API}${image.startsWith('/') ? image : '/' + image}`;
}

const Transformations = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [transformations, setTransformations] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const filters = [
    { id: 'all', label: 'All Styles', icon: '✦' },
    { id: 'men', label: 'Men', icon: '◈' },
    { id: 'trending', label: 'Trending', icon: '▲' },
    { id: 'classic', label: 'Classic', icon: '◆' },
    { id: 'modern', label: 'Modern', icon: '◉' },
  ];

  useEffect(() => {
    Promise.all([
      fetchJson('/api/content/transformations').catch(() => ({ transformations: [] })),
      fetchJson('/api/styles').catch(() => ({ styles: [] }))
    ]).then(([transData, stylesData]) => {
      const transList = (transData.transformations || []).map(t => ({ ...t, isStyle: false }));
      const stylesList = (stylesData.styles || [])
        .filter(s => s.status === 'Active')
        .map(style => ({
          id: `style-${style.id}`,
          rawId: style.id,
          name: style.name,
          style: style.name,
          image: style.image,
          after: style.image,
          before: null,
          category: style.gender ? style.gender.toLowerCase() : '',
          type: style.category ? style.category.toLowerCase() : 'trending',
          description: style.description,
          user: 'StyleAI',
          rating: style.rating || 5.0,
          likes: style.popularity ? style.popularity * 10 : 100,
          tags: [style.category, style.gender].filter(Boolean),
          price: style.price || 49,
          duration: style.duration || '45 min',
          isStyle: true
        }));
      setTransformations([...transList, ...stylesList]);
    }).catch(() => {});
  }, []);

  const filteredTransformations = transformations
    .filter(item => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'trending' || activeFilter === 'classic' || activeFilter === 'modern') {
        return (item.type || '').toLowerCase() === activeFilter;
      }
      return (item.category || '').toLowerCase() === activeFilter;
    })
    .filter(item =>
      searchTerm === '' ||
      (item.style || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'recent') return new Date(b.date || 0) - new Date(a.date || 0);
      return 0;
    });

  const stats = [
    { label: 'Styles', value: String(transformations.length || 0), icon: '✦' },
    { label: 'Happy Users', value: '12.5K+', icon: '◈' },
    { label: 'Success Rate', value: '98%', icon: '◆' },
    { label: 'Avg. Rating', value: '4.8★', icon: '◉' },
  ];

  const handleBookNow = (style) => {
    setSelectedStyle(style);
    setBookingModal(true);
  };

  const handleProceedToCheckout = () => {
    const service = {
      name: selectedStyle.style || selectedStyle.name,
      price: selectedStyle.price || 49,
      category: selectedStyle.type || 'Hair Style',
      description: selectedStyle.description,
      duration: selectedStyle.duration || '45 min',
    };
    setBookingModal(false);
    navigate('/checkout', { state: { service } });
  };

  return (
    <>
      <div className="tf-page">

        {/* ── HERO ── */}
        <section className="tf-hero">
          <div className="tf-hero-bg" />
          <div className="tf-hero-inner">
            <span className="tf-badge">✦ Curated Styles</span>
            <h1 className="tf-hero-title">
              Discover Your<br />
              <span className="tf-hero-accent">Perfect Look</span>
            </h1>
            <p className="tf-hero-sub">
              Browse premium hairstyle collections crafted by our AI stylists.
              Click any style to preview and book your appointment instantly.
            </p>
            <div className="tf-stats">
              {stats.map((s, i) => (
                <div key={i} className="tf-stat">
                  <span className="tf-stat-icon">{s.icon}</span>
                  <span className="tf-stat-val">{s.value}</span>
                  <span className="tf-stat-lbl">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FILTERS ── */}
        <section className="tf-filter-bar">
          <div className="tf-filter-inner">
            <div className="tf-filter-tabs">
              {filters.map(f => (
                <button
                  key={f.id}
                  className={`tf-filter-btn ${activeFilter === f.id ? 'tf-filter-active' : ''}`}
                  onClick={() => setActiveFilter(f.id)}
                >
                  <span className="tf-filter-icon">{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="tf-filter-right">
              <div className="tf-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search styles…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="tf-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="recent">Newest</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section className="tf-gallery">
          <div className="tf-gallery-inner">
            {filteredTransformations.length > 0 ? (
              <div className="tf-grid">
                {filteredTransformations.map(item => (
                  <div
                    key={item.id}
                    className={`tf-card ${hoveredCard === item.id ? 'tf-card-hovered' : ''}`}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => setSelectedStyle(item)}
                  >
                    {/* Image */}
                    <div className="tf-card-img-wrap">
                      {item.before ? (
                        <>
                          <div className="tf-card-img-half">
                            <img
                              src={getImageUrl(item.before) || '/api/placeholder/180/220'}
                              alt="Before"
                              onError={e => { e.target.src = '/api/placeholder/180/220'; }}
                            />
                            <span className="tf-img-tag tf-img-before">Before</span>
                          </div>
                          <div className="tf-card-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="tf-card-img-half">
                            <img
                              src={getImageUrl(item.after) || '/api/placeholder/180/220'}
                              alt="After"
                              onError={e => { e.target.src = '/api/placeholder/180/220'; }}
                            />
                            <span className="tf-img-tag tf-img-after">After</span>
                          </div>
                        </>
                      ) : (
                        <div className="tf-card-img-single">
                          <img
                            src={getImageUrl(item.after || item.image) || '/api/placeholder/360/220'}
                            alt={item.style}
                            onError={e => { e.target.src = '/api/placeholder/360/220'; }}
                          />
                          <span className="tf-img-tag tf-img-style">Style</span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="tf-card-overlay">
                        <button className="tf-overlay-view-btn" onClick={e => { e.stopPropagation(); setSelectedStyle(item); }}>
                          View Style
                        </button>
                        <button className="tf-overlay-book-btn" onClick={e => { e.stopPropagation(); handleBookNow(item); }}>
                          Book Now
                        </button>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="tf-card-body">
                      <div className="tf-card-top">
                        <h3 className="tf-card-title">{item.style}</h3>
                        <span className="tf-card-badge">{item.type || 'style'}</span>
                      </div>
                      {item.description && (
                        <p className="tf-card-desc">{item.description}</p>
                      )}
                      <div className="tf-card-meta">
                        <div className="tf-card-meta-left">
                          <div className="tf-card-avatar">{(item.user || 'S').charAt(0).toUpperCase()}</div>
                          <span className="tf-card-by">{item.user}</span>
                        </div>
                        <div className="tf-card-meta-right">
                          <span className="tf-card-rating">⭐ {Number(item.rating).toFixed(1)}</span>
                          <span className="tf-card-likes">♥ {item.likes.toLocaleString()}</span>
                        </div>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="tf-card-tags">
                          {item.tags.slice(0, 3).map((tag, i) => tag && (
                            <span key={i} className="tf-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <button className="tf-card-book-btn" onClick={e => { e.stopPropagation(); handleBookNow(item); }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Book This Style
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tf-empty">
                <span className="tf-empty-icon">◈</span>
                <h3>No styles found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn-reset" onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="tf-testimonials">
          <div className="tf-test-inner">
            <div className="tf-section-head">
              <h2>What Clients Say</h2>
              <p>Real stories from people who transformed their look with StyleAI</p>
            </div>
            <div className="tf-test-grid">
              {[
                { name: 'Michael B.', text: '"StyleAI showed me exactly what would work for my face shape. The results were incredible!"', init: 'M' },
                { name: 'Lisa A.', text: '"The AI recommendations were spot on! My stylist was impressed by how accurate they were."', init: 'L' },
                { name: 'James W.', text: '"Game changer! Within seconds I had amazing suggestions. My confidence has never been higher."', init: 'J' },
              ].map((t, i) => (
                <div key={i} className="tf-test-card">
                  <div className="tf-test-stars">★★★★★</div>
                  <p className="tf-test-text">{t.text}</p>
                  <div className="tf-test-author">
                    <div className="tf-test-avatar">{t.init}</div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>Verified User</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-container">
            <h2 className="cta-title">Ready for Your Transformation?</h2>
            <p className="cta-description">Join thousands of happy users who found their perfect hairstyle</p>
            <div className="cta-buttons">
              <a href="/try-now" className="btn-primary">
                Try It Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/pricing" className="btn-secondary">View Plans</a>
            </div>
          </div>
        </section>

        {/* ── STYLE DETAIL MODAL ── */}
        {selectedStyle && !bookingModal && (
          <div className="tf-modal-overlay" onClick={() => setSelectedStyle(null)}>
            <div className="tf-modal" onClick={e => e.stopPropagation()}>
              <button className="tf-modal-close" onClick={() => setSelectedStyle(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="tf-modal-body">
                {/* Left – image */}
                <div className="tf-modal-left">
                  {selectedStyle.before ? (
                    <div className="tf-modal-split">
                      <div className="tf-modal-img-wrap">
                        <img src={getImageUrl(selectedStyle.before)} alt="Before" onError={e => { e.target.src = '/api/placeholder/260/360'; }} />
                        <span className="tf-modal-tag">Before</span>
                      </div>
                      <div className="tf-modal-arrow-big">→</div>
                      <div className="tf-modal-img-wrap">
                        <img src={getImageUrl(selectedStyle.after)} alt="After" onError={e => { e.target.src = '/api/placeholder/260/360'; }} />
                        <span className="tf-modal-tag tf-modal-tag-after">After</span>
                      </div>
                    </div>
                  ) : (
                    <div className="tf-modal-single-img">
                      <img
                        src={getImageUrl(selectedStyle.after || selectedStyle.image) || '/api/placeholder/400/360'}
                        alt={selectedStyle.style}
                        onError={e => { e.target.src = '/api/placeholder/400/360'; }}
                      />
                      <span className="tf-modal-tag tf-modal-tag-after">Style</span>
                    </div>
                  )}
                </div>

                {/* Right – info */}
                <div className="tf-modal-right">
                  <div className="tf-modal-badge-row">
                    <span className="tf-modal-type-badge">{selectedStyle.type || 'Style'}</span>
                    {selectedStyle.tags && selectedStyle.tags.slice(0, 2).map((t, i) => t && (
                      <span key={i} className="tf-modal-tag-pill">{t}</span>
                    ))}
                  </div>

                  <h2 className="tf-modal-title">{selectedStyle.style}</h2>
                  {selectedStyle.description && (
                    <p className="tf-modal-desc">{selectedStyle.description}</p>
                  )}

                  <div className="tf-modal-stats">
                    <div className="tf-modal-stat">
                      <span className="tf-modal-stat-val">⭐ {Number(selectedStyle.rating).toFixed(1)}</span>
                      <span className="tf-modal-stat-lbl">Rating</span>
                    </div>
                    <div className="tf-modal-stat">
                      <span className="tf-modal-stat-val">♥ {selectedStyle.likes.toLocaleString()}</span>
                      <span className="tf-modal-stat-lbl">Likes</span>
                    </div>
                    <div className="tf-modal-stat">
                      <span className="tf-modal-stat-val">{selectedStyle.duration || '45 min'}</span>
                      <span className="tf-modal-stat-lbl">Duration</span>
                    </div>
                  </div>

                  <div className="tf-modal-price-row">
                    <div>
                      <span className="tf-modal-price-label">Service Price</span>
                      <span className="tf-modal-price">${selectedStyle.price || 49}</span>
                    </div>
                    <div className="tf-modal-stylist">
                      <div className="tf-modal-stylist-avatar">{(selectedStyle.user || 'S').charAt(0).toUpperCase()}</div>
                      <div>
                        <span className="tf-modal-stylist-name">{selectedStyle.user}</span>
                        <span className="tf-modal-stylist-label">Stylist</span>
                      </div>
                    </div>
                  </div>

                  <div className="tf-modal-actions">
                    <button className="tf-modal-book-btn" onClick={() => handleBookNow(selectedStyle)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Book Appointment
                    </button>
                    <a href="/try-now" className="tf-modal-try-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                      </svg>
                      Try with AI
                    </a>
                  </div>

                  <div className="tf-modal-perks">
                    <span>✔ Free cancellation</span>
                    <span>✔ Instant confirmation</span>
                    <span>✔ Secure payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKING CONFIRM MODAL ── */}
        {bookingModal && selectedStyle && (
          <div className="tf-modal-overlay" onClick={() => setBookingModal(false)}>
            <div className="tf-book-modal" onClick={e => e.stopPropagation()}>
              <button className="tf-modal-close" onClick={() => setBookingModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="tf-book-header">
                <div className="tf-book-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h2 className="tf-book-title">Book Your Appointment</h2>
                  <p className="tf-book-sub">Secure your slot for this style</p>
                </div>
              </div>

              <div className="tf-book-style-preview">
                <div className="tf-book-style-img">
                  {(selectedStyle.after || selectedStyle.image) ? (
                    <img
                      src={getImageUrl(selectedStyle.after || selectedStyle.image)}
                      alt={selectedStyle.style}
                      onError={e => { e.target.src = '/api/placeholder/80/80'; }}
                    />
                  ) : (
                    <div className="tf-book-style-img-fallback">{(selectedStyle.style || 'S').charAt(0)}</div>
                  )}
                </div>
                <div className="tf-book-style-info">
                  <strong>{selectedStyle.style}</strong>
                  <span>{selectedStyle.type || 'Hair Style'} • {selectedStyle.duration || '45 min'}</span>
                  <span className="tf-book-style-by">by {selectedStyle.user}</span>
                </div>
                <div className="tf-book-price-tag">
                  <span className="tf-book-price">${selectedStyle.price || 49}</span>
                  <span className="tf-book-price-lbl">per session</span>
                </div>
              </div>

              <div className="tf-book-breakdown">
                <div className="tf-book-row">
                  <span>Service Fee</span>
                  <span>${selectedStyle.price || 49}</span>
                </div>
                <div className="tf-book-row">
                  <span>Booking Fee</span>
                  <span className="tf-book-free">Free</span>
                </div>
                <div className="tf-book-row tf-book-total">
                  <span>Total</span>
                  <span>${selectedStyle.price || 49}</span>
                </div>
              </div>

              <div className="tf-book-perks">
                <div className="tf-book-perk">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Free cancellation up to 24h before
                </div>
                <div className="tf-book-perk">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Instant booking confirmation
                </div>
                <div className="tf-book-perk">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Secured by Stripe payments
                </div>
              </div>

              <div className="tf-book-actions">
                <button className="tf-book-confirm-btn" onClick={handleProceedToCheckout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Proceed to Payment
                </button>
                <button className="tf-book-cancel-btn" onClick={() => setBookingModal(false)}>
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .tf-page {
          min-height: 100vh;
          background: #f8f9fb;
          font-family: 'Inter', sans-serif;
        }

        /* ── HERO ── */
        .tf-hero {
          position: relative;
          padding: 100px 32px 80px;
          overflow: hidden;
          text-align: center;
        }
        .tf-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #111111 100%);
          z-index: 0;
        }
        .tf-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 80% 30%, rgba(255,255,255,0.03) 0%, transparent 70%);
        }
        .tf-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }
        .tf-badge {
          display: inline-block;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(8px);
          color: rgba(255,255,255,0.9);
          padding: 6px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.5px;
          margin-bottom: 28px;
        }
        .tf-hero-title {
          font-size: 56px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }
        .tf-hero-accent {
          color: #d1d5db;
          position: relative;
        }
        .tf-hero-sub {
          font-size: 17px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto 48px;
        }
        .tf-stats {
          display: flex;
          justify-content: center;
          gap: 0;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
        }
        .tf-stat {
          flex: 1;
          padding: 20px 24px;
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .tf-stat:last-child { border-right: none; }
        .tf-stat-icon { font-size: 14px; color: rgba(255,255,255,0.4); }
        .tf-stat-val {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .tf-stat-lbl {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
        }

        /* ── FILTER BAR ── */
        .tf-filter-bar {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 12px rgba(0,0,0,0.04);
        }
        .tf-filter-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          height: 68px;
        }
        .tf-filter-tabs {
          display: flex;
          gap: 4px;
        }
        .tf-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border: 1.5px solid transparent;
          border-radius: 10px;
          background: transparent;
          font-size: 13.5px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
        }
        .tf-filter-btn:hover {
          background: #f3f4f6;
          color: #111827;
          border-color: #e5e7eb;
        }
        .tf-filter-active {
          background: #111827 !important;
          color: #ffffff !important;
          border-color: #111827 !important;
        }
        .tf-filter-icon { font-size: 12px; }
        .tf-filter-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tf-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8f9fb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 9px 14px;
          color: #9ca3af;
          transition: all 0.2s;
        }
        .tf-search:focus-within {
          border-color: #374151;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(55,65,81,0.08);
          color: #374151;
        }
        .tf-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #111827;
          width: 180px;
          font-family: 'Inter', sans-serif;
        }
        .tf-search input::placeholder { color: #9ca3af; }
        .tf-sort {
          padding: 9px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13.5px;
          color: #374151;
          background: #f8f9fb;
          cursor: pointer;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          transition: border-color 0.2s;
        }
        .tf-sort:focus { border-color: #374151; }

        /* ── GALLERY ── */
        .tf-gallery {
          padding: 48px 32px 80px;
        }
        .tf-gallery-inner {
          max-width: 1320px;
          margin: 0 auto;
        }
        .tf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        /* ── CARD ── */
        .tf-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .tf-card:hover, .tf-card-hovered {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.12);
          border-color: #d1d5db;
        }
        .tf-card-img-wrap {
          position: relative;
          height: 220px;
          background: #f3f4f6;
          display: flex;
          overflow: hidden;
        }
        .tf-card-img-half {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .tf-card-img-half img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }
        .tf-card-arrow {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          background: rgba(17,24,39,0.75);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          backdrop-filter: blur(4px);
        }
        .tf-card-img-single {
          width: 100%;
          height: 220px;
          position: relative;
          overflow: hidden;
        }
        .tf-card-img-single img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .tf-card:hover .tf-card-img-single img {
          transform: scale(1.06);
        }
        .tf-img-tag {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0,0,0,0.55);
          color: #fff;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          backdrop-filter: blur(4px);
        }
        .tf-img-after, .tf-img-style {
          left: auto;
          right: 10px;
          background: rgba(17,24,39,0.8);
        }
        .tf-img-before { left: 10px; }

        /* Hover overlay */
        .tf-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.25s ease;
          z-index: 3;
          backdrop-filter: blur(2px);
        }
        .tf-card:hover .tf-card-overlay { opacity: 1; }
        .tf-overlay-view-btn {
          padding: 9px 24px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.5);
          color: #fff;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
        }
        .tf-overlay-view-btn:hover { background: rgba(255,255,255,0.25); }
        .tf-overlay-book-btn {
          padding: 9px 24px;
          background: #ffffff;
          border: none;
          color: #111827;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .tf-overlay-book-btn:hover {
          background: #f3f4f6;
          transform: scale(1.02);
        }

        /* Card body */
        .tf-card-body {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .tf-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .tf-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          line-height: 1.3;
        }
        .tf-card-badge {
          flex-shrink: 0;
          padding: 3px 10px;
          border-radius: 8px;
          background: #f3f4f6;
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
          letter-spacing: 0.3px;
        }
        .tf-card-desc {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tf-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tf-card-meta-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tf-card-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #111827, #374151);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .tf-card-by {
          font-size: 12.5px;
          color: #374151;
          font-weight: 500;
        }
        .tf-card-meta-right {
          display: flex;
          gap: 10px;
        }
        .tf-card-rating, .tf-card-likes {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        .tf-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tf-tag {
          padding: 3px 10px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }
        .tf-card-book-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: 11px;
          background: #111827;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
          margin-top: auto;
        }
        .tf-card-book-btn:hover {
          background: #374151;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        }

        /* ── EMPTY ── */
        .tf-empty {
          text-align: center;
          padding: 100px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .tf-empty-icon {
          font-size: 48px;
          color: #d1d5db;
          display: block;
          margin-bottom: 8px;
        }
        .tf-empty h3 { font-size: 22px; font-weight: 700; color: #374151; }
        .tf-empty p { font-size: 15px; color: #6b7280; }
        .btn-reset {
          margin-top: 12px;
          padding: 10px 28px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.2s;
        }
        .btn-reset:hover { background: #374151; }

        /* ── TESTIMONIALS ── */
        .tf-testimonials {
          padding: 80px 32px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
        }
        .tf-test-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .tf-section-head {
          text-align: center;
          margin-bottom: 48px;
        }
        .tf-section-head h2 {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }
        .tf-section-head p { font-size: 16px; color: #6b7280; }
        .tf-test-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .tf-test-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 28px;
          transition: box-shadow 0.2s;
        }
        .tf-test-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.07);
        }
        .tf-test-stars { font-size: 16px; color: #fbbf24; margin-bottom: 14px; }
        .tf-test-text {
          font-size: 14.5px;
          color: #374151;
          line-height: 1.65;
          font-style: italic;
          margin-bottom: 20px;
        }
        .tf-test-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tf-test-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #111827, #374151);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .tf-test-author strong { display: block; font-size: 14px; color: #111827; }
        .tf-test-author span { font-size: 12px; color: #6b7280; }

        /* ── CTA ── */
        .cta-section {
          padding: 80px 32px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
        }
        .cta-container {
          max-width: 560px;
          margin: 0 auto;
          text-align: center;
        }
        .cta-title {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin-bottom: 14px;
        }
        .cta-description {
          font-size: 17px;
          color: rgba(255,255,255,0.65);
          margin-bottom: 32px;
        }
        .cta-buttons {
          display: flex;
          gap: 14px;
          justify-content: center;
        }
        .btn-primary {
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          padding: 13px 30px;
          background: white !important;
          color: #111827 !important;
          text-decoration: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          transition: all 0.25s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .btn-secondary {
          display: inline-flex !important;
          align-items: center;
          padding: 13px 30px;
          background: rgba(255,255,255,0.12) !important;
          color: white !important;
          text-decoration: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          border: 1.5px solid rgba(255,255,255,0.25) !important;
          transition: all 0.25s ease;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.2) !important; }

        /* ── MODAL OVERLAY ── */
        .tf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          animation: tfFadeIn 0.22s ease;
          backdrop-filter: blur(3px);
        }
        @keyframes tfFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tfSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── STYLE DETAIL MODAL ── */
        .tf-modal {
          background: #ffffff;
          border-radius: 24px;
          max-width: 920px;
          width: 100%;
          position: relative;
          animation: tfSlideUp 0.28s ease;
          overflow: hidden;
          max-height: 90vh;
          overflow-y: auto;
        }
        .tf-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid #e5e7eb;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #374151;
          z-index: 10;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .tf-modal-close:hover { background: #f3f4f6; transform: scale(1.1); }
        .tf-modal-body {
          display: flex;
          min-height: 420px;
        }
        .tf-modal-left {
          flex: 1;
          background: #f3f4f6;
          overflow: hidden;
          min-width: 0;
        }
        .tf-modal-split {
          display: flex;
          height: 100%;
          align-items: center;
          gap: 12px;
          padding: 24px;
        }
        .tf-modal-img-wrap {
          flex: 1;
          position: relative;
          border-radius: 14px;
          overflow: hidden;
        }
        .tf-modal-img-wrap img {
          width: 100%;
          height: 360px;
          object-fit: cover;
          display: block;
        }
        .tf-modal-arrow-big {
          font-size: 24px;
          color: #374151;
          flex-shrink: 0;
        }
        .tf-modal-single-img {
          position: relative;
          height: 100%;
          min-height: 400px;
        }
        .tf-modal-single-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tf-modal-tag {
          position: absolute;
          bottom: 14px;
          left: 14px;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .tf-modal-tag-after { left: auto; right: 14px; background: rgba(17,24,39,0.85); }
        .tf-modal-right {
          width: 360px;
          flex-shrink: 0;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tf-modal-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tf-modal-type-badge {
          padding: 4px 12px;
          background: #111827;
          color: white;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
          letter-spacing: 0.4px;
        }
        .tf-modal-tag-pill {
          padding: 4px 12px;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .tf-modal-title {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }
        .tf-modal-desc {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.65;
        }
        .tf-modal-stats {
          display: flex;
          gap: 0;
          background: #f8f9fb;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .tf-modal-stat {
          flex: 1;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          border-right: 1px solid #e5e7eb;
        }
        .tf-modal-stat:last-child { border-right: none; }
        .tf-modal-stat-val { font-size: 15px; font-weight: 700; color: #111827; }
        .tf-modal-stat-lbl { font-size: 11px; color: #9ca3af; font-weight: 500; }
        .tf-modal-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tf-modal-price-label { display: block; font-size: 11px; color: #9ca3af; font-weight: 500; margin-bottom: 2px; }
        .tf-modal-price { font-size: 28px; font-weight: 900; color: #111827; letter-spacing: -0.5px; }
        .tf-modal-stylist { display: flex; align-items: center; gap: 8px; }
        .tf-modal-stylist-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #111827, #374151);
          color: white; display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700;
        }
        .tf-modal-stylist-name { display: block; font-size: 13px; font-weight: 600; color: #111827; }
        .tf-modal-stylist-label { display: block; font-size: 11px; color: #9ca3af; }
        .tf-modal-actions { display: flex; flex-direction: column; gap: 10px; }
        .tf-modal-book-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 14px; background: #111827; color: white; border: none;
          border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.22s ease;
        }
        .tf-modal-book-btn:hover { background: #374151; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .tf-modal-try-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 13px; background: transparent; color: #374151;
          border: 1.5px solid #d1d5db; border-radius: 12px; font-size: 14px;
          font-weight: 600; cursor: pointer; text-decoration: none;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .tf-modal-try-btn:hover { border-color: #374151; background: #f9fafb; }
        .tf-modal-perks {
          display: flex; flex-direction: column; gap: 4px;
        }
        .tf-modal-perks span { font-size: 12px; color: #6b7280; }

        /* ── BOOKING MODAL ── */
        .tf-book-modal {
          background: #ffffff;
          border-radius: 24px;
          max-width: 480px;
          width: 100%;
          position: relative;
          animation: tfSlideUp 0.28s ease;
          padding: 36px;
        }
        .tf-book-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }
        .tf-book-icon {
          width: 52px; height: 52px;
          background: #f3f4f6;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #374151;
          flex-shrink: 0;
        }
        .tf-book-title { font-size: 20px; font-weight: 800; color: #111827; line-height: 1.2; }
        .tf-book-sub { font-size: 13px; color: #9ca3af; margin-top: 2px; }

        .tf-book-style-preview {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: #f8f9fb;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .tf-book-style-img {
          width: 64px; height: 64px; border-radius: 12px;
          overflow: hidden; flex-shrink: 0; background: #e5e7eb;
        }
        .tf-book-style-img img { width: 100%; height: 100%; object-fit: cover; }
        .tf-book-style-img-fallback {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #111827, #374151);
          color: white; display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800;
        }
        .tf-book-style-info {
          flex: 1; min-width: 0;
        }
        .tf-book-style-info strong { display: block; font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tf-book-style-info span { display: block; font-size: 12px; color: #6b7280; margin-top: 2px; }
        .tf-book-style-by { font-size: 11px !important; color: #9ca3af !important; }
        .tf-book-price-tag { flex-shrink: 0; text-align: right; }
        .tf-book-price { display: block; font-size: 22px; font-weight: 900; color: #111827; }
        .tf-book-price-lbl { font-size: 11px; color: #9ca3af; }

        .tf-book-breakdown {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .tf-book-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
          color: #374151;
        }
        .tf-book-row:last-child { border-bottom: none; }
        .tf-book-total { font-weight: 800; color: #111827 !important; font-size: 15px !important; }
        .tf-book-free { color: #10b981; font-weight: 600; }

        .tf-book-perks {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .tf-book-perk {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .tf-book-actions { display: flex; flex-direction: column; gap: 10px; }
        .tf-book-confirm-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 14px;
          background: #111827; color: white; border: none;
          border-radius: 12px; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.22s ease;
        }
        .tf-book-confirm-btn:hover { background: #374151; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .tf-book-cancel-btn {
          width: 100%; padding: 12px;
          background: transparent; color: #6b7280;
          border: 1.5px solid #e5e7eb; border-radius: 12px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .tf-book-cancel-btn:hover { border-color: #d1d5db; color: #374151; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .tf-grid { grid-template-columns: repeat(2, 1fr); }
          .tf-test-grid { grid-template-columns: repeat(2, 1fr); }
          .tf-modal-body { flex-direction: column; }
          .tf-modal-right { width: 100%; padding: 24px; }
          .tf-modal-img-wrap img { height: 260px; }
          .tf-modal-single-img { min-height: 280px; }
        }
        @media (max-width: 768px) {
          .tf-hero-title { font-size: 38px; }
          .tf-filter-inner { flex-direction: column; align-items: stretch; height: auto; padding: 12px 20px; gap: 10px; }
          .tf-filter-tabs { flex-wrap: wrap; gap: 6px; }
          .tf-filter-right { flex-direction: column; }
          .tf-search input { width: 100%; }
          .tf-gallery { padding: 32px 20px 60px; }
          .tf-grid { grid-template-columns: 1fr; }
          .tf-test-grid { grid-template-columns: 1fr; }
          .tf-stats { flex-wrap: wrap; }
          .tf-stat { min-width: 45%; }
          .tf-modal-split { flex-direction: column; }
          .tf-book-modal { padding: 24px 20px; }
        }
        @media (max-width: 480px) {
          .tf-hero { padding: 72px 20px 56px; }
          .tf-hero-title { font-size: 30px; }
          .cta-buttons { flex-direction: column; align-items: center; }
          .tf-book-style-preview { flex-wrap: wrap; }
        }
      `}</style>
    </>
  );
};

export default Transformations;
