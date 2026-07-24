// ============================================
// components/cms/AdminDashboard.tsx — Updated for Multi-Tenant
// Uses useAdmin() for portfolio-scoped data
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../layouts/AdminLayout';

export default function AdminDashboard() {
  const { portfolio, data, members, invitations, portfolioId } = useAdmin();

  const stats = [
    { label: 'Projects', value: data?.projects?.length || 0, icon: '🚀', path: 'projects' },
    { label: 'Skills', value: data?.skills?.length || 0, icon: '⭐', path: 'skills' },
    { label: 'Team Members', value: members.length, icon: '👥', path: 'members' },
    { label: 'Pending Invites', value: invitations.length, icon: '📨', path: 'members' },
  ];

  return (
    <div>
      <h1 style={styles.title}>📊 Dashboard</h1>
      <p style={styles.subtitle}>
        Managing: <strong>{portfolio?.title}</strong> 
        <span style={styles.slug}>/{portfolio?.slug}</span>
      </p>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.path} style={styles.statCard}>
            <span style={styles.statIcon}>{stat.icon}</span>
            <span style={styles.statValue}>{stat.value}</span>
            <span style={styles.statLabel}>{stat.label}</span>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link to="hero" style={styles.actionCard}>
            <span style={styles.actionIcon}>🏠</span>
            <span style={styles.actionText}>Edit Hero</span>
          </Link>
          <Link to="about" style={styles.actionCard}>
            <span style={styles.actionIcon}>👤</span>
            <span style={styles.actionText}>Edit About</span>
          </Link>
          <Link to="theme" style={styles.actionCard}>
            <span style={styles.actionIcon}>🎨</span>
            <span style={styles.actionText}>Edit Theme</span>
          </Link>
          <Link to="settings" style={styles.actionCard}>
            <span style={styles.actionIcon}>⚙️</span>
            <span style={styles.actionText}>Site Settings</span>
          </Link>
        </div>
      </div>

      {/* Portfolio Status */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Portfolio Status</h2>
        <div style={styles.statusCard}>
          <div style={styles.statusRow}>
            <span style={styles.statusLabel}>Published</span>
            <span style={{
              ...styles.statusBadge,
              background: portfolio?.is_published ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.2)',
              color: portfolio?.is_published ? '#22c55e' : '#94a3b8',
            }}>
              {portfolio?.is_published ? 'Yes' : 'No'}
            </span>
          </div>
          <div style={styles.statusRow}>
            <span style={styles.statusLabel}>Public URL</span>
            <a 
              href={`/portfolio/${portfolio?.slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.statusLink}
            >
              /portfolio/{portfolio?.slug}
            </a>
          </div>
          <div style={styles.statusRow}>
            <span style={styles.statusLabel}>Portfolio ID</span>
            <span style={styles.statusValue}>{portfolioId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: '28px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--color-text, #e2e8f0)',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--color-text-muted, #94a3b8)',
    margin: '0 0 28px 0',
  },
  slug: {
    color: 'var(--color-primary, #3b82f6)',
    fontFamily: 'monospace',
    fontSize: '13px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    padding: '20px',
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray, #334155)',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.15s',
  },
  statIcon: {
    fontSize: '28px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--color-text, #e2e8f0)',
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--color-text-muted, #94a3b8)',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 16px 0',
    color: 'var(--color-text, #e2e8f0)',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    padding: '20px',
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray, #334155)',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    transition: 'border-color 0.15s',
  },
  actionIcon: {
    fontSize: '24px',
  },
  actionText: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-text, #e2e8f0)',
  },
  statusCard: {
    padding: '20px',
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray, #334155)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: '14px',
    color: 'var(--color-text-muted, #94a3b8)',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
  },
  statusLink: {
    color: 'var(--color-primary, #3b82f6)',
    textDecoration: 'none',
    fontSize: '14px',
  },
  statusValue: {
    fontSize: '13px',
    color: 'var(--color-text, #e2e8f0)',
    fontFamily: 'monospace',
  },
};