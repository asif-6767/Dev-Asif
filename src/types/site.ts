export type BgStyle = 'cyber-grid' | 'minimal';
export type AnimationIntensity = 'subtle' | 'balanced' | 'dynamic';
export type GlowIntensity = 'low' | 'medium' | 'high';
export type BorderStyle = 'conic-glow' | 'static-subtle';
export type AiMode = 'builtin' | 'api';
export type AiProvider = 'openai_compatible' | 'gemini' | 'anthropic';

export interface GeneralSettings {
  siteTitle: string;
  brandName: string;
  logoText: string;
  siteDescription: string;
  browserTitle: string;
  faviconUrl: string;
  footerText: string;
}

export interface ProfileSettings {
  name: string;
  imageUrl: string;
  location: string;
  education: string;
  startedYear: string;
  interests: string;
  futureGoal: string;
  aboutHeading: string;
  introduction: string;
  aboutDescription: string;
}

export interface HeroSettings {
  visible: boolean;
  badge: string;
  heading: string;
  subtitle: string;
  typingPhrases: string;
  primaryBtn: string;
  secondaryBtn: string;
  bgImageUrl: string;
  profileImageUrl: string;
}

export interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  destinationLink: string;
  buttonText: string;
  displayOrder: number;
  isActive: boolean;
}

export interface JourneyMilestone {
  id: number;
  yearLabel: string;
  title: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ServiceItem {
  id: number;
  serviceNumber: string;
  slug: string;
  iconKey: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  platforms: string[];
  contactButtonText: string;
  displayOrder: number;
  isActive: boolean;
}

export interface SocialLinkItem {
  id: number;
  platformKey: string;
  platformName: string;
  supportingText: string;
  url: string;
  brandColor: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ContactSettings {
  heading: string;
  subtitle: string;
  email: string;
  whatsapp: string;
  telegram: string;
  enableWhatsapp: boolean;
  enableEmailMailto: boolean;
  enablePhpMail: boolean;
  successMessage: string;
}

export interface KnowledgeEntry {
  id: number;
  topic: string;
  keywords: string;
  answerText: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AiSettings {
  isEnabled: boolean;
  mode: AiMode;
  assistantName: string;
  welcomeMessage: string;
  systemInstructions: string;
  fallbackMessage: string;
  offTopicMessage: string;
  apiProvider: AiProvider;
  apiEndpoint: string;
  modelName: string;
  hasApiKeyConfigured: boolean;
  suggestedQuestions: string[];
  rateLimitPerMinute: number;
}

export interface AppearanceSettings {
  accentPrimary: string;
  accentSecondary: string;
  accentPurple: string;
  bgStyle: BgStyle;
  animationIntensity: AnimationIntensity;
  glowIntensity: GlowIntensity;
  borderStyle: BorderStyle;
  cardRadius: number;
  showBanners: boolean;
  showJourney: boolean;
  showAbout: boolean;
  showServices: boolean;
  showSupport: boolean;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  robots: string;
}

export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  preferredMethod: string;
  serviceCategory: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface SiteData {
  general: GeneralSettings;
  profile: ProfileSettings;
  hero: HeroSettings;
  banners: BannerItem[];
  milestones: JourneyMilestone[];
  services: ServiceItem[];
  socials: SocialLinkItem[];
  contact: ContactSettings;
  ai: AiSettings;
  knowledgeBase: KnowledgeEntry[];
  appearance: AppearanceSettings;
  seo: SeoSettings;
  messages: ContactMessage[];
}
