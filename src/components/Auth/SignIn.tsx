import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthContainer } from './AuthContainer';
import { Eye, EyeOff } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onSuccess
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError(null);
    setEmailError('');
    setPasswordError('');

    let hasErrors = false;

    if (!email.trim()) {
      setEmailError('Email address is required');
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    }

    if (hasErrors) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setBannerError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <AuthContainer>
      <div className="auth-header">
        <h1 className="auth-title">Welcome back.</h1>
        <p className="auth-subtitle">Log in to continue to your UNICARD.</p>
      </div>

      {bannerError && <div className="auth-error-banner">{bannerError}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="signin-email">
            Email <span className="required-star">*</span>
          </label>
          <input
            id="signin-email"
            type="email"
            className={`form-input ${emailError ? 'input-error' : ''}`}
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            disabled={isSubmitting}
          />
          {emailError && <span className="auth-inline-error">{emailError}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signin-password">
            Password <span className="required-star">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${passwordError ? 'input-error' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordError && <span className="auth-inline-error">{passwordError}</span>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="button"
              className="auth-link"
              onClick={onSwitchToForgotPassword}
              style={{ fontSize: '13px' }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="auth-actions">
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <DotLottieReact
                  src="https://lottie.host/c50fba5a-6759-4ed6-abb1-895e287827c0/yYW2rfV8hL.lottie"
                  loop
                  autoplay
                  style={{ width: '28px', height: '28px' }}
                />
                <span>Logging in...</span>
              </span>
            ) : (
              'Log in'
            )}
          </button>
        </div>
      </form>

      <div className="auth-footer-links">
        <span>
          Don’t have an account?{' '}
          <button type="button" className="auth-link" onClick={onSwitchToSignUp}>
            Create one
          </button>
        </span>
      </div>
    </AuthContainer>
  );
};
