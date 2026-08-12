import React from 'react';
import { Share2, QrCode, Contact, Briefcase, Globe, RefreshCw } from 'lucide-react';
import './Benefits.css';

interface BenefitItem {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

export const Benefits: React.FC = () => {
  const benefits: BenefitItem[] = [
    {
      icon: Share2,
      title: "One shareable profile",
      subtitle: "Consolidate your identity, work, and links into one beautiful, unified card link."
    },
    {
      icon: QrCode,
      title: "Instant QR sharing",
      subtitle: "Allow camera scanning with zero app downloads required for instant connection."
    },
    {
      icon: Contact,
      title: "Direct contact save",
      subtitle: "Let new contacts save your email, phone, and details directly to their address book."
    },
    {
      icon: Briefcase,
      title: "Professional credentials",
      subtitle: "Highlight designations, company info, portfolios, and verified work credentials."
    },
    {
      icon: Globe,
      title: "Unified social presence",
      subtitle: "Connect LinkedIn, GitHub, X, websites, and custom links in one clean ecosystem."
    },
    {
      icon: RefreshCw,
      title: "Real-time updates",
      subtitle: "Edit role or contact info anytime — everyone with your card link sees live updates."
    }
  ];

  return (
    <section id="benefits" className="section benefits-section">
      <div className="container">
        <div className="benefits-header">
          <h2 className="benefits-heading">
            Less friction.<br />
            <span className="benefits-heading-sub">More connection.</span>
          </h2>
          <p className="benefits-subtext">
            Designed to replace physical business cards and fragmented bio links with one timeless digital presence.
          </p>
        </div>

        <div className="benefits-cards-grid">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="benefit-card">
                <div className="benefit-card-top">
                  <div className="benefit-icon-wrapper">
                    <Icon size={20} />
                  </div>
                </div>

                <div className="benefit-card-body">
                  <h3 className="benefit-card-title">{item.title}</h3>
                  <p className="benefit-card-subtitle">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
