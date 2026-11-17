import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  User,
  X,
} from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { BrandMonogram, PlatformIcon, ServiceIcon } from './components/Icons';
import { ServiceModal } from './components/ServiceModal';
import { DEFAULT_PROFILE_IMAGE, DEFAULT_SITE_DATA } from './data/defaultSiteData';
import type { ServiceItem, SiteData } from './types/site';

const STORAGE_KEY = 'asif_islam_site_data_v1';

function loadInitialData(): SiteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_DATA;
    const parsed = JSON.parse(raw) as Partial<SiteData>;
    return {
      ...DEFAULT_SITE_DATA,
      ...parsed,
      general: { ...DEFAULT_SITE_DATA.general, ...parsed.general },
      profile: { ...DEFAULT_SITE_DATA.profile, ...parsed.profile },
      hero: { ...DEFAULT_SITE_DATA.hero, ...parsed.hero },
      contact: { ...DEFAULT_SITE_DATA.contact, ...parsed.contact },
      ai: { ...DEFAULT_SITE_DATA.ai, ...parsed.ai },
      appearance: { ...DEFAULT_SITE_DATA.appearance, ...parsed.appearance },
      seo: { ...DEFAULT_SITE_DATA.seo, ...parsed.seo },
    };
  } catch {
    return DEFAULT_SITE_DATA;
  }
}

