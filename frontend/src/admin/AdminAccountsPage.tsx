// ============================================
// admin/AdminAccountsPage.tsx — Manage Admin Accounts
// ============================================

import React, { useState, useEffect } from 'react';
import {
  getAdminUsers,
  createAdminAccount,
  updateAdminAccount,
  deactivateAdminAccount,
  type AdminUser,
} from '../utils/supabase';

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    setLoading(true);
    const data = await getAdminUsers();
    setAdmins(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!newUsername || !newEmail || !newPassword) {
      setCreateError('Username, email, and password are required.');
      return;
    }

    setCreating(true);
    const result = await createAdminAccount(
      newUsername,
      newEmail,
      newPassword,
      newFullName,
      newRole
    );

    if (result.success) {
      setCreateSuccess(`Admin account created for ${newEmail}`);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('admin');
      await loadAdmins();
      setTimeout(() => setShowCreate(false), 1500);
    } else {
      setCreateError(result.error || 'Failed to create admin account');
    }
    setCreating(false);
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    const success = await updateAdminAccount(id, {
      role: editRole,
      is_active: editActive,
    });
    if (success) {
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, role: editRole, is_active: editActive } : a
        )
      );
      setEditingId(null);
    } else {
      setError('Failed to save changes');
    }
    setSaving(false);
  }

  async function handleDeactivate(id: string, username: string) {
    if (!window.confirm(`Deactivate admin account "${username}"?`)) return;
    const success = await deactivateAdminAccount(id);
    if (success) {
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: false } : a))
      );
    } else {
      setError('Failed to deactivate account');
    }
  }

  function startEdit(admin: AdminUser) {
    setEditingId(admin.id);
    setEditRole(admin.role);
    setEditActive(admin.is_active);
    setError(null);
  }

  if (loading) {
    return (
      <div className="dashboard-section-wrap">
        <p className="text-muted">Loading admin accounts...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="inbox-title">👤 Admin Accounts</h2>
          <p className="inbox-subtitle">Manage who has access to the admin panel</p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setCreateError(null);
            setCreateSuccess(null);
          }}
          className="btn btn-primary"
        >
          + New Admin
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="dashboard-section-wrap">
        <div className="admin-table">
          <div className="table-header-grid">
            <span className="table-col">User</span>
            <span className="table-col">Username</span>
            <span className="table-col">Role</span>
            <span className="table-col">Status</span>
            <span className="table-col">Last Login</span>
            <span className="text-right"></span>
          </div>

          {admins.map((admin) => (
            <div key={admin.id} className="table-row-grid">
              <span className="table-col">
                <span className="user-badge">{admin.full_name || admin.email || admin.username}</span>
                <br />
                <span className="text-muted" style={{ fontSize: 12 }}>{admin.email}</span>
              </span>

              <span className="table-col">{admin.username}</span>

              <span className="table-col">
                {editingId === admin.id ? (
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="form-input"
                    style={{ width: 140 }}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="support">Support</option>
                  </select>
                ) : (
                  <span className={`role-badge ${admin.role === 'super_admin' ? 'role-owner' : admin.role === 'admin' ? 'role-editor' : 'role-viewer'}`}>
                    {admin.role}
                  </span>
                )}
              </span>

              <span className="table-col">
                {editingId === admin.id ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                    />
                    {editActive ? 'Active' : 'Inactive'}
                  </label>
                ) : (
                  <span className={`badge-sm ${admin.is_active ? 'badge-success' : 'badge-muted'}`}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </span>
                )}
              </span>

              <span className="table-col-muted">
                {admin.last_login
                  ? new Date(admin.last_login).toLocaleDateString()
                  : 'Never'}
              </span>

              <span className="text-right">
                {editingId === admin.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(admin.id)}
                      disabled={saving}
                      className="btn-success-sm"
                      style={{ marginRight: 8 }}
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-outline-danger-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(admin)}
                      className="btn-outline-sm"
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    {admin.is_active && (
                      <button
                        onClick={() => handleDeactivate(admin.id, admin.username)}
                        className="btn-outline-danger-sm"
                      >
                        Deactivate
                      </button>
                    )}
                  </>
                )}
              </span>
            </div>
          ))}
        </div>

        {admins.length === 0 && (
          <p className="text-muted">No admin accounts found.</p>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-dark" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title-dashboard">Create Admin Account</h2>

            {createError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>{createError}</div>
            )}
            {createSuccess && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>{createSuccess}</div>
            )}

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label className="form-label-sm">Username *</label>
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  className="form-input-dark"
                  placeholder="admin_jane"
                />
              </div>
              <div className="form-group">
                <label className="form-label-sm">Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="form-input-dark"
                  placeholder="jane@company.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label-sm">Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input-dark"
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label className="form-label-sm">Full Name</label>
                <input
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="form-input-dark"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="form-group">
                <label className="form-label-sm">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="form-input-dark"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-modal-submit"
                >
                  {creating ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}