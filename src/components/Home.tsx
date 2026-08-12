import React, { useState, useEffect } from 'react';
import './Home.css';

interface HomeProps {
  userName?: string;
  profile?: any | null;
  onViewCard?: (slug: string) => void;
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
  const [userCards, setUserCards] = useState<any[]>(initialProfile ? [initialProfile] : []);
  const [loading, setLoading] = useState<boolean>(!initialProfile);

  const firstName = userName.trim().split(' ')[0] || 'User';

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
        console.error('Fetch user cards error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [initialProfile]);

  const handleCardClick = (slugOrId: string) => {
    if (onViewCard) {
      onViewCard(slugOrId);
    }
  };

  return (
    <div className="auth-product-page">
      <div className="home-container">
        {/* Top Welcome Header */}
        <header className="home-header">
          <h1 className="home-title">Welcome back, {firstName}.</h1>
          <p className="home-subheading">
            {userCards.length > 0 ? "Manage your UNICARD digital identity" : "Let's make your first card"}
          </p>
          <div className="home-action-wrapper">
            <button className="btn btn-primary" onClick={onCreateCard}>
              {userCards.length > 0 ? "Create more" : "Create"}
            </button>
          </div>
        </header>

        {/* User Cards Section */}
        <section className="home-cards-section">
          <h2 className="articles-heading">My Cards</h2>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', padding: '24px 0' }}>Loading your cards...</p>
          ) : userCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#0F1E36', marginBottom: '8px' }}>
                No cards created yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Create your first digital card to share your contact identity effortlessly.
              </p>
              <button className="btn btn-primary" onClick={onCreateCard}>
                Create Card Now
              </button>
            </div>
          ) : (
            <div className="cards-grid">
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
