// ============================================
// admin/MembersPage.tsx — Manage Portfolio Members (FIXED)
// Uses useAdmin() context for portfolioId and member data
// ============================================

import { useState, useMemo } from 'react';
import { useAdmin } from '../layouts/AdminLayout';

// Extended member type that includes accepted invitation info
interface DisplayMember {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_at: string;
  user_email?: string;
  user_name?: string;
  accepted_from_invite?: boolean;
  invite_accepted_at?: string | null;
  isInviteeRow?: boolean;
}

export default function MembersPage() {
  const { members, invitations, handleRemoveMember } = useAdmin();
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function onRemove(userId: string) {
    if (!confirm('Remove this member from the portfolio?')) return;
    setRemovingId(userId);
    await handleRemoveMember(userId);
    setRemovingId(null);
  }

  const pendingInvitations = invitations.filter((i) => !i.is_accepted);
  const acceptedInvitations = invitations.filter((i) => i.is_accepted);

  // FIX A: Merge accepted invitations into members display
  const allMembers: DisplayMember[] = useMemo(() => {
    const baseMembers: DisplayMember[] = (members || []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      invited_at: m.invited_at,
      user_email: m.user_email || m.user_id,
      user_name: m.user_name,
    }));

    // Append accepted invitations that might not yet appear in members
    // (e.g., if RPC hasn't created the row yet, or if we want to show invite history)
    const acceptedRows: DisplayMember[] = acceptedInvitations.map((inv) => ({
      id: `accepted-${inv.id}`,
      user_id: inv.email,
      role: 'viewer', // Default role for invitees until explicitly changed
      invited_at: inv.accepted_at || inv.created_at,
      user_email: inv.email,
      user_name: inv.email,
      accepted_from_invite: true,
      invite_accepted_at: inv.accepted_at,
      isInviteeRow: true,
    }));

    // Merge: base members take precedence, but enrich with invite info if email matches
    const memberByEmail = new Map<string, DisplayMember>();
    for (const m of baseMembers) {
      const key = (m.user_email || m.user_id).toLowerCase();
      memberByEmail.set(key, m);
    }

    // Enrich existing members with invite acceptance info
    for (const inv of acceptedInvitations) {
      const key = inv.email.toLowerCase();
      const existing = memberByEmail.get(key);
      if (existing) {
        existing.accepted_from_invite = true;
        existing.invite_accepted_at = inv.accepted_at;
      } else {
        memberByEmail.set(key, acceptedRows.find(r => r.user_email?.toLowerCase() === key)!);
      }
    }

    return Array.from(memberByEmail.values()).sort(
      (a, b) => new Date(b.invited_at).getTime() - new Date(a.invited_at).getTime()
    );
  }, [members, acceptedInvitations]);

  return (
    <div>
      <h2 className="inbox-title">👥 Team Members</h2>
      <p className="inbox-subtitle">Manage who can edit this portfolio</p>

      {/* Current Members + Accepted Invitations */}
      <div className="dashboard-section-wrap">
        <h3 className="section-title-sm">
          Current Members {allMembers.length > 0 && <span className="count-badge">({allMembers.length})</span>}
        </h3>
        <div className="admin-table">
          <div className="table-header-grid">
            <span className="table-col">User</span>
            <span className="table-col">Role</span>
            <span className="table-col">Joined</span>
            <span className="text-right"></span>
          </div>

          {allMembers.map((member) => (
            <div key={member.id} className="table-row-grid">
              <span className="table-col">
                <span className="user-badge" title={member.user_email}>
                  {member.role === 'owner' ? '👑' : '👤'}{' '}
                  {member.user_name || member.user_email || member.user_id}
                </span>
                {member.accepted_from_invite && (
                  <span className="badge-accepted" title={`Accepted on ${member.invite_accepted_at ? new Date(member.invite_accepted_at).toLocaleDateString() : 'unknown'}`}>
                    via invite
                  </span>
                )}
              </span>
              <span className="table-col">
                <span className={`role-badge ${member.role === 'owner' ? 'role-owner' : member.role === 'editor' ? 'role-editor' : 'role-viewer'}`}>
                  {member.role}
                </span>
              </span>
              <span className="table-col-muted">
                {member.invited_at ? new Date(member.invited_at).toLocaleDateString() : 'N/A'}
              </span>
              <span className="text-right">
                {member.role !== 'owner' && !member.isInviteeRow && (
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

      {allMembers.length === 0 && (
        <div className="dashboard-section-wrap">
          <p className="text-muted">No members yet. Invite someone to collaborate!</p>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="dashboard-section-wrap">
          <h3 className="section-title-sm">
            Pending Invitations <span className="count-badge">({pendingInvitations.length})</span>
          </h3>
          <div className="admin-table">
            <div className="table-header-grid">
              <span className="table-col">Email</span>
              <span className="table-col">Sent</span>
              <span className="table-col">Expires</span>
              <span className="text-right">Status</span>
            </div>

            {pendingInvitations.map((invite) => (
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

      {pendingInvitations.length === 0 && (
        <div className="dashboard-section-wrap">
          <p className="text-muted">No pending invitations.</p>
        </div>
      )}
    </div>
  );
}