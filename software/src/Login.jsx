import React, { useRef, useState } from 'react';
import heroArt from './assets/mindmate-hero.jpg';

const PASSKEY_LENGTH = 4;
const emptyDigits = () => Array(PASSKEY_LENGTH).fill('');

function BrandMark({ dark = false }) {
  return (
    <span className={`mm-mark ${dark ? 'dark' : 'light'}`} aria-hidden="true">
      m<i />
    </span>
  );
}

function StudentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="3" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login({ api, onAuth }) {
  const [mode, setMode] = useState('passkey');
  const [role, setRole] = useState('student');
  const [digits, setDigits] = useState(emptyDigits);
  const [showPasskey, setShowPasskey] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [regRole, setRegRole] = useState('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regAdminKey, setRegAdminKey] = useState('');
  const [regConsent, setRegConsent] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const slotRefs = useRef([]);

  const switchMode = nextMode => {
    setMode(nextMode);
    setError('');
  };

  const selectRole = nextRole => {
    setRole(nextRole);
    setError('');
    const firstEmpty = digits.findIndex(d => !d);
    const target = firstEmpty === -1 ? 0 : firstEmpty;
    requestAnimationFrame(() => slotRefs.current[target]?.focus());
  };

  const fillDemoPasskey = (targetRole, code) => {
    setRole(targetRole);
    setDigits(code.split(''));
    setError('');
    requestAnimationFrame(() => slotRefs.current[PASSKEY_LENGTH - 1]?.focus());
  };

  const handleDigitChange = (index, rawValue) => {
    let cleaned = rawValue.replace(/\D/g, '');
    setError('');
    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    if (cleaned.length === 2 && digits[index]) {
      cleaned = cleaned[0] === digits[index] ? cleaned[1] : cleaned[0];
    }

    const chars = cleaned.slice(0, PASSKEY_LENGTH - index).split('');
    const next = [...digits];
    chars.forEach((ch, offset) => {
      next[index + offset] = ch;
    });
    setDigits(next);

    const nextFocus = Math.min(index + chars.length, PASSKEY_LENGTH - 1);
    slotRefs.current[nextFocus]?.focus();
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        e.preventDefault();
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        slotRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      slotRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < PASSKEY_LENGTH - 1) {
      e.preventDefault();
      slotRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = e => {
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, PASSKEY_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = emptyDigits();
    pasted.split('').forEach((ch, idx) => {
      next[idx] = ch;
    });
    setDigits(next);
    setError('');
    slotRefs.current[Math.min(pasted.length, PASSKEY_LENGTH) - 1]?.focus();
  };

  const submitPasskey = async e => {
    e.preventDefault();
    const passkey = digits.join('');
    if (passkey.length < PASSKEY_LENGTH) {
      setError('Please enter all 4 digits of your passkey.');
      const firstEmpty = digits.findIndex(d => !d);
      slotRefs.current[firstEmpty === -1 ? 0 : firstEmpty]?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/passkey', {
        method: 'POST',
        body: JSON.stringify({ role, passkey }),
      });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitEmailLogin = async e => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter both your email address and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async e => {
    e.preventDefault();
    if (regName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match. Please re-enter them.');
      return;
    }
    if (regRole === 'admin' && regAdminKey.trim().length < 4) {
      setError('Please enter the Admin authorization passkey (3400).');
      return;
    }
    if (!regConsent) {
      setError('Please confirm the research prototype consent box to continue.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          confirmPassword: regConfirm,
          consent: regConsent,
          role: regRole,
          adminPasskey: regRole === 'admin' ? regAdminKey.trim() : undefined,
        }),
      });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const passOk = regPassword.length >= 8;
  const confirmOk = Boolean(regConfirm) && regPassword === regConfirm;

  return (
    <main className="auth-shell">
      <section
        className="brand-panel"
        aria-label="About MindMate"
      >
        <img
          src={heroArt}
          alt=""
          aria-hidden="true"
          className="brand-hero-img"
          decoding="async"
        />
        <div className="brand-scrim" aria-hidden="true" />

        <div className="brand-top">
          <div className="brand-lockup">
            <BrandMark />
            <strong>
              Mind<span>Mate</span>
            </strong>
          </div>
          <span className="brand-badge">PILOT ⚡</span>
        </div>

        <div className="brand-copy">
          <h1>
            A calmer place
            <span>
              to <em>check in.</em>
            </span>
          </h1>
          <i className="brand-rule" aria-hidden="true" />
          <p>
            Confidential PHQ-9, GAD-7, and PSS-4 screening with Bangla, Banglish, and English
            support for university students.
          </p>
        </div>

        <div className="trust-capsule">
          <span>
            <b className="tc-mint">◈</b> Private
          </span>
          <span>
            <b className="tc-amber">⚡</b> Multilingual
          </span>
          <span>
            <b className="tc-coral">♡</b> Student First
          </span>
        </div>

        <svg className="brand-wave" viewBox="0 0 180 900" preserveAspectRatio="none" aria-hidden="true">
          <path d="M180,0 L118,0 C28,155 12,330 64,480 C112,620 82,775 0,900 L180,900 Z" />
        </svg>
      </section>

      <section className="auth-card">
        <div className="auth-surface">
          <div className="auth-card-logo">
            <BrandMark dark />
          </div>

          <div className="auth-header">
            {mode === 'register' ? (
              <h2>
                Create <span>account</span>
              </h2>
            ) : (
              <h2>
                Welcome <span>back</span>
              </h2>
            )}
            <p className="auth-subtitle">
              {mode === 'passkey'
                ? 'Choose your portal and enter your 4-digit passkey'
                : mode === 'email'
                  ? 'Sign in with your email and password'
                  : 'Create your private MindMate profile'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'passkey'}
              className={mode === 'passkey' ? 'active' : ''}
              onClick={() => switchMode('passkey')}
            >
              Passkey
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'email'}
              className={mode === 'email' ? 'active' : ''}
              onClick={() => switchMode('email')}
            >
              Email
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Sign up
            </button>
          </div>

          {mode === 'passkey' && (
            <form key="passkey" className="passkey-form" onSubmit={submitPasskey}>
              <div className="role-grid" role="radiogroup" aria-label="Account role">
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'student'}
                  className={`role-card ${role === 'student' ? 'selected' : ''}`}
                  onClick={() => selectRole('student')}
                >
                  <span className="role-icon"><StudentIcon /></span>
                  <span className="role-text">
                    <strong>Student</strong>
                    <small>Check-ins &amp; chat</small>
                  </span>
                  <span className="role-check" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'admin'}
                  className={`role-card ${role === 'admin' ? 'selected' : ''}`}
                  onClick={() => selectRole('admin')}
                >
                  <span className="role-icon"><AdminIcon /></span>
                  <span className="role-text">
                    <strong>Admin</strong>
                    <small>Research &amp; pilot</small>
                  </span>
                  <span className="role-check" aria-hidden="true" />
                </button>
              </div>

              <div className="passkey-block">
                <div className="passkey-top">
                  <span className="field-caption">
                    {role === 'admin' ? 'Admin' : 'Student'} passkey (4 digits)
                  </span>
                  <div className="passkey-tools">
                    {digits.some(Boolean) && (
                      <button
                        type="button"
                        className="text-tool"
                        onClick={() => {
                          setDigits(emptyDigits());
                          setError('');
                          slotRefs.current[0]?.focus();
                        }}
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-tool"
                      onClick={() => setShowPasskey(v => !v)}
                      aria-label={showPasskey ? 'Hide passkey' : 'Show passkey'}
                    >
                      <EyeIcon open={showPasskey} />
                      <span>{showPasskey ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                </div>

                <div className="passkey-boxes" onPaste={handlePaste}>
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { slotRefs.current[index] = el; }}
                      type={showPasskey ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      aria-label={`${role === 'admin' ? 'Admin' : 'Student'} passkey digit ${index + 1}`}
                      value={digit}
                      className={digit ? 'filled' : ''}
                      onFocus={e => e.target.select()}
                      onChange={e => handleDigitChange(index, e.target.value)}
                      onKeyDown={e => handleDigitKeyDown(index, e)}
                    />
                  ))}
                </div>
              </div>

              {error && <p className="error" role="alert">{error}</p>}

              <button className="primary auth-submit" disabled={busy}>
                {busy
                  ? 'Verifying passkey…'
                  : `Continue as ${role === 'admin' ? 'Admin' : 'Student'} →`}
              </button>

              <div className="auth-divider"><span>quick passkeys</span></div>

              <div className="demo-pills-row">
                <button
                  type="button"
                  className={`demo-pill ${role === 'student' ? 'active' : ''}`}
                  onClick={() => fillDemoPasskey('student', '1234')}
                >
                  Student · <b>1234</b>
                </button>
                <button
                  type="button"
                  className={`demo-pill ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => fillDemoPasskey('admin', '3400')}
                >
                  Admin · <b>3400</b>
                </button>
              </div>
            </form>
          )}

          {mode === 'email' && (
            <form key="email" className="credentials-form" onSubmit={submitEmailLogin} noValidate>
              <div className="pill-input-wrap">
                <span className="input-lead"><MailIcon /></span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  aria-label="Email address"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={e => { setLoginEmail(e.target.value); setError(''); }}
                />
              </div>

              <div className="pill-input-wrap">
                <span className="input-lead"><LockIcon /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => { setLoginPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {error && <p className="error" role="alert">{error}</p>}

              <button className="primary auth-submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Login →'}
              </button>

              <p className="demo">
                Demo: <code>student@mindmate.local</code> / <code>Student123!</code> ·{' '}
                <code>admin@mindmate.local</code> / <code>Admin123!</code>
              </p>
            </form>
          )}

          {mode === 'register' && (
            <form key="register" className="credentials-form" onSubmit={submitRegister} noValidate>
              <div className="reg-role-row" role="radiogroup" aria-label="Account type">
                <span className="field-caption">Account type</span>
                <div className="reg-role-pills">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={regRole === 'student'}
                    className={regRole === 'student' ? 'active' : ''}
                    onClick={() => { setRegRole('student'); setError(''); }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={regRole === 'admin'}
                    className={regRole === 'admin' ? 'active' : ''}
                    onClick={() => { setRegRole('admin'); setError(''); }}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="pill-input-wrap">
                <span className="input-lead"><UserIcon /></span>
                <input
                  required
                  autoComplete="name"
                  aria-label="Full name"
                  placeholder="Full name"
                  value={regName}
                  onChange={e => { setRegName(e.target.value); setError(''); }}
                />
              </div>

              <div className="pill-input-wrap">
                <span className="input-lead"><MailIcon /></span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  aria-label="Email address"
                  placeholder="you@university.edu"
                  value={regEmail}
                  onChange={e => { setRegEmail(e.target.value); setError(''); }}
                />
              </div>

              <div className="reg-pass-grid">
                <div className="pill-input-wrap">
                  <span className="input-lead"><LockIcon /></span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    aria-label="Password"
                    placeholder="Password (8+)"
                    value={regPassword}
                    onChange={e => { setRegPassword(e.target.value); setError(''); }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowRegPassword(v => !v)}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showRegPassword} />
                  </button>
                </div>

                <div className="pill-input-wrap no-lead">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    aria-label="Confirm password"
                    placeholder="Confirm"
                    value={regConfirm}
                    onChange={e => { setRegConfirm(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              <div className="field-hints">
                <span className={passOk ? 'ok' : ''}>{passOk ? '✓ 8+ characters' : '• 8+ characters'}</span>
                <span className={confirmOk ? 'ok' : ''}>{confirmOk ? '✓ Passwords match' : '• Confirm password'}</span>
              </div>

              {regRole === 'admin' && (
                <div className="pill-input-wrap">
                  <span className="input-lead"><AdminIcon /></span>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    required
                    aria-label="Admin passkey"
                    placeholder="Admin passkey (3400)"
                    value={regAdminKey}
                    onChange={e => { setRegAdminKey(e.target.value); setError(''); }}
                  />
                </div>
              )}

              <label className="check">
                <input
                  type="checkbox"
                  checked={regConsent}
                  onChange={e => { setRegConsent(e.target.checked); setError(''); }}
                />
                <span>I understand this is a research prototype, not medical care.</span>
              </label>

              {error && <p className="error" role="alert">{error}</p>}

              <button className="primary auth-submit" disabled={busy}>
                {busy
                  ? 'Creating account…'
                  : regRole === 'admin'
                    ? 'Create admin account →'
                    : 'Create account →'}
              </button>
            </form>
          )}

          <p className="auth-switch-foot">
            {mode === 'register' ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('passkey')}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => switchMode('register')}>
                  Sign up
                </button>
              </>
            )}
          </p>

          <p className="auth-safety-note">
            Non-diagnostic prototype · Emergency? Call Bangladesh <b>999</b>.
          </p>
        </div>
      </section>
    </main>
  );
}
