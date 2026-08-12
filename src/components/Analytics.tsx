import React from 'react';
import './Home.css';

export const Analytics: React.FC = () => {
  return (
    <div className="auth-product-page">
      <div className="home-container">
        <section style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: '#0F1E36', marginBottom: '8px' }}>
            Analytics
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            Analytics feature is coming soon.
          </p>
        </section>
      </div>
    </div>
  );
};
