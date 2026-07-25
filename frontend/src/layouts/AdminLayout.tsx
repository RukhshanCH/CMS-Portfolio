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
  theme: Theme | null;
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
  { path: 'theme', label: '🎨 Theme', id: 'theme' },
  { path: 'hero', label: '🏠 Hero', id: 'hero' },
  { path: 'about', label: '👤 About', id: 'about' },
  { path: 'skills', label: '⭐ Skills', id: 'skills' },
  { path: 'projects', label: '🚀 Projects', id: 'projects' },
  { path: 'contact', label: '📧 Contact', id: 'contact' },
  { path: 'settings', label: '⚙️ Settings', id: 'settings' },
  { path: 'members', label: '👥 Members', id: 'members' },
  { path: 'inbox', label: '📨 Inbox', id: 'inbox' },
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
      <div style={styles.loader}>
        <div className="spinner" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (error || !data || !portfolioId) {
    return (
      <div style={styles.loader}>
        <p style={{ color: 'var(--color-danger, #ef4444)', marginBottom: 16 }}>
          {error || 'Portfolio not found or you do not have access.'}
        </p>
        <button onClick={() => navigate('/dashboard')} style={styles.button}>
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
      <div style={styles.layout}>
        {/* Mobile Toggle */}
        <button
          style={styles.mobileToggle}
          onClick={() => setSidebarOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {/* Sidebar */}
        <aside
          style={{
            ...styles.sidebar,
            transform: sidebarOpen ? 'translateX(0)' : undefined,
          }}
        >
          <div style={styles.sidebarHeader}>
            <h2 style={styles.portfolioTitle}>
              {data.portfolio?.title || 'Admin'}
            </h2>
            <span
              style={{
                ...styles.statusBadge,
                background: data.portfolio?.is_published
                  ? 'rgba(34,197,94,0.2)'
                  : 'rgba(148,163,184,0.2)',
                color: data.portfolio?.is_published ? '#22c55e' : '#94a3b8',
              }}
            >
              {data.portfolio?.is_published ? 'Published' : 'Draft'}
            </span>
          </div>

          <nav style={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={navPath(item.path)}
                onClick={() => setSidebarOpen(false)}
                style={{
                  ...styles.navItem,
                  background:
                    activeTab === item.id
                      ? 'var(--color-primary, #3b82f6)'
                      : 'transparent',
                  color:
                    activeTab === item.id
                      ? '#fff'
                      : 'var(--color-text-muted, #94a3b8)',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={styles.sidebarFooter}>
            <button
              onClick={() => {
                setInviteError(null);
                setShowInviteModal(true);
              }}
              style={styles.inviteBtn}
            >
              + Invite Member
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            style={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main style={styles.main}>
          {/* Top Bar */}
          <header style={styles.topBar}>
            <div style={styles.breadcrumbs}>
              <Link to="/dashboard" style={styles.breadcrumbLink}>
                Dashboard
              </Link>
              <span style={styles.breadcrumbSep}>/</span>
              <span style={styles.breadcrumbCurrent}>Admin</span>
            </div>
            <div style={styles.topActions}>
              <a
                href={`/portfolio/${data.portfolio?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.previewLink}
              >
                🔗 Preview
              </a>
            </div>
          </header>

          {/* Content Area */}
          <div style={styles.content}>{children}</div>
        </main>

        {/* Invite Modal */}
        {showInviteModal && (
          <div
            style={styles.modalOverlay}
            onClick={() => setShowInviteModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <div
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="invite-title" style={styles.modalTitle}>
                Invite Team Member
              </h3>
              <p style={styles.modalDesc}>
                They'll receive an email with a link to join this portfolio as
                an editor.
              </p>

              {inviteError && (
                <div style={styles.inviteError}>{inviteError}</div>
              )}

              <div style={styles.inputGroup}>
                <label htmlFor="invite-email" style={styles.label}>
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
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError(null);
                  }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleInvite(inviteEmail)}
                  disabled={inviting || !inviteEmail.trim()}
                  style={{
                    ...styles.submitBtn,
                    opacity: inviting || !inviteEmail.trim() ? 0.6 : 1,
                    cursor:
                      inviting || !inviteEmail.trim()
                        ? 'not-allowed'
                        : 'pointer',
                  }}
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

// ─── Styles ───

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--color-background, #0f172a)',
    color: 'var(--color-text, #e2e8f0)',
  },
  loader: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'var(--color-background, #0f172a)',
    color: 'var(--color-text-muted, #94a3b8)',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  mobileToggle: {
    display: 'none',
    position: 'fixed',
    top: 16,
    left: 16,
    zIndex: 200,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'var(--color-surface, #1e293b)',
    color: 'var(--color-text, #e2e8f0)',
    fontSize: '18px',
    cursor: 'pointer',
  },
  sidebar: {
    width: '260px',
    background: 'var(--color-surface, #1e293b)',
    borderRight: '1px solid var(--color-gray, #334155)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 150,
    transition: 'transform 0.25s ease',
  },
  sidebarOverlay: {
    display: 'none',
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 140,
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid var(--color-gray, #334155)',
  },
  portfolioTitle: {
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--color-text, #e2e8f0)',
    wordBreak: 'break-word',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto',
  },
  navItem: {
    padding: '10px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s',
    display: 'block',
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid var(--color-gray, #334155)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inviteBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px dashed var(--color-primary, #3b82f6)',
    background: 'transparent',
    color: 'var(--color-primary, #3b82f6)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  logoutBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'transparent',
    color: 'var(--color-text-muted, #94a3b8)',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 28px',
    borderBottom: '1px solid var(--color-gray, #334155)',
    background: 'var(--color-surface, #1e293b)',
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  breadcrumbLink: {
    color: 'var(--color-primary, #3b82f6)',
    textDecoration: 'none',
  },
  breadcrumbSep: {
    color: 'var(--color-text-muted, #94a3b8)',
  },
  breadcrumbCurrent: {
    color: 'var(--color-text-muted, #94a3b8)',
  },
  topActions: {
    display: 'flex',
    gap: '12px',
  },
  previewLink: {
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
  },
  content: {
    flex: 1,
    padding: '28px',
    overflowY: 'auto',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid var(--color-gray, #334155)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--color-text, #e2e8f0)',
  },
  modalDesc: {
    fontSize: '14px',
    color: 'var(--color-text-muted, #94a3b8)',
    margin: '0 0 20px 0',
  },
  inviteError: {
    padding: '10px 14px',
    background: 'var(--danger-bg, rgba(239,68,68,0.1))',
    border: '1px solid var(--danger-border, rgba(239,68,68,0.3))',
    borderRadius: '8px',
    color: 'var(--danger-text, #ef4444)',
    marginBottom: '16px',
    fontSize: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '20px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text, #e2e8f0)',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'var(--color-background, #0f172a)',
    color: 'var(--color-text, #e2e8f0)',
    fontSize: '15px',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'transparent',
    color: 'var(--color-text-muted, #94a3b8)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
  },
};

// Mobile media queries via injected style tag (CSS-in-JS workaround)
const mobileCSS = `
@media (max-width: 768px) {
  [data-admin-layout] .mobile-toggle { display: block !important; }
  [data-admin-layout] aside { transform: translateX(-100%); }
  [data-admin-layout] main { margin-left: 0 !important; }
  [data-admin-layout] .sidebar-overlay { display: block !important; }
}
`;
if (typeof document !== 'undefined') {
  const id = 'admin-layout-mobile';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = mobileCSS;
    document.head.appendChild(style);
  }
}