import React, { useState } from 'react';
import type { OnboardingData } from './types';
import { SOCIAL_PLATFORMS } from './types';
import { Trash2, Plus } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SocialsStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onGenerate: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  isEditing?: boolean;
}

export const SocialsStep: React.FC<SocialsStepProps> = ({
  data,
  updateData,
  onGenerate,
  onBack,
  isSubmitting = false,
  submitError = null,
  isEditing = false
}) => {
  const [errors, setErrors] = useState<{ website?: string; socials?: Record<number, string> }>({});

  const isValidUrl = (urlStr: string): boolean => {
    const trimmed = urlStr.trim();
    if (!trimmed) return true; // Optional field
    try {
      const formattedUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
      const parsed = new URL(formattedUrl);
      const hostParts = parsed.hostname.split('.');
      return parsed.hostname.includes('.') && (hostParts[hostParts.length - 1]?.length || 0) >= 2;
    } catch {
      return false;
    }
  };

  const handleWebsiteChange = (val: string) => {
    updateData({ website: val });
    if (errors.website) {
      setErrors({ ...errors, website: undefined });
    }
  };

  const handleAddSocialRow = () => {
    const currentSocials = data.socials || [];
    updateData({
      socials: [...currentSocials, { platform: '', url: '' }]
    });
  };

  const handleRemoveSocialRow = (index: number) => {
    const currentSocials = [...(data.socials || [])];
    currentSocials.splice(index, 1);
    updateData({ socials: currentSocials });

    // Clean up error state for removed index
    if (errors.socials) {
      const updatedSocialErrors = { ...errors.socials };
      delete updatedSocialErrors[index];
      setErrors({ ...errors, socials: updatedSocialErrors });
    }
  };

  const handleSocialPlatformChange = (index: number, platform: string) => {
    const currentSocials = [...(data.socials || [])];
    currentSocials[index] = { ...currentSocials[index], platform };
    updateData({ socials: currentSocials });
  };

  const handleSocialUrlChange = (index: number, url: string) => {
    const currentSocials = [...(data.socials || [])];
    currentSocials[index] = { ...currentSocials[index], url };
    updateData({ socials: currentSocials });

    if (errors.socials && errors.socials[index]) {
      const updatedSocialErrors = { ...errors.socials };
      delete updatedSocialErrors[index];
      setErrors({ ...errors, socials: updatedSocialErrors });
    }
  };

  // Get available platforms for a specific row to prevent duplicate selection (except 'Other')
  const getAvailablePlatforms = (rowIndex: number): string[] => {
    const selectedPlatforms = (data.socials || [])
      .map((item, idx) => (idx !== rowIndex ? item.platform : null))
      .filter((p): p is string => Boolean(p) && p !== 'Other');

    return SOCIAL_PLATFORMS.filter((p) => !selectedPlatforms.includes(p));
  };

  const validate = (): boolean => {
    const newErrors: { website?: string; socials?: Record<number, string> } = {};

    // Validate website if provided
    if (data.website && !isValidUrl(data.website)) {
      newErrors.website = 'Enter a valid website URL, for example https://example.com';
    }

    // Validate social URLs if provided
    const socialErrors: Record<number, string> = {};
    (data.socials || []).forEach((item, idx) => {
      if (item.url && !isValidUrl(item.url)) {
        socialErrors[idx] = 'Enter a valid URL, for example https://linkedin.com/in/username';
      }
    });

    if (Object.keys(socialErrors).length > 0) {
      newErrors.socials = socialErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onGenerate();
    }
  };

  return (
    <form className="onboarding-step" onSubmit={handleSubmit} noValidate>
      <h2 className="step-heading">Where can people find you?</h2>
      <p className="step-subheading">
        Add your website and the platforms you’d like to share on your UNICARD.
      </p>

      {/* Website Field */}
      <div className="form-group">
        <label htmlFor="website" className="form-label">Website</label>
        <input
          id="website"
          type="url"
          className={`form-input ${errors.website ? 'input-error' : ''}`}
          placeholder="https://yourwebsite.com"
          value={data.website}
          onChange={(e) => handleWebsiteChange(e.target.value)}
        />
        {errors.website && <span className="error-text">{errors.website}</span>}
      </div>

      {/* Social Profiles Dynamic Section */}
      <div className="social-profiles-section">
        <div className="social-section-header">
          <label className="form-label">Social profiles</label>
          <p className="social-section-subtitle">
            Add the platforms you want people to see on your UNICARD.
          </p>
        </div>

        {/* Dynamic Social Link Rows */}
        <div className="social-rows-list">
          {(data.socials || []).map((item, idx) => {
            const availablePlatforms = getAvailablePlatforms(idx);
            const rowError = errors.socials ? errors.socials[idx] : undefined;

            return (
              <div key={idx} className="social-row">
                <div className="social-row-inputs">
                  <select
                    className="form-select social-platform-select"
                    value={item.platform}
                    onChange={(e) => handleSocialPlatformChange(idx, e.target.value)}
                  >
                    <option value="">Select a platform</option>
                    {availablePlatforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>

                  <input
                    type="url"
                    className={`form-input social-url-input ${rowError ? 'input-error' : ''}`}
                    placeholder="https://..."
                    value={item.url}
                    onChange={(e) => handleSocialUrlChange(idx, e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn-social-remove"
                    onClick={() => handleRemoveSocialRow(idx)}
                    title="Remove social profile"
                    aria-label="Remove social profile"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {rowError && <span className="error-text social-row-error">{rowError}</span>}
              </div>
            );
          })}
        </div>

        {/* Add Another Social Button */}
        <div className="add-social-wrapper">
          <button
            type="button"
            className="btn-add-social"
            onClick={handleAddSocialRow}
          >
            <Plus size={16} />
            <span>Add another social</span>
          </button>
        </div>
      </div>

      {submitError && (
        <div className="auth-error-banner" style={{ marginTop: '20px' }}>
          {submitError}
        </div>
      )}

      {/* Bottom Controls */}
      <div className="form-actions form-actions-dual">
        <button type="button" className="btn-text-back" onClick={onBack} disabled={isSubmitting}>
          Back
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <DotLottieReact
                src="https://lottie.host/c50fba5a-6759-4ed6-abb1-895e287827c0/yYW2rfV8hL.lottie"
                loop
                autoplay
                style={{ width: '28px', height: '28px' }}
              />
              <span>{isEditing ? 'Saving Edits...' : 'Generating UNICARD...'}</span>
            </span>
          ) : (
            isEditing ? 'Save Edits' : 'Generate UNICARD'
          )}
        </button>
      </div>
    </form>
  );
};
