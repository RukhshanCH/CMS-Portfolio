// ============================================
// pages/InvitePage.tsx — Accept Invitation (FIXED)
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  acceptInvitation,
  getCurrentUser,
  getInvitationByToken,
  getSession,
  signIn,
  signUp,
} from '../utils/supabase';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<'checking' | 'login' | 'accepting' | 'success' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);

  // FIX: Default to Sign Up since most invitees don't have accounts yet
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // NEW: Store invitation details for validation
  const [invitation, setInvitation] = useState<Awaited<ReturnType<typeof getInvitationByToken>>>(null);

  useEffect(() => {
    // Persist token so user can return after email confirmation
    if (token) {
      sessionStorage.setItem('pending_invite_token', token);
    }
    loadInvitationAndCheckAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadInvitationAndCheckAuth() {
    if (!token) {
      setStep('error');
      setErrorMsg('Invalid invitation link: no token provided.');
      setSessionChecked(true);
      return;
    }

    // NEW: Pre-fetch invitation to validate it
    const inv = await getInvitationByToken(token);
    setInvitation(inv);

    if (!inv) {
      setStep('error');
      setErrorMsg('This invitation link is invalid, expired, or has already been used.');
      setSessionChecked(true);
      return;
    }

    if (inv.is_accepted) {
      setStep('error');
      setErrorMsg('This invitation has already been accepted.');
      setSessionChecked(true);
      return;
    }

    if (new Date(inv.expires_at) < new Date()) {
      setStep('error');
      setErrorMsg('This invitation has expired.');
      setSessionChecked(true);
      return;
    }

    // Pre-fill email from invitation
    setEmail(inv.email);

    const user = await getCurrentUser();

    if (user) {
      // NEW: Validate that logged-in user's email matches invitation email
      if (user.email?.toLowerCase() !== inv.email.toLowerCase()) {
        setStep('error');
        setErrorMsg(
          `You are signed in as ${user.email}, but this invitation was sent to ${inv.email}. Please sign out and use the correct account.`
        );
        setSessionChecked(true);
        return;
      }

      setStep('accepting');
      const success = await acceptInvitation(token);
      if (success) {
        setStep('success');
        sessionStorage.removeItem('pending_invite_token');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setStep('error');
        setErrorMsg('Failed to accept invitation. It may have expired or already been used.');
      }
    } else {
      setStep('login');
      // Also check URL param for email fallback
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
      // NEW: Validate email matches invitation before proceeding
      if (invitation && email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new Error(`This invitation was sent to ${invitation.email}. Please use that email address.`);
      }

      let authError = null;

      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await signUp(email, password);
        authError = error;

        if (!error) {
          // FIX: Check if a session was created immediately (email confirmation disabled)
          const session = await getSession();
          if (session) {
            // User is signed in immediately — proceed to accept
            setStep('accepting');
            const success = await acceptInvitation(token!);
            if (success) {
              setStep('success');
              sessionStorage.removeItem('pending_invite_token');
              setTimeout(() => navigate('/dashboard'), 2000);
            } else {
              throw new Error('Failed to accept invitation. It may be expired or already used.');
            }
            setLoading(false);
            return;
          }

          // Email confirmation required — tell user to check email
          setErrorMsg('Account created! Please check your email to confirm, then come back to this link.');
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn(email, password);
        authError = error;
      }

      if (authError) throw authError;

      // After sign-in, accept the invitation
      setStep('accepting');
      const success = await acceptInvitation(token!);

      if (success) {
        setStep('success');
        sessionStorage.removeItem('pending_invite_token');
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
        <p className="auth-hint" style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          {isLogin
            ? 'Already have an account? Enter your credentials above.'
            : 'New here? Pick a password and you are in!'}
        </p>

        {invitation?.portfolios?.title && (
          <p className="auth-portfolio-name">
            Portfolio: <strong>{invitation.portfolios.title}</strong>
          </p>
        )}

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
              // Lock email to invitation email
              readOnly={!!invitation}
              style={invitation ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
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