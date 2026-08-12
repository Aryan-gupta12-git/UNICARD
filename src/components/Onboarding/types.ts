export interface SocialItem {
  platform: string;
  url: string;
}

export interface OnboardingData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  usageType: 'personal' | 'business' | null;
  theme?: 'comic-theme' | 'pink-pop-theme' | 'spider-comic-theme';
  business: {
    name: string;
    designation: string;
    address: string;
    category: string;
  };
  presence: {
    offline: boolean;
    online: boolean;
  };
  website: string;
  socials: SocialItem[];
}

export const BUSINESS_CATEGORIES: string[] = [
  'Technology',
  'Software / IT',
  'Design',
  'Marketing',
  'Consulting',
  'Finance',
  'Education',
  'Healthcare',
  'Legal',
  'Real Estate',
  'Retail',
  'E-commerce',
  'Food & Restaurant',
  'Hospitality',
  'Travel',
  'Fitness',
  'Beauty & Wellness',
  'Photography',
  'Media & Entertainment',
  'Manufacturing',
  'Construction',
  'Automotive',
  'Non-Profit',
  'Freelancer',
  'Other'
];

export const SOCIAL_PLATFORMS: string[] = [
  'Instagram',
  'LinkedIn',
  'GitHub',
  'X / Twitter',
  'Facebook',
  'YouTube',
  'WhatsApp',
  'Telegram',
  'Threads',
  'Behance',
  'Dribbble',
  'Medium',
  'Pinterest',
  'TikTok',
  'Discord',
  'Portfolio',
  'Other'
];
