import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiUrl } from '../api';

const STRIPE_PK = 'pk_test_51TnDSNCE20vKv4iil5KyvAp4d1ACx6ATZBSEmaCzYGowSn3BGfJSiOLegmB7mJcs8ZuA8ka1FtvlmSEZNf3V7hJZ00StCJ2gvc';
const stripePromise = loadStripe(STRIPE_PK);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a2e',
      fontFamily: "'Inter', sans-serif",
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

function CheckoutForm({ service }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name || user.username) setName(user.name || user.username);
      if (user.email) setEmail(user.email);
    } catch { }
    // Default date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!name.trim() || !email.trim() || !date) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create PaymentIntent on backend
      const intentRes = await fetch(apiUrl('/api/create-payment-intent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: service.price }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.message || 'Failed to create payment');

      const { clientSecret } = intentData;

      // 2. Confirm card payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name, email },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // 3. Save booking to backend
      const token = localStorage.getItem('token') || '';
      const bookingRes = await fetch(apiUrl('/api/bookings/confirm'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          service: service.name,
          amount: service.price,
          date,
          time,
          stylist: 'StyleAI Stylist',
          paymentIntentId: paymentIntent.id,
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.message || 'Failed to save booking');

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:00 PM',
    '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  if (success) {
    return (
      <div className="success-screen">
        <div className="success-icon">✅</div>
        <h2>Booking Confirmed!</h2>
        <p>Your appointment has been booked successfully. Redirecting to your dashboard…</p>
        <div className="success-pulse" />
        <style jsx>{`
          .success-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 80px 40px;
            text-align: center;
            animation: fadeIn 0.5s ease;
          }
          .success-icon { font-size: 64px; }
          .success-screen h2 {
            font-size: 28px; font-weight: 800; color: #111827;
          }
          .success-screen p { font-size: 16px; color: #6b7280; }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      {/* Personal details */}
      <div className="form-section">
        <h3 className="form-section-title">Your Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <input
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="form-section">
        <h3 className="form-section-title">Appointment Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Preferred Date <span className="required">*</span></label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Preferred Time</label>
            <select value={time} onChange={e => setTime(e.target.value)}>
              {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="form-section">
        <h3 className="form-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Card Details
        </h3>
        <div className="card-element-wrapper">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="secure-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Your payment is secured by Stripe. We never store your card details.
        </p>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      <button type="submit" className="pay-btn" disabled={loading || !stripe}>
        {loading ? (
          <>
            <span className="btn-spinner" />
            Processing...
          </>
        ) : (
          <>
            Pay ${service.price} • Book Appointment
          </>
        )}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const service = location.state?.service;

  if (!service) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>No service selected</h2>
        <button onClick={() => navigate('/pricing')} style={{ marginTop: 16, padding: '10px 24px', background: '#111827', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          View Services
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="checkout-page">
        {/* Header */}
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate('/pricing')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Services
          </button>
          <div className="header-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>StyleAI</span>
          </div>
        </div>

        <div className="checkout-body">
          {/* Left: Summary */}
          <div className="checkout-summary">
            <div className="summary-card">
              <div className="summary-label">Service Selected</div>
              <h2 className="summary-service-name">{service.name}</h2>
              <div className="summary-category">{service.category}</div>

              {service.description && (
                <p className="summary-desc">{service.description}</p>
              )}

              <div className="summary-divider" />

              <div className="summary-row">
                <span>Service</span>
                <span>${service.price}</span>
              </div>
              <div className="summary-row">
                <span>Booking Fee</span>
                <span>Free</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>Total</span>
                <span>${service.price}</span>
              </div>

              <div className="summary-duration">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Duration: {service.duration || '30 min'}
              </div>

              <div className="trust-badges">
                <div className="trust-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Free cancellation
                </div>
                <div className="trust-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Instant confirmation
                </div>
                <div className="trust-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Secure payment
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="checkout-form-area">
            <div className="checkout-form-card">
              <h1 className="checkout-title">Complete Your Booking</h1>
              <p className="checkout-subtitle">Fill in your details and confirm payment to secure your appointment.</p>

              <Elements stripe={stripePromise}>
                <CheckoutForm service={service} />
              </Elements>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .checkout-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        .checkout-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1px solid #e5e7eb;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: #f3f4f6;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 800;
          color: #111827;
        }

        .checkout-body {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 0;
          min-height: calc(100vh - 65px);
        }

        /* Summary Panel */
        .checkout-summary {
          background: #111827;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
        }

        .summary-card {
          color: white;
        }

        .summary-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 12px;
        }

        .summary-service-name {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .summary-category {
          display: inline-block;
          background: rgba(255,255,255,0.1);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
          color: rgba(255,255,255,0.8);
        }

        .summary-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .summary-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.12);
          margin: 16px 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 10px;
        }

        .summary-row.total {
          font-size: 22px;
          font-weight: 800;
          color: white;
          margin-top: 4px;
        }

        .summary-duration {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin-top: 20px;
        }

        .trust-badges {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
        }

        /* Form Area */
        .checkout-form-area {
          padding: 48px 60px;
          overflow-y: auto;
        }

        .checkout-form-card {
          max-width: 560px;
          margin: 0 auto;
        }

        .checkout-title {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }

        .checkout-subtitle {
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        /* Form Styles */
        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-section-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .required { color: #ef4444; }

        .form-group input,
        .form-group select {
          padding: 12px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          color: #111827;
          font-family: 'Inter', sans-serif;
          background: white;
          transition: border-color 0.2s ease;
          outline: none;
          width: 100%;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .card-element-wrapper {
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          transition: border-color 0.2s ease;
        }

        .card-element-wrapper:focus-within {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .secure-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .checkout-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
        }

        .pay-btn {
          width: 100%;
          padding: 16px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.3px;
        }

        .pay-btn:hover:not(:disabled) {
          background: #374151;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .pay-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .checkout-body {
            grid-template-columns: 1fr;
          }
          .checkout-summary {
            padding: 32px 28px;
          }
          .checkout-form-area {
            padding: 32px 28px;
          }
          .checkout-form-card {
            max-width: 100%;
          }
        }

        @media (max-width: 640px) {
          .checkout-header {
            padding: 14px 20px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .checkout-form-area {
            padding: 24px 20px;
          }
        }
      `}</style>
    </>
  );
}
