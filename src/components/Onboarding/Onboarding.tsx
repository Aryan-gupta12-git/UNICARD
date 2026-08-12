import React, { useState, useEffect } from 'react';
import type { OnboardingData } from './types';
import { PersonalStep } from './PersonalStep';
import { PurposeStep } from './PurposeStep';
import { PresenceStep } from './PresenceStep';
import { SocialsStep } from './SocialsStep';
import { CompletionView } from './CompletionView';
import './Onboarding.css';

interface OnboardingProps {
  onClose?: () => void;
  onViewCard?: (slug: string) => void;
  onCompleteSuccess?: () => void;
  editingCardId?: string | null;
  initialCardData?: any | null;
}

const initialData: OnboardingData = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  usageType: null,
  theme: 'comic-theme',
  business: {
    name: '',
    designation: '',
    address: '',
    category: ''
  },
  presence: {
    offline: false,
    online: false
  },
  website: '',
  socials: []
};

export const Onboarding: React.FC<OnboardingProps> = ({
  onClose,
  onViewCard,
  onCompleteSuccess,
  editingCardId = null,
  initialCardData = null
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<OnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState<string>('');

  const activeCardId = editingCardId || initialCardData?.id || null;
  const isEditing = Boolean(activeCardId);

  // Populate form with existing card data when editing
  useEffect(() => {
    const fetchCardForEditing = async () => {
      if (initialCardData) {
        populateForm(initialCardData);
        return;
      }

      if (editingCardId) {
        try {
          const res = await fetch(`/api/unicard/cards/${editingCardId}`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.card || data.profile) {
              populateForm(data.card || data.profile);
            }
          }
        } catch (err) {
          console.error('Failed to load card for editing:', err);
        }
      }
    };

    fetchCardForEditing();
  }, [editingCardId, initialCardData]);

  const populateForm = (card: any) => {
    const usageType = card.usageType
      ? (String(card.usageType).toLowerCase() as 'personal' | 'business')
      : 'personal';

    setFormData({
      name: card.name || '',
      email: card.email || '',
      phone: card.phone || '',
      bio: card.bio || '',
      usageType,
      theme: card.theme || 'comic-theme',
      business: {
        name: card.businessName || '',
        designation: card.designation || card.profession || '',
        address: card.businessAddress || '',
        category: card.businessCategory || ''
      },
      presence: {
        offline: Boolean(card.offlinePresence),
        online: Boolean(card.onlinePresence)
      },
      website: card.website || '',
      socials: Array.isArray(card.socials)
        ? card.socials.map((s: { platform: string; url: string }) => ({
            platform: s.platform,
            url: s.url
          }))
        : []
    });
  };

  const handleClose = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onClose) onClose();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const updateFormData = (fields: Partial<OnboardingData>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields
    }));
  };

  const handleNextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentStep === 2 && formData.usageType === 'personal') {
      setCurrentStep(4);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentStep === 4 && formData.usageType === 'personal') {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      handleClose();
    }
  };

  const handleGenerateUniCard = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      theme: formData.theme || 'comic-theme',
      usageType: formData.usageType,
      profession: formData.business.designation,
      business: formData.business,
      presence: formData.presence,
      website: formData.website,
      socials: formData.socials
    };

    const targetUrl = isEditing ? `/api/unicard/cards/${activeCardId}` : '/api/unicard';
    const httpMethod = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(targetUrl, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const res = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(res.error || 'Failed to save UNICARD. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setGeneratedSlug(res.slug || res.card?.slug || res.profile?.slug);
      setIsSubmitting(false);

      // Transition to CompletionView on successful save
      setCurrentStep(5);
    } catch (err) {
      console.error('Submit UNICARD error:', err);
      setSubmitError('Network error. Please check server connection.');
      setIsSubmitting(false);
    }
  };

  const handleEditDetails = () => {
    setCurrentStep(1);
    if (onClose) handleClose();
  };

  return (
    <div className="onboarding-page">
      <main className="onboarding-main">
        <div className="container onboarding-container">
          {currentStep <= 4 && (
            <div className="onboarding-header">
              <h1 className="onboarding-title">
                {isEditing ? 'Edit your card.' : 'Let’s build your card.'}
              </h1>
              <p className="onboarding-subtitle">
                {isEditing ? 'Update your information below.' : 'Tell us a little about yourself. You can change these details later.'}
              </p>

              {/* Minimal Progress Indicator */}
              <div className="progress-indicator">
                <span className={`progress-step ${currentStep === 1 ? 'is-active' : ''} ${currentStep > 1 ? 'is-completed' : ''}`}>
                  01 Personal
                </span>
                <span className="progress-arrow">→</span>
                <span className={`progress-step ${currentStep === 2 ? 'is-active' : ''} ${currentStep > 2 ? 'is-completed' : ''}`}>
                  02 Purpose
                </span>
                {formData.usageType !== 'personal' && (
                  <>
                    <span className="progress-arrow">→</span>
                    <span className={`progress-step ${currentStep === 3 ? 'is-active' : ''} ${currentStep > 3 ? 'is-completed' : ''}`}>
                      03 Presence
                    </span>
                  </>
                )}
                <span className="progress-arrow">→</span>
                <span className={`progress-step ${currentStep === 4 ? 'is-active' : ''} ${currentStep > 4 ? 'is-completed' : ''}`}>
                  {formData.usageType === 'personal' ? '03 Socials' : '04 Socials'}
                </span>
              </div>
            </div>
          )}

          {/* Form Step Body */}
          <div className="onboarding-card">
            {currentStep === 1 && (
              <PersonalStep
                data={formData}
                updateData={updateFormData}
                onNext={handleNextStep}
                onBackToHome={handleClose}
              />
            )}

            {currentStep === 2 && (
              <PurposeStep
                data={formData}
                updateData={updateFormData}
                onNext={handleNextStep}
                onBack={handlePrevStep}
              />
            )}

            {currentStep === 3 && (
              <PresenceStep
                data={formData}
                updateData={updateFormData}
                onNext={handleNextStep}
                onBack={handlePrevStep}
              />
            )}

            {currentStep === 4 && (
              <SocialsStep
                data={formData}
                updateData={updateFormData}
                onGenerate={handleGenerateUniCard}
                onBack={handlePrevStep}
                isSubmitting={isSubmitting}
                submitError={submitError}
                isEditing={isEditing}
              />
            )}

            {currentStep === 5 && (
              <CompletionView
                data={formData}
                slug={generatedSlug}
                onViewCard={(slug) => {
                  if (onViewCard) {
                    onViewCard(slug);
                  } else if (onClose) {
                    onClose();
                  }
                }}
                onEditDetails={handleEditDetails}
                onGoHome={() => {
                  if (onCompleteSuccess) {
                    onCompleteSuccess();
                  } else if (onClose) {
                    onClose();
                  }
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
