// ============================================
// layouts/AdminLayout.tsx — Portfolio-scoped Admin Wrapper
// Reads portfolioId from URL, loads data, provides context
// ============================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  useParams,
  useNavigate,
  Link,
  useLocation,
} from 'react-router-dom';
import {
  fetchAllPortfolioData,
  getPortfolioMembers,
  getPortfolioInvitations,
  inviteUser,
  removeMember,
  signOut,
  type Portfolio,
  type PortfolioData,
  type PortfolioMember,
  type Invitation,
  type Theme,
} from '../utils/supabase';

// ─── ADMIN CONTEXT ───

interface AdminContextType {
  portfolioId: string;
  portfolio: Portfolio | null;
  data: PortfolioData | null;
  theme: Theme[];
  members: PortfolioMember[];
  invitations: Invitation[];
  loading: boolean;
  refreshData: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  handleInvite: (email: string) => Promise<void>;
  handleRemoveMember: (userId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminLayout');
  return ctx;
};

// ─── NAV ITEMS ───
// Paths are route segments relative to /admin/:portfolioId

const NAV_ITEMS = [
  { path: 'dashboard', label: '📊 Dashboard', id: 'dashboard' },
  { path: 'inbox', label: '📨 Inbox', id: 'inbox' },
  { path: 'theme', label: '🎨 Theme', id: 'theme' },
  { path: 'hero', label: '🏠 Hero', id: 'hero' },
  { path: 'about', label: '👤 About', id: 'about' },
  { path: 'skills', label: '⭐ Skills', id: 'skills' },
  { path: 'projects', label: '🚀 Projects', id: 'projects' },
  { path: 'contact', label: '📧 Contact', id: 'contact' },
  { path: 'pages', label: '📄 Pages', id: 'pages' },
  { path: 'members', label: '👥 Members', id: 'members' },
  { path: 'settings', label: '⚙️ Settings', id: 'settings' },
];

// ─── ADMIN LAYOUT ───

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<PortfolioData | null>(null);
  const [members, setMembers] = useState<PortfolioMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inviteInputRef = useRef<HTMLInputElement>(null);

  // Determine active tab from the last URL segment
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSegment = pathParts[pathParts.length - 1] || '';
  const activeTab =
    NAV_ITEMS.find((item) => item.path === currentSegment)?.id || 'hero';

  const navPath = (segment: string) =>
    `/admin/${portfolioId}${segment ? `/${segment}` : ''}`;

  // ─── Data Loading ───

  const loadData = useCallback(async () => {
    if (!portfolioId) return;
    setLoading(true);
    setError(null);

    try {
      const [portfolioData, membersData, invitesData] = await Promise.all([
        fetchAllPortfolioData(portfolioId),
        getPortfolioMembers(portfolioId),
        getPortfolioInvitations(portfolioId),
      ]);

      setData(portfolioData);
      setMembers(membersData);
      setInvitations(invitesData);
    } catch (err: any) {
      console.error('AdminLayout loadData failed:', err);
      setError(err?.message || 'Failed to load portfolio data.');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    if (portfolioId) {
      loadData();
    }
  }, [portfolioId, loadData]);

  // ─── Refresh Helpers ───

  const refreshData = useCallback(async () => {
    if (!portfolioId) return;
    try {
      const portfolioData = await fetchAllPortfolioData(portfolioId);
      setData(portfolioData);
    } catch (err: any) {
      console.error('refreshData failed:', err);
    }
  }, [portfolioId]);

  const refreshMembers = useCallback(async () => {
    if (!portfolioId) return;
    try {
      const [membersData, invitesData] = await Promise.all([
        getPortfolioMembers(portfolioId),
        getPortfolioInvitations(portfolioId),
      ]);
      setMembers(membersData);
      setInvitations(invitesData);
    } catch (err: any) {
      console.error('refreshMembers failed:', err);
    }
  }, [portfolioId]);

  // ─── Invite ───

  const handleInvite = useCallback(
    async (email: string) => {
      if (!portfolioId || !email.trim()) return;

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setInviteError('Please enter a valid email address.');
        return;
      }

      setInviting(true);
      setInviteError(null);

      try {
        await inviteUser(email.trim(), portfolioId);
        await refreshMembers();
        setInviteEmail('');
        setShowInviteModal(false);
      } catch (err: any) {
        console.error('Invite failed:', err);
        setInviteError(err?.message || 'Failed to send invitation.');
      } finally {
        setInviting(false);
      }
    },
    [portfolioId, refreshMembers]
  );

