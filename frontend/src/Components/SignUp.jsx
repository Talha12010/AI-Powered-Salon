import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (formData.password.match(/[A-Z]/)) strength++;
    if (formData.password.match(/[0-9]/)) strength++;
    if (formData.password.match(/[^A-Za-z0-9]/)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match!');
      setMessageType('error');
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters!');
      setMessageType('error');
      return;
    }

    if (!agreeToTerms) {
      setMessage('Please agree to the Terms & Conditions!');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setMessage(res.data.message || 'Account created successfully! 🎉');
      setMessageType('success');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 1: return '#ef4444';
      case 2: return '#f59e0b';
      case 3: return '#10b981';
      case 4: return '#6366f1';
      default: return '#e5e7eb';
    }
  };

  const getPasswordStrengthLabel = () => {
    switch(passwordStrength) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  return (
    <>
      <div className="signup-page">
        <div className="signup-container">
          <div className={`signup-wrapper ${isVisible ? 'visible' : ''}`}>
            {/* Left Side - Brand Section */}
            <div className="signup-brand">
              <div className="brand-background">
                <div className="brand-shape-1"></div>
                <div className="brand-shape-2"></div>
              </div>
              <div className="brand-content">
                <div className="brand-logo">
                  <div className="logo-circle">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h1 className="brand-name">StyleAI</h1>
                </div>
                <h2 className="brand-title">Start Your Style Journey</h2>
                <p className="brand-description">
                  Join our community and discover your perfect hairstyle with AI-powered recommendations.
                </p>
                
                <div className="brand-features">
                  <div className="brand-feature">
                    <span className="feature-icon">✨</span>
                    <span>Free AI-powered analysis</span>
                  </div>
                  <div className="brand-feature">
                    <span className="feature-icon">🎯</span>
                    <span>Personalized recommendations</span>
                  </div>
                  <div className="brand-feature">
                    <span className="feature-icon">🔒</span>
                    <span>Secure & private</span>
                  </div>
                </div>

                <div className="brand-stats">
                  <div className="brand-stat">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Users</span>
                  </div>
                  <div className="brand-stat">
                    <span className="stat-number">1000+</span>
                    <span className="stat-label">Styles</span>
                  </div>
                  <div className="brand-stat">
                    <span className="stat-number">4.9</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="signup-form-section">
              <div className="form-container">
                <div className="form-header">
                  <h2>Create Account</h2>
                  <p>Fill in the details to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                  {/* Username & Email Row */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Username"
                          value={formData.username}
                          required
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        <input 
                          type="email" 
                          placeholder="Email address"
                          value={formData.email}
                          required
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password Row */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="password-strength-mini">
                          <div className="strength-bars-mini">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className="strength-bar-mini"
                                style={{
                                  background: level <= passwordStrength ? getPasswordStrengthColor() : '#e5e7eb'
                                }}
                              />
                            ))}
                          </div>
                          <span className="strength-label-mini" style={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthLabel()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          required
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <span className="password-mismatch">Passwords do not match</span>
                      )}
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="terms-checkbox">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="terms-text">
                        I agree to the{' '}
                        <a href="/terms" onClick={(e) => e.preventDefault()}>Terms</a>
                        {' '}&{' '}
                        <a href="/privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className={`submit-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Message Alert */}
                  {message && (
                    <div className={`message-alert ${messageType}`}>
                      <span className="message-icon">
                        {messageType === 'success' ? '✅' : '❌'}
                      </span>
                      <span>{message}</span>
                    </div>
                  )}
                </form>

                {/* Footer */}
                <div className="form-footer">
                  <p>Already have an account? <a href="/login">Sign In</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .signup-page::before {
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

        .signup-container {
          width: 100%;
          max-width: 1000px;
          position: relative;
          z-index: 1;
        }

        .signup-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .signup-wrapper.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Brand Section */
        .signup-brand {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
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
          top: -40px;
          right: -40px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .brand-shape-2 {
          position: absolute;
          bottom: -30px;
          left: -30px;
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .brand-content {
          position: relative;
          z-index: 1;
          color: white;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .logo-circle {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .brand-name {
          font-size: 28px;
          font-weight: 800;
          margin: 0;
        }

        .brand-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .brand-description {
          font-size: 14px;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 28px;
        }

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }

        .brand-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
        }

        .feature-icon {
          font-size: 18px;
        }

        .brand-stats {
          display: flex;
          gap: 24px;
        }

        .brand-stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 22px;
          font-weight: 800;
        }

        .stat-label {
          font-size: 11px;
          opacity: 0.8;
          font-weight: 500;
        }

        /* Form Section */
        .signup-form-section {
          padding: 40px;
          display: flex;
          align-items: center;
          min-height: 500px;
        }

        .form-container {
          width: 100%;
        }

        .form-header {
          margin-bottom: 24px;
        }

        .form-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 6px;
        }

        .form-header p {
          font-size: 14px;
          color: #6b7280;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 13px;
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
          left: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .input-wrapper input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          color: #374151;
          outline: none;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .input-wrapper input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .input-wrapper input::placeholder {
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
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

        .password-strength-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .strength-bars-mini {
          display: flex;
          gap: 3px;
          flex: 1;
        }

        .strength-bar-mini {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-label-mini {
          font-size: 11px;
          font-weight: 600;
        }

        .password-mismatch {
          color: #ef4444;
          font-size: 11px;
          margin-top: 4px;
          font-weight: 500;
        }

        .terms-checkbox {
          margin-top: 4px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #6b7280;
          position: relative;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: inline-block;
          position: relative;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .checkbox-label input:checked + .checkmark {
          background: #6366f1;
          border-color: #6366f1;
        }

        .checkbox-label input:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 10px;
          font-weight: bold;
        }

        .terms-text a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }

        .terms-text a:hover {
          text-decoration: underline;
        }

        .submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
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
          width: 18px;
          height: 18px;
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
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-5px); }
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
          font-size: 16px;
        }

        .form-footer {
          text-align: center;
          margin-top: 20px;
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

        /* Responsive Design */
        @media (max-width: 900px) {
          .signup-wrapper {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }

          .signup-brand {
            padding: 30px;
          }

          .brand-title {
            font-size: 22px;
          }

          .signup-form-section {
            padding: 30px;
          }
        }

        @media (max-width: 480px) {
          .signup-page {
            padding: 10px;
          }

          .signup-wrapper {
            border-radius: 16px;
          }

          .signup-brand {
            padding: 24px 20px;
          }

          .signup-form-section {
            padding: 24px 20px;
          }

          .brand-title {
            font-size: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .brand-stats {
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default SignUp;