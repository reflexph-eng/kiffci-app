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
  // Certification (Sprint 6) — établissement partenaire associé, si applicable
  linkedEstablishmentId?: string;
  // Accès prioritaire (Sprint 6)
  earlyAccessUntil?: number;
  // Stats (Sprint 5)
  views?: number;
  createdAt?: number;
  updatedAt?: number;
};

// ── Challenge ─────────────────────────────────────────────────────────────────
// ── Défis (Sprint 6 — refonte) ────────────────────────────────────────────────
export type ChallengeType = 'decouverte' | 'frequence' | 'saisonnier' | 'communautaire';

export type Challenge = {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  category: string;
  type: ChallengeType;
  // decouverte & saisonnier : liste fixe d'expériences à compléter
  experiences: string[];
  // frequence : revenir plusieurs fois chez un établissement précis
  targetEstablishmentId?: string;
  targetEstablishmentName?: string;
  requiredVisits?: number;
  // saisonnier (obligatoire) / autres types (optionnel) : fenêtre de validité
  startDate?: string; // ISO
  endDate?: string;   // ISO
  isActive: boolean;
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
  isSuspended?: boolean;
  suspendedReason?: string;
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
  // Certification (Sprint 6)
  verified: boolean;
  verifiedVia: 'declaration' | 'code';
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
  // Confiance (Sprint 4)
  isVerified: boolean;
  // Certification (Sprint 6)
  checkInCode: string;
  // Accès prioritaire (Sprint 6)
  earlyAccessUntil?: number;
  // Stats
  views: number;
  favoritesCount: number;
  whatsappClicks: number;
  phoneClicks: number;
  // Modération (Sprint 3)
  moderationNote?: string;
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
  favoritesCount: number;
  whatsappClicks: number;
  phoneClicks: number;
  // Modération (Sprint 3)
  moderationNote?: string;
  // Accès prioritaire (Sprint 6)
  earlyAccessUntil?: number;
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
  // Bêta (Sprint 5)
  betaModeEnabled:           boolean;
  betaMessage:               string;
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

// ── Rubriques dynamiques homepage (Sprint 2) ──────────────────────────────────
export type SectionContentType = 'experiences' | 'establishments' | 'events';
export type SectionMode        = 'manual' | 'auto';

export type HomeSection = {
  id:            string;
  title:         string;
  subtitle:      string;
  contentType:   SectionContentType;
  mode:          SectionMode;
  // mode = 'manual'
  manualIds:     string[];
  // mode = 'auto' — règle simple, tous champs optionnels
  autoCategory:  string;   // '' = toutes
  autoMood:      string;   // '' = tous (experiences uniquement)
  autoCity:      string;   // '' = toutes
  autoPriceMax:  number;   // 0 = illimité
  limit:         number;   // nb d'éléments affichés
  isActive:      boolean;
  order:         number;
  createdAt:     number;
  updatedAt:     number;
};

// ── Encarts publicitaires (Sprint 2) ──────────────────────────────────────────
export type AdSlotId =
  | 'home-hero-bas'
  | 'home-milieu'
  | 'liste-experiences'
  | 'detail-sidebar'
  | 'carte-bas';

export type AdCreative = {
  id:         string;
  slotId:     AdSlotId;
  title:      string;      // usage interne admin
  imageUrl:   string;
  linkUrl:    string;
  sponsorName: string;     // affiché en petit ("Sponsorisé par …")
  startDate:  string;      // ISO date, '' = pas de début
  endDate:    string;      // ISO date, '' = pas de fin
  isActive:   boolean;
  views:      number;
  clicks:     number;
  createdAt:  number;
  updatedAt:  number;
};

// ── Menu éditable (Sprint 2) ──────────────────────────────────────────────────
export type NavItem = {
  id:        string;
  label:     string;
  href:      string;
  isVisible: boolean;
  order:     number;
};

// ── Modération enrichie & journal d'audit (Sprint 3) ──────────────────────────
export type ModerationLog = {
  id:          string;
  kind:        'establishment' | 'event';
  targetId:    string;
  targetName:  string;
  action:      'approved' | 'rejected' | 'changes_requested';
  reason:      string;     // motif, obligatoire pour rejet/modifications
  moderatorId: string;
  moderatorName: string;
  createdAt:   number;
};

// ── Abonnement Premium/Sponsorisé (Sprint 3) ──────────────────────────────────
export type SubscriptionPlan = 'none' | 'premium' | 'sponsored';

// ── Journal d'audit admin (Sprint 3) ──────────────────────────────────────────
export type AuditLog = {
  id:          string;
  actorId:     string;
  actorName:   string;
  action:      string;      // ex: "role_changed", "user_suspended", "moderation"
  targetType:  string;      // ex: "user", "establishment", "event"
  targetId:    string;
  targetLabel: string;
  details:     string;
  createdAt:   number;
};

// ── Avis & notes (Sprint 4) ────────────────────────────────────────────────────
export type ReviewTargetType = 'establishment' | 'event' | 'experience';

export type Review = {
  id:           string;
  targetType:   ReviewTargetType;
  targetId:     string;
  targetName:   string;
  userId:       string;
  userName:     string;
  userPhoto?:   string;
  rating:       number;   // 1 à 5
  comment:      string;
  isFlagged:    boolean;
  isHidden:     boolean;  // masqué par un modérateur
  createdAt:    number;
};

export type ReviewSummary = {
  average: number;
  count:   number;
};

// ── Tirage au sort mensuel (Sprint 6 — Palier 1) ──────────────────────────────
export type RaffleWinner = {
  id:         string;
  period:     string;   // format 'YYYY-MM'
  userId:     string;
  userName:   string;
  prize:      string;
  drawnAt:    number;
  drawnBy:    string;
};

export type RewardsSettings = {
  currentPrize:       string;
  eligibilityMinLevel: string; // ex: 'Explorateur'
  updatedAt:          number;
};

// ── Passages certifiés (Sprint 6) — trace chaque validation de code, y compris
// les visites répétées, pour alimenter les défis de fréquence.
export type CheckIn = {
  id:              string;
  userId:          string;
  establishmentId: string;
  experienceId:    string;
  createdAt:       number;
};
