import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const router = Router();
const COOKIE_NAME = 'unicard_token';

// Helper to get JWT_SECRET strictly from environment variable
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return secret;
};

// Auth middleware
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: 'Unauthenticated. Please log in.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (err) {
      if (err.message.includes('JWT_SECRET')) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: err.message || 'Internal authentication error.' });
  }
};

// Helper: Convert string to lowercase clean slug base
const generateSlugBase = (name) => {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Helper: Ensure slug uniqueness
const getUniqueSlug = async (name, currentProfileId = null) => {
  let baseSlug = generateSlugBase(name) || 'unicard';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.uniCardProfile.findUnique({
      where: { slug }
    });

    if (!existing || (currentProfileId && existing.id === currentProfileId)) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

// Helper: Validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

// Helper: Validate URL format requiring dot and TLD
const isValidUrl = (urlStr) => {
  if (!urlStr || !String(urlStr).trim()) return true;
  const trimmed = String(urlStr).trim();
  try {
    const formattedUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(formattedUrl);
    const hostParts = parsed.hostname.split('.');
    return parsed.hostname.includes('.') && (hostParts[hostParts.length - 1]?.length || 0) >= 2;
  } catch {
    return false;
  }
};

// Helper: Normalize URL to have https:// scheme
const normalizeUrl = (urlStr) => {
  if (!urlStr || !String(urlStr).trim()) return null;
  const trimmed = String(urlStr).trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
};

// POST /api/unicard - Create or update UniCard Profile
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      bio,
      theme,
      usageType,
      business,
      presence,
      website,
      socials,
      profileImageUrl
    } = req.body;

    // Field validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPhone = String(phone || '').trim();
    const cleanTheme = theme ? String(theme).trim() : 'comic-theme';
    const normalizedUsageType = usageType ? String(usageType).toUpperCase() : 'PERSONAL';

    if (!cleanName) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!['PERSONAL', 'BUSINESS'].includes(normalizedUsageType)) {
      return res.status(400).json({ error: 'Usage type must be Personal or Business.' });
    }

    // Business validation if usageType is BUSINESS
    let businessName = null;
    let designation = null;
    let businessAddress = null;
    let businessCategory = null;

    if (normalizedUsageType === 'BUSINESS') {
      businessName = business?.name ? String(business.name).trim() : null;
      designation = business?.designation ? String(business.designation).trim() : null;
      businessAddress = business?.address ? String(business.address).trim() : null;
      businessCategory = business?.category ? String(business.category).trim() : null;

      if (!businessName || !designation) {
        return res.status(400).json({ error: 'Company Name and Title/Designation are required for business cards.' });
      }
    }

    // Presence validation
    const offlinePresence = Boolean(presence?.offline);
    const onlinePresence = Boolean(presence?.online);

    // Optional website validation & normalization
    let cleanWebsite = null;
    if (website && String(website).trim()) {
      if (!isValidUrl(website)) {
        return res.status(400).json({ error: 'Please enter a valid website URL, for example https://example.com' });
      }
      cleanWebsite = normalizeUrl(website);
    }

    // Social links array formatting & validation
    const validSocials = [];
    if (Array.isArray(socials)) {
      for (const s of socials) {
        if (s && s.platform && s.url && String(s.url).trim()) {
          if (!isValidUrl(s.url)) {
            return res.status(400).json({ error: `Please enter a valid URL for ${s.platform}, for example https://example.com` });
          }
          validSocials.push({
            platform: String(s.platform).toLowerCase().trim(),
            url: normalizeUrl(s.url)
          });
        }
      }
    }

    // Check existing profile for this user
    const existingProfile = await prisma.uniCardProfile.findUnique({
      where: { userId: req.user.id },
      include: { socials: true }
    });

    let slug;
    if (existingProfile) {
      slug = existingProfile.slug;
    } else {
      slug = await getUniqueSlug(cleanName);
    }

    // Upsert transaction to handle profile and social links cleanly
    const result = await prisma.$transaction(async (tx) => {
      let profile;

      if (existingProfile) {
        // Delete old social links
        await tx.socialLink.deleteMany({
          where: { profileId: existingProfile.id }
        });

        // Update profile
        profile = await tx.uniCardProfile.update({
          where: { id: existingProfile.id },
          data: {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            bio: bio ? String(bio).trim() : null,
            theme: cleanTheme,
            profileImageUrl: profileImageUrl ? String(profileImageUrl).trim() : null,
            usageType: normalizedUsageType,
            businessName,
            designation,
            businessAddress,
            businessCategory,
            offlinePresence,
            onlinePresence,
            website: cleanWebsite,
            socials: {
              create: validSocials
            }
          },
          include: { socials: true }
        });
      } else {
        // Create new profile
        profile = await tx.uniCardProfile.create({
          data: {
            userId: req.user.id,
            slug,
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            bio: bio ? String(bio).trim() : null,
            theme: cleanTheme,
            profileImageUrl: profileImageUrl ? String(profileImageUrl).trim() : null,
            usageType: normalizedUsageType,
            businessName,
            designation,
            businessAddress,
            businessCategory,
            offlinePresence,
            onlinePresence,
            website: cleanWebsite,
            socials: {
              create: validSocials
            }
          },
          include: { socials: true }
        });
      }

      return profile;
    });

    return res.status(201).json({
      profile: result,
      slug: result.slug,
      url: `/u/${result.slug}`
    });
  } catch (err) {
    console.error('Error saving UNICARD profile details:', err);
    return res.status(500).json({ error: err.message || 'Failed to save UNICARD profile. Please try again.' });
  }
});

