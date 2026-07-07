export type ProfileType = 'solo' | 'couple' | 'famille' | 'amis';
export type UserRole    = 'user' | 'partner' | 'admin';
export type Status      = 'pending' | 'approved' | 'rejected';

// ── Experience ────────────────────────────────────────────────────────────────
export type Experience = {
  id: string;
  title: string;
  description: string;
  category: string;
  mood: string[];
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  duration: string;
  priceMin: number;
  priceMax: number;
  priceText: string;
  openingHours: string;
  contactPhone: string;
  whatsapp: string;
  email?: string;
  images: string[];
  tags: string[];
  suitableFor: ProfileType[];
  bestMoment: string[];
  isFree: boolean;
  isPremium: boolean;
  isSponsored: boolean;
  isPublished: boolean;
  bookingLink?: string;
  createdAt?: number;
  updatedAt?: number;
};

// ── Challenge ─────────────────────────────────────────────────────────────────
export type Challenge = {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  experiences: string[];
  category: string;
};

// ── AppUser ───────────────────────────────────────────────────────────────────
export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  points: number;
  level: string;
  badges: string[];
  createdAt: number;
};

// ── Favorite ──────────────────────────────────────────────────────────────────
export type Favorite = {
  id: string;
  userId: string;
  experienceId: string;
  createdAt: number;
};

// ── CompletedExperience ───────────────────────────────────────────────────────
export type CompletedExperience = {
  id: string;
  userId: string;
  experienceId: string;
  pointsEarned: number;
  completedAt: number;
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export type Badge = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  condition: {
    type: 'category' | 'count' | 'challenge';
    category?: string;
    count: number;
  };
};

// ── Establishment ─────────────────────────────────────────────────────────────
export type Establishment = {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  images: string[];
  ownerId: string;
  ownerName?: string;
  status: Status;
  // Monétisation future
  isFeatured: boolean;
  isSponsored: boolean;
  premiumUntil?: number;
  // Stats
  views: number;
  favoritesCount: number;
  whatsappClicks: number;
  phoneClicks: number;
  createdAt: number;
  updatedAt?: number;
};

// ── Event ─────────────────────────────────────────────────────────────────────
export type KiffEvent = {
  id: string;
  title: string;
  description: string;
  startDate: string;   // ISO string
  endDate: string;     // ISO string
  city: string;
  location: string;
  price: string;
  capacity?: number;
  images: string[];
  organizerId: string;
  organizerName?: string;
  establishmentId?: string;
  contactPhone: string;
  whatsapp: string;
  status: Status;
  // Monétisation future
  isFeatured: boolean;
  isSponsored: boolean;
  premiumUntil?: number;
  // Stats
  views: number;
  whatsappClicks: number;
  phoneClicks: number;
  createdAt: number;
  updatedAt?: number;
};

// ── PartnerStats ──────────────────────────────────────────────────────────────
export type PartnerStats = {
  totalEstablishments: number;
  approvedEstablishments: number;
  pendingEstablishments: number;
  totalEvents: number;
  approvedEvents: number;
  pendingEvents: number;
  totalViews: number;
  totalWhatsappClicks: number;
  totalPhoneClicks: number;
  totalFavorites: number;
};

// ── CMS Types ─────────────────────────────────────────────────────────────────

export type HomepageSettings = {
  heroTitle:                 string;
  heroSubtitle:              string;
  heroImageUrl:              string;
  heroButtonText:            string;
  heroButtonLink:            string;
  slogan:                    string;
  featuredExperienceIds:     string[];
  featuredEventIds:          string[];
  featuredEstablishmentIds:  string[];
  activeCampaignId:          string;
  maintenanceMode:           boolean;
  appVersion:                string;
  updatedAt:                 number;
};

export type Banner = {
  id:          string;
  title:       string;
  subtitle:    string;
  imageUrl:    string;
  buttonText:  string;
  buttonLink:  string;
  position:    number;
  isActive:    boolean;
  startDate:   string;
  endDate:     string;
  createdAt:   number;
};

export type Category = {
  id:        string;
  name:      string;
  icon:      string;
  color:     string;
  type:      string;
  isVisible: boolean;
  order:     number;
  createdAt: number;
};

export type Campaign = {
  id:                      string;
  title:                   string;
  description:             string;
  imageUrl:                string;
  startDate:               string;
  endDate:                 string;
  isActive:                boolean;
  targetType:              'experience' | 'event' | 'establishment' | 'mixed';
  linkedExperienceIds:     string[];
  linkedEventIds:          string[];
  linkedEstablishmentIds:  string[];
  createdAt:               number;
};

// ── Pages éditables (Sprint 1) ────────────────────────────────────────────────
export type SitePage = {
  id:           string;
  slug:         string;   // ex: 'a-propos', 'cgu'
  title:        string;
  content:      string;   // markdown simplifié
  isPublished:  boolean;
  showInFooter: boolean;
  order:        number;
  createdAt:    number;
  updatedAt:    number;
};

// ── Réglages footer (Sprint 1) ────────────────────────────────────────────────
export type FooterSettings = {
  description:  string;
  email:        string;
  phone:        string;
  whatsapp:     string;
  instagram:    string;
  tiktok:       string;
  facebook:     string;
  youtube:      string;
  updatedAt:    number;
};
