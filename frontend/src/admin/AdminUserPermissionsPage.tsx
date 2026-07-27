// ============================================
// admin/AdminUsersPage.tsx — Manage Users
// Admin-only: toggle can_create_portfolios, set max_portfolios
// ============================================

import { useState, useEffect } from 'react';
import {
    supabase,
    getAllProfiles,
    updateUserPermissions,
    getCurrentUser,
} from '../utils/supabase';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    can_create_portfolios: boolean;
    max_portfolios: number;
    created_at: string;
}

export default function AdminUserPermissionsPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMax, setEditMax] = useState<number>(0);
    const [editCanCreate, setEditCanCreate] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    async function checkAdminAndLoad() {
        setCheckingAdmin(true);
        try {
            const user = await getCurrentUser();
            if (!user) {
                setError('Not authenticated');
                setCheckingAdmin(false);
                return;
            }

            // Check if current user is admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                setIsAdmin(false);
                setCheckingAdmin(false);
                return;
            }

            setIsAdmin(true);
            await loadUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCheckingAdmin(false);
            setLoading(false);
        }
    }

    async function loadUsers() {
        setLoading(true);
        const data = await getAllProfiles();
        setUsers(data as UserProfile[]);
        setLoading(false);
    }

    async function handleSave(userId: string) {
        setSaving(true);
        const success = await updateUserPermissions(userId, {
            can_create_portfolios: editCanCreate,
            max_portfolios: editMax,
        });
        if (success) {
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? { ...u, can_create_portfolios: editCanCreate, max_portfolios: editMax }
                        : u
                )
            );
            setEditingId(null);
        } else {
            setError('Failed to save changes');
        }
        setSaving(false);
    }

    function startEdit(user: UserProfile) {
        setEditingId(user.id);
        setEditMax(user.max_portfolios || 0);
        setEditCanCreate(user.can_create_portfolios === true);
        setError(null);
    }

    if (checkingAdmin) {
        return (
            <div className="dashboard-section-wrap">
                <p className="text-muted">Checking permissions...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="dashboard-section-wrap">
                <h2 className="inbox-title">Access Denied</h2>
                <p className="text-muted">You do not have permission to view this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-section-wrap">
                <p className="text-muted">Loading users...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="inbox-title">👥 User Permissions</h2>
            <p className="inbox-subtitle">Control portfolio creation rights per user</p>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="dashboard-section-wrap">
                <div className="admin-table">
                    <div className="table-header-grid">
                        <span className="table-col">User</span>
                        <span className="table-col">Can Create</span>
                        <span className="table-col">Max Portfolios</span>
                        <span className="table-col">Joined</span>
                        <span className="text-right"></span>
                    </div>

                    {users.map((user) => (
                        <div key={user.id} className="table-row-grid">
                            <span className="table-col">
                                <span className="user-badge">
                                    {user.full_name || user.email}
                                </span>
                                <br />
                                <span className="text-muted" style={{ fontSize: 12 }}>
                                    {user.email}
                                </span>
                            </span>

                            <span className="table-col">
                                {editingId === user.id ? (
                                    <label className="toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="checkbox"
                                            checked={editCanCreate}
                                            onChange={(e) => setEditCanCreate(e.target.checked)}
                                        />
                                        <span>{editCanCreate ? 'Yes' : 'No'}</span>
                                    </label>
                                ) : (
                                    <span className={`badge-sm ${user.can_create_portfolios ? 'badge-success' : 'badge-muted'}`}>
                                        {user.can_create_portfolios ? 'Yes' : 'No'}
                                    </span>
                                )}
                            </span>

                            <span className="table-col">
                                {editingId === user.id ? (
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={editMax}
                                        onChange={(e) => setEditMax(parseInt(e.target.value) || 0)}
                                        className="form-input"
                                        style={{ width: 80 }}
                                    />
                                ) : (
                                    <span>{user.max_portfolios || 0}</span>
                                )}
                            </span>

                            <span className="table-col-muted">
                                {new Date(user.created_at).toLocaleDateString()}
                            </span>

                            <span className="text-right">
                                {editingId === user.id ? (
                                    <>
                                        <button
                                            onClick={() => handleSave(user.id)}
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
                                    <button
                                        onClick={() => startEdit(user)}
                                        className="btn-outline-sm"
                                    >
                                        Edit
                                    </button>
                                )}
                            </span>
                        </div>
                    ))}
                </div>

                {users.length === 0 && (
                    <p className="text-muted">No users found.</p>
                )}
            </div>
        </div>
    );
}