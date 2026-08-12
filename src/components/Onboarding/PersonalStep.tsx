import React, { useState } from 'react';
import type { OnboardingData } from './types';

interface PersonalStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBackToHome?: () => void;
}

export const PersonalStep: React.FC<PersonalStepProps> = ({ data, updateData, onNext, onBackToHome }) => {
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};

    if (!data.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!data.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 160) {
      updateData({ bio: text });
    }
  };

  return (
    <form className="onboarding-step" onSubmit={handleSubmit} noValidate>
      <h2 className="step-heading">About you</h2>

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Full Name <span className="required-star">*</span>
        </label>
        <input
          id="name"
          type="text"
          className={`form-input ${errors.name ? 'input-error' : ''}`}
          placeholder="e.g. Alex Morgan"
          value={data.name}
          onChange={(e) => {
            updateData({ name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span className="required-star">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={`form-input ${errors.email ? 'input-error' : ''}`}
          placeholder="e.g. alex@example.com"
          value={data.email}
          onChange={(e) => {
            updateData({ email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          Phone Number <span className="required-star">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          className={`form-input ${errors.phone ? 'input-error' : ''}`}
          placeholder="e.g. +1 (555) 000-0000"
          value={data.phone}
          onChange={(e) => {
            updateData({ phone: e.target.value });
            if (errors.phone) setErrors({ ...errors, phone: undefined });
          }}
        />
        {errors.phone && <span className="error-text">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="bio" className="form-label">Short Bio</label>
          <span className="char-counter">{data.bio.length} / 160</span>
        </div>
        <textarea
          id="bio"
          className="form-textarea"
          rows={3}
          placeholder="A short introduction about who you are or what you build..."
          value={data.bio}
          onChange={handleBioChange}
        />
      </div>

      <div className="form-actions form-actions-dual">
        <button type="button" className="btn-text-back" onClick={onBackToHome}>
          Back
        </button>
        <button type="submit" className="btn btn-primary btn-submit">
          Continue
        </button>
      </div>
    </form>
  );
};
