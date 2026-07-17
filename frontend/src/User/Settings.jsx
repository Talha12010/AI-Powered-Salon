import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api';

const Settings = ({ userData, setUserData }) => {
  const [activeSection, setActiveSection] = useState('account');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyNewsletter: false,
    styleRecommendations: true,
    bookingReminders: true,
    promotionalOffers: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showTryOns: true,
    shareAnalytics: false,
    allowMessages: true,
  });

  // Email/password form state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    fetchJson('/api/settings', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    }).then(data => {
      if (data.settings?.notifications) setNotifications(data.settings.notifications);
      if (data.settings?.privacy) setPrivacy(data.settings.privacy);
    }).catch(() => {});
  }, []);

  const saveSettings = () => {
    fetchJson('/api/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify({ notifications, privacy })
    }).catch(() => {});
  };

  return (
    <>
      <div className="settings-page">
        <div className="settings-layout">
          <div className="settings-sidebar">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="settings-nav-icon">{section.icon}</span>
                <span className="settings-nav-label">{section.label}</span>
              </button>
            ))}
          </div>

          <div className="settings-content">
            {activeSection === 'account' && (
              <div className="settings-section">
                <h3 className="settings-section-title">Account Settings</h3>
                <div className="settings-card account-card">
                  <div className="account-grid">
                    <div className="account-column">
                      <h4 className="account-label">Email</h4>
                      <p className="account-value">{userData.email}</p>
                      {!showEmailForm && <button className="btn-primary" onClick={() => { setShowEmailForm(true); setMessage(''); setError(''); setNewEmail(userData.email); }}>Edit Email</button>}
                    </div>
                    <div className="account-column">
                      <h4 className="account-label">Password</h4>
                      <p className="account-value">••••••••••••</p>
                      {!showPasswordForm && <button className="btn-primary" onClick={() => { setShowPasswordForm(true); setMessage(''); setError(''); setNewPassword(''); setConfirmPassword(''); setCurrentPassword(''); }}>Change Password</button>}
                    </div>
                  </div>

                  <div className="account-forms">
                    {showEmailForm && (
                      <div className="form-card">
                        <h4 className="form-title">Update Email</h4>
                        <div className="form-row">
                          <label>New email</label>
                          <input className="input-field" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@example.com" />
                        </div>
                        <div className="form-row">
                          <label>Current password</label>
                          <input className="input-field" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                        </div>
                        <div className="form-actions">
                          <button className="btn-primary" onClick={async () => {
                            setLoading(true); setError(''); setMessage('');
                            try {
                              const data = await fetchJson('/api/auth/change-email', {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                                body: JSON.stringify({ currentPassword, newEmail })
                              });
                              setMessage(data.message || 'Email updated');
                              setUserData(prev => ({ ...prev, email: newEmail }));
                              setShowEmailForm(false);
                            } catch (err) {
                              setError(err.message);
                            } finally { setLoading(false); }
                          }}>{loading ? 'Saving...' : 'Save'}</button>
                          <button className="btn-outline" onClick={() => { setShowEmailForm(false); setCurrentPassword(''); setNewEmail(''); }}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {showPasswordForm && (
                      <div className="form-card">
                        <h4 className="form-title">Change Password</h4>
                        <div className="form-row">
                          <label>Current password</label>
                          <input className="input-field" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" />
                        </div>
                        <div className="form-row">
                          <label>New password</label>
                          <input className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
                        </div>
                        <div className="form-row">
                          <label>Confirm password</label>
                          <input className="input-field" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
                        </div>
                        <div className="form-actions">
                          <button className="btn-primary" onClick={async () => {
                            setLoading(true); setError(''); setMessage('');
                            if (newPassword !== confirmPassword) { setError('New passwords do not match'); setLoading(false); return; }
                            if (String(newPassword).length < 8) { setError('New password must be at least 8 characters'); setLoading(false); return; }
                            try {
                              const data = await fetchJson('/api/auth/change-password', {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                                body: JSON.stringify({ currentPassword, newPassword })
                              });
                              setMessage(data.message || 'Password updated');
                              setShowPasswordForm(false);
                            } catch (err) {
                              setError(err.message);
                            } finally { setLoading(false); }
                          }}>{loading ? 'Saving...' : 'Save'}</button>
                          <button className="btn-outline" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {(message || error) && (
                    <div className="message" style={{ color: error ? '#ef4444' : '#10b981' }}>{error || message}</div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h3 className="settings-section-title">Notification Preferences</h3>
                <div className="settings-card">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="setting-item">
                      <div className="setting-info">
                        <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                        <p>Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications</p>
                      </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => { handleNotificationChange(key); saveSettings(); }}
                      />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="settings-section">
                <h3 className="settings-section-title">Privacy Settings</h3>
                <div className="settings-card">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Profile Visibility</h4>
                      <p>Control who can see your profile</p>
                    </div>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="setting-select"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Show Try-Ons</h4>
                      <p>Display your try-on history on profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacy.showTryOns}
                        onChange={(e) => { handlePrivacyChange('showTryOns', e.target.checked); saveSettings(); }}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Share Analytics</h4>
                      <p>Help us improve by sharing usage data</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacy.shareAnalytics}
                        onChange={(e) => { handlePrivacyChange('shareAnalytics', e.target.checked); saveSettings(); }}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Allow Messages</h4>
                      <p>Let stylists send you messages</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacy.allowMessages}
                        onChange={(e) => { handlePrivacyChange('allowMessages', e.target.checked); saveSettings(); }}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="settings-section">
                <h3 className="settings-section-title">Billing & Plan</h3>
                <div className="settings-card">
                  <div className="plan-card">
                    <div className="plan-header">
                      <div className="plan-info">
                        <span className="plan-badge">Current Plan</span>
                        <h4>{userData.plan} Plan</h4>
                        <p>$29.99/month • Billed monthly</p>
                      </div>
                      <div className="plan-price">$29.99</div>
                    </div>
                    <div className="plan-features">
                      <div className="plan-feature">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Unlimited try-ons
                      </div>
                      <div className="plan-feature">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Priority booking
                      </div>
                      <div className="plan-feature">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Advanced AI analysis
                      </div>
                      <div className="plan-feature">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Style history export
                      </div>
                    </div>
                    <div className="plan-actions">
                      <button className="btn-upgrade">Upgrade to Pro</button>
                      <button className="btn-manage">Manage Billing</button>
                    </div>
                  </div>
                  <div className="payment-methods">
                    <h4>Payment Methods</h4>
                    <div className="payment-card">
                      <div className="payment-card-info">
                        <span className="payment-icon">💳</span>
                        <div>
                          <p className="payment-card-number">•••• •••• •••• 4242</p>
                          <p className="payment-expiry">Expires 12/25</p>
                        </div>
                      </div>
                      <span className="payment-default">Default</span>
                    </div>
                    <button className="btn-add-payment">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 32px;
        }

        .settings-sidebar {
          background: white;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .settings-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          border: none;
          background: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          font-size: 15px;
          font-weight: 500;
        }

        .settings-nav-item:hover {
          background: #f9fafb;
          color: #374151;
        }

        .settings-nav-item.active {
          background: #111827;
          color: white;
        }

        .settings-nav-icon {
          font-size: 20px;
        }

        .settings-section-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 24px;
        }

        .settings-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          overflow: hidden;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-item.danger {
          background: #f9fafb;
        }

        .setting-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .setting-info p {
          font-size: 13px;
          color: #6b7280;
        }

        .btn-change,
        .btn-enable {
          padding: 8px 20px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s ease;
        }

        .btn-change:hover,
        .btn-enable:hover {
          background: #e5e7eb;
        }

        .btn-delete {
          padding: 8px 20px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s ease;
        }

        .btn-delete:hover {
          background: #f3f4f6;
        }

        /* New form styles */
        .account-card { padding: 20px; }
        .account-grid { display: flex; gap: 20px; align-items: center; }
        .account-column { flex: 1; }
        .account-label { font-size: 14px; color: #6b7280; margin-bottom: 6px; }
        .account-value { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 10px; }
        .account-forms { margin-top: 18px; display: grid; gap: 12px; }
        .form-card { background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #eef2f7; box-shadow: 0 6px 18px rgba(15,23,42,0.04); }
        .form-title { font-size: 16px; margin-bottom: 8px; }
        .form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
        .input-field { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
        .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.06); }
        .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; }
        .btn-primary { padding: 10px 16px; background: #6366f1; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-primary:hover { background: #4f46e5; }
        .btn-outline { padding: 10px 16px; background: white; color: #374151; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
        .btn-outline:hover { background: #f8fafc; }
        .message { padding: 12px 16px; border-radius: 8px; margin-top: 12px; font-weight: 600; }
        .message[style*="#ef4444"] { background: rgba(239,68,68,0.06); }
        .message[style*="#10b981"] { background: rgba(16,185,129,0.06); }


        .toggle-switch {
          position: relative;
          width: 48px;
          height: 28px;
          display: inline-block;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #d1d5db;
          transition: 0.3s;
          border-radius: 28px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #111827;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .setting-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
          background: white;
          cursor: pointer;
          outline: none;
        }

        .plan-card {
          padding: 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .plan-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #f3f4f6;
          color: #374151;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .plan-info h4 {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .plan-info p {
          font-size: 14px;
          color: #6b7280;
        }

        .plan-price {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
        }

        .plan-features {
          display: grid;
          gap: 12px;
          margin-bottom: 24px;
        }

        .plan-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .plan-actions {
          display: flex;
          gap: 12px;
        }

        .btn-upgrade {
          flex: 1;
          padding: 12px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-upgrade:hover {
          background: #374151;
        }

        .btn-manage {
          padding: 12px 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s ease;
        }

        .btn-manage:hover {
          background: #f9fafb;
        }

        .payment-methods {
          padding: 24px;
        }

        .payment-methods h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
        }

        .payment-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          margin-bottom: 16px;
        }

        .payment-card-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payment-icon {
          font-size: 24px;
        }

        .payment-card-number {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .payment-expiry {
          font-size: 12px;
          color: #6b7280;
        }

        .payment-default {
          padding: 4px 12px;
          background: #f3f4f6;
          color: #374151;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .btn-add-payment {
          width: 100%;
          padding: 14px;
          background: white;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-add-payment:hover {
          border-color: #374151;
          color: #111827;
          background: #f9fafb;
        }

        @media (max-width: 1024px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            position: static;
            display: flex;
            overflow-x: auto;
            padding: 8px;
            gap: 8px;
          }

          .settings-nav-item {
            white-space: nowrap;
            flex-shrink: 0;
          }
        }

        @media (max-width: 768px) {
          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .plan-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default Settings;
