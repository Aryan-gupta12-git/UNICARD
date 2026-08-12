import React from 'react';
import { BarChart3 } from 'lucide-react';
import './Home.css';

export const Analytics: React.FC = () => {
  return (
    <div className="auth-product-page">
      <div className="home-container">
        {/* Page Header */}
        <header className="home-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="eyebrow">ANALYTICS</span>
            <span className="quick-nav-badge-soon">Coming Soon</span>
          </div>
          <h1 className="home-title">Analytics are coming soon.</h1>
          <p className="home-subtitle">
            Soon you'll be able to understand how people discover and interact with your UNICARD.
          </p>
        </header>

        {/* Minimal Quiet Coming Soon State */}
        <section className="primary-card-section" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: 'var(--text-tertiary)'
          }}>
            <BarChart3 size={24} />
          </div>

          <h2 className="card-overview-name" style={{ fontSize: '24px', marginBottom: '8px' }}>
            Insights & Performance
          </h2>
          <p className="card-overview-role" style={{ maxWidth: '440px', margin: '0 auto' }}>
            We're building privacy-first analytics to help you see card views, link taps, and connections.
          </p>
        </section>
      </div>
    </div>
  );
};
