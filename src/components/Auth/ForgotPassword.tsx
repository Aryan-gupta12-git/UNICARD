import React, { useState } from 'react';
import { AuthContainer } from './AuthContainer';

interface ForgotPasswordProps {
  onSwitchToSignIn: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setSuccessMessage(null);

    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    // Prepared flow UI feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('If an account exists for this email, password reset instructions have been sent.');
    }, 800);
  };

  return (
    <AuthContainer>
      <div className="auth-header">
        <h1 className="auth-title">Reset your password.</h1>
        <p className="auth-subtitle">
          Enter your email address and we’ll help you reset your password.
        </p>
      </div>

      {successMessage && <div className="auth-success-banner">{successMessage}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="reset-email">
            Email <span className="required-star">*</span>
          </label>
          <input
            id="reset-email"
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

        <div className="auth-actions">
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
      </form>

      <div className="auth-footer-links">
        <span>
          Remember your password?{' '}
          <button type="button" className="auth-link" onClick={onSwitchToSignIn}>
            Log in
          </button>
        </span>
      </div>
    </AuthContainer>
  );
};
