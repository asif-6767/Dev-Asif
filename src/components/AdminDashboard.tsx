import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  AiMode,
  AiProvider,
  AnimationIntensity,
  BannerItem,
  BgStyle,
  BorderStyle,
  GlowIntensity,
  JourneyMilestone,
  KnowledgeEntry,
  ServiceItem,
  SiteData,
} from '../types/site';

interface AdminDashboardProps {
  siteData: SiteData;
  onUpdateData: (next: SiteData) => void;
  onResetDefaults: () => void;
  onExitAdmin: () => void;
}

const ADMIN_CRED_KEY = 'asif_admin_cred_hash_v1';
const ADMIN_SESS_KEY = 'asif_admin_session_active_v1';

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type AdminTab =
  | 'overview'
  | 'general'
  | 'profile'
  | 'hero'
  | 'banners'
  | 'journey'
  | 'services'
  | 'social'
  | 'contact'
  | 'ai'
  | 'appearance'
  | 'seo'
  | 'backup';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: 'Overview & Inbox' },
  { id: 'general', label: 'A. General Settings' },
  { id: 'profile', label: 'B. Profile & About' },
  { id: 'hero', label: 'C. Hero Section' },
  { id: 'banners', label: 'D. Banner Manager' },
  { id: 'journey', label: 'E. Journey Milestones' },
  { id: 'services', label: 'F. Services Manager' },
  { id: 'social', label: 'G. Social Links' },
  { id: 'contact', label: 'H. Contact Settings' },
  { id: 'ai', label: 'I. AI Assistant & KB' },
  { id: 'appearance', label: 'J. Appearance' },
  { id: 'seo', label: 'K. SEO Settings' },
  { id: 'backup', label: 'L. Backup & InfinityFree ZIP' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  siteData,
  onUpdateData,
  onResetDefaults,
  onExitAdmin,
}) => {
  const [storedCredRaw, setStoredCredRaw] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ADMIN_CRED_KEY);
    } catch {
      return null;
    }
  });
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESS_KEY) === '1';
    } catch {
      return false;
    }
  });

  // Setup / Login state
  const [setupUser, setSetupUser] = useState('asifadmin');
  const [setupPass, setSetupPass] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [restoreConfirm, setRestoreConfirm] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [newApiKeyInput, setNewApiKeyInput] = useState('');

  // Quick-add form states
  const [newBanner, setNewBanner] = useState<Omit<BannerItem, 'id'>>({
    title: '',
    subtitle: '',
    imageUrl: '/assets/images/banner-web.svg',
    destinationLink: '#services',
    buttonText: 'Explore',
    displayOrder: siteData.banners.length + 1,
    isActive: true,
  });

  const [newMilestone, setNewMilestone] = useState<Omit<JourneyMilestone, 'id'>>({
    yearLabel: '2028',
    title: '',
    description: '',
    displayOrder: siteData.milestones.length + 1,
    isActive: true,
  });

  const [newService, setNewService] = useState({
    serviceNumber: `0${siteData.services.length + 1}`,
    iconKey: 'sparkles',
    title: '',
    shortDescription: '',
    fullDescription: '',
    featuresText: '',
    platformsCsv: 'web',
    contactButtonText: 'Request This Service',
    displayOrder: siteData.services.length + 1,
  });

  const [newKb, setNewKb] = useState<Omit<KnowledgeEntry, 'id'>>({
    topic: '',
    keywords: '',
    answerText: '',
    category: 'general',
    isActive: true,
    displayOrder: siteData.knowledgeBase.length + 1,
  });

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(setupUser.trim())) {
      setAuthError('Username must be 3–40 characters (letters, numbers, _, ., -).');
      return;
    }
    if (setupPass.length < 8) {
      setAuthError('Password must be at least 8 characters.');
      return;
    }
    if (setupPass !== setupConfirm) {
      setAuthError('Password confirmation does not match.');
      return;
    }
    const hash = await sha256Hex(`${setupUser.trim()}:${setupPass}`);
    const payload = JSON.stringify({ username: setupUser.trim(), hash });
    localStorage.setItem(ADMIN_CRED_KEY, payload);
    sessionStorage.setItem(ADMIN_SESS_KEY, '1');
    setStoredCredRaw(payload);
    setIsAuthed(true);
    setSetupPass('');
    setSetupConfirm('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!storedCredRaw) return;
    try {
      const parsed = JSON.parse(storedCredRaw) as { username: string; hash: string };
      const attemptHash = await sha256Hex(`${loginUser.trim()}:${loginPass}`);
      if (loginUser.trim() === parsed.username && attemptHash === parsed.hash) {
        sessionStorage.setItem(ADMIN_SESS_KEY, '1');
        setIsAuthed(true);
        setLoginPass('');
      } else {
        setAuthError('Invalid username or password.');
      }
    } catch {
      setAuthError('Stored credential error.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESS_KEY);
    setIsAuthed(false);
  };

  // Auth Gate UI (First-time setup OR Login)
  if (!isAuthed) {
    return (
      <div className="min-h-dvh grid place-items-center bg-[#08090D] p-5">
        <div className="w-full max-w-md rounded-2xl border border-[#00E5FF]/25 bg-[#141821] p-7 shadow-2xl">
          <div className="mb-3 inline-block rounded border border-[#00E5FF]/30 px-2.5 py-1 font-mono text-[11px] tracking-widest text-[#00E5FF]">
            {storedCredRaw ? 'ASIF ISLAM · CONTROL PANEL' : 'INITIAL SETUP'}
          </div>
          <h1 className="font-display mb-2 text-2xl font-bold text-[#F5F7FA]">
            {storedCredRaw ? 'Administrator Sign In' : 'Create Admin Password'}
          </h1>
          <p className="mb-5 text-sm text-[#9299A8]">
            {storedCredRaw
              ? 'Sign in to manage website content, banners, services, AI assistant, and export the InfinityFree PHP deployment bundle.'
              : 'Configure your local admin credentials to unlock the live control panel. (On InfinityFree PHP hosting, /admin/setup.php handles MySQL setup.)'}
          </p>

          {authError && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/15 px-3.5 py-2.5 text-sm text-red-200">
              {authError}
            </div>
          )}

          {!storedCredRaw ? (
            <form onSubmit={handleFirstTimeSetup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#CBD5E1]">Admin Username</label>
                <input
                  type="text"
                  value={setupUser}
                  onChange={(e) => setSetupUser(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/12 bg-[#0A0D14] px-3.5 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#CBD5E1]">Password (min 8 chars)</label>
                <input
                  type="password"
                  value={setupPass}
                  onChange={(e) => setSetupPass(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-white/12 bg-[#0A0D14] px-3.5 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#CBD5E1]">Confirm Password</label>
                <input
                  type="password"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-white/12 bg-[#0A0D14] px-3.5 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00E5FF]"
                />
              </div>
              <button type="submit" className="btn-3d btn-primary-3d w-full">
                Create &amp; Enter Dashboard
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#CBD5E1]">Username</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/12 bg-[#0A0D14] px-3.5 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#CBD5E1]">Password</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/12 bg-[#0A0D14] px-3.5 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00E5FF]"
                />
              </div>
              <button type="submit" className="btn-3d btn-primary-3d w-full">
                Sign In
              </button>
            </form>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#9299A8]">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 hover:text-[#00E5FF] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Website
            </button>
            <a
              href="/asif-islam-website.zip"
              download="asif-islam-website.zip"
              className="inline-flex items-center gap-1 text-[#00FF9D] hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              PHP + MySQL ZIP
            </a>
          </div>
        </div>
      </div>
    );
  }

  const exportJsonBackup = () => {
    const bundle = {
      schema_version: '1.0',
      exported_at: new Date().toISOString(),
      data: siteData,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asif-islam-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('JSON backup downloaded.');
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (restoreConfirm.trim().toUpperCase() !== 'RESTORE') {
      setRestoreError('Please type RESTORE in the confirmation field before selecting a backup file.');
      e.target.value = '';
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { schema_version?: string; data?: SiteData };
      if (parsed.schema_version !== '1.0' || !parsed.data?.general || !parsed.data?.services) {
        throw new Error('Invalid backup JSON schema.');
      }
      onUpdateData(parsed.data);
      setRestoreConfirm('');
      notify('Backup validated and restored.');
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : 'Unable to parse backup JSON.');
    } finally {
      e.target.value = '';
    }
  };

  const inputCls =
    'w-full rounded-xl border border-white/12 bg-[#0A0D14] px-3 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00E5FF]';
  const labelCls = 'mb-1 block text-xs font-semibold text-[#CBD5E1]';
  const cardCls = 'rounded-2xl border border-white/10 bg-[#141821] p-5 sm:p-6 mb-5';

  return (
    <div className="flex min-h-dvh bg-[#08090D] text-[#F5F7FA]">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-white/10 bg-[#10131B] transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <strong className="font-display text-sm tracking-widest text-[#00E5FF]">ASIF ADMIN</strong>
          <span className="font-mono text-[11px] text-[#00FF9D]">LIVE CMS</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                setMobileNavOpen(false);
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === t.id
                  ? 'border-[#00E5FF]/35 bg-[#00E5FF]/12 text-[#F5F7FA]'
                  : 'border-transparent text-[#9299A8] hover:bg-white/[0.04] hover:text-[#F5F7FA]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3.5">
          <a
            href="/asif-islam-website.zip"
            download="asif-islam-website.zip"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00FF9D]/35 bg-[#00FF9D]/10 px-3 py-2 text-xs font-semibold text-[#00FF9D] hover:bg-[#00FF9D]/20"
          >
            <Download className="h-3.5 w-3.5" />
            Download PHP + MySQL ZIP
          </a>
          <button
            type="button"
            onClick={onExitAdmin}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#F5F7FA] hover:border-[#00E5FF] cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Public Website
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/12 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#08090D]/90 px-4 py-3.5 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 bg-[#141821] lg:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="font-display text-base sm:text-lg font-bold">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          {toast && (
            <span className="rounded-lg border border-[#00FF9D]/40 bg-[#00FF9D]/12 px-3 py-1 text-xs font-medium text-[#BBF7D0]">
              {toast}
            </span>
          )}
        </header>

        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
          {/* OVERVIEW & INBOX */}
          {activeTab === 'overview' && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-[#141821] p-4">
                  <div className="text-[11px] uppercase tracking-wider text-[#9299A8]">Active Services</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#00E5FF]">
                    {siteData.services.filter((s) => s.isActive).length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#141821] p-4">
                  <div className="text-[11px] uppercase tracking-wider text-[#9299A8]">Banners</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#00E5FF]">
                    {siteData.banners.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#141821] p-4">
                  <div className="text-[11px] uppercase tracking-wider text-[#9299A8]">AI KB Entries</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#00FF9D]">
                    {siteData.knowledgeBase.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#141821] p-4">
                  <div className="text-[11px] uppercase tracking-wider text-[#9299A8]">Inquiries</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#8B5CF6]">
                    {siteData.messages.length}
                  </div>
                </div>
              </div>

              <div className={cardCls}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">InfinityFree PHP + MySQL Deployment Package</h2>
                    <p className="text-sm text-[#9299A8]">
                      Includes all 29 production PHP, MySQL (`schema.sql`), `.htaccess`, Admin CMS, and Dual-Mode AI files ready for `/htdocs/`.
                    </p>
                  </div>
                  <a
                    href="/asif-islam-website.zip"
                    download="asif-islam-website.zip"
                    className="btn-3d btn-primary-3d"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download ZIP (176 KB)</span>
                  </a>
                </div>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-1 text-lg font-bold">Contact Form Inbox</h2>
                <p className="mb-4 text-sm text-[#9299A8]">
                  Inquiries submitted from the Support section on the public site.
                </p>
                {siteData.messages.length === 0 ? (
                  <p className="text-sm text-[#9299A8]">No inquiries recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {siteData.messages.map((m) => (
                      <div key={m.id} className="rounded-xl border border-white/10 bg-[#0B0E15] p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <strong className="text-sm text-[#F5F7FA]">{m.fullName}</strong>{' '}
                            <span className="text-xs text-[#9299A8]">({m.email})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#00E5FF]">
                              {m.preferredMethod} &middot; {m.serviceCategory}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateData({
                                  ...siteData,
                                  messages: siteData.messages.filter((x) => x.id !== m.id),
                                });
                                notify('Message deleted.');
                              }}
                              className="rounded-lg border border-red-500/35 bg-red-500/12 p-1.5 text-red-300 hover:bg-red-500/20 cursor-pointer"
                              aria-label="Delete message"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-[#CBD5E1]">{m.message}</p>
                        <div className="mt-2 font-mono text-[11px] text-[#9299A8]">{m.createdAt}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* A. GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className={cardCls}>
              <h2 className="font-display mb-4 text-lg font-bold">A. General Settings</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Brand Name</label>
                  <input
                    className={inputCls}
                    value={siteData.general.brandName}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, general: { ...siteData.general, brandName: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Navbar Logo Text</label>
                  <input
                    className={inputCls}
                    value={siteData.general.logoText}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, general: { ...siteData.general, logoText: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Website Title</label>
                  <input
                    className={inputCls}
                    value={siteData.general.siteTitle}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, general: { ...siteData.general, siteTitle: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Browser Title</label>
                  <input
                    className={inputCls}
                    value={siteData.general.browserTitle}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, general: { ...siteData.general, browserTitle: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Favicon URL</label>
                  <input
                    className={inputCls}
                    value={siteData.general.faviconUrl}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, general: { ...siteData.general, faviconUrl: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Footer Text</label>
                  <input
                    className={inputCls}
                    value={siteData.general.footerText}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, general: { ...siteData.general, footerText: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Website Description</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={siteData.general.siteDescription}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, general: { ...siteData.general, siteDescription: e.target.value } })
                  }
                />
              </div>
              <button type="button" onClick={() => notify('General settings live-saved.')} className="btn-3d btn-primary-3d mt-4">
                <Save className="h-4 w-4" />
                <span>Confirm Saved</span>
              </button>
            </div>
          )}

          {/* B. PROFILE MANAGEMENT */}
          {activeTab === 'profile' && (
            <div className={cardCls}>
              <h2 className="font-display mb-4 text-lg font-bold">B. Profile &amp; About Section</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Name</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.name}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, name: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Profile Image URL</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.imageUrl}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, imageUrl: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.location}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, location: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Education</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.education}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, education: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Journey Starting Year</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.startedYear}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, startedYear: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>About Heading</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.aboutHeading}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, aboutHeading: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Interests</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.interests}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, interests: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Future Goal</label>
                  <input
                    className={inputCls}
                    value={siteData.profile.futureGoal}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, profile: { ...siteData.profile, futureGoal: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Personal Introduction</label>
                <textarea
                  rows={4}
                  className={inputCls}
                  value={siteData.profile.introduction}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, profile: { ...siteData.profile, introduction: e.target.value } })
                  }
                />
              </div>
              <div className="mt-4">
                <label className={labelCls}>About Narrative</label>
                <textarea
                  rows={5}
                  className={inputCls}
                  value={siteData.profile.aboutDescription}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, profile: { ...siteData.profile, aboutDescription: e.target.value } })
                  }
                />
              </div>
            </div>
          )}

          {/* C. HERO SECTION */}
          {activeTab === 'hero' && (
            <div className={cardCls}>
              <h2 className="font-display mb-4 text-lg font-bold">C. Hero Section</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Small Badge</label>
                  <input
                    className={inputCls}
                    value={siteData.hero.badge}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, hero: { ...siteData.hero, badge: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Main Heading</label>
                  <input
                    className={inputCls}
                    value={siteData.hero.heading}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, hero: { ...siteData.hero, heading: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Primary CTA Text</label>
                  <input
                    className={inputCls}
                    value={siteData.hero.primaryBtn}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, hero: { ...siteData.hero, primaryBtn: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Secondary CTA Text</label>
                  <input
                    className={inputCls}
                    value={siteData.hero.secondaryBtn}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, hero: { ...siteData.hero, secondaryBtn: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Profile Image URL</label>
                  <input
                    className={inputCls}
                    value={siteData.hero.profileImageUrl}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, hero: { ...siteData.hero, profileImageUrl: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Background Image URL (Optional)</label>
                  <input
                    className={inputCls}
                    value={siteData.hero.bgImageUrl}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, hero: { ...siteData.hero, bgImageUrl: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Typing Phrases (separated by |)</label>
                <input
                  className={inputCls}
                  value={siteData.hero.typingPhrases}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, hero: { ...siteData.hero, typingPhrases: e.target.value } })
                  }
                />
              </div>
              <div className="mt-4">
                <label className={labelCls}>Subtitle</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={siteData.hero.subtitle}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, hero: { ...siteData.hero, subtitle: e.target.value } })
                  }
                />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={siteData.hero.visible}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, hero: { ...siteData.hero, visible: e.target.checked } })
                  }
                />
                Show Hero Section
              </label>
            </div>
          )}

          {/* D. BANNER MANAGEMENT */}
          {activeTab === 'banners' && (
            <>
              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">D. Add New Banner (Image URL)</h2>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Banner Title</label>
                    <input
                      className={inputCls}
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Image URL</label>
                    <input
                      className={inputCls}
                      value={newBanner.imageUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Destination Link</label>
                    <input
                      className={inputCls}
                      value={newBanner.destinationLink}
                      onChange={(e) => setNewBanner({ ...newBanner, destinationLink: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Button Text</label>
                    <input
                      className={inputCls}
                      value={newBanner.buttonText}
                      onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Subtitle</label>
                  <input
                    className={inputCls}
                    value={newBanner.subtitle}
                    onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newBanner.title.trim()) return;
                    onUpdateData({
                      ...siteData,
                      banners: [...siteData.banners, { ...newBanner, id: Date.now() }],
                    });
                    setNewBanner({ ...newBanner, title: '', subtitle: '' });
                    notify('Banner added.');
                  }}
                  className="btn-3d btn-primary-3d mt-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Banner</span>
                </button>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">Manage Banners</h2>
                <div className="space-y-4">
                  {siteData.banners.map((b, idx) => (
                    <div key={b.id} className="rounded-xl border border-white/10 bg-[#0B0E15] p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>Title</label>
                          <input
                            className={inputCls}
                            value={b.title}
                            onChange={(e) => {
                              const next = [...siteData.banners];
                              next[idx] = { ...b, title: e.target.value };
                              onUpdateData({ ...siteData, banners: next });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Image URL</label>
                          <input
                            className={inputCls}
                            value={b.imageUrl}
                            onChange={(e) => {
                              const next = [...siteData.banners];
                              next[idx] = { ...b, imageUrl: e.target.value };
                              onUpdateData({ ...siteData, banners: next });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Link</label>
                          <input
                            className={inputCls}
                            value={b.destinationLink}
                            onChange={(e) => {
                              const next = [...siteData.banners];
                              next[idx] = { ...b, destinationLink: e.target.value };
                              onUpdateData({ ...siteData, banners: next });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Order</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={b.displayOrder}
                            onChange={(e) => {
                              const next = [...siteData.banners];
                              next[idx] = { ...b, displayOrder: Number(e.target.value) || 1 };
                              onUpdateData({ ...siteData, banners: next });
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={b.isActive}
                            onChange={(e) => {
                              const next = [...siteData.banners];
                              next[idx] = { ...b, isActive: e.target.checked };
                              onUpdateData({ ...siteData, banners: next });
                            }}
                          />
                          Active
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateData({
                              ...siteData,
                              banners: siteData.banners.filter((x) => x.id !== b.id),
                            });
                            notify('Banner removed.');
                          }}
                          className="rounded-lg border border-red-500/35 bg-red-500/12 px-3 py-1.5 text-xs text-red-200 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* E. JOURNEY MANAGEMENT */}
          {activeTab === 'journey' && (
            <>
              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">E. Add Journey Milestone</h2>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>Year / Date</label>
                    <input
                      className={inputCls}
                      value={newMilestone.yearLabel}
                      onChange={(e) => setNewMilestone({ ...newMilestone, yearLabel: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Title</label>
                    <input
                      className={inputCls}
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newMilestone.title.trim()) return;
                    onUpdateData({
                      ...siteData,
                      milestones: [...siteData.milestones, { ...newMilestone, id: Date.now() }],
                    });
                    setNewMilestone({ ...newMilestone, title: '', description: '' });
                    notify('Milestone added.');
                  }}
                  className="btn-3d btn-primary-3d mt-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">Edit Journey Milestones</h2>
                <div className="space-y-4">
                  {siteData.milestones.map((ms, idx) => (
                    <div key={ms.id} className="rounded-xl border border-white/10 bg-[#0B0E15] p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className={labelCls}>Year</label>
                          <input
                            className={inputCls}
                            value={ms.yearLabel}
                            onChange={(e) => {
                              const next = [...siteData.milestones];
                              next[idx] = { ...ms, yearLabel: e.target.value };
                              onUpdateData({ ...siteData, milestones: next });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Title</label>
                          <input
                            className={inputCls}
                            value={ms.title}
                            onChange={(e) => {
                              const next = [...siteData.milestones];
                              next[idx] = { ...ms, title: e.target.value };
                              onUpdateData({ ...siteData, milestones: next });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Order</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={ms.displayOrder}
                            onChange={(e) => {
                              const next = [...siteData.milestones];
                              next[idx] = { ...ms, displayOrder: Number(e.target.value) || 1 };
                              onUpdateData({ ...siteData, milestones: next });
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className={labelCls}>Description</label>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={ms.description}
                          onChange={(e) => {
                            const next = [...siteData.milestones];
                            next[idx] = { ...ms, description: e.target.value };
                            onUpdateData({ ...siteData, milestones: next });
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={ms.isActive}
                            onChange={(e) => {
                              const next = [...siteData.milestones];
                              next[idx] = { ...ms, isActive: e.target.checked };
                              onUpdateData({ ...siteData, milestones: next });
                            }}
                          />
                          Active
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateData({
                              ...siteData,
                              milestones: siteData.milestones.filter((x) => x.id !== ms.id),
                            });
                            notify('Milestone deleted.');
                          }}
                          className="rounded-lg border border-red-500/35 bg-red-500/12 px-3 py-1.5 text-xs text-red-200 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* F. SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <>
              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">F. Add Service</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Number</label>
                    <input
                      className={inputCls}
                      value={newService.serviceNumber}
                      onChange={(e) => setNewService({ ...newService, serviceNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Icon</label>
                    <select
                      className={inputCls}
                      value={newService.iconKey}
                      onChange={(e) => setNewService({ ...newService, iconKey: e.target.value })}
                    >
                      <option value="code">Code / Web</option>
                      <option value="globe">Globe</option>
                      <option value="shield-user">Shield User</option>
                      <option value="alert-shield">Safety Shield</option>
                      <option value="bot">Bot / Automation</option>
                      <option value="video">Video</option>
                      <option value="sparkles">Sparkles / Custom</option>
                      <option value="cpu">CPU / Tech</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Service Title</label>
                    <input
                      className={inputCls}
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Button Text</label>
                    <input
                      className={inputCls}
                      value={newService.contactButtonText}
                      onChange={(e) => setNewService({ ...newService, contactButtonText: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Short Description</label>
                  <input
                    className={inputCls}
                    value={newService.shortDescription}
                    onChange={(e) => setNewService({ ...newService, shortDescription: e.target.value })}
                  />
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Full Description</label>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={newService.fullDescription}
                    onChange={(e) => setNewService({ ...newService, fullDescription: e.target.value })}
                  />
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Features (one per line)</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={newService.featuresText}
                    onChange={(e) => setNewService({ ...newService, featuresText: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newService.title.trim()) return;
                    const srv: ServiceItem = {
                      id: Date.now(),
                      serviceNumber: newService.serviceNumber,
                      slug: newService.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      iconKey: newService.iconKey,
                      title: newService.title,
                      shortDescription: newService.shortDescription,
                      fullDescription: newService.fullDescription || newService.shortDescription,
                      features: newService.featuresText
                        .split(/\r?\n/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                      platforms: newService.platformsCsv
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                      contactButtonText: newService.contactButtonText,
                      displayOrder: newService.displayOrder,
                      isActive: true,
                    };
                    onUpdateData({ ...siteData, services: [...siteData.services, srv] });
                    setNewService({ ...newService, title: '', shortDescription: '', fullDescription: '', featuresText: '' });
                    notify('Service added.');
                  }}
                  className="btn-3d btn-primary-3d mt-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">Manage Services</h2>
                <div className="space-y-4">
                  {siteData.services.map((srv, idx) => (
                    <div key={srv.id} className="rounded-xl border border-white/10 bg-[#0B0E15] p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className={labelCls}>Number</label>
                          <input
                            className={inputCls}
                            value={srv.serviceNumber}
                            onChange={(e) => {
                              const next = [...siteData.services];
                              next[idx] = { ...srv, serviceNumber: e.target.value };
                              onUpdateData({ ...siteData, services: next });
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Title</label>
                          <input
                            className={inputCls}
                            value={srv.title}
                            onChange={(e) => {
                              const next = [...siteData.services];
                              next[idx] = { ...srv, title: e.target.value };
                              onUpdateData({ ...siteData, services: next });
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className={labelCls}>Short Description</label>
                        <input
                          className={inputCls}
                          value={srv.shortDescription}
                          onChange={(e) => {
                            const next = [...siteData.services];
                            next[idx] = { ...srv, shortDescription: e.target.value };
                            onUpdateData({ ...siteData, services: next });
                          }}
                        />
                      </div>
                      <div className="mt-3">
                        <label className={labelCls}>Features (one per line)</label>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={srv.features.join('\n')}
                          onChange={(e) => {
                            const next = [...siteData.services];
                            next[idx] = {
                              ...srv,
                              features: e.target.value.split(/\r?\n/),
                            };
                            onUpdateData({ ...siteData, services: next });
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={srv.isActive}
                            onChange={(e) => {
                              const next = [...siteData.services];
                              next[idx] = { ...srv, isActive: e.target.checked };
                              onUpdateData({ ...siteData, services: next });
                            }}
                          />
                          Active
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateData({
                              ...siteData,
                              services: siteData.services.filter((x) => x.id !== srv.id),
                            });
                            notify('Service deleted.');
                          }}
                          className="rounded-lg border border-red-500/35 bg-red-500/12 px-3 py-1.5 text-xs text-red-200 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* G. SOCIAL LINKS */}
          {activeTab === 'social' && (
            <div className={cardCls}>
              <h2 className="font-display mb-2 text-lg font-bold">G. Social Links Management</h2>
              <p className="mb-4 text-sm text-[#9299A8]">
                Leave URL empty to show an unconfigured/disabled card, or uncheck Visible to hide it completely.
              </p>
              <div className="space-y-3.5">
                {siteData.socials.map((soc, idx) => (
                  <div key={soc.id} className="rounded-xl border border-white/10 bg-[#0B0E15] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <strong>{soc.platformName}</strong>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={soc.isActive}
                          onChange={(e) => {
                            const next = [...siteData.socials];
                            next[idx] = { ...soc, isActive: e.target.checked };
                            onUpdateData({ ...siteData, socials: next });
                          }}
                        />
                        Visible
                      </label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>URL</label>
                        <input
                          className={inputCls}
                          value={soc.url}
                          placeholder="https://... or mailto:..."
                          onChange={(e) => {
                            const next = [...siteData.socials];
                            next[idx] = { ...soc, url: e.target.value };
                            onUpdateData({ ...siteData, socials: next });
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Supporting Text</label>
                        <input
                          className={inputCls}
                          value={soc.supportingText}
                          onChange={(e) => {
                            const next = [...siteData.socials];
                            next[idx] = { ...soc, supportingText: e.target.value };
                            onUpdateData({ ...siteData, socials: next });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* H. CONTACT SETTINGS */}
          {activeTab === 'contact' && (
            <div className={cardCls}>
              <h2 className="font-display mb-4 text-lg font-bold">H. Contact Settings</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Section Heading</label>
                  <input
                    className={inputCls}
                    value={siteData.contact.heading}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, contact: { ...siteData.contact, heading: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    className={inputCls}
                    value={siteData.contact.email}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, contact: { ...siteData.contact, email: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>WhatsApp Number</label>
                  <input
                    className={inputCls}
                    value={siteData.contact.whatsapp}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, contact: { ...siteData.contact, whatsapp: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Telegram Link</label>
                  <input
                    className={inputCls}
                    value={siteData.contact.telegram}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, contact: { ...siteData.contact, telegram: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Subtitle</label>
                <input
                  className={inputCls}
                  value={siteData.contact.subtitle}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, contact: { ...siteData.contact, subtitle: e.target.value } })
                  }
                />
              </div>
              <div className="mt-4">
                <label className={labelCls}>Success Message</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={siteData.contact.successMessage}
                  onChange={(e) =>
                    onUpdateData({ ...siteData, contact: { ...siteData.contact, successMessage: e.target.value } })
                  }
                />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siteData.contact.enableWhatsapp}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, contact: { ...siteData.contact, enableWhatsapp: e.target.checked } })
                    }
                  />
                  Generate WhatsApp Handoff Link
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siteData.contact.enableEmailMailto}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, contact: { ...siteData.contact, enableEmailMailto: e.target.checked } })
                    }
                  />
                  Provide Email (mailto) Fallback Link
                </label>
              </div>
            </div>
          )}

          {/* I. AI ASSISTANT & KNOWLEDGE BASE */}
          {activeTab === 'ai' && (
            <>
              <div className={cardCls}>
                <h2 className="font-display mb-2 text-lg font-bold">I. AI Assistant Settings</h2>
                <p className="mb-4 text-sm text-[#9299A8]">
                  Mode 1 runs natively with zero API key required. Mode 2 connects server-side in PHP (`cURL`) via `/api/chat.php` without exposing keys in public JS.
                </p>
                <label className="mb-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={siteData.ai.isEnabled}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, ai: { ...siteData.ai, isEnabled: e.target.checked } })
                    }
                  />
                  Enable ASIF&apos;S ASSISTANT on Public Site
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Assistant Mode</label>
                    <select
                      className={inputCls}
                      value={siteData.ai.mode}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, ai: { ...siteData.ai, mode: e.target.value as AiMode } })
                      }
                    >
                      <option value="builtin">MODE 1 — Built-in Knowledge Base</option>
                      <option value="api">MODE 2 — Optional External AI API (with Mode 1 fallback)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Assistant Display Name</label>
                    <input
                      className={inputCls}
                      value={siteData.ai.assistantName}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, ai: { ...siteData.ai, assistantName: e.target.value } })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>API Provider Format</label>
                    <select
                      className={inputCls}
                      value={siteData.ai.apiProvider}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, ai: { ...siteData.ai, apiProvider: e.target.value as AiProvider } })
                      }
                    >
                      <option value="openai_compatible">OpenAI-Compatible (OpenAI, Groq, OpenRouter)</option>
                      <option value="gemini">Google Gemini REST API</option>
                      <option value="anthropic">Anthropic Messages API</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Model Name</label>
                    <input
                      className={inputCls}
                      value={siteData.ai.modelName}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, ai: { ...siteData.ai, modelName: e.target.value } })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>API Endpoint URL</label>
                    <input
                      className={inputCls}
                      value={siteData.ai.apiEndpoint}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, ai: { ...siteData.ai, apiEndpoint: e.target.value } })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      API Key ({siteData.ai.hasApiKeyConfigured ? 'Configured for PHP Server' : 'Not Configured'})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        className={inputCls}
                        value={newApiKeyInput}
                        onChange={(e) => setNewApiKeyInput(e.target.value)}
                        placeholder="Enter API key in InfinityFree PHP Admin for server-side encryption"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newApiKeyInput.trim()) return;
                          onUpdateData({
                            ...siteData,
                            ai: { ...siteData.ai, hasApiKeyConfigured: true },
                          });
                          setNewApiKeyInput('');
                          notify('Key status recorded. Configure real server key in PHP Admin.');
                        }}
                        className="rounded-xl border border-[#00E5FF]/40 bg-[#00E5FF]/12 px-4 text-xs font-semibold text-[#00E5FF] cursor-pointer"
                      >
                        Mark Key
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelCls}>Welcome Message</label>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={siteData.ai.welcomeMessage}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, ai: { ...siteData.ai, welcomeMessage: e.target.value } })
                    }
                  />
                </div>
                <div className="mt-4">
                  <label className={labelCls}>Suggested Questions (one per line)</label>
                  <textarea
                    rows={4}
                    className={inputCls}
                    value={siteData.ai.suggestedQuestions.join('\n')}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        ai: { ...siteData.ai, suggestedQuestions: e.target.value.split(/\r?\n/) },
                      })
                    }
                  />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Fallback Message</label>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={siteData.ai.fallbackMessage}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, ai: { ...siteData.ai, fallbackMessage: e.target.value } })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Off-Topic Refusal Message</label>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={siteData.ai.offTopicMessage}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, ai: { ...siteData.ai, offTopicMessage: e.target.value } })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">Add Knowledge Base Entry</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Topic</label>
                    <input
                      className={inputCls}
                      value={newKb.topic}
                      onChange={(e) => setNewKb({ ...newKb, topic: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Keywords (comma separated)</label>
                    <input
                      className={inputCls}
                      value={newKb.keywords}
                      onChange={(e) => setNewKb({ ...newKb, keywords: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Approved Answer Text</label>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={newKb.answerText}
                    onChange={(e) => setNewKb({ ...newKb, answerText: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newKb.topic.trim() || !newKb.answerText.trim()) return;
                    onUpdateData({
                      ...siteData,
                      knowledgeBase: [...siteData.knowledgeBase, { ...newKb, id: Date.now() }],
                    });
                    setNewKb({ ...newKb, topic: '', keywords: '', answerText: '' });
                    notify('Knowledge entry added.');
                  }}
                  className="btn-3d btn-primary-3d mt-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Entry</span>
                </button>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-4 text-lg font-bold">Approved Knowledge Base</h2>
                <div className="space-y-3">
                  {siteData.knowledgeBase.map((kb, idx) => (
                    <div key={kb.id} className="rounded-xl border border-white/10 bg-[#0B0E15] p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>Topic</label>
                          <input
                            className={inputCls}
                            value={kb.topic}
                            onChange={(e) => {
                              const next = [...siteData.knowledgeBase];
                              next[idx] = { ...kb, topic: e.target.value };
                              onUpdateData({ ...siteData, knowledgeBase: next });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Keywords</label>
                          <input
                            className={inputCls}
                            value={kb.keywords}
                            onChange={(e) => {
                              const next = [...siteData.knowledgeBase];
                              next[idx] = { ...kb, keywords: e.target.value };
                              onUpdateData({ ...siteData, knowledgeBase: next });
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className={labelCls}>Answer</label>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={kb.answerText}
                          onChange={(e) => {
                            const next = [...siteData.knowledgeBase];
                            next[idx] = { ...kb, answerText: e.target.value };
                            onUpdateData({ ...siteData, knowledgeBase: next });
                          }}
                        />
                      </div>
                      <div className="mt-2.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateData({
                              ...siteData,
                              knowledgeBase: siteData.knowledgeBase.filter((x) => x.id !== kb.id),
                            });
                            notify('Knowledge entry removed.');
                          }}
                          className="rounded-lg border border-red-500/35 bg-red-500/12 px-3 py-1 text-xs text-red-200 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* J. APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className={cardCls}>
              <h2 className="font-display mb-4 text-lg font-bold">J. Website Appearance &amp; Visibility</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Primary Accent Color</label>
                  <input
                    type="color"
                    className="h-11 w-full rounded-xl border border-white/12 bg-[#0A0D14] p-1"
                    value={siteData.appearance.accentPrimary}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, accentPrimary: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Secondary Accent Color</label>
                  <input
                    type="color"
                    className="h-11 w-full rounded-xl border border-white/12 bg-[#0A0D14] p-1"
                    value={siteData.appearance.accentSecondary}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, accentSecondary: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Background Style</label>
                  <select
                    className={inputCls}
                    value={siteData.appearance.bgStyle}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, bgStyle: e.target.value as BgStyle },
                      })
                    }
                  >
                    <option value="cyber-grid">Cyber Grid + Ambient Orbs</option>
                    <option value="minimal">Minimal Ambient</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Border Style</label>
                  <select
                    className={inputCls}
                    value={siteData.appearance.borderStyle}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, borderStyle: e.target.value as BorderStyle },
                      })
                    }
                  >
                    <option value="conic-glow">Animated Conic Glow</option>
                    <option value="static-subtle">Static Subtle Hairline</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Animation Intensity</label>
                  <select
                    className={inputCls}
                    value={siteData.appearance.animationIntensity}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: {
                          ...siteData.appearance,
                          animationIntensity: e.target.value as AnimationIntensity,
                        },
                      })
                    }
                  >
                    <option value="subtle">Subtle</option>
                    <option value="balanced">Balanced</option>
                    <option value="dynamic">Dynamic</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Glow Intensity</label>
                  <select
                    className={inputCls}
                    value={siteData.appearance.glowIntensity}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, glowIntensity: e.target.value as GlowIntensity },
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Card Radius ({siteData.appearance.cardRadius}px)</label>
                  <input
                    type="range"
                    min={8}
                    max={28}
                    value={siteData.appearance.cardRadius}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, cardRadius: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#00E5FF]"
                  />
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siteData.appearance.showBanners}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, showBanners: e.target.checked },
                      })
                    }
                  />
                  Show Banner Slider
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siteData.appearance.showJourney}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, showJourney: e.target.checked },
                      })
                    }
                  />
                  Show Journey Section
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siteData.appearance.showAbout}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, showAbout: e.target.checked },
                      })
                    }
                  />
                  Show About Section
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siteData.appearance.showServices}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, showServices: e.target.checked },
                      })
                    }
                  />
                  Show Services Section
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siteData.appearance.showSupport}
                    onChange={(e) =>
                      onUpdateData({
                        ...siteData,
                        appearance: { ...siteData.appearance, showSupport: e.target.checked },
                      })
                    }
                  />
                  Show Support Section
                </label>
              </div>
            </div>
          )}

          {/* K. SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className={cardCls}>
              <h2 className="font-display mb-4 text-lg font-bold">K. SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Meta Title</label>
                  <input
                    className={inputCls}
                    value={siteData.seo.metaTitle}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, seo: { ...siteData.seo, metaTitle: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Meta Description</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={siteData.seo.metaDescription}
                    onChange={(e) =>
                      onUpdateData({ ...siteData, seo: { ...siteData.seo, metaDescription: e.target.value } })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Open Graph Image URL</label>
                    <input
                      className={inputCls}
                      value={siteData.seo.ogImage}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, seo: { ...siteData.seo, ogImage: e.target.value } })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Search Engine Indexing</label>
                    <select
                      className={inputCls}
                      value={siteData.seo.robots}
                      onChange={(e) =>
                        onUpdateData({ ...siteData, seo: { ...siteData.seo, robots: e.target.value } })
                      }
                    >
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* L. BACKUP, RESTORE & INFINITYFREE ZIP */}
          {activeTab === 'backup' && (
            <>
              <div className={cardCls}>
                <h2 className="font-display mb-2 text-lg font-bold">Download Deployable InfinityFree PHP + MySQL ZIP</h2>
                <p className="mb-4 text-sm text-[#9299A8]">
                  Contains `/index.php`, `/.htaccess`, `/config/database.php`, `/config/security.php`, `/database/schema.sql`, `/includes/`, `/api/`, `/admin/` (setup + login + A–L CMS), `/assets/`, and `/README.md`.
                </p>
                <a
                  href="/asif-islam-website.zip"
                  download="asif-islam-website.zip"
                  className="btn-3d btn-primary-3d"
                >
                  <Download className="h-4 w-4" />
                  <span>Download asif-islam-website.zip</span>
                </a>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-2 text-lg font-bold">L. Export JSON Configuration Backup</h2>
                <p className="mb-4 text-sm text-[#9299A8]">
                  Export your live website settings, banners, journey milestones, services, social links, and AI knowledge base.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={exportJsonBackup} className="btn-3d btn-secondary-3d">
                    <Download className="h-4 w-4" />
                    <span>Export Backup JSON</span>
                  </button>
                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reset to Defaults</span>
                    </button>
                  ) : (
                    <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5">
                      <span className="text-xs font-medium text-amber-200">Reset preview data?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onResetDefaults();
                          setConfirmReset(false);
                          notify('Reset to default settings.');
                        }}
                        className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-[#08090D] cursor-pointer"
                      >
                        Confirm Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-medium text-[#9299A8] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={cardCls}>
                <h2 className="font-display mb-2 text-lg font-bold">Restore From Validated Backup</h2>
                <p className="mb-4 text-sm text-[#9299A8]">
                  Type <code>RESTORE</code> below before uploading a backup JSON file to prevent accidental overwrite.
                </p>
                {restoreError && (
                  <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/15 px-3.5 py-2.5 text-sm text-red-200">
                    {restoreError}
                  </div>
                )}
                <div className="mb-3 max-w-xs">
                  <label className={labelCls}>Confirmation Text</label>
                  <input
                    className={inputCls}
                    placeholder="Type RESTORE"
                    value={restoreConfirm}
                    onChange={(e) => setRestoreConfirm(e.target.value)}
                  />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#00E5FF]/35 bg-[#00E5FF]/12 px-4 py-2.5 text-sm font-semibold text-[#00E5FF]">
                  <Upload className="h-4 w-4" />
                  <span>Select &amp; Restore Backup JSON</span>
                  <input type="file" accept=".json,application/json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
