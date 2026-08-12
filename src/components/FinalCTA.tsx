import React from 'react';
import './FinalCTA.css';

export const FinalCTA: React.FC = () => {
  const handleCreateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="cta" className="section cta-section">
      <div className="container cta-container">
        <h2 className="cta-heading">
          One identity.<br />
          <span className="cta-heading-sub">Unique identity.</span>
        </h2>
        <p className="cta-copy">
          Ready to simplify how you connect? Create your digital card in seconds.
        </p>
        <div className="cta-actions">
          <a href="#" className="btn btn-primary btn-cta-main" onClick={handleCreateClick}>
            Create your UNICARD
          </a>
        </div>
      </div>
    </section>
  );
};
