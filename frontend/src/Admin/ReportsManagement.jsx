import React, { useEffect, useState } from 'react';
import { fetchJson, apiUrl } from '../api';

const ReportsManagement = ({ initialSubAction, clearSubAction }) => {
  const [summary, setSummary] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('bookings');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    fetchJson('/api/admin/reports/summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    }).then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialSubAction === 'generate') {
      setShowExportModal(true);
      if (clearSubAction) clearSubAction();
    }
  }, [initialSubAction, clearSubAction]);

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      const response = await fetch(apiUrl(`/api/admin/reports/export?type=${exportType}&format=${exportFormat}`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `report_${exportType}_${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setShowExportModal(false);
    } catch (err) {
      setExportError(err.message || 'Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  const stats = summary ? [
    { label: 'Total Users', value: String(summary.summary.totalUsers), change: '', trend: 'up' },
    { label: 'Active Users', value: String(summary.summary.activeUsers), change: '', trend: 'up' },
    { label: 'Total Bookings', value: String(summary.summary.totalBookings), change: '', trend: 'up' },
    { label: 'Total Revenue', value: `$${Number(summary.summary.totalRevenue || 0).toLocaleString()}`, change: '', trend: 'up' }
  ] : [];

  const topServices = summary?.topServices || [];

  return (
    <div className="reports-management">
      <div className="page-header">
        <div className="header-left">
          <h2>Reports & Analytics</h2>
          <p>Live admin analytics from backend</p>
        </div>
        <button className="btn-add" onClick={() => setShowExportModal(true)}>
          📊 Generate Report
        </button>
      </div>
      <div className="report-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="report-stat-card">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="report-card">
        <div className="card-header"><h3>Top Services</h3></div>
        <div className="top-services-list">
          {topServices.map((service, index) => (
            <div key={index} className="top-service-item">
              <div className="service-rank">#{index + 1}</div>
              <div className="service-details">
                <h4>{service.name}</h4>
                <div className="service-metrics">
                  <span>{service.bookings} bookings</span>
                  <span>${Number(service.revenue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate & Export Report</h3>
              <button className="btn-close-modal" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {exportError && <div className="modal-error">{exportError}</div>}
              
              <div className="form-group">
                <label>Report Data Type</label>
                <select value={exportType} onChange={e => setExportType(e.target.value)}>
                  <option value="bookings">Bookings Report</option>
                  <option value="users">Users Report</option>
                  <option value="services">Services Listing Report</option>
                  <option value="styles">Styles Catalog Report</option>
                </select>
              </div>

              <div className="form-group">
                <label>Format</label>
                <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
                  <option value="csv">CSV (Excel Compatible)</option>
                  <option value="json">JSON Format</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowExportModal(false)} disabled={exporting}>Cancel</button>
              <button className="btn-save" onClick={handleExport} disabled={exporting}>
                {exporting ? 'Exporting...' : 'Download Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reports-management {
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
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-add:hover {
          background: #334155;
        }

        .report-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .report-stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
        }

        .report-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          padding: 24px;
        }

        .report-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .top-services-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .top-service-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border-radius: 10px;
          background: #f8fafc;
        }

        .service-rank {
          font-size: 16px;
          font-weight: 700;
          color: #6366f1;
          width: 32px;
          height: 32px;
          background: #e0e7ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .service-details {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .service-details h4 {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .service-metrics {
          display: flex;
          gap: 20px;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
        }

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
          max-width: 450px;
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

        .form-group select {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
          background: #f8fafc;
        }

        .form-group select:focus {
          border-color: #0f172a;
          background: white;
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

        @media (max-width: 768px) {
          .report-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .report-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsManagement;
