import React from 'react';
import './WhyUnicard.css';

interface EditorialReason {
  number: string;
  title: string;
  description: string;
}

export const WhyUnicard: React.FC = () => {
  const reasons: EditorialReason[] = [
    {
      number: "01",
      title: "One identity",
      description: "Everything important about you in one place."
    },
    {
      number: "02",
      title: "Always current",
      description: "Change your information without replacing or reprinting anything."
    },
    {
      number: "03",
      title: "Share naturally",
      description: "Share your UNICARD using a simple link or QR."
    },
    {
      number: "04",
      title: "Made for connections",
      description: "Give people one simple place to understand who you are and reach you."
    }
  ];

  return (
    <section id="why-unicard" className="section why-section">
      <div className="container">
        <span className="eyebrow">WHY UNICARD</span>
        <h2 className="why-main-heading">Designed around clarity and ease.</h2>

        <div className="why-list">
          {reasons.map((item, idx) => (
            <div key={idx} className="why-row">
              <span className="why-number">{item.number}</span>
              <div className="why-content">
                <h3 className="why-title">{item.title}</h3>
                <p className="why-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
