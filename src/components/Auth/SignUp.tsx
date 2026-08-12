import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthContainer } from './AuthContainer';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface SignUpProps {
  onSwitchToSignIn: () => void;
  onSuccess: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn, onSuccess }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Field inline errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError(null);
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasErrors = false;

    if (!name.trim()) {
      setNameError('Full Name is required');
      hasErrors = true;
    }

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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      hasErrors = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasErrors = true;
    }

    if (hasErrors) return;

    setIsSubmitting(true);
    const result = await register(name, email, password, confirmPassword);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setBannerError(result.error || 'Failed to create account.');
    }
  };

  return (
    <AuthContainer>
      <div className="auth-header">
        <h1 className="auth-title">Create your UNICARD account.</h1>
        <p className="auth-subtitle">Start with an account, then we’ll build your card.</p>
      </div>

      {bannerError && <div className="auth-error-banner">{bannerError}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name <span className="required-star">*</span>
          </label>
          <input
            id="name"
            type="text"
            className={`form-input ${nameError ? 'input-error' : ''}`}
            placeholder="e.g. Maya Lin"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            disabled={isSubmitting}
          />
          {nameError && <span className="auth-inline-error">{nameError}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email <span className="required-star">*</span>
          </label>
          <input
            id="email"
            type="email"
            className={`form-input ${emailError ? 'input-error' : ''}`}
            placeholder="maya@example.com"
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
          <label className="form-label" htmlFor="password">
            Password <span className="required-star">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${passwordError ? 'input-error' : ''}`}
              placeholder="Minimum 8 characters"
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
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm Password <span className="required-star">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`form-input ${confirmPasswordError ? 'input-error' : ''}`}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPasswordError && <span className="auth-inline-error">{confirmPasswordError}</span>}
        </div>

        <div className="auth-actions">
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </form>

      <div className="auth-footer-links">
        <span>
          Already have an account?{' '}
          <button type="button" className="auth-link" onClick={onSwitchToSignIn}>
            Log in
          </button>
        </span>
      </div>
    </AuthContainer>
  );
};
