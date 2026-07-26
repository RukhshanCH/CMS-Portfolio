// ============================================
// admin/InboxPage.tsx — Contact Form Submissions
// Shows messages sent via the public portfolio contact form
// ============================================

import { useState, useEffect } from 'react';
import { useAdmin } from '../layouts/AdminLayout';
import { getContactSubmissions, markSubmissionAsRead } from '../utils/supabase';
import type { ContactSubmission } from '../utils/supabase';

export default function InboxPage() {
  const { portfolioId } = useAdmin();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadSubmissions();
  }, [portfolioId]);

  async function loadSubmissions() {
    if (!portfolioId) return;
    setLoading(true);
    const data = await getContactSubmissions(portfolioId);
    setSubmissions(data);
    setLoading(false);
  }

  async function handleMarkRead(id: string) {
    if (!portfolioId) return;
    await markSubmissionAsRead(portfolioId, id);
    await loadSubmissions();
  }

  const filtered = filter === 'unread'
    ? submissions.filter(s => !s.is_read)
    : submissions;

  const unreadCount = submissions.filter(s => !s.is_read).length;

  if (loading) {
    return <p className="text-dim">Loading messages...</p>;
  }

  return (
    <div>
      <div className="inbox-header">
        <div>
          <h2 className="inbox-title">📨 Inbox</h2>
          <p className="inbox-subtitle">
            {submissions.length} total · {unreadCount} unread
          </p>
        </div>
        <div className="filter-group">
          <button
            onClick={() => setFilter('all')}
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`filter-chip ${filter === 'unread' ? 'active' : ''}`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-box">
          <p className="text-dim">
            {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
          </p>
        </div>
      ) : (
        <div className="message-list">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className={`message-card ${sub.is_read ? 'message-card-read' : 'message-card-unread'}`}
            >
              <div className="message-header">
                <div className="sender-info">
                  <span className="sender-name">{sub.name}</span>
                  <span className="sender-email">&lt;{sub.email}&gt;</span>
                  {sub.subject && (
                    <span className="message-subject">— {sub.subject}</span>
                  )}
                </div>
                <div className="message-meta">
                  <span className="message-date">
                    {new Date(sub.created_at).toLocaleString()}
                  </span>
                  {!sub.is_read && (
                    <button
                      onClick={() => handleMarkRead(sub.id)}
                      className="btn-mark-read"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              <p className="message-body">{sub.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}