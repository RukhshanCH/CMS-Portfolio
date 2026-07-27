// ============================================
// admin/AdminOverviewPage.tsx — Admin Panel Overview
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPortfolios: 0,
        totalAdmins: 0,
        totalInvites: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            const [
                { count: users },
                { count: portfolios },
                { count: admins },
                { count: invites },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('portfolios').select('*', { count: 'exact', head: true }),
                supabase.from('admin_users').select('*', { count: 'exact', head: true }),
                supabase.from('invitations').select('*', { count: 'exact', head: true }),
            ]);

            setStats({
                totalUsers: users || 0,
                totalPortfolios: portfolios || 0,
                totalAdmins: admins || 0,
                totalInvites: invites || 0,
            });
        } catch (err) {
            console.error('Stats load error:', err);
        } finally {
            setLoading(false);
        }
    }

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, path: '/admin-panel/users', color: '#3b82f6' },
        { label: 'Total Portfolios', value: stats.totalPortfolios, path: '/dashboard', color: '#22c55e' },
        { label: 'Admin Accounts', value: stats.totalAdmins, path: '/admin-panel/accounts', color: '#f59e0b' },
        { label: 'Pending Invites', value: stats.totalInvites, path: '/dashboard', color: '#ef4444' },
    ];

    return (
        <div>
            <h2 className="inbox-title">📊 Admin Overview</h2>
            <p className="inbox-subtitle">System-wide stats at a glance</p>

            {loading ? (
                <p className="text-muted">Loading stats...</p>
            ) : (
                <div className="portfolio-grid" style={{ marginTop: 24 }}>
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            to={card.path}
                            className="portfolio-card"
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="portfolio-card-header">
                                <h3 className="portfolio-card-title" style={{ fontSize: 32, color: card.color }}>
                                    {card.value}
                                </h3>
                            </div>
                            <p className="portfolio-desc">{card.label}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}