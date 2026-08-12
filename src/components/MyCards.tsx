import React, { useState } from 'react';
import { ExternalLink, Edit3, Check, Copy } from 'lucide-react';
import './Home.css';

interface MyCardsProps {
  profile?: any | null;
  onViewCard: (slug: string) => void;
  onEditDetails: () => void;
  onCreateCard: () => void;
}

export const MyCards: React.FC<MyCardsProps> = ({
  profile = null,
  onViewCard,
  onEditDetails,
  onCreateCard
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (profile?.slug) {
      navigator.clipboard.writeText(`https://unicard.app/u/${profile.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="auth-product-page">
      <div className="home-container">
        {/* Page Header */}
        <header className="home-header">
          <span className="eyebrow">MY CARDS</span>
          <h1 className="home-title">My Cards</h1>
          <p className="home-subtitle">
            Manage the cards that represent you.
          </p>
        </header>

        {/* Card Content */}
        {profile ? (
          <section className="primary-card-section">
            <div className="card-overview-header">
              <span className="card-type-badge">
                {profile.usageType === 'BUSINESS' ? 'Business Card' : 'Personal Card'}
              </span>
              <span className="card-live-dot">● LIVE</span>
            </div>

            <h2 className="card-overview-name">{profile.name}</h2>

            {(profile.designation || profile.businessName) && (
              <p className="card-overview-role">
                {profile.designation} {profile.businessName ? `at ${profile.businessName}` : ''}
              </p>
            )}

            <div className="card-url-preview">
              <span style={{ color: 'var(--text-tertiary)' }}>unicard.app/u/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profile.slug}</span>
            </div>

            <div className="card-overview-actions">
              <button
                className="btn btn-primary"
                onClick={() => onViewCard(profile.slug)}
              >
                <ExternalLink size={15} />
                <span>View Card</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={onEditDetails}
              >
                <Edit3 size={15} />
                <span>Edit Details</span>
              </button>

              <button
                className="btn-tertiary-copy"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </section>
        ) : (
          <section className="primary-card-section" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h2 className="card-overview-name" style={{ fontSize: '24px', marginBottom: '8px' }}>
              You haven't created your UNICARD yet.
            </h2>
            <p className="card-overview-role" style={{ marginBottom: '24px' }}>
              Create your digital identity in 4 quick steps.
            </p>
            <button className="btn btn-primary" onClick={onCreateCard}>
              Create your UNICARD
            </button>
          </section>
        )}
      </div>
    </div>
  );
};
