import React, { useState } from 'react';
import type { OnboardingData } from './types';
import { BUSINESS_CATEGORIES } from './types';

interface PurposeStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PurposeStep: React.FC<PurposeStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [errors, setErrors] = useState<{ usageType?: string; businessName?: string }>({});

  const handleSelectUsage = (type: 'personal' | 'business') => {
    updateData({
      usageType: type,
      theme: type === 'personal' ? (data.theme || 'comic-theme') : undefined
    });
    if (errors.usageType) {
      setErrors({ ...errors, usageType: undefined });
    }
  };

  const handleSelectTheme = (theme: 'comic-theme' | 'pink-pop-theme') => {
    updateData({ theme });
  };

  const handleBusinessChange = (field: string, value: string) => {
    updateData({
      business: {
        ...data.business,
        [field]: value
      }
    });
    if (field === 'name' && errors.businessName) {
      setErrors({ ...errors, businessName: undefined });
    }
  };

  const validate = (): boolean => {
    const newErrors: { usageType?: string; businessName?: string } = {};

    if (!data.usageType) {
      newErrors.usageType = 'Please select how you will use UNICARD to continue';
    } else if (data.usageType === 'business' && !data.business.name.trim()) {
      newErrors.businessName = 'Business name is required';
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

  const selectedTheme = data.theme || 'comic-theme';

  return (
    <form className="onboarding-step" onSubmit={handleSubmit} noValidate>
      <h2 className="step-heading">How will you use UNICARD?</h2>
      <p className="step-subheading">
        Choose the profile that best describes how you’ll use your card.
      </p>

      {/* Selectable Option Cards */}
      <div className="option-cards-grid">
        <div
          className={`option-card ${data.usageType === 'personal' ? 'is-selected' : ''}`}
          onClick={() => handleSelectUsage('personal')}
        >
          <div className="option-card-header">
            <span className="option-title">Personal</span>
            <div className="option-radio">
              {data.usageType === 'personal' && <div className="option-radio-dot" />}
            </div>
          </div>
          <p className="option-description">
            For your individual identity and connections.
          </p>
        </div>

        <div
          className={`option-card ${data.usageType === 'business' ? 'is-selected' : ''}`}
          onClick={() => handleSelectUsage('business')}
        >
          <div className="option-card-header">
            <span className="option-title">Business</span>
            <div className="option-radio">
              {data.usageType === 'business' && <div className="option-radio-dot" />}
            </div>
          </div>
          <p className="option-description">
            For representing your business or professional work.
          </p>
        </div>
      </div>

      {errors.usageType && <span className="error-text error-block">{errors.usageType}</span>}

      {/* Personal Card Theme & Profession Options */}
      {data.usageType === 'personal' && (
        <div className="business-fields-container fade-in-subfields">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="personalProfession" className="form-label">
              Profession / Role
            </label>
            <input
              id="personalProfession"
              type="text"
              className="form-input"
              placeholder="e.g. Designer, Software Engineer, Creator, Photographer..."
              value={data.business.designation}
              onChange={(e) => handleBusinessChange('designation', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
              Select Card Theme
            </label>
            <p className="step-subheading" style={{ marginBottom: '16px', fontSize: '13px' }}>
              Choose an available theme for your personal card. More themes coming soon!
            </p>

            <div className="option-cards-grid">
              <div
                className={`option-card ${selectedTheme === 'comic-theme' ? 'is-selected' : ''}`}
                onClick={() => handleSelectTheme('comic-theme')}
              >
                <div className="option-card-header">
                  <span className="option-title">Comic</span>
                  <div className="option-radio">
                    {selectedTheme === 'comic-theme' && <div className="option-radio-dot" />}
                  </div>
                </div>
                <p className="option-description">
                  Bold pop-art illustration style with Bangers comic font.
                </p>
              </div>

              <div
                className={`option-card ${selectedTheme === 'pink-pop-theme' ? 'is-selected' : ''}`}
                onClick={() => handleSelectTheme('pink-pop-theme')}
              >
                <div className="option-card-header">
                  <span className="option-title">Barbie / Pink Pop</span>
                  <div className="option-radio">
                    {selectedTheme === 'pink-pop-theme' && <div className="option-radio-dot" />}
                  </div>
                </div>
                <p className="option-description">
                  Vibrant pink pop-comic style with gradient title text.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Additional Fields */}
      {data.usageType === 'business' && (
        <div className="business-fields-container fade-in-subfields">
          <div className="form-group">
            <label htmlFor="businessName" className="form-label">
              Business Name <span className="required-star">*</span>
            </label>
            <input
              id="businessName"
              type="text"
              className={`form-input ${errors.businessName ? 'input-error' : ''}`}
              placeholder="e.g. Acme Studio"
              value={data.business.name}
              onChange={(e) => handleBusinessChange('name', e.target.value)}
            />
            {errors.businessName && <span className="error-text">{errors.businessName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="designation" className="form-label">Designation / Role</label>
            <input
              id="designation"
              type="text"
              className="form-input"
              placeholder="e.g. Founder, Designer, Developer, Manager..."
              value={data.business.designation}
              onChange={(e) => handleBusinessChange('designation', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessCategory" className="form-label">Business Category</label>
            <select
              id="businessCategory"
              className="form-select"
              value={data.business.category}
              onChange={(e) => handleBusinessChange('category', e.target.value)}
            >
              <option value="">Select a category</option>
              {BUSINESS_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="businessAddress" className="form-label">Business Address</label>
            <textarea
              id="businessAddress"
              className="form-textarea"
              rows={2}
              placeholder="Street address, city, state, postal code..."
              value={data.business.address}
              onChange={(e) => handleBusinessChange('address', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Form Controls */}
      <div className="form-actions form-actions-dual">
        <button type="button" className="btn-text-back" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </div>
    </form>
  );
};