export default function App() {
  const [siteData, setSiteData] = useState<SiteData>(loadInitialData);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => window.location.hash === '#admin');
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollPct, setScrollPct] = useState(0);

  // Typing effect
  const typingPhrases = useMemo(
    () =>
      siteData.hero.typingPhrases
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean),
    [siteData.hero.typingPhrases]
  );
  const [typedText, setTypedText] = useState(() => typingPhrases[0] || 'Websites & Digital Presence');

  // Banner slider
  const activeBanners = useMemo(
    () =>
      [...siteData.banners]
        .filter((b) => b.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [siteData.banners]
  );
  const [bannerIdx, setBannerIdx] = useState(0);

  // Service modal
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Contact form
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    preferredMethod: 'WhatsApp',
    serviceCategory: siteData.services[0]?.title || 'Website Development',
    message: '',
    honeypot: '',
  });
  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    whatsappUrl?: string;
    mailtoUrl?: string;
    telegramUrl?: string;
  } | null>(null);
  const lastSubmittedAt = useRef<number>(0);

  // Persist siteData changes live
  const updateSiteData = (next: SiteData) => {
    setSiteData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  // Sync CSS variables & document title
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', siteData.appearance.accentPrimary);
    root.style.setProperty('--accent-2', siteData.appearance.accentSecondary);
    root.style.setProperty('--accent-purple', siteData.appearance.accentPurple);
    root.style.setProperty('--card-radius', `${siteData.appearance.cardRadius}px`);
    document.title = siteData.seo.metaTitle || siteData.general.browserTitle;
  }, [siteData]);

  // Initial loader
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 320);
    return () => clearTimeout(timer);
  }, []);

  // Hash listener for #admin
  useEffect(() => {
    const onHash = () => setIsAdminRoute(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Scroll progress & active nav section
  useEffect(() => {
    if (isAdminRoute) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const top = window.scrollY || doc.scrollTop;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      setScrollPct(Math.min(100, (top / max) * 100));

      const ids = ['home', 'journey', 'about', 'services', 'support'];
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isAdminRoute]);

  // Typing loop
  useEffect(() => {
    if (typingPhrases.length <= 1) {
      setTypedText(typingPhrases[0] || '');
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setTypedText(typingPhrases[0]);
      return;
    }

    let pIdx = 0;
    let cIdx = typingPhrases[0].length;
    let deleting = true;
    let timerId: number;

    const step = () => {
      const current = typingPhrases[pIdx] || '';
      if (deleting) {
        cIdx--;
        setTypedText(current.slice(0, Math.max(0, cIdx)));
        if (cIdx <= 0) {
          deleting = false;
          pIdx = (pIdx + 1) % typingPhrases.length;
          timerId = window.setTimeout(step, 340);
          return;
        }
        timerId = window.setTimeout(step, 32);
      } else {
        cIdx++;
        setTypedText(current.slice(0, cIdx));
        if (cIdx >= current.length) {
          deleting = true;
          timerId = window.setTimeout(step, 1900);
          return;
        }
        timerId = window.setTimeout(step, 55);
      }
    };

    timerId = window.setTimeout(step, 2000);
    return () => clearTimeout(timerId);
  }, [typingPhrases]);

  // Banner auto-play
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % activeBanners.length);
    }, 5200);
    return () => clearInterval(id);
  }, [activeBanners.length]);

  const handleCardTilt = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(950px) rotateX(${(-y * 5.5).toFixed(2)}deg) rotateY(${(x * 5.5).toFixed(2)}deg) translateY(-3px)`;
  };

  const resetCardTilt = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.honeypot.trim() !== '') {
      setFormFeedback({ type: 'error', text: 'Submission rejected by spam protection.' });
      return;
    }
    if (Date.now() - lastSubmittedAt.current < 15000) {
      setFormFeedback({
        type: 'error',
        text: 'You recently submitted an inquiry. Please wait a few seconds before sending another.',
      });
      return;
    }
    const name = formState.fullName.trim();
    const email = formState.email.trim();
    const msg = formState.message.trim();

    if (name.length < 2) {
      setFormFeedback({ type: 'error', text: 'Please enter your full name (at least 2 characters).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormFeedback({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (msg.length < 10) {
      setFormFeedback({ type: 'error', text: 'Please enter a message of at least 10 characters.' });
      return;
    }

    lastSubmittedAt.current = Date.now();
    const newEntry = {
      id: Date.now(),
      fullName: name,
      email,
      preferredMethod: formState.preferredMethod,
      serviceCategory: formState.serviceCategory,
      message: msg,
      status: 'new' as const,
      createdAt: new Date().toLocaleString(),
    };

    updateSiteData({
      ...siteData,
      messages: [newEntry, ...siteData.messages].slice(0, 50),
    });

    const formatted = `Hello Asif,\nName: ${name}\nEmail: ${email}\nPreferred Contact: ${formState.preferredMethod}\nService: ${formState.serviceCategory}\nMessage: ${msg}`;
    const digits = siteData.contact.whatsapp.replace(/\D+/g, '');
    const whatsappUrl =
      siteData.contact.enableWhatsapp && digits
        ? `https://wa.me/${digits}?text=${encodeURIComponent(formatted)}`
        : undefined;
    const mailtoUrl =
      siteData.contact.enableEmailMailto && siteData.contact.email
        ? `mailto:${siteData.contact.email}?subject=${encodeURIComponent(`Website Inquiry: ${formState.serviceCategory} — ${name}`)}&body=${encodeURIComponent(formatted)}`
        : undefined;

    setFormFeedback({
      type: 'success',
      text: siteData.contact.successMessage,
      whatsappUrl,
      mailtoUrl,
      telegramUrl: siteData.contact.telegram || undefined,
    });
    setFormState((prev) => ({ ...prev, fullName: '', email: '', message: '' }));
  };

  if (isAdminRoute) {
    return (
      <AdminDashboard
        siteData={siteData}
        onUpdateData={updateSiteData}
        onResetDefaults={() => updateSiteData(DEFAULT_SITE_DATA)}
        onExitAdmin={() => {
          window.location.hash = '#home';
          setIsAdminRoute(false);
        }}
      />
    );
  }

  const activeMilestones = [...siteData.milestones]
    .filter((m) => m.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const activeServices = [...siteData.services]
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const activeSocials = [...siteData.socials]
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const navItems = [
    { id: 'home', label: '1. Home', show: true, icon: Home },
    { id: 'journey', label: '2. Journey', show: siteData.appearance.showJourney, icon: Clock },
    { id: 'about', label: '3. About', show: siteData.appearance.showAbout, icon: User },
    { id: 'services', label: '4. Services', show: siteData.appearance.showServices, icon: LayoutGrid },
    { id: 'support', label: '5. Support', show: siteData.appearance.showSupport, icon: MessageSquare },
  ].filter((n) => n.show);

  const aboutParagraphs = siteData.profile.aboutDescription
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      className={`min-h-screen relative border-${siteData.appearance.borderStyle} glow-${siteData.appearance.glowIntensity}`}
    >
      {/* Initial Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3.5 bg-[#08090D]">
          <div className="grid h-12 w-12 animate-spin place-items-center rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] border-r-[var(--accent-2)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
          </div>
          <span className="font-display text-xs tracking-[0.22em] text-[#9299A8]">
            {siteData.general.logoText}
          </span>
        </div>
      )}

      {/* Scroll Progress Bar */}
      <div
        className="fixed left-0 top-0 z-50 h-[2.5px] bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-purple)] shadow-[0_0_10px_rgba(0,229,255,0.45)] transition-[width] duration-75"
        style={{ width: `${scrollPct}%` }}
        aria-hidden="true"
      />

      {/* Ambient Background Canvas */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {siteData.appearance.bgStyle === 'cyber-grid' && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.028) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 80% 70% at 50% 25%, #000 35%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 80% 70% at 50% 25%, #000 35%, transparent 100%)',
            }}
          />
        )}
        <div
          className="ambient-orb-item orb-drift-1 absolute -left-20 -top-28 h-[420px] w-[420px] rounded-full opacity-20 blur-[85px]"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
        />
        <div
          className="ambient-orb-item orb-drift-2 absolute -right-28 top-[35%] h-[390px] w-[390px] rounded-full opacity-20 blur-[85px]"
          style={{ background: 'radial-gradient(circle, var(--accent-purple), transparent 70%)' }}
        />
        <div
          className="ambient-orb-item orb-drift-1 absolute -bottom-24 left-[25%] h-[350px] w-[350px] rounded-full opacity-20 blur-[85px]"
          style={{ background: 'radial-gradient(circle, var(--accent-2), transparent 70%)' }}
        />
      </div>

      {/* Top Floating Rounded Glass Navigation Bar (No Search, No Login) */}
      <header className="pointer-events-none fixed inset-x-0 top-3.5 z-40 px-4">
        <nav
          aria-label="Primary Navigation"
          className="glow-frame pointer-events-auto mx-auto flex h-[62px] max-w-[1160px] items-center justify-between rounded-full border border-white/10 bg-[#0C0F16]/80 pl-5 pr-3.5 shadow-[0_14px_36px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <a
            href="#home"
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap transition hover:-translate-y-0.5"
          >
            <BrandMonogram className="h-8 w-8 drop-shadow-[0_0_8px_rgba(0,229,255,0.35)]" />
            <span className="font-display bg-gradient-to-r from-[#F5F7FA] via-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-base font-bold tracking-[0.08em] text-transparent">
              {siteData.general.logoText}
            </span>
          </a>

          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-white/12 bg-[#141821]/85 transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 active:scale-95 cursor-pointer"
          >
            <span
              className={`h-[2px] w-[18px] rounded bg-[#F5F7FA] transition-transform duration-300 ${
                drawerOpen ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`mr-3 h-[2px] w-[13px] self-end rounded bg-[var(--accent)] transition-all duration-200 ${
                drawerOpen ? 'translate-x-2 opacity-0' : ''
              }`}
            />
            <span
              className={`h-[2px] w-[18px] rounded bg-[#F5F7FA] transition-transform duration-300 ${
                drawerOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Slide-In Mobile-App Navigation Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside
        aria-label="Navigation Menu"
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[min(360px,88vw)] flex-col border-l border-white/10 bg-gradient-to-b from-[#0D1017] to-[#08090D] shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <a
            href="#home"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-2.5"
          >
            <BrandMonogram className="h-7 w-7" />
            <span className="font-display text-sm font-bold tracking-[0.08em] text-[#F5F7FA]">
              {siteData.general.logoText}
            </span>
          </a>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/[0.04] text-[#F5F7FA] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {navItems.map((item, idx) => {
            const IconComp = item.icon;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setDrawerOpen(false)}
                style={{ transitionDelay: drawerOpen ? `${idx * 50 + 60}ms` : '0ms' }}
                className={`flex items-center gap-3.5 rounded-2xl border px-3.5 py-3 transition-all duration-300 ${
                  drawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                } ${
                  isActive
                    ? 'border-[var(--accent)]/40 bg-gradient-to-r from-[var(--accent)]/15 to-[var(--accent-2)]/5'
                    : 'border-transparent bg-white/[0.02] hover:translate-x-1 hover:border-[var(--accent)]/25 hover:bg-[var(--accent)]/8'
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#141821] text-[var(--accent)]">
                  <IconComp className="h-4 w-4" />
                </span>
                <span className="font-display flex-1 text-[15px] font-semibold text-[#F5F7FA]">
                  {item.label}
                </span>
                <span className={`text-lg ${isActive ? 'text-[var(--accent)]' : 'text-[#9299A8]'}`}>
                  &rsaquo;
                </span>
              </a>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 px-5 py-4 text-xs text-[#9299A8]">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--accent-2)]" />
            <span>{siteData.profile.location}</span>
          </div>
          {siteData.contact.email && (
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-[var(--accent-2)]" />
              <span className="truncate">{siteData.contact.email}</span>
            </div>
          )}
        </div>
      </aside>

      <main>
        {/* 4. HOME — HERO SECTION */}
        {siteData.hero.visible && (
          <section id="home" className="relative flex min-h-[92vh] flex-col justify-center px-5 pb-16 pt-32">
            <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="text-center lg:text-left">
                <div className="mb-5 inline-flex items-center gap-2.5 rounded-md border border-[var(--accent)]/25 bg-[var(--accent)]/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
                  <span className="h-[1.5px] w-4 bg-[var(--accent-2)]" />
                  <span>{siteData.hero.badge}</span>
                </div>

                <h1 className="font-display gradient-text-anim mb-5 text-[clamp(2.25rem,4.4vw,3.85rem)] font-extrabold leading-[1.08] tracking-tight text-balance">
                  {siteData.hero.heading}
                </h1>

                <p className="mx-auto mb-5 max-w-[560px] text-base sm:text-lg text-[#9299A8] lg:mx-0">
                  {siteData.hero.subtitle}
                </p>

                <div
                  className="mb-7 flex min-h-[26px] items-center justify-center gap-2 font-mono text-sm text-[#F5F7FA] lg:justify-start"
                  aria-live="polite"
                >
                  <span className="text-[var(--accent-2)]">Focus &rarr;</span>
                  <span>{typedText}</span>
                  <span className="typing-cursor" aria-hidden="true" />
                </div>

                <div className="mb-6 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
                  <a href="#services" className="btn-3d btn-primary-3d">
                    <span>{siteData.hero.primaryBtn}</span>
                    <ArrowRight className="btn-arrow h-4 w-4" />
                  </a>
                  <a href="#journey" className="btn-3d btn-secondary-3d">
                    <span>{siteData.hero.secondaryBtn}</span>
                  </a>
                </div>

                <div className="inline-flex items-center justify-center gap-2 text-sm text-[#9299A8] lg:justify-start">
                  <MapPin className="h-4 w-4 text-[var(--accent)]" />
                  <span>Based in {siteData.profile.location}</span>
                </div>
              </div>

              {/* 3D Framed Personal Portrait */}
              <div className="flex justify-center">
                <div
                  onMouseMove={handleCardTilt}
                  onMouseLeave={resetCardTilt}
                  className="relative w-[min(370px,86vw)] transition-transform duration-200"
                >
                  <div
                    className="orbit-spin-slow pointer-events-none absolute -inset-4 rounded-full border border-dashed border-[var(--accent)]/25"
                    aria-hidden="true"
                  />
                  <div
                    className="orbit-spin-reverse pointer-events-none absolute -inset-1.5 rounded-full border border-[var(--accent-2)]/15"
                    aria-hidden="true"
                  />
                  <div className="glow-frame floating-slow rounded-[26px] border border-white/10 bg-gradient-to-br from-[#161B26]/95 to-[#0B0E15]/98 p-3.5 shadow-[0_28px_65px_rgba(0,0,0,0.65)]">
                    <div className="aspect-square overflow-hidden rounded-[18px] border border-[var(--accent)]/25 bg-[#08090D]">
                      <img
                        src={siteData.hero.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                        alt={`${siteData.profile.name} portrait`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-1 pt-3">
                      <span className="font-display text-sm font-bold tracking-[0.08em] text-[#F5F7FA]">
                        {siteData.general.brandName}
                      </span>
                      <span className="font-mono text-xs text-[var(--accent)]">
                        {siteData.profile.education} &middot; Est. {siteData.profile.startedYear}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated Banner Slider */}
            {siteData.appearance.showBanners && activeBanners.length > 0 && (
              <div className="mx-auto mt-14 w-full max-w-[1160px]">
                <div
                  className="glow-frame relative overflow-hidden border border-white/10 bg-[#141821]"
                  style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                >
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${(bannerIdx % activeBanners.length) * 100}%)` }}
                  >
                    {activeBanners.map((b) => (
                      <article
                        key={b.id}
                        className="relative flex min-h-[220px] min-w-full items-center overflow-hidden px-6 pb-14 pt-8 sm:px-10 sm:py-10"
                      >
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#08090D]/92 via-[#08090D]/65 to-[#08090D]/20" />
                        <div className="relative z-10 max-w-xl">
                          <h3 className="font-display mb-2 text-xl sm:text-2xl font-bold text-[#F5F7FA]">
                            {b.title}
                          </h3>
                          {b.subtitle && <p className="mb-4 text-sm text-[#9299A8]">{b.subtitle}</p>}
                          {b.destinationLink && (
                            <a
                              href={b.destinationLink}
                              className="btn-3d btn-secondary-3d !px-4 !py-2.5 !text-sm"
                            >
                              <span>{b.buttonText || 'Explore'}</span>
                              <ArrowRight className="btn-arrow h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  {activeBanners.length > 1 && (
                    <div className="absolute bottom-3.5 right-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#08090D]/75 px-2.5 py-1 backdrop-blur-md">
                      <button
                        type="button"
                        onClick={() =>
                          setBannerIdx((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
                        }
                        aria-label="Previous banner"
                        className="p-0.5 text-[#F5F7FA] hover:text-[var(--accent)] cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="flex gap-1.5">
                        {activeBanners.map((b, i) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBannerIdx(i)}
                            aria-label={`Slide ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              i === bannerIdx % activeBanners.length
                                ? 'w-5 bg-[var(--accent)]'
                                : 'w-1.5 bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setBannerIdx((prev) => (prev + 1) % activeBanners.length)}
                        aria-label="Next banner"
                        className="p-0.5 text-[#F5F7FA] hover:text-[var(--accent)] cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. JOURNEY SECTION */}
        {siteData.appearance.showJourney && (
          <section id="journey" className="scroll-mt-20 px-5 py-20">
            <div className="mx-auto max-w-[1160px]">
              <header className="mx-auto mb-14 max-w-2xl text-center">
                <span className="mb-2.5 inline-block font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-2)]">
                  Timeline &middot; Since {siteData.profile.startedYear}
                </span>
                <h2 className="font-display mb-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
                  MY DIGITAL JOURNEY
                </h2>
                <p className="text-base text-[#9299A8]">
                  Every experience begins with curiosity. Every step builds something new.
                </p>
              </header>

              <div className="relative mx-auto max-w-[960px] space-y-7">
                <div
                  className="absolute bottom-3 left-4 top-3 w-0.5 bg-gradient-to-b from-[var(--accent)] via-[var(--accent-2)] to-transparent md:left-1/2 md:-translate-x-1/2"
                  aria-hidden="true"
                />
                {activeMilestones.map((ms, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <article
                      key={ms.id}
                      className={`relative pl-10 md:w-1/2 md:pl-0 ${
                        isLeft ? 'md:pr-9' : 'md:ml-auto md:pl-9'
                      }`}
                    >
                      <div
                        className={`absolute left-[7px] top-6 z-10 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-[var(--accent)] bg-[#08090D] shadow-[0_0_16px_rgba(0,229,255,0.65)] ${
                          isLeft ? 'md:left-auto md:-right-[9px]' : 'md:-left-[9px]'
                        }`}
                        aria-hidden="true"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
                      </div>
                      <div
                        onMouseMove={handleCardTilt}
                        onMouseLeave={resetCardTilt}
                        style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                        className="glow-frame border border-white/10 bg-gradient-to-br from-[#161B26]/80 to-[#0D1018]/90 p-6 backdrop-blur-md transition-transform duration-200 shadow-xl"
                      >
                        <div className="mb-1.5 font-mono text-xs font-semibold tracking-wider text-[var(--accent)] tabular-nums">
                          {ms.yearLabel}
                        </div>
                        <h3 className="font-display mb-2 text-lg font-bold text-[#F5F7FA]">
                          {ms.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[#9299A8]">{ms.description}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 6. ABOUT SECTION */}
        {siteData.appearance.showAbout && (
          <section id="about" className="scroll-mt-20 px-5 py-20">
            <div className="mx-auto max-w-[1160px]">
              <header className="mx-auto mb-12 max-w-2xl text-center">
                <span className="mb-2.5 inline-block font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-2)]">
                  Profile &amp; Vision
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
                  {siteData.profile.aboutHeading}
                </h2>
              </header>

              <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1.1fr_0.9fr]">
                <div
                  style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                  className="glow-frame space-y-4 border border-white/10 bg-gradient-to-br from-[#161B26]/80 to-[#0D1018]/90 p-7 backdrop-blur-md shadow-xl"
                >
                  {aboutParagraphs.map((para, i) => (
                    <p key={i} className="text-[15.5px] leading-relaxed text-[#D7DCE6]">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div
                    style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                    className="border border-white/10 bg-[#141821]/85 p-4.5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--accent)]">
                      Name
                    </span>
                    <strong className="font-display mt-1 block text-sm font-semibold text-[#F5F7FA]">
                      {siteData.profile.name}
                    </strong>
                  </div>
                  <div
                    style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                    className="border border-white/10 bg-[#141821]/85 p-4.5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--accent)]">
                      Location
                    </span>
                    <strong className="font-display mt-1 block text-sm font-semibold text-[#F5F7FA]">
                      {siteData.profile.location}
                    </strong>
                  </div>
                  <div
                    style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                    className="border border-white/10 bg-[#141821]/85 p-4.5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--accent)]">
                      Education
                    </span>
                    <strong className="font-display mt-1 block text-sm font-semibold text-[#F5F7FA]">
                      {siteData.profile.education}
                    </strong>
                  </div>
                  <div
                    style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                    className="border border-white/10 bg-[#141821]/85 p-4.5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--accent)]">
                      Started Exploring
                    </span>
                    <strong className="font-display mt-1 block font-mono text-sm font-semibold text-[#F5F7FA] tabular-nums">
                      {siteData.profile.startedYear}
                    </strong>
                  </div>
                  <div
                    style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                    className="border border-white/10 bg-[#141821]/85 p-4.5 sm:col-span-2 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--accent)]">
                      Interests
                    </span>
                    <strong className="font-display mt-1 block text-sm font-semibold text-[#F5F7FA]">
                      {siteData.profile.interests}
                    </strong>
                  </div>
                  <div
                    style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                    className="border border-white/10 bg-[#141821]/85 p-4.5 sm:col-span-2 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--accent)]">
                      Future Goal
                    </span>
                    <strong className="font-display mt-1 block text-sm font-semibold text-[#F5F7FA]">
                      {siteData.profile.futureGoal}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 7. SERVICES SECTION */}
        {siteData.appearance.showServices && (
          <section id="services" className="scroll-mt-20 px-5 py-20">
            <div className="mx-auto max-w-[1160px]">
              <header className="mx-auto mb-14 max-w-2xl text-center">
                <span className="mb-2.5 inline-block font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-2)]">
                  Digital Solutions
                </span>
                <h2 className="font-display mb-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
                  WHAT I CAN HELP YOU WITH
                </h2>
                <p className="text-base text-[#9299A8]">
                  Creative ideas, digital solutions, and customized services — built around your needs.
                </p>
              </header>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {activeServices.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedService(srv)}
                    onMouseMove={handleCardTilt}
                    onMouseLeave={resetCardTilt}
                    style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                    className="glow-frame flex flex-col border border-white/10 bg-gradient-to-br from-[#161B26]/80 to-[#0D1018]/90 p-6 text-left backdrop-blur-md transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_24px_54px_rgba(0,0,0,0.65),0_0_28px_rgba(0,229,255,0.12)] cursor-pointer"
                  >
                    <div className="mb-4 flex w-full items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/15 to-[var(--accent-purple)]/15 text-[var(--accent)]">
                        <ServiceIcon iconKey={srv.iconKey} className="h-6 w-6" />
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#9299A8] tabular-nums">
                        {srv.serviceNumber}
                      </span>
                    </div>

                    <h3 className="font-display mb-2.5 text-lg font-bold text-[#F5F7FA]">
                      {srv.title}
                    </h3>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-[#9299A8]">
                      {srv.shortDescription}
                    </p>

                    <div className="flex w-full items-center justify-between gap-2 border-t border-white/[0.07] pt-3.5">
                      <div className="flex items-center gap-1.5">
                        {srv.platforms.slice(0, 5).map((p) => (
                          <span
                            key={p}
                            title={p}
                            className="grid h-6 w-6 place-items-center rounded-md bg-white/[0.04] text-[#9299A8]"
                          >
                            <PlatformIcon platformKey={p} className="h-3.5 w-3.5" />
                          </span>
                        ))}
                      </div>
                      <span className="font-display text-xs font-semibold text-[var(--accent)]">
                        View Details &rarr;
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. SUPPORT SECTION */}
        {siteData.appearance.showSupport && (
          <section id="support" className="scroll-mt-20 px-5 py-20">
            <div className="mx-auto max-w-[1160px]">
              <header className="mx-auto mb-12 max-w-2xl text-center">
                <span className="mb-2.5 inline-block font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-2)]">
                  Direct Support &amp; Channels
                </span>
                <h2 className="font-display mb-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
                  {siteData.contact.heading}
                </h2>
                <p className="text-base text-[#9299A8]">{siteData.contact.subtitle}</p>
              </header>

              {/* Social Cards Grid (2 per row on mobile where space permits, 4 on desktop) */}
              <div className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {activeSocials.map((soc) => {
                  const hasUrl = soc.url.trim() !== '';
                  const styleObj = {
                    borderRadius: `${siteData.appearance.cardRadius}px`,
                    '--brand-c': soc.brandColor,
                  } as React.CSSProperties;

                  if (!hasUrl) {
                    return (
                      <div
                        key={soc.id}
                        style={styleObj}
                        aria-disabled="true"
                        className="flex cursor-not-allowed items-center gap-3 border border-white/10 bg-[#141821]/60 p-3.5 sm:p-4.5 opacity-45"
                      >
                        <span
                          className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl border border-white/10"
                          style={{ color: soc.brandColor, backgroundColor: '#0B0E14' }}
                        >
                          <PlatformIcon platformKey={soc.platformKey} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <strong className="font-display block text-xs sm:text-sm text-[#F5F7FA]">
                            {soc.platformName}
                          </strong>
                          <span className="block truncate text-[11px] text-[#9299A8]">
                            Link not configured
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target={soc.url.startsWith('mailto:') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      style={styleObj}
                      className="glow-frame flex items-center gap-3 border border-white/10 bg-gradient-to-br from-[#161B26]/80 to-[#0D1018]/90 p-3.5 sm:p-4.5 backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:border-white/25"
                    >
                      <span
                        className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl border border-white/12"
                        style={{ color: soc.brandColor, backgroundColor: '#0B0E14' }}
                      >
                        <PlatformIcon platformKey={soc.platformKey} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <strong className="font-display block text-xs sm:text-sm text-[#F5F7FA]">
                          {soc.platformName}
                        </strong>
                        <span className="block truncate text-[11px] text-[#9299A8]">
                          {soc.supportingText}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Contact Form */}
              <div
                style={{ borderRadius: `${siteData.appearance.cardRadius}px` }}
                className="glow-frame mx-auto max-w-[860px] border border-white/10 bg-gradient-to-br from-[#161B26]/85 to-[#0D1018]/92 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
              >
                <h3 className="font-display mb-1.5 text-xl font-bold text-[#F5F7FA]">
                  Send a Direct Inquiry
                </h3>
                <p className="mb-6 text-sm text-[#9299A8]">
                  Share your requirements cleanly below. We validate every field and prepare a direct handoff.
                </p>

                <form onSubmit={handleContactSubmit} noValidate>
                  {/* Honeypot spam protection */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="hp_website">Website</label>
                    <input
                      id="hp_website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formState.honeypot}
                      onChange={(e) => setFormState({ ...formState, honeypot: e.target.value })}
                    />
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf_name" className="mb-1.5 block text-xs font-semibold text-[#C7CEDB]">
                        Full Name
                      </label>
                      <input
                        id="cf_name"
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formState.fullName}
                        onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-[#08090D]/80 px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="cf_email" className="mb-1.5 block text-xs font-semibold text-[#C7CEDB]">
                        Email Address
                      </label>
                      <input
                        id="cf_email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-[#08090D]/80 px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="cf_method" className="mb-1.5 block text-xs font-semibold text-[#C7CEDB]">
                        Preferred Contact Method
                      </label>
                      <select
                        id="cf_method"
                        value={formState.preferredMethod}
                        onChange={(e) => setFormState({ ...formState, preferredMethod: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-[#08090D]/80 px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[var(--accent)]"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Email">Email</option>
                        <option value="Telegram">Telegram</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cf_service" className="mb-1.5 block text-xs font-semibold text-[#C7CEDB]">
                        Service Category
                      </label>
                      <select
                        id="cf_service"
                        value={formState.serviceCategory}
                        onChange={(e) => setFormState({ ...formState, serviceCategory: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-[#08090D]/80 px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[var(--accent)]"
                      >
                        {activeServices.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.serviceNumber} — {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cf_msg" className="mb-1.5 block text-xs font-semibold text-[#C7CEDB]">
                      Message
                    </label>
                    <textarea
                      id="cf_msg"
                      rows={4}
                      required
                      placeholder="Describe your idea, website requirement, or assistance needed..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full rounded-xl border border-white/12 bg-[#08090D]/80 px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {formFeedback && (
                    <div
                      role="status"
                      className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                        formFeedback.type === 'success'
                          ? 'border-[var(--accent-2)]/35 bg-[var(--accent-2)]/10 text-[#D2FFE9]'
                          : 'border-red-500/40 bg-red-500/12 text-red-200'
                      }`}
                    >
                      <div>{formFeedback.text}</div>
                      {formFeedback.type === 'success' && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {formFeedback.whatsappUrl && (
                            <a
                              href={formFeedback.whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)]/45 bg-[var(--accent)]/15 px-3 py-1.5 text-xs font-semibold text-[#F5F7FA]"
                            >
                              Open WhatsApp Message &rarr;
                            </a>
                          )}
                          {formFeedback.mailtoUrl && (
                            <a
                              href={formFeedback.mailtoUrl}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)]/45 bg-[var(--accent)]/15 px-3 py-1.5 text-xs font-semibold text-[#F5F7FA]"
                            >
                              Open Email Client &rarr;
                            </a>
                          )}
                          {formFeedback.telegramUrl && (
                            <a
                              href={formFeedback.telegramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)]/45 bg-[var(--accent)]/15 px-3 py-1.5 text-xs font-semibold text-[#F5F7FA]"
                            >
                              Open Telegram &rarr;
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button type="submit" className="btn-3d btn-primary-3d">
                      <span>Send Message</span>
                      <ArrowRight className="btn-arrow h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-10 border-t border-white/10 bg-[#090B10]/90 px-5 pb-7 pt-11">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-5 border-b border-white/[0.06] pb-6">
          <div>
            <span className="font-display text-base font-bold tracking-[0.1em] text-[#F5F7FA]">
              {siteData.general.brandName}
            </span>
            <p className="mt-1.5 text-sm text-[#9299A8]">{siteData.general.footerText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-[#9299A8]">
            <a href="#home" className="hover:text-[var(--accent)]">Home</a>
            <a href="#journey" className="hover:text-[var(--accent)]">Journey</a>
            <a href="#about" className="hover:text-[var(--accent)]">About</a>
            <a href="#services" className="hover:text-[var(--accent)]">Services</a>
            <a href="#support" className="hover:text-[var(--accent)]">Support</a>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#admin';
                setIsAdminRoute(true);
              }}
              className="text-[#9299A8]/70 hover:text-[var(--accent)] cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1160px] flex-wrap justify-between gap-3 pt-4 text-xs text-[#9299A8]">
          <span>
            &copy; {new Date().getFullYear()} {siteData.profile.name}. All rights reserved.
          </span>
          <span>{siteData.profile.location}</span>
        </div>
      </footer>

      {/* Service Detail Modal */}
      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onSelectForContact={(srvTitle) => {
          setFormState((prev) => ({ ...prev, serviceCategory: srvTitle }));
          setSelectedService(null);
          document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ASIF'S ASSISTANT Floating Chatbot */}
      <AiAssistantWidget siteData={siteData} />
    </div>
  );
}
