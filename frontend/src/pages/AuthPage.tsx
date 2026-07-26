// ============================================
// pages/AuthPage.tsx — Login & Signup (FIXED)
// Uses Supabase Auth with proper redirect handling
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, signUp, getSession } from '../utils/supabase';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check if already logged in on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    const session = await getSession();
    if (session) {
      console.log('Already logged in, redirecting to', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (!isLogin) {
        // SIGN UP
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { data, error: signUpError } = await signUp(email, password);

        if (signUpError) throw signUpError;

        // Check if user already exists (identities array empty)
        if (data.user?.identities?.length === 0) {
          setMessage('Account already exists. Please sign in.');
          setIsLogin(true);
          setLoading(false);
          return;
        }

        // If email confirmation is required, session will be null
        if (!data.session) {
          setMessage('Check your email for confirmation link, or sign in if email confirmation is disabled.');
          setLoading(false);
          return;
        }

        // Auto-login after signup (if email confirmation disabled)
        console.log('Signup successful, session exists, redirecting...');
        navigate(redirectTo, { replace: true });

      } else {
        // SIGN IN
        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
          // Provide helpful error messages
          let msg = signInError.message;
          if (signInError.message.includes('Invalid login credentials')) {
            msg = 'Invalid email or password.';
          }
          if (signInError.message.includes('Email not confirmed')) {
            msg = 'Email not confirmed. Check your inbox, or ask the admin to disable email confirmation in Supabase settings.';
          }
          throw new Error(msg);
        }

        if (data.session) {
          console.log('Login successful, session:', data.session.user?.email);
          console.log('Redirecting to:', redirectTo);
          // Small delay to ensure session is propagated
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 100);
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