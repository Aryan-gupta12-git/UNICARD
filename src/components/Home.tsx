import React from 'react';
import './Home.css';

interface HomeProps {
  userName?: string;
  profile?: any | null;
  onViewCard?: (slug: string) => void;
  onEditDetails: () => void;
  onCreateCard: () => void;
  onNavigate?: (view: 'saved-cards' | 'analytics') => void;
}

interface Article {
  title: string;
  author: string;
  time: string;
}

interface UserCardItem {
  name: string;
  email: string;
  businessName: string;
  theme?: 'comic-theme' | 'pink-pop-theme' | 'pink-theme';
}

const HARDCODED_CARDS: UserCardItem[] = [
  {
    name: "Misti Sharma",
    email: "misti@unicard.app",
    businessName: "Design Studio",
    theme: "pink-pop-theme"
  },
  {
    name: "Alex Morgan",
    email: "alex.morgan@techlabs.io",
    businessName: "Nexus Tech Labs",
    theme: "comic-theme"
  },
  {
    name: "Jordan Lee",
    email: "jordan@creators.co",
    businessName: "Creative Studio",
    theme: "comic-theme"
  }
];

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
  profile = null,
  onEditDetails,
  onCreateCard
}) => {
  // Extract user's real first name dynamically
  const firstName = userName.trim().split(' ')[0] || 'User';

  const handleCreateClick = () => {
    if (profile) {
      onEditDetails();
    } else {
      onCreateCard();
    }
  };

  return (
    <div className="auth-product-page">
      <div className="home-container">
        {/* Top Welcome Header */}
        <header className="home-header">
          <h1 className="home-title">Welcome back, {firstName}.</h1>
          <p className="home-subheading">Let's make your first card</p>
          <div className="home-action-wrapper">
            <button className="btn btn-primary" onClick={handleCreateClick}>
              Create
            </button>
          </div>
        </header>

        {/* User Cards Section */}
        <section className="home-cards-section">
          <h2 className="articles-heading">Saved Cards</h2>
          <div className="cards-grid">
            {HARDCODED_CARDS.map((card, idx) => {
              const themeClass = card.theme === 'pink-theme' ? 'pink-pop-theme' : (card.theme || 'comic-theme');
              return (
                <div key={idx} className={`card-box ${themeClass}`}>
                  <div className="card-box-main">
                    <h3 className="card-user-name">{card.name}</h3>
                    <p className="card-user-email">{card.email}</p>
                  </div>
                  <div className="card-meta-row">
                    <span className="card-business-label">BUSINESS</span>
                    <span className="card-business-name">{card.businessName}</span>
                  </div>
                </div>
              );
            })}
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
