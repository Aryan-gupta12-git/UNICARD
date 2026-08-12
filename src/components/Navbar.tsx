import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface NavbarProps {
  onLoginClick?: () => void;
  onHomeClick?: (targetId?: string) => void;
  isAuthActive?: boolean;
  onViewProfile?: () => void;
  activeView?: string;
  onNavigateView?: (view: 'home' | 'my-cards' | 'saved-cards' | 'analytics') => void;
  onLogoutSuccess?: () => void;
  isTypewriterActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoginClick,
  onHomeClick,
  isAuthActive,
  onViewProfile,
  activeView = 'home',
  onNavigateView,
  onLogoutSuccess,
  isTypewriterActive = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const prevScrollY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // Handle mobile scroll hide/show with menu override
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768 || mobileMenuOpen || dropdownOpen) {
        setNavbarHidden(false);
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - prevScrollY.current;

      if (currentScrollY < 20) {
        setNavbarHidden(false);
      } else if (scrollDelta > 8) {
        setNavbarHidden(true);
      } else if (scrollDelta < -8) {
        setNavbarHidden(false);
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mobileMenuOpen, dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (isTypewriterActive) return;
    setMobileMenuOpen(false);
    if (onHomeClick) {
      onHomeClick(targetId);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleAuthenticatedNav = (e: React.MouseEvent<HTMLAnchorElement>, view: 'home' | 'my-cards' | 'saved-cards' | 'analytics') => {
    e.preventDefault();
    if (isTypewriterActive) return;
    setMobileMenuOpen(false);
    if (onNavigateView) {
      onNavigateView(view);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isTypewriterActive) return;
    setMobileMenuOpen(false);
    if (isAuthenticated && onNavigateView) {
      onNavigateView('home');
    } else if (onHomeClick) {
      onHomeClick();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (isTypewriterActive) return;
    setMobileMenuOpen(false);
    if (isAuthActive && onHomeClick) {
      onHomeClick();
    } else if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleSignOutClick = async () => {
    if (isTypewriterActive) return;
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    if (onLogoutSuccess) {
      onLogoutSuccess();
    } else if (onHomeClick) {
      onHomeClick();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <header className="navbar">
        <div className="container navbar-container">
          <a href="#" className="navbar-logo" onClick={(e) => e.preventDefault()}>
            UNICARD
          </a>
          <div className="navbar-actions">
            <div
              className="skeleton-pulse"
              style={{
                width: '100px',
                height: '36px',
                borderRadius: '9999px',
                backgroundColor: '#F0F3F7'
              }}
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`navbar ${navbarHidden ? 'is-hidden-mobile' : ''}`}>
      <div className="container navbar-container">
        {/* Left: Editorial Wordmark */}
        <a href="#" className={`navbar-logo ${isTypewriterActive ? 'is-disabled-nav' : ''}`} onClick={handleLogoClick}>
          UNICARD
        </a>

        {/* Center Navigation Links */}
        <nav className={`navbar-links ${isTypewriterActive ? 'is-disabled-nav' : ''}`}>
          {isAuthenticated ? (
            <>
              <a
                href="#home"
                className={activeView === 'home' ? 'is-active' : ''}
                onClick={(e) => handleAuthenticatedNav(e, 'home')}
              >
                Home
              </a>
              <a
                href="#my-cards"
                className={activeView === 'my-cards' ? 'is-active' : ''}
                onClick={(e) => handleAuthenticatedNav(e, 'my-cards')}
              >
                My Cards
              </a>
              <a
                href="#saved-cards"
                className={activeView === 'saved-cards' ? 'is-active' : ''}
                onClick={(e) => handleAuthenticatedNav(e, 'saved-cards')}
              >
                Saved Cards
              </a>
              <a
                href="#analytics"
                style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}
                onClick={(e) => e.preventDefault()}
              >
                Analytics
              </a>
            </>
          ) : (
            !isAuthActive && (
              <>
                <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>Mission</a>
                <a href="#benefits" onClick={(e) => handleNavClick(e, 'benefits')}>Benefits</a>
              </>
            )
          )}
        </nav>

        {/* Right CTA Action */}
        <div className={`navbar-actions ${isTypewriterActive ? 'is-disabled-nav' : ''}`}>
          {isAuthenticated ? (
            <div className="profile-dropdown-container" ref={dropdownRef}>
              <button
                className="btn btn-secondary navbar-cta profile-btn"
                onClick={() => !isTypewriterActive && setDropdownOpen(!dropdownOpen)}
                disabled={isTypewriterActive}
              >
                <User size={16} />
                <span>{user?.name || 'User'}</span>
                <ChevronDown size={14} className={`dropdown-chevron ${dropdownOpen ? 'is-open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown-menu">
                  <button
                    className="profile-dropdown-item"
                    disabled={true}
                    style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onViewProfile) onViewProfile();
                    }}
                  >
                    <User size={15} />
                    View Profile
                  </button>
                  <button
                    className="profile-dropdown-item profile-dropdown-logout"
                    onClick={handleSignOutClick}
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : !isAuthActive ? (
            <a href="#login" className="btn btn-primary navbar-cta" onClick={handleLogin}>
              Log in
            </a>
          ) : null}

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-toggle"
            onClick={() => !isTypewriterActive && setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            disabled={isTypewriterActive}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay Drawer */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="mobile-menu-inner">
          {isAuthenticated ? (
            <>
              <a
                href="#home"
                className={activeView === 'home' ? 'is-active' : ''}
                onClick={(e) => handleAuthenticatedNav(e, 'home')}
              >
                Home
              </a>
              <a
                href="#saved-cards"
                className={activeView === 'saved-cards' ? 'is-active' : ''}
                onClick={(e) => handleAuthenticatedNav(e, 'saved-cards')}
              >
                My Cards
              </a>
              <a
                href="#analytics"
                style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}
                onClick={(e) => e.preventDefault()}
              >
                Analytics
              </a>
            </>
          ) : isAuthActive ? (
            <button className="btn btn-secondary mobile-cta" onClick={handleLogin}>
              Back to site
            </button>
          ) : (
            <>
              <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>Mission</a>
              <a href="#benefits" onClick={(e) => handleNavClick(e, 'benefits')}>Benefits</a>
              <a href="#login" className="btn btn-primary mobile-cta" onClick={handleLogin}>
                Log in
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
