// ============================================
// admin/MembersPage.tsx — Manage Portfolio Members
// Uses useAdmin() context for portfolioId and member data
// ============================================

import { useState } from 'react';
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
      <h2 className="inbox-title">👥 Team Members</h2>
      <p className="inbox-subtitle">Manage who can edit this portfolio</p>

      {/* Current Members */}
      <div className="dashboard-section-wrap">
        <h3 className="section-title-sm">Current Members</h3>
        <div className="admin-table">
          <div className="table-header-grid">
            <span className="table-col">User</span>
            <span className="table-col">Role</span>
            <span className="table-col">Joined</span>
            <span className="text-right"></span>
          </div>

          {members.map((member) => (
            <div key={member.id} className="table-row-grid">
              <span className="table-col">
                <span className="user-badge">
                  {member.role === 'owner' ? '👑' : '👤'} {member.user_id.slice(0, 8)}...
                </span>
              </span>
              <span className="table-col">
                <span className={`role-badge ${member.role === 'owner' ? 'role-owner' : member.role === 'editor' ? 'role-editor' : 'role-viewer'}`}>
                  {member.role}
                </span>
              </span>
              <span className="table-col-muted">
                {new Date(member.invited_at).toLocaleDateString()}
              </span>
              <span className="text-right">
                {member.role !== 'owner' && (
                  <button
                    onClick={() => onRemove(member.user_id)}
                    disabled={removingId === member.user_id}
                    className="btn-outline-danger-sm"
                  >
                    {removingId === member.user_id ? '...' : 'Remove'}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {members.length === 0 && (
        <div className="dashboard-section-wrap">
          <h3 className="section-title-sm">No members yet.</h3>
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="dashboard-section-wrap">
          <h3 className="section-title-sm">Pending Invitations</h3>
          <div className="admin-table">
            <div className="table-header-grid">
              <span className="table-col">Email</span>
              <span className="table-col">Sent</span>
              <span className="table-col">Expires</span>
              <span className="text-right">Status</span>
            </div>

            {invitations.map((invite) => (
              <div key={invite.id} className="table-row-grid">
                <span className="table-col">{invite.email}</span>
                <span className="table-col-muted">
                  {new Date(invite.created_at).toLocaleDateString()}
                </span>
                <span className="table-col-muted">
                  {new Date(invite.expires_at).toLocaleDateString()}
                </span>
                <span className="text-right">
                  <span className="badge-pending">Pending</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {invitations.length === 0 && (
        <div className="dashboard-section-wrap">
          <h3 className="section-title-sm">No pending invitations.</h3>
        </div>
      )}
    </div>
  );
}