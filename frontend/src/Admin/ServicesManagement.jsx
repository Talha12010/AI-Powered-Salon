import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

const emptyForm = { name: '', category: 'Haircut', price: '', duration: '', description: '', status: 'Active' };

const ServicesManagement = ({ initialSubAction, clearSubAction }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSubAction === 'add') {
      setErrorMsg('');
      setEditingId(null);
      setForm(emptyForm);
      setShowAddModal(true);
      if (clearSubAction) clearSubAction();
    }
  }, [initialSubAction, clearSubAction]);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  });

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchJson('/api/services');
      setServices(data.services || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { loadServices().catch(() => {}); }, []);

  const filteredServices = services.filter(service =>
    String(service.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(service.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveService = async () => {
    setErrorMsg('');
    if (!form.name.trim()) {
      setErrorMsg('Service Name is required.');
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price || 0),
      bookings: 0
    };
    try {
      if (editingId) {
        await fetchJson(`/api/admin/services/${editingId}`, { 
          method: 'PUT', 
          headers: getHeaders(), 
          body: JSON.stringify(payload) 
        });
      } else {
        await fetchJson('/api/admin/services', { 
          method: 'POST', 
          headers: getHeaders(), 
          body: JSON.stringify(payload) 
        });
      }
      setShowAddModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadServices();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save service.');
    }
  };

  const editService = (service) => {
    setErrorMsg('');
    setEditingId(service.id);
    setForm({
      name: service.name || '',
      category: service.category || 'Haircut',
      price: String(service.price || ''),
      duration: service.duration || '',
      description: service.description || '',
      status: service.status || 'Active'
    });
    setShowAddModal(true);
  };

  const toggleStatus = async (service) => {
    try {
      await fetchJson(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: service.status === 'Active' ? 'Inactive' : 'Active' })
      });
      await loadServices();
    } catch (_) {}
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetchJson(`/api/admin/services/${id}`, { 
        method: 'DELETE', 
        headers: getHeaders() 
      });
      await loadServices();
    } catch (_) {}
  };

  return (
    <>
      <div className="services-management">
        <div className="page-header">
          <div className="header-left">
            <h2>Services Management</h2>
            <p>Manage your salon services and pricing</p>
          </div>
          <button className="btn-add" onClick={() => { setErrorMsg(''); setEditingId(null); setForm(emptyForm); setShowAddModal(true); }}>
            + Add Service
          </button>
        </div>

        <div className="services-toolbar">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search services..." />
          </div>
          <div className="toolbar-stats">
            <span>Total Services: <strong>{services.length}</strong></span>
            <span>Active: <strong className="active-count">{services.filter(s => s.status === 'Active').length}</strong></span>
          </div>
        </div>

        {loading && services.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading services...</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <div className="service-category">{service.category}</div>
                  <div className="service-actions">
                    <button className="btn-icon edit" onClick={() => editService(service)} title="Edit Service">✎</button>
                    <button className="btn-icon delete" onClick={() => deleteService(service.id)} title="Delete Service">🗑</button>
                  </div>
                </div>
                <div className="service-body">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-desc">{service.description || 'No description provided.'}</p>
                  <div className="service-details">
                    <div className="detail-item">
                      <span className="detail-label">Price</span>
                      <span className="detail-value">${service.price}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{service.duration || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Bookings</span>
                      <span className="detail-value">{service.bookings || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="service-footer">
                  <button className={`btn-status ${service.status.toLowerCase()}`} onClick={() => toggleStatus(service)}>
                    {service.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
                <button className="btn-close-modal" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {errorMsg && <div className="modal-error">{errorMsg}</div>}
                
                <div className="form-group">
                  <label>Service Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Signature Cut" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Haircut</option>
                    <option>Grooming</option>
                    <option>Styling</option>
                    <option>Color</option>
                    <option>Treatment</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="85" />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="45 min" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the service..." />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-save" onClick={saveService}>Save Service</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .services-management {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .header-left h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .header-left p {
          font-size: 14px;
          color: #64748b;
        }

        .btn-add {
          padding: 10px 20px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add:hover {
          background: #334155;
        }

        /* Toolbar */
        .services-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 16px 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 8px;
          min-width: 280px;
          flex: 1;
          max-width: 400px;
        }

        .search-box svg {
          color: #94a3b8;
        }

        .search-box input {
          border: none;
          background: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          color: #334155;
        }

        .toolbar-stats {
          display: flex;
          gap: 20px;
          font-size: 14px;
          color: #64748b;
        }

        .active-count {
          color: #10b981;
        }

        /* Grid & Cards */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .service-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
          border-color: #cbd5e1;
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .service-category {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .service-actions {
          display: flex;
          gap: 6px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .btn-icon:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .btn-icon.delete:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fca5a5;
        }

        .service-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .service-name {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .service-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }

        .service-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 10px;
          margin-top: 8px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: center;
        }

        .detail-label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }

        .service-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
          display: flex;
          justify-content: flex-start;
        }

        .btn-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-status.active {
          background: #d1fae5;
          color: #065f46;
        }

        .btn-status.inactive {
          background: #f1f5f9;
          color: #475569;
        }

        /* Loading */
        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #0f172a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: scaleUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .btn-close-modal {
          background: none;
          border: none;
          font-size: 24px;
          color: #94a3b8;
          cursor: pointer;
        }

        .btn-close-modal:hover {
          color: #475569;
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .modal-error {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
          background: #f8fafc;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #0f172a;
          background: white;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }

        .btn-cancel {
          padding: 10px 18px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #475569;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-cancel:hover {
          background: #f1f5f9;
        }

        .btn-save {
          padding: 10px 18px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save:hover {
          background: #334155;
        }

        @media (max-width: 640px) {
          .services-toolbar { flex-direction: column; align-items: stretch; }
          .search-box { min-width: 100%; }
        }
      `}</style>
    </>
  );
};

export default ServicesManagement;
