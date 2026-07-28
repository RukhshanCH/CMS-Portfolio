// ============================================
// components/cms/AdminDashboard.tsx — Multi-Tenant Dashboard
// ============================================

import { Link } from 'react-router-dom';
import { useAdmin } from '../../layouts/AdminLayout';

export default function AdminDashboard() {
  const { portfolio, data, members, invitations, portfolioId } = useAdmin();

  // Guard: if context is still settling, show nothing (AdminLayout handles loading)
  if (!portfolio) {
    return (
      <div className="dashboard-empty">
        Portfolio data unavailable.
      </div>
    );
  }

  const navPath = (segment: string) =>
    `/admin/${portfolioId}${segment ? `/${segment}` : ''}`;

  const stats = [
    {
      label: 'Projects',
      value: data?.projects?.length ?? 0,
      icon: '🚀',
      path: 'projects',
    },
    {
      label: 'Skills',
      value: data?.skills?.length ?? 0,
      icon: '⭐',
      path: 'skills',
    },
    {
      label: 'Team Members',
      value: members.length,
      icon: '👥',
      path: 'members',
    },
    {
      label: 'Pending Invites',
      value: invitations.filter((i) => !i.is_accepted).length,
      icon: '📨',
      path: 'members',
    },
  ];

  const quickActions = [
    { path: 'hero', icon: '🏠', text: 'Edit Hero' },
    { path: 'about', icon: '👤', text: 'Edit About' },
    { path: 'theme', icon: '🎨', text: 'Edit Theme' },
    { path: 'settings', icon: '⚙️', text: 'Site Settings' },
  ];

  return (
    <div>
      <h1 className="dashboard-title">📊 Dashboard</h1>
      <p className="dashboard-subtitle">
        Managing: <strong>{portfolio.title}</strong>
        <span className="dashboard-slug">/{portfolio.slug}</span>
      </p>

      {/* Stats Grid */}
      <div className="stats-grid-sm">
        {stats.map((stat) => (
          <Link key={stat.label} to={navPath(stat.path)} className="stat-card-link">
            <span className="stat-icon-lg">{stat.icon}</span>
            <span className="stat-value-lg">{stat.value}</span>
            <span className="stat-label-sm">{stat.label}</span>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section-wrap">
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action) => (
            <Link key={action.path} to={navPath(action.path)} className="action-card-link">
              <span className="action-icon">{action.icon}</span>
              <span className="action-text">{action.text}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Portfolio Status */}
      <div className="dashboard-section-wrap">
        <h2 className="dashboard-section-title">Portfolio Status</h2>
        <div className="status-card">
          <div className="status-row">
            <span className="status-label">Published</span>
            <span
              className={`badge-sm ${portfolio.is_published ? 'badge-success' : 'badge-muted'}`}
            >
              {portfolio.is_published ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Public URL</span>
            <a
              href={`/portfolio/${portfolio.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="status-link"
            >
              /portfolio/{portfolio.slug}
            </a>
          </div>
          <div className="status-row">
            <span className="status-label">Portfolio ID</span>
            <span className="status-value-mono">{portfolioId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}