// ============================================
// admin/MembersPage.tsx — Manage Portfolio Members
// Uses useAdmin() context for portfolioId and member data
// ============================================

import React, { useState } from 'react';
import { useAdmin } from '../layouts/AdminLayout';

export default function MembersPage() {
  const { members, invitations, handleRemoveMember } = useAdmin();
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function onRemove(userId: string) {
    if (!confirm('Remove this member from the portfolio?')) return;
    setRemovingId(userId);
    await handleRemoveMember(userId);
    setRemovingId(null);
  }

  return (
    <div>
      <h2 style={styles.title}>👥 Team Members</h2>
      <p style={styles.subtitle}>Manage who can edit this portfolio</p>

      {/* Current Members */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Current Members</h3>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={styles.col}>User</span>
            <span style={styles.col}>Role</span>
            <span style={styles.col}>Joined</span>
            <span style={styles.colAction}></span>
          </div>

          {members.map((member) => (
            <div key={member.id} style={styles.tableRow}>
              <span style={styles.col}>
                <span style={styles.userBadge}>
                  {member.role === 'owner' ? '👑' : '👤'} {member.user_id.slice(0, 8)}...
                </span>
              </span>
              <span style={styles.col}>
                <span style={{
                  ...styles.roleBadge,
                  background: member.role === 'owner' 
                    ? 'rgba(251,191,36,0.2)' 
                    : member.role === 'editor'
                    ? 'rgba(59,130,246,0.2)'
                    : 'rgba(148,163,184,0.2)',
                  color: member.role === 'owner' 
                    ? '#fbbf24' 
                    : member.role === 'editor'
                    ? '#3b82f6'
                    : '#94a3b8',
                }}>
                  {member.role}
                </span>
              </span>
              <span style={styles.colMuted}>
                {new Date(member.invited_at).toLocaleDateString()}
              </span>
              <span style={styles.colAction}>
                {member.role !== 'owner' && (
                  <button
                    onClick={() => onRemove(member.user_id)}
                    disabled={removingId === member.user_id}
                    style={styles.removeBtn}
                  >
                    {removingId === member.user_id ? '...' : 'Remove'}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pending Invitations</h3>
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={styles.col}>Email</span>
              <span style={styles.col}>Sent</span>
              <span style={styles.col}>Expires</span>
              <span style={styles.colAction}>Status</span>
            </div>

            {invitations.map((invite) => (
              <div key={invite.id} style={styles.tableRow}>
                <span style={styles.col}>{invite.email}</span>
                <span style={styles.colMuted}>
                  {new Date(invite.created_at).toLocaleDateString()}
                </span>
                <span style={styles.colMuted}>
                  {new Date(invite.expires_at).toLocaleDateString()}
                </span>
                <span style={styles.colAction}>
                  <span style={styles.pendingBadge}>Pending</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--color-text, #e2e8f0)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted, #94a3b8)',
    margin: '0 0 28px 0',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 16px 0',
    color: 'var(--color-text, #e2e8f0)',
  },
  table: {
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray, #334155)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 100px',
    padding: '14px 20px',
    background: 'rgba(255,255,255,0.03)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-muted, #94a3b8)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 100px',
    padding: '14px 20px',
    borderTop: '1px solid var(--color-gray, #334155)',
    alignItems: 'center',
    fontSize: '14px',
  },
  col: {
    color: 'var(--color-text, #e2e8f0)',
  },
  colMuted: {
    color: 'var(--color-text-muted, #94a3b8)',
    fontSize: '13px',
  },
  colAction: {
    textAlign: 'right',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  pendingBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    background: 'rgba(245,158,11,0.2)',
    color: '#f59e0b',
  },
  removeBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    fontSize: '12px',
    cursor: 'pointer',
  },
};