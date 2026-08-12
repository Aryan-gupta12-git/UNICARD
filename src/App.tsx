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
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isProfileChecking, setIsProfileChecking] = useState<boolean>(true);
  const { isAuthenticated, isLoading, user } = useAuth();

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
            setView((prev) => (prev === 'landing' || prev === 'signin' || prev === 'signup' ? 'home' : prev));
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

      sections.forEach((sec) => {
        sec.classList.add('fade-in-section');
        observer.observe(sec);
      });

      return () => observer.disconnect();
    }
  }, [view]);

  // Protected route enforcement for onboarding or home
  const handleStartBuild = () => {
    if (isAuthenticated) {
      setView('home');
    } else {
      setView('signin');
    }
  };

  const handleNavigateHome = (targetId?: string) => {
    if (isAuthenticated) {
      setView('home');
    } else {
      setView('landing');
      if (targetId) {
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      }
    }
  };

  const handleViewPublicCard = (slug: string, origin?: AppView) => {
    if (origin) {
      setCardOriginView(origin);
    } else {
      setCardOriginView(view === 'view-card' ? cardOriginView : view);
    }
    setPublicSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('view-card');
  };

  const handleCreateNewCard = () => {
    setEditingCardId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('onboarding');
  };

  const handleEditCard = (cardIdOrSlug?: string) => {
    const targetId = cardIdOrSlug || publicSlug || userProfile?.id;
    setEditingCardId(targetId || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('onboarding');
  };

  const handleRefreshProfile = async () => {
    try {
      const res = await fetch('/api/unicard/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const active = data.profile || (Array.isArray(data.cards) ? data.cards[0] : null);
        setUserProfile(active || null);
        return active;
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
    return null;
  };

  const [isTypewriterActive, setIsTypewriterActive] = useState<boolean>(false);

  const isAuthView = view === 'signin' || view === 'signup' || view === 'forgot-password' || view === 'onboarding' || view === 'public-card';

  if (isLoading || (isAuthenticated && isProfileChecking)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-secondary)'
      }}>
        Loading UNICARD...
      </div>
    );
  }

  return (
    <div className="app-root">
      <Navbar
        onLoginClick={handleStartBuild}
        onHomeClick={handleNavigateHome}
        isAuthActive={isAuthView}
        onViewProfile={() => {
          if (userProfile?.slug) {
            handleViewPublicCard(userProfile.slug);
          } else {
            handleCreateNewCard();
          }
        }}
        activeView={view}
        onNavigateView={(navView) => setView(navView as AppView)}
        isTypewriterActive={isTypewriterActive}
      />
      
      {view === 'landing' && (
        <main>
          <Hero
            onLoginClick={handleStartBuild}
            onTypewriterStateChange={setIsTypewriterActive}
          />
          <AboutUs />
          <Benefits />
        </main>
      )}

      {view === 'signin' && (
        <SignIn
          onSwitchToSignUp={() => setView('signup')}
          onSwitchToForgotPassword={() => setView('forgot-password')}
          onSuccess={async () => {
            await handleRefreshProfile();
            setView('home');
          }}
        />
      )}

      {view === 'signup' && (
        <SignUp
          onSwitchToSignIn={() => setView('signin')}
          onSuccess={async () => {
            await handleRefreshProfile();
            setView('home');
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
          onClose={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setView(isAuthenticated ? 'home' : 'landing');
          }}
          onViewCard={handleViewPublicCard}
          onCompleteSuccess={async () => {
            await handleRefreshProfile();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setView('home');
          }}
        />
      )}

      {view === 'home' && (
        <Home
          userName={user?.name}
          profile={userProfile}
          onCreateCard={handleCreateNewCard}
          onNavigate={(targetView) => setView(targetView)}
        />
      )}

      {view === 'saved-cards' && (
        <SavedCards
          onViewCard={(slug) => handleViewPublicCard(slug, 'saved-cards')}
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
        />
      )}

      {view === 'view-card' && (
        <ViewCard
          slug={publicSlug}
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
