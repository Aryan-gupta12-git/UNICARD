import React, { useState, useEffect } from 'react';
import './Home.css';

interface SavedCardsProps {
  onViewCard?: (slug: string) => void;
  onCreateCard?: () => void;
}

export const SavedCards: React.FC<SavedCardsProps> = ({ onViewCard, onCreateCard }) => {
  const [userCards, setUserCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const res = await fetch('/api/unicard/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setUserCards([data.profile]);
          } else if (Array.isArray(data.cards)) {
            setUserCards(data.cards);
          }
        }
      } catch (err) {
        console.error('Fetch saved cards error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, []);

  const handleCardClick = (slugOrId: string) => {
    if (onViewCard) {
      onViewCard(slugOrId);
    }
  };

  return (
    <div className="auth-product-page">
      <div className="home-container">
        <h2 className="articles-heading" style={{ marginBottom: '24px' }}>Saved Cards</h2>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '24px 0' }}>Loading saved cards...</p>
        ) : userCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#0F1E36', marginBottom: '8px' }}>
              No cards saved yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Create your digital UNICARD to manage your identity.
            </p>
            {onCreateCard && (
              <button className="btn btn-primary" onClick={onCreateCard}>
                Create Card Now
              </button>
            )}
          </div>
        ) : (
          <div className="cards-grid" style={{ marginTop: '0' }}>
            {userCards.map((card, idx) => {
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
