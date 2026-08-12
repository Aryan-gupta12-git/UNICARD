import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { renderThemeName } from '../utils/themeHelpers';
import './Home.css';

interface HomeProps {
  userName?: string;
  profile?: any | null;
  onViewCard?: (slug: string, isReadOnly?: boolean) => void;
  onEditDetails?: () => void;
  onCreateCard: () => void;
  onNavigate?: (view: 'saved-cards' | 'analytics') => void;
}

interface Article {
  title: string;
  author: string;
  time: string;
}

const ARTICLES: Article[] = [
  {
    title: "The Death of Paper Business Cards and the Rise of One Unified Digital Identity",
    author: "TechCrunch",
    time: "2 hours ago"
  },
  {
    title: "How UNICARD is Redefining Professional Introductions for Modern Creators",
    author: "Forbes",
    time: "5 hours ago"
  },
  {
    title: "Why Physical Cards are Disappearing from Global Tech Conferences",
    author: "Wired",
    time: "1 day ago"
  },
  {
    title: "The Psychology of First Impressions in the Digital Networking Era",
    author: "Fast Company",
    time: "2 days ago"
  },
  {
    title: "Simplifying Contact Sharing Across Remote and Distributed Teams",
    author: "Inc. Magazine",
    time: "3 days ago"
  },
  {
    title: "From Scattered Bio Links to One Permanent Shareable Profile",
    author: "Product Hunt",
    time: "4 days ago"
  }
];

export const Home: React.FC<HomeProps> = ({
  userName = 'User',
  profile: initialProfile = null,
  onViewCard,
  onCreateCard
}) => {
  const { user } = useAuth();
  const [userCards, setUserCards] = useState<any[]>(initialProfile ? [initialProfile] : []);

  // Saved Cards state for Home section
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState<boolean>(true);

  const nameToUse = (userName && userName !== 'User') ? userName : (user?.name || 'User');
  const firstName = nameToUse.trim().split(' ')[0] || 'User';

  // Fetch user's owned cards for header logic
  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const res = await fetch('/api/unicard/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.cards)) {
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
        console.error('Fetch user cards error:', err);
      }
    };

    fetchUserCards();
  }, [initialProfile]);

  // Fetch saved cards (cards saved from other users)
  useEffect(() => {
    const fetchSavedCards = async () => {
      setLoadingSaved(true);
      try {
        const res = await fetch('/api/unicard/saved-cards', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.savedCards)) {
            setSavedCards(data.savedCards);
          } else if (Array.isArray(data.cards)) {
            setSavedCards(data.cards);
          } else if (Array.isArray(data)) {
            setSavedCards(data);
          } else {
            setSavedCards([]);
          }
        }
      } catch (err) {
        console.error('Fetch saved cards error on home:', err);
      } finally {
        setLoadingSaved(false);
      }
    };

    fetchSavedCards();
  }, []);

  return (
    <div className="auth-product-page">
      <div className="home-container">
        {/* Top Welcome Header */}
        <header className="home-header">
          <h1 className="home-title">
            Welcome back, <span style={{ color: '#0EA5E9' }}>{firstName}</span>.
          </h1>
          {userCards.length === 0 && (
            <p className="home-subheading">Let's make your first card</p>
          )}
          <div className="home-action-wrapper">
            <button className="btn btn-primary" onClick={onCreateCard}>
              {userCards.length > 0 ? "Create more" : "Create"}
            </button>
          </div>
        </header>

        {/* Saved Cards Section */}
        <section className="home-cards-section">
          <h2 className="articles-heading" style={{ marginBottom: '20px' }}>Saved Cards</h2>

          {loadingSaved ? (
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
          ) : savedCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
                Scan to add card
              </p>
            </div>
          ) : (
            <div className="cards-grid" style={{ marginTop: '0' }}>
              {savedCards.map((card, idx) => {
                const themeClass = card.theme === 'pink-theme' ? 'pink-pop-theme' : (card.theme || 'comic-theme');
                const isPersonal = String(card.usageType || '').toUpperCase() === 'PERSONAL';
                const metaLabel = isPersonal ? 'PROFESSION' : 'BUSINESS';
                const cardProfession = card.designation || card.profession || 'MEMBER';
                const cardBusiness = card.businessName || '';
                const metaValue = isPersonal ? cardProfession : (cardBusiness || cardProfession || 'BUSINESS');

                return (
                  <div
                    key={card.id || idx}
                    className={`card-box ${themeClass}`}
                    onClick={() => {
                      if (onViewCard) {
                        onViewCard(card.slug || card.id, true);
                      }
                    }}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <div className="card-box-main">
                      <h3 className="card-user-name">
                        {renderThemeName(card.name, themeClass)}
                      </h3>
                    </div>
                    <div className="card-meta-row">
                      <span className="card-business-label">{metaLabel}</span>
                      <span className="card-business-name">{metaValue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Featured Articles Section */}
        <section className="home-articles-section">
          <h2 className="articles-heading">Featured Articles</h2>
          <div className="articles-grid">
            {ARTICLES.map((article, idx) => (
              <div key={idx} className="article-box">
                <h3 className="article-title">{article.title}</h3>
                <div className="article-meta-row">
                  <span className="article-author">{article.author}</span>
                  <span className="article-time">{article.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