  // ─── Remove Member ───

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!portfolioId) return;
      const confirmed = window.confirm(
        'Are you sure you want to remove this member?'
      );
      if (!confirmed) return;

      try {
        await removeMember(portfolioId, userId);
        await refreshMembers();
      } catch (err: any) {
        console.error('Remove member failed:', err);
        alert(err?.message || 'Failed to remove member.');
      }
    },
    [portfolioId, refreshMembers]
  );

  // ─── Logout ───

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [navigate]);

  // ─── Modal Escape Key ───

  useEffect(() => {
    if (!showInviteModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowInviteModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showInviteModal]);

  useEffect(() => {
    if (showInviteModal && inviteInputRef.current) {
      inviteInputRef.current.focus();
    }
  }, [showInviteModal]);

  // ─── Render ───

  if (loading) {
    return (
      <div className="loader-wrapper full-page admin-loader">
        <div className="spinner" />
        <p className="loader-text">Loading admin panel...</p>
      </div>
    );
  }

  if (error || !data || !portfolioId) {
    return (
      <div className="loader-wrapper full-page admin-loader">
        <p className="error-text">
          {error || 'Portfolio not found or you do not have access.'}
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const ctxValue: AdminContextType = {
    portfolioId,
    portfolio: data.portfolio,
    data,
    theme: data.theme,
    members,
    invitations,
    loading,
    refreshData,
    refreshMembers,
    handleInvite,
    handleRemoveMember,
  };

  return (
    <AdminContext.Provider value={ctxValue}>
      <div className="admin-layout">
        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setSidebarOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2 className="portfolio-title">
              {data.portfolio?.title || 'Admin'}
            </h2>
            <span
              className={`status-badge-inline ${data.portfolio?.is_published ? 'published' : 'draft'}`}
            >
              {data.portfolio?.is_published ? 'Published' : 'Draft'}
            </span>
          </div>

          <nav className="admin-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={navPath(item.path)}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              onClick={() => {
                setInviteError(null);
                setShowInviteModal(true);
              }}
              className="btn-invite"
            >
              + Invite Member
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="admin-main">
          {/* Top Bar */}
          <header className="admin-topbar">
            <div className="breadcrumbs">
              <Link to="/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Admin</span>
            </div>
            <div className="top-actions">
              <a
                href={`/portfolio/${data.portfolio?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-preview"
              >
                🔗 Preview
              </a>
            </div>
          </header>

          {/* Content Area */}
          <div className="admin-content">{children}</div>
        </main>

        {/* Invite Modal */}
        {showInviteModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowInviteModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <div
              className="modal-admin"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="invite-title" className="modal-title">
                Invite Team Member
              </h3>
              <p className="modal-desc">
                They'll receive an email with a link to join this portfolio as
                an editor.
              </p>

              {inviteError && (
                <div className="alert alert-error">{inviteError}</div>
              )}

              <div className="modal-form-group">
                <label htmlFor="invite-email" className="form-label-sm">
                  Email Address
                </label>
                <input
                  id="invite-email"
                  ref={inviteInputRef}
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInvite(inviteEmail);
                  }}
                  placeholder="colleague@example.com"
                  className="form-input"
                />
              </div>

              <div className="modal-actions-row">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError(null);
                  }}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleInvite(inviteEmail)}
                  disabled={inviting || !inviteEmail.trim()}
                  className="btn-modal-submit"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminContext.Provider>
  );
}