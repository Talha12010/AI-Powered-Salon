import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchJson, apiUrl } from '../api';

const CATEGORIES = ['Trending', 'Popular', 'Classic', 'New'];
const GENDERS = ['Men', 'Unisex'];

const emptyForm = {
  name: '',
  category: 'Trending',
  gender: 'Men',
  popularity: 80,
  status: 'Active',
  image: '',
  description: '',
};

const CAT_COLORS = {
  Trending: { bg: '#fef3c7', color: '#b45309' },
  Popular:  { bg: '#d1fae5', color: '#047857' },
  Classic:  { bg: '#e0e7ff', color: '#4338ca' },
  New:      { bg: '#fce7f3', color: '#be185d' },
};

const StylesManagement = ({ initialSubAction, clearSubAction }) => {
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterCat, setFilterCat]           = useState('all');
  const [filterGender, setFilterGender]     = useState('all');
  const [showModal, setShowModal]           = useState(false);
  const [styles, setStyles]                 = useState([]);
  const [form, setForm]                     = useState(emptyForm);
  const [editingId, setEditingId]           = useState(null);
  const [pageLoading, setPageLoading]       = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [errorMsg, setErrorMsg]             = useState('');
  const [imagePreview, setImagePreview]     = useState('');
  const [uploading, setUploading]           = useState(false);
  const fileInputRef = useRef(null);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  }), []);

  /* ── auto-trigger from dashboard ── */
  useEffect(() => {
    if (initialSubAction === 'add') {
      openAdd();
      if (clearSubAction) clearSubAction();
    }
  }, [initialSubAction]); // eslint-disable-line

  /* ── data ── */
  const loadStyles = async () => {
    setPageLoading(true);
    try {
      const data = await fetchJson('/api/styles');
      setStyles(data.styles || []);
    } catch (_) {}
    setPageLoading(false);
  };
  useEffect(() => { loadStyles(); }, []);

  const filtered = styles.filter(s => {
    const name     = String(s.name || '').toLowerCase();
    const matchQ   = name.includes(searchTerm.toLowerCase());
    const matchCat = filterCat === 'all'    || s.category === filterCat;
    const matchG   = filterGender === 'all' || s.gender   === filterGender;
    return matchQ && matchCat && matchG;
  });

  /* ── modal helpers ── */
  const openAdd = () => {
    setErrorMsg(''); setEditingId(null); setForm(emptyForm); setImagePreview(''); setShowModal(true);
  };
  const openEdit = s => {
    setErrorMsg('');
    setEditingId(s.id);
    setForm({ name: s.name || '', category: s.category || 'Trending', gender: s.gender || 'Men',
               popularity: s.popularity ?? 80, status: s.status || 'Active',
               image: s.image || '', description: s.description || '' });
    setImagePreview(s.image || '');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setErrorMsg(''); setImagePreview(''); };

  /* ── image upload ── */
  const handleFile = async file => {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res  = await fetch(apiUrl('/api/admin/styles/upload-image'), {
        method: 'POST', headers: authHeaders, body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      setForm(p => ({ ...p, image: json.imageUrl }));
    } catch (err) {
      setErrorMsg(`Image upload failed: ${err.message}`);
    } finally { setUploading(false); }
  };

  /* ── save ── */
  const handleSave = async () => {
    setErrorMsg('');
    if (!form.name.trim()) { setErrorMsg('Style name is required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, popularity: Number(form.popularity || 0),
                        name: form.name.trim(), description: form.description.trim() };
      if (editingId) {
        await fetchJson(`/api/admin/styles/${editingId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(payload) });
      } else {
        await fetchJson('/api/admin/styles', { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) });
      }
      closeModal(); await loadStyles();
    } catch (err) { setErrorMsg(err.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  /* ── toggle / delete ── */
  const handleToggle = async s => {
    try {
      await fetchJson(`/api/admin/styles/${s.id}`, {
        method: 'PUT', headers: authHeaders,
        body: JSON.stringify({ status: s.status === 'Active' ? 'Inactive' : 'Active' }),
      });
      await loadStyles();
    } catch (_) {}
  };
  const handleDelete = async id => {
    if (!window.confirm('Delete this style permanently?')) return;
    try { await fetchJson(`/api/admin/styles/${id}`, { method: 'DELETE', headers: authHeaders }); await loadStyles(); }
    catch (_) {}
  };

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="sms-wrap">

      {/* ─── Page header ─── */}
      <div className="sms-page-header">
        <div>
          <h2 className="sms-page-title">Styles Management</h2>
          <p className="sms-page-sub">Create and manage your hairstyle catalog</p>
        </div>
        <button className="sms-btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Style
        </button>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="sms-toolbar">
        <div className="sms-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="sms-search-input"
            placeholder="Search styles…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sms-filters-row">
          <div className="sms-select-wrap">
            <label className="sms-select-label">Category</label>
            <select className="sms-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">All</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sms-select-wrap">
            <label className="sms-select-label">Gender</label>
            <select className="sms-select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              <option value="all">All</option>
              {GENDERS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="sms-summary">
          <span className="sms-summary-item"><strong>{styles.length}</strong> Total</span>
          <span className="sms-summary-item sms-active-count">
            <strong>{styles.filter(s => s.status === 'Active').length}</strong> Active
          </span>
        </div>
      </div>

      {/* ─── Content ─── */}
      {pageLoading ? (
        <div className="sms-state-box">
          <div className="sms-spinner"/>
          <p className="sms-state-text">Loading styles…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="sms-state-box">
          <span className="sms-state-emoji">✂️</span>
          <h3 className="sms-state-heading">{styles.length === 0 ? 'No styles yet' : 'No results found'}</h3>
          <p className="sms-state-sub">
            {styles.length === 0
              ? 'Add your first hairstyle to the catalog to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
          {styles.length === 0 && (
            <button className="sms-btn-primary" style={{ marginTop: 20 }} onClick={openAdd}>
              Add First Style
            </button>
          )}
        </div>
      ) : (
        <div className="sms-grid">
          {filtered.map(s => {
            const cc = CAT_COLORS[s.category] || { bg: '#f1f5f9', color: '#475569' };
            const isActive = s.status === 'Active';
            return (
              <div key={s.id} className="sms-card">
                {/* Image area */}
                <div className="sms-card-img-box">
                  <img
                    src={s.image || '/api/placeholder/320/200'}
                    alt={s.name}
                    className="sms-card-img"
                    onError={e => { e.target.src = '/api/placeholder/320/200'; }}
                  />

                  {/* Overlay badges */}
                  <div className="sms-card-top-badges">
                    <span className="sms-cat-badge" style={{ background: cc.bg, color: cc.color }}>
                      {s.category}
                    </span>
                    <span className="sms-gender-badge">
                      {s.gender === 'Men' ? '♂' : '⚥'} {s.gender}
                    </span>
                  </div>

                  {/* Status toggle */}
                  <button
                    className={`sms-status-btn ${isActive ? 'sms-status-active' : 'sms-status-inactive'}`}
                    onClick={() => handleToggle(s)}
                    title="Click to toggle status"
                  >
                    <span className="sms-dot"/>
                    {s.status}
                  </button>
                </div>

                {/* Body */}
                <div className="sms-card-body">
                  <h3 className="sms-card-name">{s.name}</h3>
                  {s.description && <p className="sms-card-desc">{s.description}</p>}

                  {/* Popularity bar */}
                  <div className="sms-pop-wrap">
                    <div className="sms-pop-meta">
                      <span className="sms-pop-label">Popularity</span>
                      <span className="sms-pop-val">{Math.min(100, s.popularity || 0)}%</span>
                    </div>
                    <div className="sms-pop-track">
                      <div className="sms-pop-bar" style={{ width: `${Math.min(100, s.popularity || 0)}%` }}/>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="sms-card-footer">
                  <button className="sms-act-btn sms-act-edit" onClick={() => openEdit(s)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                    </svg>
                    Edit
                  </button>
                  <button className="sms-act-btn sms-act-del" onClick={() => handleDelete(s.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal ─── */}
      {showModal && (
        <div className="sms-overlay" onClick={closeModal}>
          <div className="sms-modal" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="sms-modal-hd">
              <h3 className="sms-modal-title">{editingId ? 'Edit Style' : 'Add New Style'}</h3>
              <button className="sms-modal-x" onClick={closeModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="sms-modal-bd">
              {errorMsg && <div className="sms-error-box">{errorMsg}</div>}

              {/* Image section */}
              <div className="sms-field">
                <label className="sms-lbl">Style Image</label>
                <div
                  className={`sms-drop${uploading ? ' sms-drop-busy' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {(imagePreview || form.image) ? (
                    <img
                      src={imagePreview || form.image}
                      alt="preview"
                      className="sms-drop-preview"
                      onError={e => { e.target.src = '/api/placeholder/320/180'; }}
                    />
                  ) : (
                    <div className="sms-drop-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="sms-drop-txt">Click to upload image</span>
                      <span className="sms-drop-hint">JPG, PNG, WebP</span>
                    </div>
                  )}
                  {uploading && <div className="sms-drop-overlay">Uploading…</div>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])} />

                <div className="sms-or-divider">— or paste image URL —</div>
                <input
                  className="sms-input"
                  placeholder="https://example.com/style.jpg"
                  value={form.image}
                  onChange={e => { setForm(p => ({ ...p, image: e.target.value })); setImagePreview(e.target.value); }}
                />
              </div>

              {/* Style name */}
              <div className="sms-field">
                <label className="sms-lbl">Style Name <span className="sms-req">*</span></label>
                <input
                  className="sms-input"
                  placeholder="e.g. Modern Pompadour"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="sms-field">
                <label className="sms-lbl">Description</label>
                <textarea
                  className="sms-textarea"
                  rows={3}
                  placeholder="Briefly describe this hairstyle…"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Category + Gender */}
              <div className="sms-row2">
                <div className="sms-field">
                  <label className="sms-lbl">Category</label>
                  <select className="sms-input sms-sel" value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sms-field">
                  <label className="sms-lbl">Gender</label>
                  <select className="sms-input sms-sel" value={form.gender}
                    onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Popularity + Status */}
              <div className="sms-row2">
                <div className="sms-field">
                  <label className="sms-lbl">Popularity (0–100)</label>
                  <input className="sms-input" type="number" min="0" max="100"
                    value={form.popularity}
                    onChange={e => setForm(p => ({ ...p, popularity: e.target.value }))} />
                </div>
                <div className="sms-field">
                  <label className="sms-lbl">Status</label>
                  <select className="sms-input sms-sel" value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="sms-modal-ft">
              <button className="sms-btn-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="sms-btn-save" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Style'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        /* Reset interference from global CSS inside admin */
        .sms-wrap * { box-sizing: border-box; }

        /* ── Root ──────────────────────────────────── */
        .sms-wrap {
          animation: smsIn .4s ease;
          font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
        }
        @keyframes smsIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Page header ───────────────────────────── */
        .sms-page-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
        }
        .sms-page-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
        .sms-page-sub   { font-size: 14px; color: #64748b; margin: 0; }

        /* ── Primary button ────────────────────────── */
        .sms-btn-primary {
          display: inline-flex !important; align-items: center; gap: 8px;
          padding: 10px 20px; background: #0f172a !important; color: #fff !important;
          border: none !important; border-radius: 10px; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all .2s ease;
          white-space: nowrap; line-height: 1.4;
        }
        .sms-btn-primary:hover {
          background: #1e293b !important; transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(15,23,42,.3) !important;
        }

        /* ── Toolbar ───────────────────────────────── */
        .sms-toolbar {
          display: flex; align-items: center; gap: 16px;
          background: #ffffff; padding: 16px 20px; border-radius: 14px;
          border: 1px solid #e2e8f0; margin-bottom: 28px; flex-wrap: wrap;
        }
        .sms-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 8px 14px; flex: 1; min-width: 180px;
        }
        .sms-search-input {
          border: none !important; background: transparent !important;
          outline: none !important; font-size: 14px; color: #334155;
          width: 100%; padding: 0 !important; box-shadow: none !important;
        }
        .sms-search-input::placeholder { color: #94a3b8; }

        .sms-filters-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .sms-select-wrap { display: flex; flex-direction: column; gap: 3px; }
        .sms-select-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
        .sms-select {
          padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 13px; color: #334155; background: #f8fafc; outline: none; cursor: pointer;
        }

        .sms-summary     { display: flex; gap: 16px; font-size: 13px; color: #64748b; margin-left: auto; }
        .sms-summary-item strong { color: #0f172a; font-weight: 700; }
        .sms-active-count strong { color: #059669; }

        /* ── Grid ──────────────────────────────────── */
        .sms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 22px;
        }

        /* ── Card ──────────────────────────────────── */
        .sms-card {
          background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 2px 6px rgba(0,0,0,.05); transition: all .25s ease;
        }
        .sms-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 32px rgba(0,0,0,.10);
          border-color: #c7d2fe;
        }

        /* Image area */
        .sms-card-img-box {
          position: relative; height: 188px; overflow: hidden;
          background: #f1f5f9; flex-shrink: 0;
        }
        .sms-card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .4s ease; display: block;
        }
        .sms-card:hover .sms-card-img { transform: scale(1.06); }

        /* Top-left badges */
        .sms-card-top-badges {
          position: absolute; top: 10px; left: 10px;
          display: flex; gap: 6px; flex-wrap: wrap;
        }
        .sms-cat-badge {
          padding: 3px 9px; border-radius: 20px;
          font-size: 11px; font-weight: 700; letter-spacing: .2px;
        }
        .sms-gender-badge {
          padding: 3px 9px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
          background: rgba(255,255,255,.85); color: #475569;
        }

        /* Status pill */
        .sms-status-btn {
          position: absolute !important; top: 10px; right: 10px;
          display: inline-flex !important; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px; border: none !important;
          font-size: 11px; font-weight: 600; cursor: pointer;
          transition: all .2s; backdrop-filter: blur(4px);
          background: transparent;
        }
        .sms-status-active  { background: rgba(209,250,229,.92) !important; color: #065f46 !important; }
        .sms-status-inactive{ background: rgba(241,245,249,.92) !important; color: #475569 !important; }
        .sms-status-btn:hover { transform: scale(1.06); }
        .sms-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor; flex-shrink: 0;
        }

        /* Card body */
        .sms-card-body { padding: 16px 18px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .sms-card-name { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
        .sms-card-desc {
          font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        /* Popularity */
        .sms-pop-wrap  { margin-top: auto; }
        .sms-pop-meta  { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .sms-pop-label { font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: .4px; }
        .sms-pop-val   { font-size: 12px; font-weight: 700; color: #0f172a; }
        .sms-pop-track { height: 5px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        .sms-pop-bar   {
          height: 100%; border-radius: 99px; transition: width .4s ease;
          background: linear-gradient(90deg, #6366f1, #818cf8);
        }

        /* Card footer */
        .sms-card-footer {
          display: flex; gap: 8px; padding: 12px 18px;
          border-top: 1px solid #f1f5f9; background: #fafbfc;
        }
        .sms-act-btn {
          display: inline-flex !important; align-items: center; gap: 6px;
          flex: 1; justify-content: center;
          padding: 7px 12px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all .2s ease;
        }
        .sms-act-edit {
          background: #f1f5f9 !important; border: 1px solid #e2e8f0 !important; color: #475569 !important;
        }
        .sms-act-edit:hover { background: #e2e8f0 !important; color: #0f172a !important; }
        .sms-act-del {
          background: #ffffff !important; border: 1px solid #fca5a5 !important; color: #ef4444 !important;
        }
        .sms-act-del:hover { background: #fee2e2 !important; }

        /* ── Empty/Loading states ──────────────────── */
        .sms-state-box {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; text-align: center;
          background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;
        }
        .sms-state-emoji   { font-size: 52px; margin-bottom: 16px; }
        .sms-state-heading { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
        .sms-state-sub     { font-size: 14px; color: #64748b; max-width: 300px; margin: 0; }
        .sms-state-text    { font-size: 14px; color: #64748b; }
        .sms-spinner {
          width: 36px; height: 36px; border: 3px solid #e2e8f0;
          border-top-color: #6366f1; border-radius: 50%;
          animation: smsSpin .7s linear infinite; margin-bottom: 12px;
        }
        @keyframes smsSpin { to { transform: rotate(360deg); } }

        /* ── Modal ─────────────────────────────────── */
        .sms-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,.50); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 20px;
          animation: smsIn .18s ease;
        }
        .sms-modal {
          background: #ffffff; border-radius: 20px; width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 28px 56px rgba(0,0,0,.22);
          animation: smsPop .22s cubic-bezier(.4,0,.2,1);
        }
        @keyframes smsPop { from { transform: scale(.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .sms-modal-hd {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
          position: sticky; top: 0; background: #ffffff; z-index: 1; border-radius: 20px 20px 0 0;
        }
        .sms-modal-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
        .sms-modal-x {
          background: #f1f5f9 !important; border: none !important; border-radius: 8px;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #475569; transition: all .2s;
        }
        .sms-modal-x:hover { background: #e2e8f0 !important; color: #0f172a; }

        .sms-modal-bd { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
        .sms-modal-ft {
          display: flex; justify-content: flex-end; gap: 10px;
          padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #f8fafc;
          border-radius: 0 0 20px 20px; position: sticky; bottom: 0;
        }

        .sms-error-box {
          background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c;
          padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
        }

        /* Image dropzone */
        .sms-drop {
          border: 2px dashed #cbd5e1; border-radius: 12px; overflow: hidden;
          cursor: pointer; transition: border-color .2s; min-height: 148px;
          display: flex; align-items: center; justify-content: center; position: relative;
          background: #f8fafc;
        }
        .sms-drop:hover, .sms-drop-busy { border-color: #6366f1 !important; background: #f5f3ff; }
        .sms-drop-preview { width: 100%; height: 148px; object-fit: cover; display: block; }
        .sms-drop-placeholder {
          display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 24px;
        }
        .sms-drop-txt  { font-size: 14px; color: #64748b; font-weight: 500; }
        .sms-drop-hint { font-size: 12px; color: #94a3b8; }
        .sms-drop-overlay {
          position: absolute; inset: 0; background: rgba(255,255,255,.82);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; color: #6366f1;
        }
        .sms-or-divider { text-align: center; font-size: 12px; color: #94a3b8; }

        /* Form fields */
        .sms-field { display: flex; flex-direction: column; gap: 6px; }
        .sms-lbl { font-size: 13px; font-weight: 600; color: #475569; }
        .sms-req { color: #ef4444; }
        .sms-input, .sms-textarea {
          padding: 10px 14px !important; border: 1px solid #cbd5e1 !important;
          border-radius: 9px !important; font-size: 14px; outline: none !important;
          transition: border-color .2s, box-shadow .2s; background: #f8fafc !important;
          color: #0f172a !important; font-family: inherit; width: 100%;
        }
        .sms-sel { cursor: pointer; }
        .sms-textarea { resize: vertical; }
        .sms-input:focus, .sms-textarea:focus {
          border-color: #6366f1 !important; background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important;
        }
        .sms-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* Modal action buttons */
        .sms-btn-cancel {
          padding: 10px 20px; border: 1px solid #cbd5e1 !important;
          background: #ffffff !important; color: #475569 !important;
          border-radius: 9px; font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all .2s;
        }
        .sms-btn-cancel:hover:not(:disabled) { background: #f1f5f9 !important; }
        .sms-btn-save {
          padding: 10px 22px; background: #0f172a !important; color: #ffffff !important;
          border: none !important; border-radius: 9px; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all .2s;
        }
        .sms-btn-save:hover:not(:disabled) { background: #1e293b !important; }
        .sms-btn-cancel:disabled, .sms-btn-save:disabled { opacity: .5; cursor: not-allowed; }

        /* ── Responsive ────────────────────────────── */
        @media (max-width: 680px) {
          .sms-page-header { flex-direction: column; }
          .sms-toolbar     { flex-direction: column; align-items: stretch; }
          .sms-summary     { margin-left: 0; }
          .sms-row2        { grid-template-columns: 1fr; }
          .sms-grid        { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default StylesManagement;
