import React from 'react';
import type { OnboardingData } from './types';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface CompletionViewProps {
  data?: OnboardingData;
  slug?: string;
  onMyCardsClick: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  onMyCardsClick
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMyCardsClick) {
      onMyCardsClick();
    }
  };

  return (
    <div
      className="onboarding-step completion-view fade-in-section is-visible"
      style={{ textAlign: 'center', paddingTop: '20px', position: 'relative', zIndex: 10 }}
    >
      {/* 1. Lottie Animation */}
      <div className="lottie-animation-wrapper" style={{ marginBottom: '16px', pointerEvents: 'none' }}>
        <DotLottieReact
          src="https://lottie.host/4963b850-df22-40cb-b399-2f4155c6445b/d4pvpMaqLi.lottie"
          loop={true}
          autoplay
          style={{ width: '220px', height: '220px', margin: '0 auto', pointerEvents: 'none' }}
        />
      </div>

      {/* 2. Heading below animation */}
      <h2 className="completion-heading" style={{ fontSize: 'clamp(22px, 2.4vw, 26px)', marginBottom: '28px' }}>
        Card Created <span style={{ color: '#16a34a' }}>Successfully</span>
      </h2>

      {/* 3. Single "My Cards" Action Button */}
      <div
        className="completion-actions-single"
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 20,
          pointerEvents: 'auto'
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleClick}
          style={{ cursor: 'pointer', zIndex: 30, pointerEvents: 'auto', minWidth: '160px' }}
        >
          My Cards
        </button>
      </div>
    </div>
  );
};
