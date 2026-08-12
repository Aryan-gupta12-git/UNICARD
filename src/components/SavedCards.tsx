import React, { useState } from 'react';
import './Home.css';

interface SavedCardsProps {
  onViewCard?: (slug: string) => void;
  onCreateCard?: () => void;
}

export const SavedCards: React.FC<SavedCardsProps> = ({ onViewCard }) => {
  const [savedCards] = useState<any[]>([]);

  const handleCardClick = (slugOrId: string) => {
    if (onViewCard) {
      onViewCard(slugOrId);
    }
  };

  return (
    <div className="auth-product-page">
      <div className="home-container">
        <h2 className="articles-heading" style={{ marginBottom: '24px' }}>Saved Cards</h2>

        {savedCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#0F1E36', marginBottom: '8px' }}>
              No scanned cards yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              Cards that you scan from other UNICARD connections will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="cards-grid" style={{ marginTop: '0' }}>
            {savedCards.map((card, idx) => {
              const themeClass = card.theme === 'pink-theme' ? 'pink-pop-theme' : (card.theme || 'comic-theme');
              return (
                <div
                  key={card.id || idx}
                  className={`card-box ${themeClass}`}
                  onClick={() => handleCardClick(card.slug || card.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-box-main">
                    <h3 className="card-user-name">{card.name}</h3>
                    <p className="card-user-email">{card.email}</p>
                  </div>
                  <div className="card-meta-row">
                    <span className="card-business-label">BUSINESS</span>
                    <span className="card-business-name">{card.businessName || 'UNICARD'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
