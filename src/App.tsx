import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutUs } from './components/AboutUs';
import { Benefits } from './components/Benefits';
import { Footer } from './components/Footer';
import { Onboarding } from './components/Onboarding/Onboarding';
import { SignIn } from './components/Auth/SignIn';
import { SignUp } from './components/Auth/SignUp';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { PublicCard } from './components/PublicCard';
import { Home } from './components/Home';
import { SavedCards } from './components/SavedCards';
import { Analytics } from './components/Analytics';
import { ViewCard } from './components/ViewCard';

type AppView =
  | 'landing'
  | 'signin'
  | 'signup'
  | 'forgot-password'
  | 'onboarding'
  | 'home'
  | 'saved-cards'
  | 'analytics'
  | 'public-card'
  | 'view-card';

const MainAppContent: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [publicSlug, setPublicSlug] = useState<string>('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardOriginView, setCardOriginView] = useState<AppView>('home');
  const [isReadOnlyCardView, setIsReadOnlyCardView] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isProfileChecking, setIsProfileChecking] = useState<boolean>(true);
  const { isAuthenticated, isLoading } = useAuth();

  // Check URL pathname for /c/:slug or /u/:slug on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/(?:c|u)\/([^/]+)/);
    if (match && match[1]) {
      setPublicSlug(match[1]);
      setView('public-card');
    }
  }, []);

  // Process pending save card after auth
  const processPendingSaveCard = async (): Promise<boolean> => {
    const pendingSlug = sessionStorage.getItem('pending_save_slug');
    if (pendingSlug) {
      try {
        const res = await fetch(`/api/unicard/saved-cards/${pendingSlug}`, {
          method: 'POST',
          credentials: 'include'
        });
        if (res.ok) {
          sessionStorage.removeItem('pending_save_slug');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setView('saved-cards');
          return true;
        }
      } catch (err) {
        console.error('Pending save card error:', err);
      } finally {
        sessionStorage.removeItem('pending_save_slug');
      }
    }
    return false;
  };

  // Restore session & check profile on app mount or auth change
  useEffect(() => {
    const checkUserProfile = async () => {
      if (isLoading) return;

      if (isAuthenticated) {
        try {
          const res = await fetch('/api/unicard/me', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              setUserProfile(data.profile);
            } else if (Array.isArray(data.cards) && data.cards.length > 0) {
              setUserProfile(data.cards[0]);
            } else {
              setUserProfile(null);
            }

            const savedPending = await processPendingSaveCard();
            if (!savedPending) {
              setView((prev) => (prev === 'landing' || prev === 'signin' || prev === 'signup' ? 'home' : prev));
            }
          }
        } catch (err) {
          console.error('Error checking UNICARD profile:', err);
        } finally {
          setIsProfileChecking(false);
        }
      } else {
        setUserProfile(null);
        setIsProfileChecking(false);
        setView((prev) => (prev === 'home' || prev === 'saved-cards' || prev === 'analytics' || prev === 'onboarding' ? 'landing' : prev));
      }
    };

    checkUserProfile();
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (view === 'landing') {
      const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      };

      const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);
      const sections = document.querySelectorAll('.section');

      sections.forEach((section) => {
        observer.observe(section);
      });

      return () => {
        sections.forEach((section) => {
          observer.unobserve(section);
        });
      };
    }
  }, [view]);

  const handleRefreshProfile = async () => {
    try {
      const res = await fetch('/api/unicard/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setUserProfile(data.profile);
        } else if (Array.isArray(data.cards) && data.cards.length > 0) {
          setUserProfile(data.cards[0]);
        }
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const handleViewCard = (slug: string, originView: AppView = 'home', isReadOnly: boolean = false) => {
    setPublicSlug(slug);
    setCardOriginView(originView);
    setIsReadOnlyCardView(isReadOnly);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('view-card');
  };

  const handleEditCard = (cardSlugOrId?: string) => {
    setEditingCardId(cardSlugOrId || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('onboarding');
  };

  const handleCreateNewCard = () => {
    setEditingCardId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('onboarding');
  };

  if (isLoading || (isAuthenticated && isProfileChecking && view !== 'public-card')) {
    return (
      <div className="auth-product-page">
        <Navbar
          activeView={view}
          onNavigateView={(v) => setView(v as AppView)}
          onLoginClick={() => setView('signin')}
        />
        <div className="home-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading UNICARD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar
        activeView={view}
        onNavigateView={(v) => setView(v as AppView)}
        onLoginClick={() => setView('signin')}
      />

      {view === 'landing' && (
        <main>
          <Hero />
          <AboutUs />
          <Benefits />
        </main>
      )}

      {view === 'signin' && (
        <SignIn
          onSwitchToSignUp={() => setView('signup')}
          onSwitchToForgotPassword={() => setView('forgot-password')}
          onSuccess={async () => {
            const savedPending = await processPendingSaveCard();
            if (!savedPending) {
              await handleRefreshProfile();
              setView('home');
            }
          }}
        />
      )}

      {view === 'signup' && (
        <SignUp
          onSwitchToSignIn={() => setView('signin')}
          onSuccess={async () => {
            const savedPending = await processPendingSaveCard();
            if (!savedPending) {
              await handleRefreshProfile();
              setView('home');
            }
          }}
        />
      )}

      {view === 'forgot-password' && (
        <ForgotPassword
          onSwitchToSignIn={() => setView('signin')}
        />
      )}

      {view === 'onboarding' && (
        <Onboarding
          editingCardId={editingCardId}
          onClose={async () => {
            await handleRefreshProfile();
            setView('saved-cards');
          }}
        />
      )}

      {view === 'home' && (
        <Home
          profile={userProfile}
          onViewCard={(slug) => handleViewCard(slug, 'home', false)}
          onCreateCard={handleCreateNewCard}
        />
      )}

      {view === 'saved-cards' && (
        <SavedCards
          mode="my-cards"
          onViewCard={(slug) => handleViewCard(slug, 'saved-cards', false)}
          onCreateCard={handleCreateNewCard}
        />
      )}

      {view === 'analytics' && (
        <Analytics />
      )}

      {view === 'public-card' && (
        <PublicCard
          slug={publicSlug}
          onHomeClick={() => setView(isAuthenticated ? 'home' : 'landing')}
          onNavigateToSavedCards={() => setView('saved-cards')}
          onNavigateToAuth={(authView) => setView(authView)}
        />
      )}

      {view === 'view-card' && (
        <ViewCard
          slug={publicSlug}
          isReadOnly={isReadOnlyCardView}
          onBackToHome={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setView(cardOriginView || (isAuthenticated ? 'home' : 'landing'));
          }}
          onPreviewCard={(slug) => {
            setPublicSlug(slug);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setView('public-card');
          }}
          onEditCard={(targetSlug) => handleEditCard(targetSlug)}
        />
      )}

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
