import React from 'react';
import type { OnboardingData } from './types';

interface PresenceStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PresenceStep: React.FC<PresenceStepProps> = ({ data, updateData, onNext, onBack }) => {
  const isBusiness = data.usageType === 'business';

  const toggleOffline = () => {
    updateData({
      presence: {
        ...data.presence,
        offline: !data.presence.offline
      }
    });
  };

  const toggleOnline = () => {
    updateData({
      presence: {
        ...data.presence,
        online: !data.presence.online
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="onboarding-step" onSubmit={handleSubmit}>
      <h2 className="step-heading">
        {isBusiness ? 'Where does your business exist?' : 'How are you present?'}
      </h2>
      <p className="step-subheading">Select all that apply.</p>

      <div className="option-cards-grid">
        <div
          className={`option-card ${data.presence.offline ? 'is-selected' : ''}`}
          onClick={toggleOffline}
        >
          <div className="option-card-header">
            <span className="option-title">Offline</span>
            <div className="option-checkbox">
              {data.presence.offline && <div className="option-checkbox-mark">✓</div>}
            </div>
          </div>
          <p className="option-description">
            I operate from a physical location or meet customers in person.
          </p>
        </div>

        <div
          className={`option-card ${data.presence.online ? 'is-selected' : ''}`}
          onClick={toggleOnline}
        >
          <div className="option-card-header">
            <span className="option-title">Online</span>
            <div className="option-checkbox">
              {data.presence.online && <div className="option-checkbox-mark">✓</div>}
            </div>
          </div>
          <p className="option-description">
            I provide services, products or interactions online.
          </p>
        </div>
      </div>

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
