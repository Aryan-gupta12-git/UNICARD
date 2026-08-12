import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { renderSpiderComicName } from '../utils/themeHelpers';
import './Home.css';

interface SavedCardsProps {
  mode?: 'my-cards' | 'saved-cards';
  onViewCard?: (slug: string, isReadOnly?: boolean) => void;
  onCreateCard?: () => void;
}

export const SavedCards: React.FC<SavedCardsProps> = ({
  mode = 'my-cards',
  onViewCard
}) => {
  const [userCards, setUserCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Delete modal state (for my-cards mode)
  const [cardToDelete, setCardToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      const endpoint = mode === 'saved-cards' ? '/api/unicard/saved-cards' : '/api/unicard/me';

      try {
        const res = await fetch(endpoint, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.savedCards)) {
            setUserCards(data.savedCards);
          } else if (Array.isArray(data.cards)) {
            setUserCards(data.cards);
          } else if (Array.isArray(data)) {
            setUserCards(data);
          } else if (data.profile) {
            setUserCards([data.profile]);
          } else {
            setUserCards([]);
          }
        }
      } catch (err) {
        console.error(`Fetch ${mode} error:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [mode]);

  const handleCardClick = (slugOrId: string) => {
    if (onViewCard) {
      const isReadOnly = mode === 'saved-cards';
      onViewCard(slugOrId, isReadOnly);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, card: any) => {
    e.stopPropagation();
    setCardToDelete(card);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    const targetId = cardToDelete.id || cardToDelete.slug;

    try {
      const res = await fetch(`/api/unicard/cards/${targetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setUserCards((prev) => prev.filter((c) => c.id !== cardToDelete.id && c.slug !== cardToDelete.slug));
        setCardToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'Failed to delete card.');
      }
    } catch (err) {
      console.error('Delete card error:', err);
      setDeleteError('Network error. Failed to delete card.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isMyCards = mode === 'my-cards';
  const headingTitle = isMyCards ? 'My Cards' : 'Saved Cards';
  const emptyText = isMyCards
    ? 'Created cards will appear here'
    : 'No saved cards yet. Cards saved from other connections will appear here.';

  return (
    <div className="auth-product-page">
      <div className="home-container">
        <h2 className="articles-heading" style={{ marginBottom: '24px' }}>{headingTitle}</h2>

        {loading ? (
          <div className="cards-grid" style={{ marginTop: '0' }}>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="card-box skeleton-pulse"
                style={{
                  minHeight: '220px',
                  backgroundColor: '#F0F3F7',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)'
                }}
              />
            ))}
          </div>
        ) : userCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
              {emptyText}
            </p>
          </div>
        ) : (
          <div className="cards-grid" style={{ marginTop: '0' }}>
            {userCards.map((card, idx) => {
              const themeClass = card.theme === 'pink-theme' ? 'pink-pop-theme' : (card.theme || 'comic-theme');
              const isPersonal = String(card.usageType || '').toUpperCase() === 'PERSONAL';
              const metaLabel = isPersonal ? 'PROFESSION' : 'BUSINESS';
              const cardProfession = card.designation || card.profession || '';
              const cardBusiness = card.businessName || '';
              const metaValue = isPersonal ? cardProfession : (cardBusiness || cardProfession || '');

              return (
                <div
                  key={card.id || idx}
                  className={`card-box ${themeClass}`}
                  onClick={() => handleCardClick(card.slug || card.id)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  {/* Subtle Delete Icon Button (only in My Cards mode) */}
                  {isMyCards && (
                    <button
                      type="button"
                      className="card-delete-btn"
                      title="Delete Card"
                      onClick={(e) => handleDeleteClick(e, card)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <div className="card-box-main">
                    <h3 className="card-user-name">
                      {themeClass === 'spider-comic-theme' ? renderSpiderComicName(card.name) : card.name}
                    </h3>
                  </div>
                  {(metaValue || !isPersonal) && (
                    <div className="card-meta-row">
                      <span className="card-business-label">{metaLabel}</span>
                      <span className="card-business-name">{metaValue}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {cardToDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 30, 54, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px 28px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#0F1E36', marginBottom: '8px' }}>
                Delete Card?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                Are you sure you want to delete <strong>{cardToDelete.name}</strong>'s card? This action cannot be undone.
              </p>

              {deleteError && (
                <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
                  {deleteError}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isDeleting}
                  onClick={() => setCardToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
