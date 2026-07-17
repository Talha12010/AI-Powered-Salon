import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchJson('/api/services');
      // Only show Active services
      const activeServices = (data.services || []).filter(s => s.status === 'Active');
      setServices(activeServices);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadServices().catch(() => {});
  }, []);

  const handleBooking = (service) => {
    navigate('/checkout', { state: { service } });
  };

  const categories = ['all', 'Haircut', 'Grooming', 'Styling', 'Color', 'Treatment'];
  const filteredServices = filter === 'all' ? services : services.filter(s => s.category === filter);

  return (
    <>
      <div className="pricing-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <span className="hero-badge">💇‍♂️ Our Catalog</span>
            <h1 className="hero-title">
              Our Haircuts &
              <span className="gradient-text"> Services</span>
            </h1>
            <p className="hero-description">
              Explore our range of premium haircuts, styling, and treatments customized for your signature look.
            </p>

            {/* Category Filters */}
            <div className="category-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat === 'all' ? 'All Services' : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-section">
          <div className="services-container">
            {loading ? (
              <div className="services-loading">
                <div className="loading-spinner" />
                <p>Loading haircuts and packages…</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="services-empty">
                <h3>No services found</h3>
                <p>Check back later or try selecting another category.</p>
              </div>
            ) : (
              <div className="services-grid">
                {filteredServices.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="card-header">
                      <span className="service-category">{service.category}</span>
                      <div className="service-price">${service.price}</div>
                    </div>

                    <div className="card-body">
                      <h3 className="service-name">{service.name}</h3>
                      <p className="service-desc">{service.description || 'Professional styling tailored to your preferences.'}</p>
                    </div>

                    <div className="card-footer">
                      <div className="service-duration">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{service.duration || '30 min'}</span>
                      </div>
                      <button 
                        className="btn-book"
                        onClick={() => handleBooking(service)}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .pricing-page {
          min-height: 100vh;
          background: #f9fafb;
          font-family: 'Inter', sans-serif;
          color: #111827;
        }

        /* Hero */
        .hero-section {
          padding: 80px 20px 40px;
          text-align: center;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .hero-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-block;
          padding: 6px 12px;
          background: #f3f4f6;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 16px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #111827, #6b7280);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        /* Filters */
        .category-filters {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 18px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          background: white;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .filter-btn.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        /* Services Grid */
        .services-section {
          padding: 60px 20px;
        }

        .services-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 28px;
        }

        .service-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          padding: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: all 0.25s ease;
        }

        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
          border-color: #d1d5db;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .service-category {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          background: #f3f4f6;
          color: #374151;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .service-price {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
        }

        .card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .service-name {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .service-desc {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #f3f4f6;
          padding-top: 16px;
        }

        .service-duration {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .btn-book {
          padding: 8px 16px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-book:hover {
          background: #374151;
        }

        /* States */
        .services-loading {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #111827;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .services-empty {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 32px; }
          .services-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default Pricing;
