// ============================================
// layouts/AdminPanelLayout.tsx — Super Admin Panel Wrapper
// Checks if current user is in admin_users table
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isCurrentUserAdmin, signOut } from '../utils/supabase';

interface AdminPanelLayoutProps {
    children: React.ReactNode;
}

const ADMIN_NAV = [
    { path: '/admin-panel', label: '📊 Overview', exact: true },
    { path: '/admin-panel/accounts', label: '👤 Admin Accounts' },
    { path: '/admin-panel/users', label: '👥 User Permissions' },
];

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    async function checkAdmin() {
        const admin = await isCurrentUserAdmin();
        setIsAdmin(admin);
        setChecking(false);
        if (!admin) {
            // Not an admin — redirect to dashboard
            navigate('/dashboard', { replace: true });
        }
    }

    async function handleLogout() {
        await signOut();
        navigate('/login');
    }

    if (checking) {
        return (
            <div className="loader-wrapper full-page">
                <div className="spinner" />
                <p className="loader-text">Checking admin access...</p>
            </div>
        );
    }

    if (!isAdmin) return null; // Will redirect

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2 className="portfolio-title">Super Admin</h2>
                    <span className="status-badge-inline published">Admin Panel</span>
                </div>

                <nav className="admin-nav">
                    {ADMIN_NAV.map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/dashboard" className="btn-ghost-sm" style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}>
                        ← Back to Dashboard
                    </Link>
                    <button onClick={handleLogout} className="btn-logout">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="breadcrumbs">
                        <span className="breadcrumb-current">Super Admin</span>
                        <span className="breadcrumb-sep">/</span>
                        <span className="breadcrumb-current">
                            {ADMIN_NAV.find(n => location.pathname === n.path || (!n.exact && location.pathname.startsWith(n.path)))?.label.replace(/^[^\s]+\s/, '') || 'Overview'}
                        </span>
                    </div>
                </header>
                <div className="admin-content">{children}</div>
            </main>
        </div>
    );
}