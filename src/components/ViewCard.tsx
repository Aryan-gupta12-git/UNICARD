import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2, Check, ExternalLink, ArrowLeft, Eye, Edit } from 'lucide-react';
import './ViewCard.css';

interface ViewCardProps {
  profile?: any | null;
  slug?: string;
  onBackToHome?: () => void;
  onPreviewCard?: (slug: string) => void;
  onEditCard?: () => void;
}

export const ViewCard: React.FC<ViewCardProps> = ({
  profile: initialProfile = null,
  slug: initialSlug = '',
  onBackToHome,
  onPreviewCard,
  onEditCard
}) => {
  const [profileData, setProfileData] = useState<any | null>(initialProfile);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!initialProfile && Boolean(initialSlug));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If initialProfile is not provided but initialSlug exists, fetch public profile
  useEffect(() => {
    const fetchPublicCardData = async () => {
      if (initialProfile) {
        setProfileData(initialProfile);
        setIsLoadingProfile(false);
        return;
      }

      if (initialSlug) {
        try {
          const res = await fetch(`/api/unicard/public/${initialSlug}`);
          if (res.ok) {
            const data = await res.json();
            setProfileData(data.profile || null);
          }
        } catch (err) {
          console.error('Failed to fetch profile for view card:', err);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };

    fetchPublicCardData();
  }, [initialProfile, initialSlug]);

  const slug = profileData?.slug || initialSlug || 'user';
  const publicUrl = `unicard.app/u/${slug}`;
  const fullUrl = `https://${publicUrl}`;

  // Download QR code as PNG image fully on frontend
  const handleDownloadQR = () => {
    const canvas = canvasRef.current || document.querySelector('.view-card-qr-box canvas') as HTMLCanvasElement;
    if (canvas) {
      const imageUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUrl;
      downloadLink.download = `unicard-${slug}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Share user's public link using Web Share API or clipboard fallback
  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData?.name || 'UNICARD'}`,
          text: `Check out ${profileData?.name || 'UNICARD'}'s digital card`,
          url: fullUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share dialog is cancelled or fails
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Derive presence label
  const getPresenceLabel = () => {
    if (!profileData) return null;
    const online = Boolean(profileData.onlinePresence);
    const offline = Boolean(profileData.offlinePresence);
    if (online && offline) return 'Online & Offline';
    if (online) return 'Online';
    if (offline) return 'Offline';
    return null;
  };

  const presenceLabel = getPresenceLabel();

  // Check if business details exist
  const hasBusinessDetails = Boolean(
    profileData?.businessName ||
    profileData?.designation ||
    profileData?.businessAddress ||
    profileData?.businessCategory ||
    presenceLabel
  );

  // Filter entered social links
  const validSocials = Array.isArray(profileData?.socials)
    ? profileData.socials.filter((s: { platform?: string; url?: string }) => s.url && s.url.trim() !== '')
    : [];

  const hasLinks = Boolean(profileData?.website || validSocials.length > 0);

  if (isLoadingProfile) {
    return (
      <div className="auth-product-page">
        <div className="view-card-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading UNICARD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-product-page">
      <div className="view-card-container">
        {/* Top Back Header Bar */}
        <div className="view-card-top-bar">
          {onBackToHome && (
            <button type="button" className="btn-text-back" onClick={onBackToHome}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Desktop Two-Column / Mobile Stacked Layout */}
        <div className="view-card-grid">
          {/* LEFT SIDE — QR CODE AREA */}
          <div className="view-card-left">
            <div className="view-card-qr-box">
              <div className="qr-canvas-wrapper">
                <QRCodeCanvas
                  ref={canvasRef}
                  value={fullUrl}
                  size={320}
                  level="H"
                  marginSize={1}
                  bgColor="#FFFFFF"
                  fgColor="#0F1E36"
                />
              </div>
              <div className="qr-url-text">
                <span className="url-domain">unicard.app/u/</span>
                <span className="url-slug-val">{slug}</span>
              </div>
            </div>

            {/* Action Buttons: Download, Share, & Preview */}
            <div className="view-card-qr-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownloadQR}
              >
                <Download size={15} />
                <span>Download</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleShareLink}
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (onPreviewCard) {
                    onPreviewCard(slug);
                  } else {
                    window.open(fullUrl, '_blank');
                  }
                }}
              >
                <Eye size={15} />
                <span>Preview</span>
              </button>

              {onEditCard && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onEditCard}
                >
                  <Edit size={15} />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — CARD INFORMATION DETAILS */}
          <div className="view-card-right">
            {/* 1. Personal Details Section */}
            <section className="view-card-section">
              <h2 className="view-card-section-title">Personal Details</h2>
              <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value detail-value-title">{profileData?.name || '—'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{profileData?.email || '—'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{profileData?.phone || '—'}</span>
                </div>

                {profileData?.bio && (
                  <div className="detail-item">
                    <span className="detail-label">Bio</span>
                    <span className="detail-value detail-bio">{profileData.bio}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Business Details Section */}
            <section className="view-card-section">
              <h2 className="view-card-section-title">Business Details</h2>
              {hasBusinessDetails ? (
                <div className="details-list">
                  {profileData?.businessName && (
                    <div className="detail-item">
                      <span className="detail-label">Business Name</span>
                      <span className="detail-value">{profileData.businessName}</span>
                    </div>
                  )}

                  {profileData?.designation && (
                    <div className="detail-item">
                      <span className="detail-label">Designation</span>
                      <span className="detail-value">{profileData.designation}</span>
                    </div>
                  )}

                  {profileData?.businessAddress && (
                    <div className="detail-item">
                      <span className="detail-label">Business Address</span>
                      <span className="detail-value">{profileData.businessAddress}</span>
                    </div>
                  )}

                  {profileData?.businessCategory && (
                    <div className="detail-item">
                      <span className="detail-label">Business Category</span>
                      <span className="detail-value">{profileData.businessCategory}</span>
                    </div>
                  )}

                  {presenceLabel && (
                    <div className="detail-item">
                      <span className="detail-label">Presence</span>
                      <span className="detail-value">{presenceLabel}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="detail-empty-text">No business details added.</p>
              )}
            </section>

            {/* 3. Links Section */}
            <section className="view-card-section">
              <h2 className="view-card-section-title">Links</h2>
              {hasLinks ? (
                <div className="details-list">
                  {profileData?.website && (
                    <div className="detail-item">
                      <span className="detail-label">Website</span>
                      <a
                        href={profileData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        <span>{profileData.website}</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {validSocials.map((s: { platform: string; url: string }, idx: number) => {
                    const platformName = s.platform
                      ? s.platform.charAt(0).toUpperCase() + s.platform.slice(1)
                      : 'Link';
                    return (
                      <div key={idx} className="detail-item">
                        <span className="detail-label">{platformName}</span>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-link"
                        >
                          <span>{s.url}</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="detail-empty-text">No links added.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
