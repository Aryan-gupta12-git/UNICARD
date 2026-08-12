import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import './Hero.css';

interface HeroProps {
  onLoginClick?: () => void;
  onTypewriterStateChange?: (isActive: boolean) => void;
}

const SECTIONS = [
  {
    heading: 'About Us',
    text: "UNICARD began with a simple thought — staying connected shouldn’t mean searching through different apps just to find someone again.\n\nWe wanted to create one place that feels truly yours, where your work, contact details, story, and important links come together naturally.\n\nSomething simple to share, easy to update, and always with you.\n\nUNICARD is your introduction, made simpler."
  },
  {
    heading: 'Why You Should Choose Us',
    text: "Some of the most meaningful connections begin with just a small introduction.\n\nUNICARD helps you leave behind something more than just a name — it gives people a simple way to remember who you are, what you do, and how to reach you again.\n\nNo scattered links. No forgotten details. No paper card that disappears into a wallet.\n\nJust one place that keeps the connection going after the conversation ends."
  },
  {
    heading: 'Community Note',
    text: "Thank you for choosing UNICARD.\n\nWe hope it makes every introduction a little easier, every connection a little more personal, and gives you an experience that feels simple from the very first card you create.\n\nWe’re excited to have you here and hope you have a wonderful experience using UNICARD.\n\nHere’s to the people you meet and the connections that come next."
  }
];

export const Hero: React.FC<HeroProps> = ({ onLoginClick, onTypewriterStateChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  // Notify parent of typewriter active status
  useEffect(() => {
    if (onTypewriterStateChange) {
      onTypewriterStateChange(isModalOpen);
    }
  }, [isModalOpen, onTypewriterStateChange]);

  // Single-pass typewriter engine
  useEffect(() => {
    if (!isModalOpen) return;

    const currentSection = SECTIONS[currentStepIndex];
    if (!currentSection) return;

    let charIndex = 0;
    let stepTimeoutId: ReturnType<typeof setTimeout> | null = null;

    setDisplayedText('');

    const typingInterval = setInterval(() => {
      if (charIndex < currentSection.text.length) {
        setDisplayedText(currentSection.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);

        // Transition to next section if available after reading pause
        if (currentStepIndex < SECTIONS.length - 1) {
          stepTimeoutId = setTimeout(() => {
            setCurrentStepIndex((prev) => prev + 1);
          }, 2400);
        } else {
          setIsFinished(true);
        }
      }
    }, 18);

    return () => {
      clearInterval(typingInterval);
      if (stepTimeoutId) clearTimeout(stepTimeoutId);
    };
  }, [isModalOpen, currentStepIndex]);

  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onLoginClick) {
      onLoginClick();
    } else {
      const element = document.getElementById('cta');
      if (element) {
        const navHeight = 76;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleOpenModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
    setCurrentStepIndex(0);
    setDisplayedText('');
    setIsFinished(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStepIndex(0);
    setDisplayedText('');
    setIsFinished(false);
  };

  const activeHeading = SECTIONS[currentStepIndex]?.heading || 'About Us';

  return (
    <section className={`hero-section ${isModalOpen ? 'is-white-screen' : ''}`}>
      <div className="container hero-container">
        {!isModalOpen ? (
          <div className="hero-content-wrapper fade-in-section is-visible">
            {/* Playfair Display Headline */}
            <h1 className="hero-headline">
              One card.<br />
              <span className="hero-headline-sub">Everything about you.</span>
            </h1>

            {/* Supporting Inter Paragraph */}
            <p className="hero-copy">
              UNICARD brings your identity, work, contact details and important links together in one place — ready to share whenever you need it.
            </p>

            {/* Actions */}
            <div className="hero-actions">
              <a href="#login" className="btn btn-primary" onClick={handleLoginClick}>
                Get Started
              </a>
              <a href="#about" className="btn btn-secondary" onClick={handleOpenModal}>
                Know Us?
              </a>
            </div>
          </div>
        ) : (
          <div className="white-screen-story-wrapper fade-in-section is-visible">
            <div className="white-screen-story-card">
              {/* Header: Title positioned directly at top left with Close icon at top right */}
              <div className="story-card-top">
                <h2 className="story-heading">{activeHeading}</h2>
                <button
                  type="button"
                  className="story-close-btn"
                  onClick={handleCloseModal}
                  title="Close story"
                  aria-label="Close story"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Typing Body Area */}
              <div className="story-body">
                <p className="story-text">
                  {displayedText}
                  <span className="story-cursor">|</span>
                </p>
              </div>

              {/* Footer Indicator & Controls */}
              <div className="story-footer">
                <div className="story-indicators">
                  {SECTIONS.map((sec, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`story-dot ${idx === currentStepIndex ? 'is-active' : ''} ${idx < currentStepIndex ? 'is-completed' : ''}`}
                      onClick={() => setCurrentStepIndex(idx)}
                      title={sec.heading}
                    />
                  ))}
                </div>

                <div className="story-actions-group">
                  <button
                    type="button"
                    className="btn btn-secondary story-action-btn"
                    onClick={handleCloseModal}
                  >
                    {isFinished ? <Check size={16} /> : null}
                    <span>{isFinished ? 'Got It' : 'Skip & Close'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
