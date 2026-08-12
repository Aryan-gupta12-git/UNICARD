import React from 'react';
import type { OnboardingData } from './types';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface CompletionViewProps {
  data: OnboardingData;
  slug?: string;
  onViewCard: (slug: string) => void;
  onEditDetails?: () => void;
  onGoHome?: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  data,
  slug = '',
  onViewCard,
  onGoHome
}) => {
  const generatedSlug = slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-') || 'user';

  const handleViewCardClick = () => {
    onViewCard(generatedSlug);
  };

  const handleBackToHomeClick = () => {
    if (onGoHome) onGoHome();
  };

  return (
    <div className="onboarding-step completion-view fade-in-section is-visible" style={{ textAlign: 'center', paddingTop: '20px' }}>
      {/* 1. Lottie Animation */}
      <div className="lottie-animation-wrapper" style={{ marginBottom: '16px' }}>
        <DotLottieReact
          src="https://lottie.host/4963b850-df22-40cb-b399-2f4155c6445b/d4pvpMaqLi.lottie"
          loop={true}
          autoplay
          style={{ width: '220px', height: '220px', margin: '0 auto' }}
        />
      </div>

      {/* 2. Heading below animation */}
      <h2 className="completion-heading" style={{ fontSize: 'clamp(22px, 2.4vw, 26px)', marginBottom: '28px' }}>
        Card Created <span style={{ color: '#16a34a' }}>Successfully</span>
      </h2>

      {/* 3. Action Buttons below heading */}
      <div className="completion-actions-dual" style={{ justifyContent: 'center', gap: '16px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleViewCardClick}
        >
          View Card
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBackToHomeClick}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
