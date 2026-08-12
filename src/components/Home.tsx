import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  onCreateCard
}) => {
  const { user } = useAuth();
  const [userCards, setUserCards] = useState<any[]>(initialProfile ? [initialProfile] : []);

  const nameToUse = (userName && userName !== 'User') ? userName : (user?.name || 'User');
  const firstName = nameToUse.trim().split(' ')[0] || 'User';

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
          <h2 className="articles-heading">Saved Cards</h2>
          <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
              Scan to add card
            </p>
          </div>
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
