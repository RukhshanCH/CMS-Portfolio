// ============================================
// pages/AuthPage.tsx — Login Only (FIXED)
// No public sign-up. Accounts are invite/admin-only.
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, getSession } from '../utils/supabase';

// Whitelist-safe redirect validator
function safeRedirect(url: string | null): string {
  if (!url) return '/dashboard';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return '/dashboard';
  }
  if (!url.startsWith('/')) return '/dashboard';
  return url;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get('redirect'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    checkExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkExistingSession() {
    const session = await getSession();
    if (session) {
      const pendingToken = sessionStorage.getItem('pending_invite_token');
      if (pendingToken) {
        navigate(`/invite/${pendingToken}`, { replace: true });
        return;
      }
      navigate(redirectTo, { replace: true });
    }
    setCheckingSession(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        let msg = signInError.message;
        if (signInError.message.includes('Invalid login credentials')) {
          msg = 'Invalid email or password.';
        }
        if (signInError.message.includes('Email not confirmed')) {
          msg = 'Email not confirmed. Please check your inbox for the confirmation link.';
        }
        throw new Error(msg);
      }

      if (data.session) {
        const pendingToken = sessionStorage.getItem('pending_invite_token');
        if (pendingToken) {
          navigate(`/invite/${pendingToken}`, { replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
      } else {
        throw new Error('No session returned. Please try again.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="spinner-box">
            <div className="spinner" />
          </div>
          <p className="auth-text">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-narrow shadow-card-sm">
        <h1 className="auth-title-lg">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to manage your portfolios</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="form-input-dark"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="form-input-dark"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-note" style={{ marginTop: 20, textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: 13, color: '#64748b' }}>
            Need an account? Accounts are invite-only.
          </p>
          <p className="text-muted" style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Contact your admin or check your email for an invitation link.
          </p>
        </div>
      </div>
    </div>
  );
}