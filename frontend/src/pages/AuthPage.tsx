// ============================================
// pages/AuthPage.tsx — Login & Signup (FIXED)
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, signUp, getSession } from '../utils/supabase';

// FIX: Whitelist-safe redirect validator
function safeRedirect(url: string | null): string {
  if (!url) return '/dashboard';
  // Only allow relative paths or same-origin absolute paths
  // Reject protocol-relative (//evil.com) and absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return '/dashboard';
  }
  // Must start with /
  if (!url.startsWith('/')) return '/dashboard';
  return url;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get('redirect'));

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    checkExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkExistingSession() {
    const session = await getSession();
    if (session) {
      // FIX: If there's a pending invite token, redirect there first
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
    setMessage(null);
    setLoading(true);

    try {
      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { data, error: signUpError } = await signUp(email, password);

        if (signUpError) throw signUpError;

        if (data.user?.identities?.length === 0) {
          setMessage('Account already exists. Please sign in.');
          setIsLogin(true);
          setLoading(false);
          return;
        }

        if (!data.session) {
          // FIX: Clearer message for email confirmation flow
          setMessage('Account created! Please check your email and click the confirmation link.');
          setLoading(false);
          return;
        }

        // Session exists immediately (email confirmation disabled)
        // FIX: Check for pending invite token before generic redirect
        const pendingToken = sessionStorage.getItem('pending_invite_token');
        if (pendingToken) {
          navigate(`/invite/${pendingToken}`, { replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }

      } else {
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
          // FIX: Check for pending invite token before generic redirect
          const pendingToken = sessionStorage.getItem('pending_invite_token');
          if (pendingToken) {
            navigate(`/invite/${pendingToken}`, { replace: true });
          } else {
            navigate(redirectTo, { replace: true });
          }
        } else {
          throw new Error('No session returned. Please try again.');
        }
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
        <h1 className="auth-title-lg">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="auth-subtitle">
          {isLogin
            ? 'Sign in to manage your portfolios'
            : 'Sign up to start building your portfolio'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

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

          {!isLogin && (
            <div className="form-group">
              <label className="form-label-sm">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input-dark"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading
              ? (isLogin ? 'Signing in...' : 'Creating account...')
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className="btn-link"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}