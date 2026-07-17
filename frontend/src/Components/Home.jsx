import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api';

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const [content, setContent] = useState({ testimonials: [], features: [], stats: [], popularStyles: [] });

  useEffect(() => {
    fetchJson('/api/content/home').then(setContent).catch(() => {});
  }, []);

  useEffect(() => {
    if (!content.testimonials.length) return;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % content.testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [content.testimonials.length]);

  return (
    <>
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-shape-1"></div>
            <div className="hero-shape-2"></div>
          </div>
          <div className="hero-container">
            <div className="hero-content">
              <span className="hero-badge">
                <span className="badge-dot"></span>
                #1 AI Hairstyle Assistant
              </span>
              <h1 className="hero-title">
                Discover Your
                <span className="gradient-text"> Perfect Hairstyle</span>
                <br />with AI Technology
              </h1>
              <p className="hero-description">
                Upload your photo and let our advanced AI analyze your features to recommend 
                the most flattering hairstyles. Join 50,000+ satisfied users who found their 
                signature look.
              </p>
              <div className="hero-buttons">
                <a href="/try-now" className="btn-primary">
                  Try It Free
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a href="/gallery" className="btn-secondary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  See Transformations
                </a>
              </div>
              <div className="hero-stats">
                {content.stats.map((stat, index) => (
                  <div key={index} className="hero-stat-item">
                    <span className="hero-stat-number">{stat.number}</span>
                    <span className="hero-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-container">
                <div className="floating-card card-1">
                  <span className="floating-emoji">💇‍♂️</span>
                  <span>Modern Cut</span>
                </div>
                <div className="floating-card card-2">
                  <span className="floating-emoji">✨</span>
                  <span>AI Magic</span>
                </div>
                <div className="floating-card card-3">
                  <span className="floating-emoji">🎯</span>
                  <span>Perfect Match</span>
                </div>
                <div className="hero-main-image">
                  <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="180" fill="url(#heroGradient)" opacity="0.1" />
                    <circle cx="200" cy="200" r="140" fill="url(#heroGradient)" opacity="0.2" />
                    <circle cx="200" cy="200" r="100" fill="url(#heroGradient)" opacity="0.3" />
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="400" y2="400">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="hero-avatar">
                    <span className="hero-avatar-emoji">🧑</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <div className="section-header">
              <h2 className="section-title">Why Choose StyleAI?</h2>
              <p className="section-subtitle">
                Our advanced AI technology takes the guesswork out of finding your perfect hairstyle
              </p>
            </div>
            <div className="features-grid">
              {content.features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <div className="how-it-works-container">
            <div className="section-header">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">
                Get your personalized hairstyle recommendations in 3 simple steps
              </p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-content">
                  <div className="step-icon">📸</div>
                  <h3>Upload Your Photo</h3>
                  <p>Take or upload a clear front-facing photo with good lighting</p>
                </div>
              </div>
              <div className="step-connector">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-icon">🤖</div>
                  <h3>AI Analysis</h3>
                  <p>Our AI analyzes your face shape, features, and hair texture</p>
                </div>
              </div>
              <div className="step-connector">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-icon">✨</div>
                  <h3>Get Recommendations</h3>
                  <p>Receive personalized hairstyle suggestions tailored just for you</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Styles Section */}
        <section className="popular-styles-section">
          <div className="popular-styles-container">
            <div className="section-header">
              <h2 className="section-title">Popular Hairstyles</h2>
              <p className="section-subtitle">
                Discover trending styles that our users love
              </p>
            </div>
            <div className="styles-grid">
              {content.popularStyles.map((style, index) => (
                <div key={index} className="style-card">
                  <div className="style-image-wrapper">
                    <img src={style.image} alt={style.name} className="style-image" />
                    <span className="style-category">{style.category}</span>
                  </div>
                  <div className="style-info">
                    <h3 className="style-name">{style.name}</h3>
                    <a href="/try-now" className="style-link">
                      Try This Style
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-wrapper">
              <a href="/gallery" className="btn-view-all">
                View All Transformations
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="testimonials-container">
            <div className="section-header">
              <h2 className="section-title">What Our Users Say</h2>
              <p className="section-subtitle">
                Join thousands of satisfied customers who found their perfect look
              </p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-stars">
                  {[...Array(content.testimonials[currentTestimonial]?.rating || 0)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <p className="testimonial-text">
                  "{content.testimonials[currentTestimonial]?.text}"
                </p>
                <div className="testimonial-author">
                  <img 
                    src={content.testimonials[currentTestimonial]?.image} 
                    alt={content.testimonials[currentTestimonial]?.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author-info">
                    <h4>{content.testimonials[currentTestimonial]?.name}</h4>
                    <span>{content.testimonials[currentTestimonial]?.role}</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-navigation">
                {content.testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`nav-dot ${index === currentTestimonial ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Transform Your Look?</h2>
              <p className="cta-description">
                Join over 50,000 users who have discovered their perfect hairstyle with StyleAI. 
                Start your free trial today - no credit card required.
              </p>
              <div className="cta-buttons">
                <a href="/try-now" className="btn-cta-primary">
                  Get Started Free
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a href="/pricing" className="btn-cta-secondary">
                  View Pricing
                </a>
              </div>
              <div className="cta-trust">
                <span>🔒 No credit card required</span>
                <span>⭐ 4.9/5 average rating</span>
                <span>⚡ Set up in 30 seconds</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: #ffffff;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 0;
          position: relative;
          overflow: hidden;
          min-height: 600px;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .hero-shape-1 {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .hero-shape-2 {
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          animation: fadeInUp 1s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(to right, #fff, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 500px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: white;
          color: #6366f1;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .hero-stats {
          display: flex;
          gap: 40px;
        }

        .hero-stat-item {
          text-align: center;
        }

        .hero-stat-number {
          display: block;
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin-bottom: 4px;
        }

        .hero-stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        /* Hero Image */
        .hero-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-image-container {
          position: relative;
          width: 400px;
          height: 400px;
        }

        .hero-main-image {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-avatar {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .hero-avatar-emoji {
          font-size: 120px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .floating-card {
          position: absolute;
          background: white;
          padding: 12px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          animation: floatCard 3s ease-in-out infinite;
        }

        .card-1 {
          top: 20px;
          right: -40px;
          animation-delay: 0s;
        }

        .card-2 {
          bottom: 20px;
          right: 0;
          animation-delay: 1s;
        }

        .card-3 {
          bottom: 60px;
          left: -20px;
          animation-delay: 2s;
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .floating-emoji {
          font-size: 24px;
        }

        /* Features Section */
        .features-section {
          padding: 100px 0;
          background: white;
        }

        .features-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-title {
          font-size: 36px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 18px;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .feature-card {
          text-align: center;
          padding: 40px 32px;
          background: #f9fafb;
          border-radius: 20px;
          transition: all 0.3s ease;
          border: 1px solid #f3f4f6;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          background: white;
          border-color: #e5e7eb;
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .feature-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.6;
        }

        /* How It Works Section */
        .how-it-works-section {
          padding: 100px 0;
          background: #f9fafb;
        }

        .how-it-works-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .steps-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }

        .step-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          flex: 1;
          max-width: 350px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin: 0 auto 20px;
        }

        .step-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .step-content h3 {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .step-content p {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.5;
        }

        .step-connector {
          color: #6366f1;
        }

        /* Popular Styles Section */
        .popular-styles-section {
          padding: 100px 0;
          background: white;
        }

        .popular-styles-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .styles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .style-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .style-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .style-image-wrapper {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .style-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .style-category {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(99, 102, 241, 0.9);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .style-info {
          padding: 20px;
        }

        .style-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }

        .style-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6366f1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .style-link:hover {
          color: #4f46e5;
        }

        .view-all-wrapper {
          text-align: center;
        }

        .btn-view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: white;
          color: #6366f1;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          border: 2px solid #6366f1;
          transition: all 0.3s ease;
        }

        .btn-view-all:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-2px);
        }

        /* Testimonials Section */
        .testimonials-section {
          padding: 100px 0;
          background: #f9fafb;
        }

        .testimonials-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .testimonial-card {
          background: white;
          padding: 48px;
          border-radius: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .testimonial-stars {
          margin-bottom: 24px;
          font-size: 24px;
        }

        .testimonial-text {
          font-size: 20px;
          color: #374151;
          line-height: 1.6;
          font-style: italic;
          margin-bottom: 32px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .testimonial-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .testimonial-author-info h4 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .testimonial-author-info span {
          font-size: 14px;
          color: #6b7280;
        }

        .testimonial-navigation {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }

        .nav-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #6366f1;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .nav-dot.active {
          background: #6366f1;
          width: 24px;
          border-radius: 12px;
        }

        /* CTA Section */
        .cta-section {
          padding: 100px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .cta-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 32px;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
        }

        .cta-content p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 32px;
        }

        .btn-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          background: white;
          color: #6366f1;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .btn-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 16px 32px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .btn-cta-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .cta-trust {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .cta-trust span {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-description {
            margin: 0 auto 32px;
          }

          .hero-buttons {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-image {
            display: none;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .steps-grid {
            flex-direction: column;
          }

          .step-connector {
            transform: rotate(90deg);
          }

          .styles-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .styles-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .hero-stats {
            flex-wrap: wrap;
            gap: 24px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }

          .hero-description {
            font-size: 16px;
          }

          .testimonial-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Home;
