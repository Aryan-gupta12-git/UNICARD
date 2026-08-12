import React from 'react';
import './Home.css';

interface SavedCardItem {
  name: string;
  email: string;
  businessName: string;
  theme?: 'comic-theme' | 'pink-pop-theme' | 'pink-theme';
}

const SAVED_CARDS: SavedCardItem[] = [
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

export const SavedCards: React.FC = () => {
  return (
    <div className="auth-product-page">
      <div className="home-container">
        <div className="cards-grid" style={{ marginTop: '0' }}>
          {SAVED_CARDS.map((card, idx) => {
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
      </div>
    </div>
  );
};
