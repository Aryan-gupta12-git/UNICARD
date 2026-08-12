import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2, Check, ArrowLeft, Eye, Edit } from 'lucide-react';
import './ViewCard.css';

interface ViewCardProps {
  profile?: any | null;
  slug?: string;
  onBackToHome?: () => void;
  onPreviewCard?: (slug: string) => void;
  onEditCard?: (slug: string) => void;
}

export const ViewCard: React.FC<ViewCardProps> = ({
  slug: initialSlug = '',
  onBackToHome,
  onPreviewCard,
  onEditCard
}) => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch card data directly using the target card ID / slug
  useEffect(() => {
    const fetchSpecificCardData = async () => {
      if (!initialSlug) {
        setIsLoadingProfile(false);
        return;
      }

      setProfileData(null);
      setIsLoadingProfile(true);

      try {
        // Fetch specific card from protected cards endpoint
        let res = await fetch(`/api/unicard/cards/${initialSlug}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.card || data.profile) {
            setProfileData(data.card || data.profile);
            return;
          }
        }

        // Fallback to public endpoint
        res = await fetch(`/api/unicard/public/${initialSlug}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data.profile || null);
        }
      } catch (err) {
        console.error('Failed to fetch card by ID for view:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchSpecificCardData();
  }, [initialSlug]);

  const cardSlug = profileData?.slug || initialSlug || 'user';
  const publicUrl = `unicard.app/u/${cardSlug}`;
  const fullUrl = `https://${publicUrl}`;

  // Download QR code as PNG image fully on frontend
  const handleDownloadQR = () => {
    const canvas = canvasRef.current || document.querySelector('.view-card-qr-box canvas') as HTMLCanvasElement;
    if (canvas) {
      const imageUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUrl;
      downloadLink.download = `unicard-${cardSlug}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Web Share API
  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData?.name || 'UNICARD'} Contact Card`,
          text: `Connect with ${profileData?.name || 'me'} on UNICARD`,
          url: fullUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

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

  const isPersonal = String(profileData?.usageType || '').toUpperCase() === 'PERSONAL';
  const roleOrBusinessLabel = isPersonal ? 'Profession / Role' : 'Company Name';
  const userProfession = profileData?.designation || profileData?.profession || '';
  const roleOrBusinessValue = isPersonal
    ? userProfession
    : (profileData?.businessName || '');

  const hasBusinessDetails = Boolean(
    profileData?.businessName ||
    userProfession ||
    profileData?.businessAddress ||
    profileData?.businessCategory ||
    presenceLabel
  );

  const validSocials = Array.isArray(profileData?.socials)
    ? profileData.socials.filter((s: { platform?: string; url?: string }) => s.url && s.url.trim() !== '')
    : [];

  const hasLinks = Boolean(profileData?.website || validSocials.length > 0);

  if (isLoadingProfile) {
    return (
      <div className="auth-product-page">
        <div className="view-card-container">
          <div className="view-card-top-bar">
            {onBackToHome && (
              <button type="button" className="btn-text-back" onClick={onBackToHome}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
          </div>
          <div className="view-card-grid" style={{ marginTop: '24px' }}>
            <div className="view-card-left">
              <div className="skeleton-pulse" style={{ height: '360px', borderRadius: '24px', backgroundColor: '#F0F3F7' }} />
            </div>
            <div className="view-card-right" style={{ gap: '24px' }}>
              <div className="skeleton-pulse" style={{ height: '140px', borderRadius: '16px', backgroundColor: '#F0F3F7' }} />
              <div className="skeleton-pulse" style={{ height: '140px', borderRadius: '16px', backgroundColor: '#F0F3F7' }} />
            </div>
          </div>
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
                  marginSize={0}
                  aria-label={`QR Code link for ${profileData?.name || 'UNICARD'}`}
                />
              </div>
            </div>

            {/* Action Buttons: Download, Share, Preview, & Edit */}
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
                    onPreviewCard(cardSlug);
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
                  onClick={() => onEditCard(cardSlug)}
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
                  <span className="detail-value">{profileData?.name || '—'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{profileData?.email || '—'}</span>
                </div>

                {userProfession && (
                  <div className="detail-item">
                    <span className="detail-label">Profession</span>
                    <span className="detail-value">{userProfession}</span>
                  </div>
                )}

                {profileData?.phone && (
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{profileData.phone}</span>
                  </div>
                )}

                {profileData?.bio && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Bio</span>
                    <p className="detail-value bio-text">{profileData.bio}</p>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Business / Profession Details Section */}
            {hasBusinessDetails && (
              <section className="view-card-section">
                <h2 className="view-card-section-title">
                  {isPersonal ? 'Profession Details' : 'Business Details'}
                </h2>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">{roleOrBusinessLabel}</span>
                    <span className="detail-value">{roleOrBusinessValue}</span>
                  </div>

                  {!isPersonal && profileData?.designation && (
                    <div className="detail-item">
                      <span className="detail-label">Title / Designation</span>
                      <span className="detail-value">{profileData.designation}</span>
                    </div>
                  )}

                  {profileData?.businessCategory && (
                    <div className="detail-item">
                      <span className="detail-label">Category</span>
                      <span className="detail-value">{profileData.businessCategory}</span>
                    </div>
                  )}

                  {presenceLabel && (
                    <div className="detail-item">
                      <span className="detail-label">Presence</span>
                      <span className="detail-value">{presenceLabel}</span>
                    </div>
                  )}

                  {profileData?.businessAddress && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{profileData.businessAddress}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. Links & Socials Section */}
            {hasLinks && (
              <section className="view-card-section">
                <h2 className="view-card-section-title">Links & Socials</h2>
                <div className="socials-list">
                  {profileData?.website && (
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-link"
                    >
                      <span className="social-platform-name">Website</span>
                      <span className="social-url-text">{profileData.website}</span>
                    </a>
                  )}

                  {validSocials.map((social: { platform: string; url: string }, idx: number) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-link"
                    >
                      <span className="social-platform-name">
                        {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                      </span>
                      <span className="social-url-text">{social.url}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
