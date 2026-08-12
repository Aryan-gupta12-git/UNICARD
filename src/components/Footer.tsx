import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navHeight = 76;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-top">
          <a href="#" className="footer-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            UNICARD
          </a>
          <nav className="footer-links">
            <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>Mission</a>
            <span className="footer-sep">·</span>
            <a href="#benefits" onClick={(e) => handleNavClick(e, 'benefits')}>Benefits</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="copyright">© 2026 UNICARD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
