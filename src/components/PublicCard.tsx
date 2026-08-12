import React, { useEffect, useState } from 'react';
import './Auth/Auth.css';

interface PublicCardProps {
  slug: string;
  onHomeClick: () => void;
}

interface PublicProfileData {
  name: string;
  designation?: string;
  businessName?: string;
}

export const PublicCard: React.FC<PublicCardProps> = ({ slug, onHomeClick }) => {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const response = await fetch(`/api/unicard/public/${slug}`);
        if (!response.ok) {
          setError('Public UNICARD profile not found.');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        console.error('Fetch public profile error:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPublicProfile();
    }
  }, [slug]);

  return (
    <div className="auth-page" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <main className="auth-main">
        <div className="container" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div className="auth-card" style={{ gap: '16px', alignItems: 'center' }}>
            <span className="eyebrow">UNICARD</span>

            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading UNICARD profile...</p>
            ) : error ? (
              <div>
                <h2 className="auth-title" style={{ fontSize: '32px' }}>Profile Not Found</h2>
                <p className="auth-subtitle">{error}</p>
              </div>
            ) : (
              <div>
                <h1 className="auth-title" style={{ fontSize: '48px', marginBottom: '8px' }}>
                  {profile?.name || 'UNICARD Profile'}
                </h1>
                {profile?.designation && (
                  <p className="auth-subtitle" style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {profile.designation} {profile.businessName ? `at ${profile.businessName}` : ''}
                  </p>
                )}
                <p className="auth-subtitle" style={{ marginTop: '16px', fontStyle: 'italic' }}>
                  Public profile coming next.
                </p>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={onHomeClick}>
                Return to Site
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
