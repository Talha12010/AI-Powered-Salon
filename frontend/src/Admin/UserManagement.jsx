import React, { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../api';

const emptyForm = { name: '', email: '', role: 'Customer', status: 'Active', username: '', password: '' };

const STATUS_CFG = {
  Active:    { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)', dot: '#10b981' },
  Inactive:  { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)', dot: '#f59e0b' },
  Suspended: { bg: 'rgba(239, 68, 68, 0.1)',  color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)',  dot: '#ef4444' },
};
const ROLE_CFG = {
  admin:    { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' },
  Admin:    { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' },
  Stylist:  { bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' },
  Customer: { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#fff' },
  user:     { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#fff' },
};

function Avatar({ src, name, size = 60 }) {
  const initials = String(name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [err, setErr] = useState(false);
  if (!err && src) return (
    <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #818cf8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.35, border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    }}>{initials}</div>
  );
}

const UserManagement = ({ initialSubAction, clearSubAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [users, setUsers]           = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [errMsg, setErrMsg]         = useState('');
  const [loading, setLoading]       = useState(false);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  useEffect(() => {
    if (initialSubAction === 'add') { openAdd(); if (clearSubAction) clearSubAction(); }
  }, [initialSubAction]); // eslint-disable-line

  const loadUsers = async () => {
    setLoading(true);
    try { const d = await fetchJson('/api/admin/users', { headers: authHeaders }); setUsers(d.users || []); }
    catch (_) {}
    setLoading(false);
  };
  useEffect(() => { loadUsers(); }, []); // eslint-disable-line

  const filtered = users.filter(u => {
    const name  = String(u.name || u.username || '').toLowerCase();
    const email = String(u.email || '').toLowerCase();
    const q     = searchTerm.toLowerCase();
    const role  = String(u.role || '');
    return (name.includes(q) || email.includes(q)) && (filterRole === 'all' || role === filterRole);
  });

  const openAdd  = () => { setErrMsg(''); setEditUser(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = u  => {
    setErrMsg('');
    setEditUser(u);
    setForm({ name: u.name || u.username || '', email: u.email || '', role: u.role || 'Customer',
               status: u.status || 'Active', username: u.username || '', password: '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setErrMsg(''); };

  const handleSave = async () => {
    setErrMsg('');
    if (!form.name.trim() || !form.email.trim()) { setErrMsg('Name and email are required.'); return; }
    setSaving(true);
    try {
      if (editUser) {
        await fetchJson(`/api/admin/users/${editUser.id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(form) });
      } else {
        await fetchJson('/api/admin/users', { method: 'POST', headers: authHeaders, body: JSON.stringify({
          username: form.username || form.name, name: form.name, email: form.email,
          role: form.role, status: form.status, password: form.password || 'ChangeMe@123',
        })});
      }
      closeModal(); await loadUsers();
    } catch (err) { setErrMsg(err.message || 'Failed to save.'); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await fetchJson(`/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders }); await loadUsers(); }
    catch (_) {}
  };

  const cycleStatus = async u => {
    const list = ['Active', 'Inactive', 'Suspended'];
    const next = list[(list.indexOf(u.status || 'Active') + 1) % list.length];
    try { await fetchJson(`/api/admin/users/${u.id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ status: next }) }); await loadUsers(); }
    catch (_) {}
  };

  const sc = s => STATUS_CFG[s] || STATUS_CFG.Active;
  const rc = r => ROLE_CFG[r]   || ROLE_CFG.Customer;

  const stats = [
    { emoji: '👥', label: 'Total Accounts', value: users.length,                                       color: '#6366f1', bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' },
    { emoji: '✨', label: 'Active Users',   value: users.filter(u => u.status === 'Active').length,    color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' },
    { emoji: '💇', label: 'Salon Stylists', value: users.filter(u => u.role === 'Stylist').length,    color: '#f59e0b', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
    { emoji: '🚫', label: 'Suspended',     value: users.filter(u => u.status === 'Suspended').length, color: '#ef4444', bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' },
  ];

  return (
    <div className="um-super-container">

      {/* ── Dashboard Top Header ── */}
      <div className="um-glass-header">
        <div className="um-header-info">
          <div className="um-sparkle-badge">👥 System Accounts</div>
          <h2 className="um-main-title">User Operations</h2>
          <p className="um-main-desc">Manage system roles, monitor access status, and view individual metrics</p>
        </div>
        <button className="um-add-btn" onClick={openAdd}>
          <span className="um-plus-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </span>
          Create Profile
        </button>
      </div>

      {/* ── Stats Indicators ── */}
      <div className="um-stats-flex">
        {stats.map(s => (
          <div key={s.label} className="um-stat-panel" style={{ background: s.bg }}>
            <span className="um-stat-emoji">{s.emoji}</span>
            <div className="um-stat-details">
              <span className="um-stat-count" style={{ color: s.color }}>{s.value}</span>
              <span className="um-stat-text">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter & Search Glass Panel ── */}
      <div className="um-filter-glass">
        <div className="um-search-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="um-search-box" placeholder="Find profile by name, username or email..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="um-tabs-row">
          {['all', 'Admin', 'Stylist', 'Customer'].map(r => (
            <button key={r} className={`um-tab-btn${filterRole === r ? ' um-tab-active' : ''}`}
              onClick={() => setFilterRole(r)}>
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Data View ── */}
      {loading ? (
        <div className="um-loading-box"><div className="um-spin-loader"/><p>Pulling latest accounts...</p></div>
      ) : filtered.length === 0 ? (
        <div className="um-empty-state">
          <div className="um-empty-icon">📭</div>
          <h3>No matches found</h3>
          <p>No user accounts fit the current filters or search query.</p>
        </div>
      ) : (
        <div className="um-user-cards-grid">
          {filtered.map(u => {
            const s = sc(u.status);
            const r = rc(u.role);
            const displayName = u.name || u.username || 'Anonymous User';
            return (
              <div key={u.id} className="um-profile-card">
                {/* Visual Top Decorative Gradient */}
                <div className="um-card-banner" style={{ background: u.role === 'Admin' ? 'linear-gradient(135deg, #4f46e5, #818cf8)' : u.role === 'Stylist' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #94a3b8, #cbd5e1)' }} />

                <div className="um-card-inner">
                  {/* Top Header */}
                  <div className="um-card-header-row">
                    <div className="um-avatar-container">
                      <Avatar src={u.image} name={displayName} size={64} />
                      <span className="um-live-dot" style={{ background: s.dot, boxShadow: `0 0 0 3px #fff, 0 0 8px ${s.dot}` }} />
                    </div>
                    <div className="um-actions-menu">
                      <button className="um-action-btn edit" title="Edit Profile" onClick={() => openEdit(u)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                        </svg>
                      </button>
                      <button className="um-action-btn delete" title="Delete Profile" onClick={() => handleDelete(u.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="um-card-profile-info">
                    <h3 className="um-profile-name">{displayName}</h3>
                    <span className="um-profile-username">@{u.username || 'no_handle'}</span>
                    <p className="um-profile-email">{u.email}</p>
                  </div>

                  <div className="um-profile-badges">
                    <span className="um-role-tag" style={{ background: r.bg, color: r.color }}>{u.role}</span>
                    <span className="um-status-tag" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{u.status}</span>
                  </div>

                  {/* Metrics Footer */}
                  <div className="um-card-footer-metrics">
                    <div className="um-metric-grid">
                      {u.role === 'Customer' ? (
                        <>
                          <div className="um-metric-cell">
                            <span className="um-metric-val">{u.bookings || 0}</span>
                            <span className="um-metric-lbl">Appointments</span>
                          </div>
                          <div className="um-metric-cell">
                            <span className="um-metric-val">${u.totalSpent || 0}</span>
                            <span className="um-metric-lbl">Total Spent</span>
                          </div>
                        </>
                      ) : u.role === 'Stylist' ? (
                        <div className="um-metric-cell single">
                          <span className="um-metric-val">{u.bookings || 0}</span>
                          <span className="um-metric-lbl">Sessions Booked</span>
                        </div>
                      ) : (
                        <div className="um-metric-cell single">
                          <span className="um-metric-val">Full</span>
                          <span className="um-metric-lbl">Access Privileges</span>
                        </div>
                      )}
                    </div>
                    <button className="um-status-cycle-btn" onClick={() => cycleStatus(u)}>
                      🔄 Cycle Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Profile Modification Overlay Modal ── */}
      {showModal && (
        <div className="um-modal-overlay" onClick={closeModal}>
          <div className="um-modal-window" onClick={e => e.stopPropagation()}>
            <div className="um-modal-header">
              <h3 className="um-modal-title-text">{editUser ? 'Modify Account Details' : 'Register New Account'}</h3>
              <button className="um-close-x-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="um-modal-body-container">
              {errMsg && <div className="um-form-alert">{errMsg}</div>}

              <div className="um-form-field">
                <label className="um-form-label">Full Name <span className="um-req-star">*</span></label>
                <input className="um-form-input" placeholder="e.g. Sandra Bullock" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="um-form-field">
                <label className="um-form-label">User Handle / Username</label>
                <input className="um-form-input" placeholder="e.g. sandrab" value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
              </div>
              <div className="um-form-field">
                <label className="um-form-label">Primary Email Address <span className="um-req-star">*</span></label>
                <input className="um-form-input" type="email" placeholder="sandra@styleai.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="um-form-field">
                <label className="um-form-label">Security Password {editUser ? <span className="um-input-hint">(leave blank to keep current)</span> : ''}</label>
                <input className="um-form-input" type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="um-form-grid-row">
                <div className="um-form-field">
                  <label className="um-form-label">Assign System Role</label>
                  <select className="um-form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option>Admin</option><option>Stylist</option><option>Customer</option>
                  </select>
                </div>
                <div className="um-form-field">
                  <label className="um-form-label">Default Access Status</label>
                  <select className="um-form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option>Active</option><option>Inactive</option><option>Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="um-modal-footer">
              <button className="um-modal-cancel-btn" onClick={closeModal} disabled={saving}>Discard</button>
              <button className="um-modal-confirm-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving changes...' : editUser ? 'Update Profile' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .um-super-container {
          animation: umFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1e293b;
        }

        @keyframes umFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Glass Header Design */
        .um-glass-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
          border: 1px solid #e2e8f0;
          padding: 24px 32px;
          border-radius: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
          backdrop-filter: blur(10px);
          gap: 16px;
          flex-wrap: wrap;
        }

        .um-sparkle-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.1);
          color: #4f46e5;
          font-size: 11px;
          font-weight: 700;
          border-radius: 12px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .um-main-title {
          font-size: 26px;
          font-weight: 850;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .um-main-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .um-add-btn {
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25) !important;
        }

        .um-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.35) !important;
        }

        .um-plus-circle {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Stats Panels flex */
        .um-stats-flex {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .um-stat-panel {
          border-radius: 20px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }

        .um-stat-panel:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }

        .um-stat-emoji {
          font-size: 26px;
          background: #ffffff;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
        }

        .um-stat-details {
          display: flex;
          flex-direction: column;
        }

        .um-stat-count {
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 2px;
        }

        .um-stat-text {
          font-size: 12px;
          color: #475569;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Filter Panel */
        .um-filter-glass {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 16px 24px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.01);
        }

        .um-search-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 16px;
          flex: 1;
          min-width: 260px;
          transition: all 0.25s ease;
        }

        .um-search-wrapper:focus-within {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
        }

        .um-search-box {
          border: none !important;
          background: transparent !important;
          outline: none !important;
          font-size: 14px;
          color: #0f172a !important;
          width: 100%;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .um-search-box::placeholder {
          color: #94a3b8;
        }

        .um-tabs-row {
          display: flex;
          gap: 6px;
        }

        .um-tab-btn {
          padding: 9px 18px;
          border: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #475569 !important;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .um-tab-btn:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }

        .um-tab-active {
          background: #0f172a !important;
          color: #ffffff !important;
          border-color: #0f172a !important;
        }

        /* User Cards Grid */
        .um-user-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .um-profile-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .um-profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .um-card-banner {
          height: 8px;
          width: 100%;
        }

        .um-card-inner {
          padding: 24px;
        }

        .um-card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .um-avatar-container {
          position: relative;
        }

        .um-live-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }

        .um-actions-menu {
          display: flex;
          gap: 6px;
        }

        .um-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #475569 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .um-action-btn:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }

        .um-action-btn.delete:hover {
          background: #fee2e2 !important;
          border-color: #fca5a5 !important;
          color: #ef4444 !important;
        }

        /* Profile Details styling */
        .um-card-profile-info {
          margin-bottom: 16px;
        }

        .um-profile-name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
          letter-spacing: -0.3px;
        }

        .um-profile-username {
          font-size: 13px;
          color: #6366f1;
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
        }

        .um-profile-email {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          word-break: break-all;
          line-height: 1.4;
        }

        .um-profile-badges {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .um-role-tag {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .um-status-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
        }

        /* Footer Metrics panel */
        .um-card-footer-metrics {
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .um-metric-grid {
          display: flex;
          gap: 12px;
        }

        .um-metric-cell {
          flex: 1;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .um-metric-cell.single {
          align-items: center;
          padding: 10px;
        }

        .um-metric-val {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .um-metric-lbl {
          font-size: 9px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-weight: 700;
        }

        .um-status-cycle-btn {
          width: 100%;
          padding: 8px 12px;
          background: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
          color: #475569 !important;
          font-size: 12px;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .um-status-cycle-btn:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }

        /* Load & Empty States */
        .um-loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .um-spin-loader {
          width: 38px;
          height: 38px;
          border: 4px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: umSpinPulse 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes umSpinPulse { to { transform: rotate(360deg); } }

        .um-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .um-empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .um-empty-state h3 {
          font-size: 18px;
          font-weight: 750;
          margin: 0 0 6px 0;
          color: #0f172a;
        }

        .um-empty-state p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        /* Overlay & Window Modal */
        .um-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: umFadeIn 0.2s ease;
        }

        @keyframes umFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .um-modal-window {
          background: #ffffff;
          border-radius: 28px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
          animation: umScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes umScaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .um-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid #f1f5f9;
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 1;
        }

        .um-modal-title-text {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .um-close-x-btn {
          background: #f1f5f9 !important;
          border: none !important;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .um-close-x-btn:hover {
          background: #e2e8f0 !important;
          color: #0f172a;
        }

        .um-modal-body-container {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .um-form-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
        }

        .um-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .um-form-label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }

        .um-req-star {
          color: #ef4444;
        }

        .um-input-hint {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          margin-left: 4px;
        }

        .um-form-input, .um-form-select {
          padding: 12px 16px !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 12px !important;
          font-size: 14px;
          outline: none !important;
          background: #f8fafc !important;
          color: #0f172a !important;
          width: 100%;
          transition: all 0.2s ease;
        }

        .um-form-input:focus, .um-form-select:focus {
          border-color: #6366f1 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12) !important;
        }

        .um-form-grid-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .um-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 28px;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          border-radius: 0 0 28px 28px;
        }

        .um-modal-cancel-btn {
          padding: 11px 22px;
          border: 1.5px solid #cbd5e1 !important;
          background: #ffffff !important;
          color: #475569 !important;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .um-modal-cancel-btn:hover:not(:disabled) {
          background: #f1f5f9 !important;
        }

        .um-modal-confirm-btn {
          padding: 11px 24px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .um-modal-confirm-btn:hover:not(:disabled) {
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3) !important;
        }

        .um-modal-cancel-btn:disabled, .um-modal-confirm-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media(max-width: 1024px) {
          .um-stats-flex { grid-template-columns: repeat(2, 1fr); }
        }
        @media(max-width: 600px) {
          .um-glass-header { flex-direction: column; align-items: stretch; padding: 20px; }
          .um-filter-glass { flex-direction: column; align-items: stretch; }
          .um-stats-flex { grid-template-columns: 1fr; }
          .um-form-grid-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
