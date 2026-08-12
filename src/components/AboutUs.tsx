import React from 'react';
import './AboutUs.css';

export const AboutUs: React.FC = () => {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-content-grid">
          <div className="about-left">
            <h2 className="about-heading">
              Your identity shouldn't be scattered.
            </h2>
          </div>
          <div className="about-right">
            <p className="about-paragraph">
              Your contact information, professional identity, social profiles, and important links are spread across multiple places — lost in email signatures, old paper cards, and disparate apps.
            </p>
            <p className="about-paragraph">
              UNICARD brings them together into one simple, refined digital identity that you control, update effortlessly, and share in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
