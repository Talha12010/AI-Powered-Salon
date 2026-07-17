import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SignIn = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      setMessage(`Welcome back, ${res.data.user.username}! 🎉`);
      setMessageType('success');
      
      // ── Always save token to localStorage so Profile page can access it ──
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setTimeout(() => {
        window.location.href = res.data.user.role === 'admin' ? '/admin' : '/dashboard';
      }, 1500);
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid email or password. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="signin-page">
        <div className="signin-container">
          <div className={`signin-wrapper ${isVisible ? 'visible' : ''}`}>
            {/* Left Side - Brand Section */}
            <div className="signin-brand">
              <div className="brand-background">
                <div className="brand-shape-1"></div>
                <div className="brand-shape-2"></div>
                <div className="brand-shape-3"></div>
              </div>
              <div className="brand-content">
                <div className="brand-logo">
                  <div className="logo-circle">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h1 className="brand-name">StyleAI</h1>
                </div>
                <h2 className="brand-title">Transform Your Style Journey</h2>
                <p className="brand-description">
                  Discover your perfect hairstyle with AI-powered recommendations. 
                  Join thousands of satisfied users who found their signature look.
                </p>
                <div className="brand-features">
                  <div className="brand-feature">
                    <span className="feature-icon">🤖</span>
                    <span>AI-Powered Analysis</span>
                  </div>
                  <div className="brand-feature">
                    <span className="feature-icon">📸</span>
                    <span>Virtual Try-On</span>
                  </div>
                  <div className="brand-feature">
                    <span className="feature-icon">⚡</span>
                    <span>Instant Results</span>
                  </div>
                </div>
                <div className="brand-stats">
                  <div className="brand-stat">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Happy Users</span>
                  </div>
                  <div className="brand-stat">
                    <span className="stat-number">1000+</span>
                    <span className="stat-label">Hairstyles</span>
                  </div>
                  <div className="brand-stat">
                    <span className="stat-number">4.9</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="signin-form-section">
              <div className="form-container">
                <div className="form-header">
                  <h2>Welcome Back</h2>
                  <p>Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="signin-form">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <input 
                        type="email" 
                        placeholder="Enter your email"
                        value={formData.email}
                        required
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        required
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="remember-me">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span>Remember me</span>
                    </label>
                    <a href="/forgot-password" className="forgot-password">
                      Forgot Password?
                    </a>
                  </div>

                  <button 
                    type="submit" 
                    className={`submit-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>

                  {message && (
                    <div className={`message-alert ${messageType}`}>
                      <span className="message-icon">
                        {messageType === 'success' ? '✅' : '❌'}
                      </span>
                      <span>{message}</span>
                    </div>
                  )}
                </form>

                <div className="form-divider">
                  <span>Or continue with</span>
                </div>

                <div className="social-login">
                  <button className="social-btn google">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button className="social-btn apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Apple
                  </button>
                </div>

                <div className="form-footer">
                  <p>Don't have an account? <a href="/signup">Sign Up</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .signin-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .signin-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
          animation: rotate 30s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .signin-container {
          width: 100%;
          max-width: 1100px;
          position: relative;
          z-index: 1;
        }

        .signin-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .signin-wrapper.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .signin-brand {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 50px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .brand-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .brand-shape-1 {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .brand-shape-2 {
          position: absolute;
          bottom: -30px;
          left: -30px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }

        .brand-shape-3 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          animation: float 10s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .brand-content {
          position: relative;
          z-index: 1;
          color: white;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .logo-circle {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .brand-name {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
        }

        .brand-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .brand-description {
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 32px;
        }

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }

        .brand-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          font-weight: 500;
        }

        .feature-icon {
          font-size: 20px;
        }

        .brand-stats {
          display: flex;
          gap: 32px;
        }

        .brand-stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 800;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.8;
          font-weight: 500;
        }

        .signin-form-section {
          padding: 60px 50px;
          display: flex;
          align-items: center;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .form-header {
          margin-bottom: 32px;
        }

        .form-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .form-header p {
          font-size: 14px;
          color: #6b7280;
        }

        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .input-wrapper input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          color: #374151;
          outline: none;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .input-wrapper input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .input-wrapper input::placeholder {
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: #6366f1;
          background: #f3f4f6;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #6b7280;
          position: relative;
        }

        .remember-me input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: inline-block;
          position: relative;
          transition: all 0.2s ease;
        }

        .remember-me input:checked + .checkmark {
          background: #6366f1;
          border-color: #6366f1;
        }

        .remember-me input:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .forgot-password {
          font-size: 14px;
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .forgot-password:hover {
          color: #4f46e5;
          text-decoration: underline;
        }

        .submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .submit-btn.loading {
          background: #6366f1;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .message-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-alert.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .message-alert.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .message-icon {
          font-size: 18px;
        }

        .form-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .form-divider::before,
        .form-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .form-divider span {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
          white-space: nowrap;
        }

        .social-login {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          border-color: #6366f1;
          background: #f9fafb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .form-footer {
          text-align: center;
        }

        .form-footer p {
          font-size: 14px;
          color: #6b7280;
        }

        .form-footer a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .form-footer a:hover {
          color: #4f46e5;
          text-decoration: underline;
        }

        @media (max-width: 968px) {
          .signin-wrapper {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }

          .signin-brand {
            padding: 40px 30px;
          }

          .brand-title {
            font-size: 24px;
          }

          .signin-form-section {
            padding: 40px 30px;
          }
        }

        @media (max-width: 480px) {
          .signin-page {
            padding: 10px;
          }

          .signin-wrapper {
            border-radius: 16px;
          }

          .signin-brand {
            padding: 30px 20px;
          }

          .signin-form-section {
            padding: 30px 20px;
          }

          .brand-title {
            font-size: 20px;
          }

          .brand-description {
            font-size: 13px;
          }

          .brand-stats {
            gap: 20px;
          }

          .stat-number {
            font-size: 20px;
          }

          .social-login {
            grid-template-columns: 1fr;
          }

          .form-options {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
};

export default SignIn;
