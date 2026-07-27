// ============================================
// pages/DashboardPage.tsx — Portfolio List & Create (FIXED)
// Shows all portfolios user owns or is member of
// Hides create UI if user lacks permission or hit limit
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyPortfolios,
  createPortfolio,
  getMyInvitations,
  acceptInvitation,
  signOut,
  getUserPortfolioLimitInfo,
  isCurrentUserAdmin,
  type Portfolio,
  type Invitation
} from '../utils/supabase';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // NEW: Permission & limit state
  const [canCreate, setCanCreate] = useState(false);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [maxPortfolios, setMaxPortfolios] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [myPortfolios, myInvites, limitInfo, adminStatus] = await Promise.all([
      getMyPortfolios(),
      getMyInvitations(),
      getUserPortfolioLimitInfo(),
      isCurrentUserAdmin(),
    ]);
    setIsAdmin(adminStatus);
    setPortfolios(myPortfolios);
    setInvitations(myInvites);

    if (limitInfo) {
      setCanCreate(limitInfo.canCreate);
      setPortfolioCount(limitInfo.currentCount);
      setMaxPortfolios(limitInfo.maxAllowed);
    }

    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const slug = newSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!newTitle || !newSlug) return;

    setCreating(true);

    const portfolio = await createPortfolio(newTitle, slug, newDescription || undefined);
    if (portfolio) {
      setShowCreateModal(false);
      setNewTitle('');
      setNewSlug('');
      setNewDescription('');
      setCreateError(null);
      // Refresh limit info
      await loadData();
      navigate(`/admin/${portfolio.id}`);
    } else {
      setCreateError(
        maxPortfolios > 0
          ? `Could not create portfolio. You may have reached your limit (${portfolioCount}/${maxPortfolios}).`
          : 'Could not create portfolio. You do not have permission.'
      );
    }
    setCreating(false);
  }

  async function handleAcceptInvite(token: string) {
    const success = await acceptInvitation(token);
    if (success) {
      await loadData();
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="loader-wrapper full-page">
        <div className="spinner" />
        <p className="loader-text">Loading your portfolios...</p>
      </div>
    );
  }

  return (
    <div className="dark-mode dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-header-title">My Portfolios</h1>
        <div className="dashboard-header-actions">
          {/* FIX: Only show create button if user has permission */}
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + New Portfolio
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => window.location.href = '/admin-panel'}
              className="btn-ghost-sm"
              style={{ color: '#f59e0b' }}
            >
              ⚙️ Admin Panel
            </button>
          )}
          <button onClick={handleLogout} className="btn-ghost-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* NEW: Portfolio usage indicator */}
      {maxPortfolios > 0 && (
        <div className="dashboard-section" style={{ paddingBottom: 0 }}>
          <p className="text-muted" style={{ fontSize: 14, color: '#64748b' }}>
            Portfolios: <strong>{portfolioCount}</strong> / {maxPortfolios}
            {!canCreate && portfolioCount >= maxPortfolios && (
              <span style={{ color: '#ef4444', marginLeft: 8 }}>Limit reached</span>
            )}
          </p>
        </div>
      )}

      {/* Invitations */}
      {invitations.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-heading">📨 Pending Invitations</h2>
          <div className="invite-list">
            {invitations.map((invite) => (
              <div key={invite.id} className="invite-card">
                <div>
                  <p className="invite-text">
                    Invited to <strong>{(invite as any).portfolios?.title || 'a portfolio'}</strong>
                  </p>
                  <p className="invite-meta">Expires: {new Date(invite.expires_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleAcceptInvite(invite.token)}
                  className="btn-success-sm"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolios Grid */}
      <div className="portfolio-grid">
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className="portfolio-card"
            onClick={() => navigate(`/admin/${portfolio.id}`)}
          >
            <div className="portfolio-card-header">
              <h3 className="portfolio-card-title">{portfolio.title}</h3>
              <span className={`badge-sm ${portfolio.is_published ? 'badge-success' : 'badge-muted'}`}>
                {portfolio.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="portfolio-slug">/{portfolio.slug}</p>
            {portfolio.description && (
              <p className="portfolio-desc">{portfolio.description}</p>
            )}
            <div className="portfolio-card-footer">
              <span className="portfolio-date">
                Created {new Date(portfolio.created_at).toLocaleDateString()}
              </span>
              <span className="portfolio-arrow">→</span>
            </div>
          </div>
        ))}

        {/* FIX: Only show "Create New" card if user has permission */}
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="portfolio-add-card"
          >
            <span className="portfolio-add-icon">+</span>
            <span className="portfolio-add-text">Create New Portfolio</span>
          </button>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dark" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title-dashboard">Create New Portfolio</h2>

            {createError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label className="form-label-sm">Title *</label>
                <input
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  required
                  className="form-input-dark"
                  placeholder="My Awesome Portfolio"
                />
              </div>
              <div className="form-group">
                <label className="form-label-sm">Slug *</label>
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  required
                  className="form-input-dark"
                  placeholder="my-portfolio"
                />
                <p className="form-hint">URL: /portfolio/{newSlug || 'your-slug'}</p>
              </div>
              <div className="form-group">
                <label className="form-label-sm">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="form-input-dark form-textarea"
                  placeholder="Brief description..."
                />
              </div>
              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                  }}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-modal-submit"
                >
                  {creating ? 'Creating...' : 'Create Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}