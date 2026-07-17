import React, { useState } from 'react';
import { fetchJson } from '../api';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await fetchJson('/api/contact', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setIsSubmitted(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general',
        });
      } catch (err) {
        alert(err.message || 'Failed to submit form.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const contactInfo = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: 'Email Us',
      details: 'support@styleai.com',
      description: 'We reply within 24 hours',
      action: 'mailto:support@styleai.com',
      actionText: 'Send Email',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri 9am-6pm EST',
      action: 'tel:+15551234567',
      actionText: 'Call Now',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: 'Visit Us',
      details: '123 Innovation Drive',
      description: 'San Francisco, CA 94105',
      action: 'https://maps.google.com',
      actionText: 'Get Directions',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      title: 'Live Chat',
      details: 'Available 24/7',
      description: 'For Pro & Enterprise users',
      action: '#',
      actionText: 'Start Chat',
    },
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  return (
    <>
      <div className="contact-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <span className="hero-badge">📞 Get in Touch</span>
            <h1 className="hero-title">
              We'd Love to
              <span className="gradient-text"> Hear From You</span>
            </h1>
            <p className="hero-description">
              Have a question about our AI hairstyle recommendations? 
              Need help with your account? Our team is here to help.
            </p>
          </div>
        </section>

        {/* Contact Cards Section */}
        <section className="contact-cards-section">
          <div className="contact-cards-container">
            <div className="contact-cards-grid">
              {contactInfo.map((info, index) => (
                <a 
                  key={index} 
                  href={info.action}
                  className="contact-card"
                  target={info.action.startsWith('http') ? '_blank' : ''}
                  rel="noopener noreferrer"
                >
                  <div className="contact-card-icon">
                    {info.icon}
                  </div>
                  <h3 className="contact-card-title">{info.title}</h3>
                  <p className="contact-card-details">{info.details}</p>
                  <p className="contact-card-description">{info.description}</p>
                  <span className="contact-card-action">
                    {info.actionText}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="main-contact-section">
          <div className="main-contact-container">
            <div className="contact-grid">
              {/* Contact Form */}
              <div className="form-wrapper">
                {isSubmitted ? (
                  <div className="success-message">
                    <div className="success-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <h2>Message Sent Successfully!</h2>
                    <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button 
                      className="btn-send-another"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="form-header">
                      <h2 className="form-title">Send Us a Message</h2>
                      <p className="form-subtitle">
                        Fill out the form below and we'll get back to you as soon as possible
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="contact-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="firstName" className="form-label">
                            First Name *
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                            placeholder="John"
                          />
                          {errors.firstName && (
                            <span className="error-message">{errors.firstName}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="lastName" className="form-label">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                            placeholder="Doe"
                          />
                          {errors.lastName && (
                            <span className="error-message">{errors.lastName}</span>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="john@example.com"
                          />
                          {errors.email && (
                            <span className="error-message">{errors.email}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="inquiryType" className="form-label">
                          Inquiry Type
                        </label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleChange}
                          className="form-input form-select"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="billing">Billing Question</option>
                          <option value="partnership">Partnership</option>
                          <option value="press">Press & Media</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="subject" className="form-label">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`form-input ${errors.subject ? 'error' : ''}`}
                          placeholder="How can we help you?"
                        />
                        {errors.subject && (
                          <span className="error-message">{errors.subject}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="message" className="form-label">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className={`form-textarea ${errors.message ? 'error' : ''}`}
                          rows="6"
                          placeholder="Tell us more about your inquiry..."
                        />
                        {errors.message && (
                          <span className="error-message">{errors.message}</span>
                        )}
                      </div>

                      <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="spinner"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="sidebar">
                {/* Office Hours */}
                <div className="sidebar-card">
                  <h3 className="sidebar-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Office Hours
                  </h3>
                  <div className="hours-list">
                    {officeHours.map((schedule, index) => (
                      <div key={index} className="hours-item">
                        <span className="day">{schedule.day}</span>
                        <span className="hours">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="sidebar-card">
                  <h3 className="sidebar-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Quick Help
                  </h3>
                  <div className="quick-links">
                    <a href="/faq" className="quick-link">
                      FAQ & Guides
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                    <a href="/pricing" className="quick-link">
                      Pricing Plans
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                    <a href="/try-now" className="quick-link">
                      Try AI Stylist
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                    <a href="/gallery" className="quick-link">
                      Transformations
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Social Media */}
                <div className="sidebar-card">
                  <h3 className="sidebar-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    Follow Us
                  </h3>
                  <div className="social-links">
                    <a href="#" className="social-link" aria-label="Facebook">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </a>
                    <a href="#" className="social-link" aria-label="Twitter">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                      </svg>
                    </a>
                    <a href="#" className="social-link" aria-label="Instagram">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="17.5" cy="6.5" r="1.5" />
                      </svg>
                    </a>
                    <a href="#" className="social-link" aria-label="LinkedIn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                    <a href="#" className="social-link" aria-label="YouTube">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 11.75a29.94 29.94 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29.94 29.94 0 0 0 .46-5.25 29.94 29.94 0 0 0-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h3>Our Headquarters</h3>
                <p>123 Innovation Drive, San Francisco, CA 94105</p>
                <button className="btn-directions">
                  Get Directions
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          background: #fafbfc;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 0;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%);
        }

        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 8px 24px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin-bottom: 20px;
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
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Contact Cards Section */
        .contact-cards-section {
          padding: 60px 0 40px;
          margin-top: -40px;
          position: relative;
          z-index: 2;
        }

        .contact-cards-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .contact-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .contact-card {
          background: white;
          padding: 32px 24px;
          border-radius: 16px;
          text-align: center;
          text-decoration: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          border: 1px solid #f3f4f6;
        }

        .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
          border-color: #e5e7eb;
        }

        .contact-card-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .contact-card-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .contact-card-details {
          font-size: 15px;
          color: #374151;
          font-weight: 500;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .contact-card-description {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .contact-card-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6366f1;
          font-size: 14px;
          font-weight: 600;
          margin-top: auto;
          padding: 8px 0;
        }

        .contact-card-action:hover {
          color: #4f46e5;
        }

        /* Main Contact Section */
        .main-contact-section {
          padding: 60px 0 80px;
          background: white;
        }

        .main-contact-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 48px;
          align-items: start;
        }

        /* Form Styles */
        .form-wrapper {
          background: #ffffff;
          padding: 48px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          min-width: 0;
        }

        .form-header {
          margin-bottom: 36px;
        }

        .form-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .form-subtitle {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.5;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 2px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
          color: #374151;
          transition: all 0.2s ease;
          background: white;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }

        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
          color: #374151;
          transition: all 0.2s ease;
          background: white;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
          box-sizing: border-box;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-input.error,
        .form-textarea.error {
          border-color: #ef4444;
        }

        .form-input.error:focus,
        .form-textarea.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .error-message {
          font-size: 13px;
          color: #ef4444;
          font-weight: 500;
          margin-top: 2px;
        }

        .btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 16px 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
          font-family: inherit;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Success Message */
        .success-message {
          text-align: center;
          padding: 60px 20px;
        }

        .success-icon {
          margin-bottom: 24px;
        }

        .success-message h2 {
          font-size: 24px;
          color: #111827;
          margin-bottom: 12px;
        }

        .success-message p {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 32px;
        }

        .btn-send-another {
          padding: 12px 24px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-send-another:hover {
          background: #4f46e5;
        }

        /* Sidebar Styles */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 100px;
        }

        .sidebar-card {
          background: #f9fafb;
          padding: 28px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 20px;
        }

        .sidebar-title svg {
          color: #6366f1;
          flex-shrink: 0;
        }

        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hours-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .hours-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .day {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .hours {
          font-size: 14px;
          color: #6366f1;
          font-weight: 600;
        }

        .quick-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quick-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: white;
          border-radius: 10px;
          text-decoration: none;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .quick-link:hover {
          background: #eef2ff;
          color: #6366f1;
          border-color: #6366f1;
        }

        .social-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .social-link {
          width: 42px;
          height: 42px;
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s ease;
          text-decoration: none;
          border: 1px solid #e5e7eb;
        }

        .social-link:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-2px);
          border-color: #6366f1;
        }

        /* Map Section */
        .map-section {
          padding: 0 0 80px;
          background: white;
        }

        .map-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .map-placeholder {
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-radius: 20px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
        }

        .map-content {
          text-align: center;
        }

        .map-content svg {
          margin-bottom: 16px;
        }

        .map-content h3 {
          font-size: 20px;
          color: #111827;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .map-content p {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 24px;
        }

        .btn-directions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-directions:hover {
          background: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .contact-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .sidebar {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            position: static;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .hero-description {
            font-size: 16px;
          }

          .form-wrapper {
            padding: 32px 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .form-title {
            font-size: 24px;
          }

          .sidebar {
            grid-template-columns: 1fr;
          }

          .contact-cards-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .contact-card {
            padding: 24px 20px;
          }

          .map-placeholder {
            height: 300px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }

          .hero-section {
            padding: 60px 0;
          }

          .contact-cards-grid {
            grid-template-columns: 1fr;
          }

          .form-wrapper {
            padding: 24px 16px;
          }

          .contact-cards-section {
            padding: 40px 0 20px;
            margin-top: -30px;
          }

          .main-contact-section {
            padding: 40px 0 60px;
          }

          .btn-submit {
            padding: 14px 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Contact;