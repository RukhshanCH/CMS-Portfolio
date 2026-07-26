// ============================================
// pages/InvitePage.tsx — Accept Invitation (FIXED)
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation, getCurrentUser, signIn, signUp } from '../utils/supabase';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<'checking' | 'login' | 'accepting' | 'success' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  // FIX: Explicit gate to prevent any flash before auth check completes
  const [sessionChecked, setSessionChecked] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthAndAccept();
  }, []);

  async function checkAuthAndAccept() {
    const user = await getCurrentUser();

    if (user) {
      setStep('accepting');
      const success = await acceptInvitation(token!);
      if (success) {
        setStep('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setStep('error');
        setErrorMsg('Invalid or expired invitation link.');
      }
    } else {
      setStep('login');
      const inviteEmail = searchParams.get('email');
      if (inviteEmail) setEmail(inviteEmail);
    }
    setSessionChecked(true);
  }

  async function handleAuthAndAccept(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let authError = null;

      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await signUp(email, password);
        authError = error;
        if (!error) {
          setErrorMsg('Account created! Please check your email to confirm, then come back to this link.');
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn(email, password);
        authError = error;
      }

      if (authError) throw authError;

      setStep('accepting');
      const success = await acceptInvitation(token!);

      if (success) {
        setStep('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        throw new Error('Failed to accept invitation. It may be expired or already used.');
      }
    } catch (err: any) {
      setStep('login');
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // FIX: Block everything until the initial auth check is done
  if (!sessionChecked) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="spinner-box">
            <div className="spinner" />
          </div>
          <p className="auth-text">Checking invitation...</p>
        </div>
      </div>
    );
  }

  if (step === 'accepting') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="spinner-box">
            <div className="spinner" />
          </div>
          <p className="auth-text">Accepting invitation...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon">✅</div>
          <h2 className="auth-title">Invitation Accepted!</h2>
          <p className="auth-text">
            You've been added to the portfolio. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon">❌</div>
          <h2 className="auth-title">Invitation Error</h2>
          <p className="auth-error-text">{errorMsg}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary btn-block">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Login/Signup form
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">📨</div>
        <h2 className="auth-title">You're Invited!</h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Sign in to accept this portfolio invitation'
            : 'Create an account to join this portfolio'}
        </p>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleAuthAndAccept} className="auth-form">
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
              ? 'Processing...'
              : (isLogin ? 'Sign In & Accept' : 'Create Account & Accept')
            }
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
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