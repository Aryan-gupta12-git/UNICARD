import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Download, Check } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Auth/Auth.css';
import './Home.css';

interface PublicCardProps {
  slug: string;
  onHomeClick: () => void;
  onNavigateToSavedCards?: () => void;
  onNavigateToAuth?: (view: 'signin' | 'signup') => void;
  onCardSaved?: () => void;
}

export const PublicCard: React.FC<PublicCardProps> = ({
  slug,
  onHomeClick,
  onNavigateToSavedCards,
  onNavigateToAuth,
  onCardSaved
}) => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Let Us Save action states
  const [isSavingCard, setIsSavingCard] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setNotFound(false);
      setSaveMessage(null);
      setSaveSuccess(false);

      try {
        const response = await fetch(`/api/unicard/public/${slug}`);
        if (!response.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        console.error('Fetch public profile error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPublicProfile();
    }
  }, [slug]);

  // Action 1: Save Contact (vCard .vcf file download)
  const handleSaveContact = () => {
    if (!profile) return;
    const name = profile.name || 'UNICARD Contact';
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const profession = profile.designation || '';
    const email = profile.email || '';
    const phone = profile.phone || '';
    const org = profile.businessName || '';
    const url = profile.website || (typeof window !== 'undefined' ? window.location.href : '');

    const vcardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${name};;;;`,
      `FN:${name}`,
      profession ? `TITLE:${profession}` : '',
      phone ? `TEL;TYPE=CELL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      org ? `ORG:${org}` : '',
      url ? `URL:${url}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${sanitizedName}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  // Action 2: Let Us Save (Save card to account)
  const handleLetUsSave = async () => {
    if (!profile) return;

    if (!isAuthenticated) {
      // Store pending save slug in sessionStorage
      sessionStorage.setItem('pending_save_slug', profile.slug || slug);
      if (onNavigateToAuth) {
        onNavigateToAuth('signup');
      } else {
        onHomeClick();
      }
      return;
    }

    setIsSavingCard(true);
    setSaveMessage(null);

    try {
      const targetId = profile.id || profile.slug || slug;
      const res = await fetch(`/api/unicard/saved-cards/${targetId}`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok || (data.error && data.error.toLowerCase().includes('already saved'))) {
        setSaveSuccess(true);
        setSaveMessage(res.ok ? 'Card saved to your account!' : 'Card already saved in your account.');
        if (onCardSaved) onCardSaved();
      } else {
        setSaveMessage(data.error || 'Failed to save card.');
      }
    } catch (err) {
      console.error('Let Us Save error:', err);
      setSaveMessage('Network error. Failed to save card.');
    } finally {
      setIsSavingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-product-page" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
        <div className="home-container" style={{ maxWidth: '440px', padding: '60px 24px' }}>
          <div
            className="card-box skeleton-pulse"
            style={{
              minHeight: '260px',
              backgroundColor: '#F0F3F7',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}
          />
          <div className="skeleton-pulse" style={{ height: '48px', borderRadius: '24px', backgroundColor: '#F0F3F7', marginBottom: '12px' }} />
          <div className="skeleton-pulse" style={{ height: '48px', borderRadius: '24px', backgroundColor: '#F0F3F7' }} />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="auth-product-page" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
        <div className="home-container" style={{ maxWidth: '480px', textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', color: '#0F1E36', marginBottom: '8px' }}>
              This card is no longer available.
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              The profile link may have been updated or removed.
            </p>
            <button className="btn btn-secondary" onClick={onHomeClick}>
              Return to Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  const themeClass = profile.theme === 'pink-theme' ? 'pink-pop-theme' : (profile.theme || 'comic-theme');
  const isPersonal = String(profile.usageType || '').toUpperCase() === 'PERSONAL';
  const metaLabel = isPersonal ? 'PROFESSION' : 'BUSINESS';
  const metaValue = isPersonal
    ? (profile.designation || profile.businessName || '')
    : (profile.businessName || '');

  return (
    <div className="auth-product-page" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="home-container" style={{ maxWidth: '440px', padding: '48px 24px 64px 24px' }}>
        {/* Render Card Artwork in Original Theme */}
        <div className={`card-box ${themeClass}`} style={{ width: '100%', marginBottom: '28px', cursor: 'default' }}>
          <div className="card-box-main">
            <h3 className="card-user-name">{profile.name}</h3>
          </div>
          {(metaValue || !isPersonal) && (
            <div className="card-meta-row">
              <span className="card-business-label">{metaLabel}</span>
              <span className="card-business-name">{metaValue}</span>
            </div>
          )}
        </div>

        {/* Feedback message banner if any */}
        {saveMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: saveSuccess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: saveSuccess ? '#15803D' : '#DC2626',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            marginBottom: '16px',
            border: `1px solid ${saveSuccess ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {saveMessage}
          </div>
        )}

        {/* Two Primary Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSaveContact}
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={18} />
            <span>Save Contact</span>
          </button>

          {saveSuccess ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (onNavigateToSavedCards) onNavigateToSavedCards();
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={18} />
              <span>View in Saved Cards</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLetUsSave}
              disabled={isSavingCard}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isSavingCard ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <DotLottieReact
                    src="https://lottie.host/c50fba5a-6759-4ed6-abb1-895e287827c0/yYW2rfV8hL.lottie"
                    loop
                    autoplay
                    style={{ width: '28px', height: '28px' }}
                  />
                  <span>Saving...</span>
                </span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Let Us Save</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
