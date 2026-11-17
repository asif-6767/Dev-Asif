<?php
declare(strict_types=1);

if (!defined('ASIF_APP')) {
    http_response_code(403);
    exit('Direct access forbidden.');
}

$brandName    = setting($settings, 'brand_name', 'ASIF ISLAM');
$logoText     = setting($settings, 'logo_text', 'ASIF ISLAM');
$browserTitle = setting($settings, 'seo_meta_title', setting($settings, 'browser_title', 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.'));
$metaDesc     = setting($settings, 'seo_meta_description', setting($settings, 'site_description', ''));
$ogImage      = safeImageUrl(setting($settings, 'seo_og_image', 'assets/images/asif-islam.jpg'));
$faviconUrl   = safeImageUrl(setting($settings, 'favicon_url', 'assets/images/asif-islam.jpg'));
$robotsMeta   = setting($settings, 'seo_robots', 'index, follow');

$accentPrimary   = sanitizeHexColor(setting($settings, 'accent_primary', '#00E5FF'), '#00E5FF');
$accentSecondary = sanitizeHexColor(setting($settings, 'accent_secondary', '#00FF9D'), '#00FF9D');
$accentPurple    = sanitizeHexColor(setting($settings, 'accent_purple', '#8B5CF6'), '#8B5CF6');
$bgStyle         = setting($settings, 'bg_style', 'cyber-grid');
$animIntensity   = setting($settings, 'animation_intensity', 'balanced');
$glowIntensity   = setting($settings, 'glow_intensity', 'medium');
$borderStyle     = setting($settings, 'border_style', 'conic-glow');
$cardRadius      = max(8, min(28, (int)setting($settings, 'card_radius', '18')));

$contactEmail    = setting($settings, 'contact_email', '');
$contactWhatsapp = setting($settings, 'contact_whatsapp', '');
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#08090D">
    <title><?= e($browserTitle) ?></title>
    <meta name="description" content="<?= e($metaDesc) ?>">
    <meta name="robots" content="<?= e($robotsMeta) ?>">
    <meta property="og:title" content="<?= e($browserTitle) ?>">
    <meta property="og:description" content="<?= e($metaDesc) ?>">
    <meta property="og:image" content="<?= e($ogImage) ?>">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="<?= e($faviconUrl) ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css?v=1.0.0">
    <link rel="stylesheet" href="assets/css/animations.css?v=1.0.0">
    <style>
        :root {
            --accent: <?= e($accentPrimary) ?>;
            --accent-2: <?= e($accentSecondary) ?>;
            --accent-purple: <?= e($accentPurple) ?>;
            --card-radius: <?= (int)$cardRadius ?>px;
        }
    </style>
</head>
<body
    class="bg-mode-<?= e($bgStyle) ?> anim-<?= e($animIntensity) ?> glow-<?= e($glowIntensity) ?> border-<?= e($borderStyle) ?>"
    data-csrf="<?= e($csrfToken) ?>"
>
    <!-- 22. Initial Loading Overlay -->
    <div id="siteLoader" class="site-loader" aria-hidden="true">
        <div class="loader-ring">
            <span class="loader-core"></span>
        </div>
        <span class="loader-brand"><?= e($logoText) ?></span>
    </div>

    <!-- 23. Subtle Scroll Progress Indicator -->
    <div id="scrollProgress" class="scroll-progress" aria-hidden="true"></div>

    <!-- 6. Ambient Background Layer -->
    <div class="ambient-canvas" aria-hidden="true">
        <div class="ambient-grid"></div>
        <div class="ambient-orb orb-1"></div>
        <div class="ambient-orb orb-2"></div>
        <div class="ambient-orb orb-3"></div>
        <div class="ambient-particles">
            <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
    </div>

    <!-- Floating Rounded Glass Navigation Bar (No Search Bar, No Login Button) -->
    <header class="site-header-wrap">
        <nav class="site-navbar glow-frame" aria-label="Primary Navigation">
            <a href="#home" class="brand-lockup" aria-label="<?= e($brandName) ?> Home">
                <span class="brand-monogram" aria-hidden="true">
                    <svg viewBox="0 0 36 36" fill="none" class="monogram-svg">
                        <path d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" stroke="url(#monoGrad)" stroke-width="1.8"/>
                        <path d="M18 9L24.5 24H21.2L19.8 20.5H16.2L14.8 24H11.5L18 9ZM17.1 17.8H18.9L18 15.2L17.1 17.8Z" fill="url(#monoGrad)"/>
                        <circle cx="27" cy="9" r="2.2" class="monogram-node"/>
                        <defs>
                            <linearGradient id="monoGrad" x1="5" y1="3" x2="31" y2="33" gradientUnits="userSpaceOnUse">
                                <stop stop-color="var(--accent)"/>
                                <stop offset="1" stop-color="var(--accent-2)"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </span>
                <span class="brand-wordmark"><?= e($logoText) ?></span>
            </a>

            <button
                type="button"
                id="hamburgerBtn"
                class="hamburger-btn"
                aria-label="Open navigation menu"
                aria-expanded="false"
                aria-controls="navDrawer"
            >
                <span class="ham-line"></span>
                <span class="ham-line"></span>
                <span class="ham-line"></span>
            </button>
        </nav>
    </header>

    <!-- Full-Height Slide-In Mobile-App Navigation Drawer -->
    <div id="navBackdrop" class="drawer-backdrop" aria-hidden="true"></div>
    <aside id="navDrawer" class="nav-drawer" aria-label="Navigation Menu" aria-hidden="true">
        <div class="drawer-header">
            <a href="#home" class="drawer-brand" data-nav-link>
                <span class="brand-monogram small">
                    <svg viewBox="0 0 36 36" fill="none" class="monogram-svg">
                        <path d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" stroke="var(--accent)" stroke-width="1.8"/>
                        <path d="M18 9L24.5 24H21.2L19.8 20.5H16.2L14.8 24H11.5L18 9Z" fill="var(--accent)"/>
                    </svg>
                </span>
                <span class="drawer-brand-text"><?= e($logoText) ?></span>
            </a>
            <button type="button" id="drawerCloseBtn" class="drawer-close-btn" aria-label="Close menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <nav class="drawer-links" aria-label="Section links">
            <a href="#home" class="drawer-item is-active" data-nav-link data-section="home" style="--stagger:0">
                <span class="drawer-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </span>
                <span class="drawer-label">1. Home</span>
                <span class="drawer-chevron" aria-hidden="true">›</span>
            </a>
            <?php if (setting($settings, 'show_journey', '1') === '1'): ?>
            <a href="#journey" class="drawer-item" data-nav-link data-section="journey" style="--stagger:1">
                <span class="drawer-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
                </span>
                <span class="drawer-label">2. Journey</span>
                <span class="drawer-chevron" aria-hidden="true">›</span>
            </a>
            <?php endif; ?>
            <?php if (setting($settings, 'show_about', '1') === '1'): ?>
            <a href="#about" class="drawer-item" data-nav-link data-section="about" style="--stagger:2">
                <span class="drawer-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                </span>
                <span class="drawer-label">3. About</span>
                <span class="drawer-chevron" aria-hidden="true">›</span>
            </a>
            <?php endif; ?>
            <?php if (setting($settings, 'show_services', '1') === '1'): ?>
            <a href="#services" class="drawer-item" data-nav-link data-section="services" style="--stagger:3">
                <span class="drawer-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                </span>
                <span class="drawer-label">4. Services</span>
                <span class="drawer-chevron" aria-hidden="true">›</span>
            </a>
            <?php endif; ?>
            <?php if (setting($settings, 'show_support', '1') === '1'): ?>
            <a href="#support" class="drawer-item" data-nav-link data-section="support" style="--stagger:4">
                <span class="drawer-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </span>
                <span class="drawer-label">5. Support</span>
                <span class="drawer-chevron" aria-hidden="true">›</span>
            </a>
            <?php endif; ?>
        </nav>

        <div class="drawer-footer">
            <div class="drawer-contact-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span><?= e(setting($settings, 'profile_location', 'Daulatpur, Kushtia, Bangladesh')) ?></span>
            </div>
            <?php if ($contactEmail !== ''): ?>
            <div class="drawer-contact-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span><?= e($contactEmail) ?></span>
            </div>
            <?php endif; ?>
        </div>
    </aside>

    <main id="mainContent">
