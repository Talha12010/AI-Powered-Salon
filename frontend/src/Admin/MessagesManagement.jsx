import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  });

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await fetchJson('/api/contacts');
      // Sort messages by date descending (newest first)
      const sorted = (data.contacts || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(sorted);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadMessages().catch(() => {});
  }, []);

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await fetchJson(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      await loadMessages();
    } catch (_) {}
  };

  return (
    <>
      <div className="messages-management">
        <div className="page-header">
          <div>
            <h2>Messages & Inquiries</h2>
            <p>View and manage client feedback and contact inquiries</p>
          </div>
          <button className="btn-refresh" onClick={loadMessages} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Inbox'}
          </button>
        </div>

        {loading && messages.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✉️</div>
            <h3>No messages yet</h3>
            <p>Inquiries sent from the Contact Us form will appear here.</p>
          </div>
        ) : (
          <div className="messages-layout">
            {/* Messages List Panel */}
            <div className="messages-list">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message-item-card ${selectedMessage?.id === msg.id ? 'active' : ''}`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <div className="item-header">
                    <span className="sender-name">{msg.firstName} {msg.lastName}</span>
                    <span className="item-date">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <div className="item-subject">{msg.subject}</div>
                  <p className="item-snippet">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Message Detail Panel */}
            <div className="message-detail-panel">
              {selectedMessage ? (
                <div className="detail-view">
                  <div className="detail-header">
                    <div className="sender-meta">
                      <h3>{selectedMessage.subject}</h3>
                      <p className="sender-info">
                        From: <strong>{selectedMessage.firstName} {selectedMessage.lastName}</strong> ({selectedMessage.email})
                        {selectedMessage.phone && ` • Phone: ${selectedMessage.phone}`}
                      </p>
                      <p className="message-date">
                        Received: {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <button className="btn-delete" onClick={() => deleteMessage(selectedMessage.id)}>
                      Delete Inquiry
                    </button>
                  </div>
                  <div className="detail-body">
                    <p className="message-content">{selectedMessage.message}</p>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <div className="select-icon">✉️</div>
                  <p>Select a message from the list to read details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .messages-management {
          animation: fadeIn 0.4s ease;
          height: calc(100vh - 160px);
          display: flex;
          flex-direction: column;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-shrink: 0;
        }

        .page-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-header p {
          font-size: 14px;
          color: #64748b;
        }

        .btn-refresh {
          padding: 8px 16px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #334155;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        /* Layout */
        .messages-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 24px;
          flex: 1;
          min-height: 0;
        }

        /* List Panel */
        .messages-list {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .message-item-card {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .message-item-card:hover {
          background: #f8fafc;
        }

        .message-item-card.active {
          background: #f1f5f9;
          border-left: 4px solid #6366f1;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .sender-name {
          font-weight: 700;
          color: #0f172a;
        }

        .item-date {
          color: #94a3b8;
        }

        .item-subject {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-snippet {
          font-size: 13px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        /* Detail Panel */
        .message-detail-panel {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .no-selection {
          margin: auto;
          text-align: center;
          color: #94a3b8;
          padding: 40px;
        }

        .select-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .detail-view {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 20px;
          gap: 16px;
        }

        .sender-meta h3 {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .sender-info {
          font-size: 14px;
          color: #475569;
          margin-bottom: 4px;
        }

        .message-date {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .btn-delete {
          padding: 8px 16px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #ef4444;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-delete:hover {
          background: #fecaca;
          color: #dc2626;
        }

        .detail-body {
          font-size: 15px;
          color: #334155;
          line-height: 1.6;
        }

        .message-content {
          white-space: pre-wrap;
          margin: 0;
        }

        /* States */
        .loading-state {
          text-align: center;
          padding: 80px 20px;
          color: #64748b;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #0f172a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          max-width: 500px;
          margin: 40px auto;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: #64748b;
        }

        @media (max-width: 992px) {
          .messages-layout {
            grid-template-columns: 1fr;
          }
          .messages-list {
            max-height: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default MessagesManagement;