// GET /api/unicard/me - Get current logged in user's UNICARD cards/profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const profile = await prisma.uniCardProfile.findUnique({
      where: { userId: req.user.id },
      include: { socials: true }
    });

    return res.json({ profile, cards: profile ? [profile] : [] });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// GET /api/unicard/cards - Authenticated cards endpoint alias
router.get('/cards', requireAuth, async (req, res) => {
  try {
    const profile = await prisma.uniCardProfile.findUnique({
      where: { userId: req.user.id },
      include: { socials: true }
    });

    return res.json({ cards: profile ? [profile] : [] });
  } catch (err) {
    console.error('Error fetching user cards:', err);
    return res.status(500).json({ error: 'Failed to load user cards.' });
  }
});

// GET /api/unicard/cards/:id - Get specific card with ownership validation
router.get('/cards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await prisma.uniCardProfile.findFirst({
      where: {
        OR: [
          { id: String(id) },
          { slug: String(id).toLowerCase().trim() }
        ]
      },
      include: { socials: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    // Ownership check for protected private view
    if (profile.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this card.' });
    }

    return res.json({ card: profile, profile });
  } catch (err) {
    console.error('Error fetching card by ID:', err);
    return res.status(500).json({ error: 'Failed to fetch card.' });
  }
});

// GET /api/unicard/public/:slug - Public read-only UNICARD endpoint (Unauthenticated)
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const profile = await prisma.uniCardProfile.findUnique({
      where: { slug: String(slug).toLowerCase().trim() },
      include: { socials: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'UNICARD profile not found.' });
    }

    // Return safe public fields only
    return res.json({
      profile: {
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        theme: profile.theme || 'comic-theme',
        profileImageUrl: profile.profileImageUrl,
        usageType: profile.usageType,
        businessName: profile.businessName,
        designation: profile.designation,
        businessAddress: profile.businessAddress,
        businessCategory: profile.businessCategory,
        offlinePresence: profile.offlinePresence,
        onlinePresence: profile.onlinePresence,
        website: profile.website,
        socials: profile.socials.map((s) => ({
          platform: s.platform,
          url: s.url
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching public UNICARD profile:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
