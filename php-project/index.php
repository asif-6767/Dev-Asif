<?php
declare(strict_types=1);

define('ASIF_APP', true);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/security.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/icons.php';

startSecureSession();
$csrfToken = getCsrfToken();

try {
    $pdo = getDbConnection();
    $settings   = getAllSiteSettings($pdo);
    $banners    = getActiveBanners($pdo, true);
    $milestones = getJourneyMilestones($pdo, true);
    $services   = getServicesWithFeatures($pdo, true);
    $socials    = getSocialLinks($pdo, true);
    $aiPublic   = getAiPublicConfig($pdo);
} catch (Throwable $e) {
    http_response_code(503);
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ASIF ISLAM — Setup Required</title>
        <style>
            body { background:#08090D; color:#F5F7FA; font-family:system-ui,-apple-system,sans-serif; margin:0; display:grid; place-items:center; min-height:100vh; padding:24px; }
            .box { max-width:560px; background:#141821; border:1px solid rgba(0,229,255,.3); border-radius:18px; padding:32px; }
            h1 { margin:0 0 12px; font-size:1.35rem; color:#00E5FF; }
            p, li { color:#9299A8; line-height:1.65; font-size:.95rem; }
            code { background:#08090D; padding:2px 6px; border-radius:6px; color:#00FF9D; }
        </style>
    </head>
    <body>
        <div class="box">
            <h1>ASIF ISLAM — Database Configuration Needed</h1>
            <p><?= e($e->getMessage()) ?></p>
            <ol>
                <li>Import <code>/database/schema.sql</code> into your InfinityFree MySQL database via phpMyAdmin.</li>
                <li>Edit <code>/config/database.php</code> with your MySQL host, database name, username, and password.</li>
                <li>Visit <code>/admin/setup.php</code> to create your admin password.</li>
            </ol>
        </div>
    </body>
    </html>
    <?php
    exit;
}

require __DIR__ . '/includes/header.php';

$heroVisible     = setting($settings, 'hero_visible', '1') === '1';
$heroBadge       = setting($settings, 'hero_badge', 'INDEPENDENT DIGITAL CREATOR');
$heroHeading     = setting($settings, 'hero_heading', 'Building Digital Experiences. Exploring Tomorrow.');
$heroSubtitle    = setting($settings, 'hero_subtitle', 'From creative websites to customized digital solutions, I explore technology and turn ideas into meaningful digital experiences.');
$heroTyping      = setting($settings, 'hero_typing_phrases', 'Websites & Digital Presence|Custom Telegram Bots|Online Safety Guidance|Creative Short Videos');
$heroPrimaryBtn  = setting($settings, 'hero_primary_btn', 'Explore My Services');
$heroSecondBtn   = setting($settings, 'hero_secondary_btn', 'Discover My Journey');
$heroProfileImg  = safeImageUrl(setting($settings, 'hero_profile_image_url', setting($settings, 'profile_image_url', 'assets/images/asif-islam.jpg')));
$heroBgImage     = safeUrl(setting($settings, 'hero_bg_image_url', ''));
$location        = setting($settings, 'profile_location', 'Daulatpur, Kushtia, Bangladesh');

// Prebuild service data payload for JS modal (safe public fields only)
$servicesForJs = [];
foreach ($services as $srv) {
    $platformIconsHtml = [];
    foreach ($srv['platforms'] as $pKey) {
        $platformIconsHtml[] = [
            'key'  => $pKey,
            'name' => ucfirst((string)$pKey),
            'svg'  => renderPlatformIcon((string)$pKey, 'modal-plat-svg'),
        ];
    }
    $servicesForJs[(int)$srv['id']] = [
        'id'            => (int)$srv['id'],
        'number'        => (string)$srv['service_number'],
        'title'         => (string)$srv['title'],
        'fullDesc'      => (string)$srv['full_description'],
        'features'      => $srv['features'],
        'contactText'   => (string)$srv['contact_button_text'],
        'iconSvg'       => renderServiceIcon((string)$srv['icon_key'], 'service-svg'),
        'platformIcons' => $platformIconsHtml,
    ];
}
?>

<?php if ($heroVisible): ?>
<!-- 4. HOME PAGE — HERO SECTION -->
<section id="home" class="hero-section section-anchor" <?= $heroBgImage !== '' ? 'style="--hero-bg-image:url(\'' . e($heroBgImage) . '\')"' : '' ?>>
    <div class="container hero-grid">
        <div class="hero-copy reveal-on-scroll">
            <div class="hero-kicker">
                <span class="kicker-line" aria-hidden="true"></span>
                <span><?= e($heroBadge) ?></span>
            </div>

            <h1 class="hero-title gradient-text-anim">
                <?= e($heroHeading) ?>
            </h1>

            <p class="hero-subtitle">
                <?= e($heroSubtitle) ?>
            </p>

            <div class="hero-typing-row" aria-live="polite">
                <span class="typing-prefix">Focus &rarr;</span>
                <span id="typingTarget" class="typing-target" data-phrases="<?= e($heroTyping) ?>">Websites &amp; Digital Presence</span>
                <span class="typing-cursor" aria-hidden="true"></span>
            </div>

            <div class="hero-actions">
                <a href="#services" class="btn-3d btn-primary-3d">
                    <span><?= e($heroPrimaryBtn) ?></span>
                    <span class="btn-arrow" aria-hidden="true">&rarr;</span>
                </a>
                <a href="#journey" class="btn-3d btn-secondary-3d">
                    <span><?= e($heroSecondBtn) ?></span>
                </a>
            </div>

            <div class="hero-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="16" height="16" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Based in <?= e($location) ?></span>
            </div>
        </div>

        <div class="hero-visual reveal-on-scroll">
            <div class="profile-stage tilt-card" data-tilt>
                <div class="profile-orbit orbit-outer" aria-hidden="true"></div>
                <div class="profile-orbit orbit-inner" aria-hidden="true"></div>
                <div class="profile-frame glow-frame floating-slow">
                    <div class="profile-img-wrap">
                        <img
                            src="<?= e($heroProfileImg) ?>"
                            alt="<?= e(setting($settings, 'profile_name', 'Asif Islam')) ?> portrait"
                            class="profile-photo"
                            width="420"
                            height="420"
                        >
                    </div>
                    <div class="profile-caption">
                        <span class="caption-name"><?= e(setting($settings, 'brand_name', 'ASIF ISLAM')) ?></span>
                        <span class="caption-meta"><?= e(setting($settings, 'profile_education', 'SSC 2027 Batch')) ?> &middot; Est. <?= e(setting($settings, 'profile_started_year', '2024')) ?></span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php if (setting($settings, 'show_banners', '1') === '1' && !empty($banners)): ?>
    <!-- Animated Banner Slider (Managed from Admin) -->
    <div class="container banner-slider-wrap reveal-on-scroll">
        <div id="bannerSlider" class="banner-slider glow-frame">
            <div class="banner-track" id="bannerTrack">
                <?php foreach ($banners as $idx => $banner): ?>
                <article class="banner-slide <?= $idx === 0 ? 'is-active' : '' ?>">
                    <img src="<?= e(safeImageUrl($banner['image_url'], 'assets/images/banner-web.svg')) ?>" alt="<?= e($banner['title']) ?>" class="banner-bg" loading="lazy">
                    <div class="banner-scrim"></div>
                    <div class="banner-content">
                        <h3><?= e($banner['title']) ?></h3>
                        <?php if (trim((string)$banner['subtitle']) !== ''): ?>
                        <p><?= e($banner['subtitle']) ?></p>
                        <?php endif; ?>
                        <?php if (trim((string)$banner['destination_link']) !== ''): ?>
                        <a href="<?= e(safeUrl($banner['destination_link'])) ?>" class="btn-3d btn-secondary-3d btn-compact">
                            <span><?= e($banner['button_text'] ?: 'Explore') ?></span>
                            <span class="btn-arrow" aria-hidden="true">&rarr;</span>
                        </a>
                        <?php endif; ?>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
            <?php if (count($banners) > 1): ?>
            <div class="banner-controls">
                <button type="button" class="banner-nav-btn" id="bannerPrev" aria-label="Previous banner">&lsaquo;</button>
                <div class="banner-dots" id="bannerDots">
                    <?php foreach ($banners as $idx => $b): ?>
                    <button type="button" class="banner-dot <?= $idx === 0 ? 'is-active' : '' ?>" data-slide-to="<?= $idx ?>" aria-label="Slide <?= $idx + 1 ?>"></button>
                    <?php endforeach; ?>
                </div>
                <button type="button" class="banner-nav-btn" id="bannerNext" aria-label="Next banner">&rsaquo;</button>
            </div>
            <?php endif; ?>
        </div>
    </div>
    <?php endif; ?>
</section>
<?php endif; ?>

<?php if (setting($settings, 'show_journey', '1') === '1'): ?>
<!-- 5. JOURNEY SECTION -->
<section id="journey" class="section-block section-anchor">
    <div class="container">
        <header class="section-head reveal-on-scroll">
            <span class="section-kicker">Timeline &middot; Since <?= e(setting($settings, 'profile_started_year', '2024')) ?></span>
            <h2 class="section-title">MY DIGITAL JOURNEY</h2>
            <p class="section-subtitle">Every experience begins with curiosity. Every step builds something new.</p>
        </header>

        <div class="timeline-wrap">
            <div class="timeline-rail" aria-hidden="true"></div>
            <?php foreach ($milestones as $idx => $ms): ?>
            <article class="timeline-item <?= ($idx % 2 === 0) ? 'is-left' : 'is-right' ?> reveal-on-scroll">
                <div class="timeline-node" aria-hidden="true"><span></span></div>
                <div class="timeline-card glass-panel glow-frame tilt-card" data-tilt>
                    <div class="timeline-year tabular-nums"><?= e($ms['year_label']) ?></div>
                    <h3 class="timeline-title"><?= e($ms['title']) ?></h3>
                    <p class="timeline-desc"><?= e($ms['description']) ?></p>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<?php if (setting($settings, 'show_about', '1') === '1'): ?>
<!-- 6. ABOUT SECTION -->
<section id="about" class="section-block section-anchor">
    <div class="container">
        <header class="section-head reveal-on-scroll">
            <span class="section-kicker">Profile &amp; Vision</span>
            <h2 class="section-title"><?= e(setting($settings, 'about_heading', 'BEHIND THE DIGITAL WORLD')) ?></h2>
        </header>

        <div class="about-layout">
            <div class="about-narrative glass-panel glow-frame reveal-on-scroll">
                <?php
                $aboutParagraphs = preg_split("/\r\n|\n|\r/", trim(setting($settings, 'about_description', '')));
                foreach ($aboutParagraphs as $para):
                    $para = trim($para);
                    if ($para === '') continue;
                ?>
                <p><?= e($para) ?></p>
                <?php endforeach; ?>
            </div>

            <div class="about-facts-grid reveal-on-scroll">
                <div class="fact-card glass-panel">
                    <span class="fact-label">Name</span>
                    <strong class="fact-value"><?= e(setting($settings, 'profile_name', 'Asif Islam')) ?></strong>
                </div>
                <div class="fact-card glass-panel">
                    <span class="fact-label">Location</span>
                    <strong class="fact-value"><?= e(setting($settings, 'profile_location', 'Daulatpur, Kushtia, Bangladesh')) ?></strong>
                </div>
                <div class="fact-card glass-panel">
                    <span class="fact-label">Education</span>
                    <strong class="fact-value"><?= e(setting($settings, 'profile_education', 'SSC 2027 Batch')) ?></strong>
                </div>
                <div class="fact-card glass-panel">
                    <span class="fact-label">Started Exploring</span>
                    <strong class="fact-value tabular-nums"><?= e(setting($settings, 'profile_started_year', '2024')) ?></strong>
                </div>
                <div class="fact-card glass-panel fact-wide">
                    <span class="fact-label">Interests</span>
                    <strong class="fact-value"><?= e(setting($settings, 'profile_interests', 'Technology, Digital Creativity, Cybersecurity, Web Development')) ?></strong>
                </div>
                <div class="fact-card glass-panel fact-wide">
                    <span class="fact-label">Future Goal</span>
                    <strong class="fact-value"><?= e(setting($settings, 'profile_future_goal', 'Computer Science & Technology')) ?></strong>
                </div>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<?php if (setting($settings, 'show_services', '1') === '1'): ?>
<!-- 7. SERVICES SECTION -->
<section id="services" class="section-block section-anchor">
    <div class="container">
        <header class="section-head reveal-on-scroll">
            <span class="section-kicker">Digital Solutions</span>
            <h2 class="section-title">WHAT I CAN HELP YOU WITH</h2>
            <p class="section-subtitle">Creative ideas, digital solutions, and customized services — built around your needs.</p>
        </header>

        <div class="services-grid">
            <?php foreach ($services as $srv): ?>
            <button
                type="button"
                class="service-card glass-panel glow-frame tilt-card reveal-on-scroll"
                data-tilt
                data-service-id="<?= (int)$srv['id'] ?>"
            >
                <div class="service-card-top">
                    <div class="service-icon-box">
                        <?= renderServiceIcon((string)$srv['icon_key'], 'service-svg') ?>
                    </div>
                    <span class="service-number tabular-nums"><?= e($srv['service_number']) ?></span>
                </div>
                <h3 class="service-card-title"><?= e($srv['title']) ?></h3>
                <p class="service-card-desc"><?= e($srv['short_description']) ?></p>

                <div class="service-card-footer">
                    <div class="service-mini-platforms">
                        <?php foreach (array_slice($srv['platforms'], 0, 5) as $pKey): ?>
                        <span class="mini-plat" title="<?= e(ucfirst((string)$pKey)) ?>">
                            <?= renderPlatformIcon((string)$pKey, 'mini-plat-svg') ?>
                        </span>
                        <?php endforeach; ?>
                    </div>
                    <span class="service-inspect">View Details &rarr;</span>
                </div>
            </button>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<?php if (setting($settings, 'show_support', '1') === '1'): ?>
<!-- 9. SUPPORT SECTION -->
<section id="support" class="section-block section-anchor">
    <div class="container">
        <header class="section-head reveal-on-scroll">
            <span class="section-kicker">Direct Support &amp; Channels</span>
            <h2 class="section-title"><?= e(setting($settings, 'contact_heading', "LET'S CONNECT")) ?></h2>
            <p class="section-subtitle"><?= e(setting($settings, 'contact_subtitle', 'Have a project, a question, or need digital assistance? Choose your preferred platform and get in touch.')) ?></p>
        </header>

        <div class="social-grid reveal-on-scroll">
            <?php foreach ($socials as $soc):
                $rawUrl = trim((string)$soc['url']);
                $href = safeUrl($rawUrl);
                $hasUrl = $href !== '';
                $brandColor = sanitizeHexColor((string)$soc['brand_color'], '#00E5FF');
            ?>
                <?php if ($hasUrl): ?>
                <a
                    href="<?= e($href) ?>"
                    target="<?= str_starts_with($href, 'mailto:') ? '_self' : '_blank' ?>"
                    rel="noopener noreferrer"
                    class="social-card glass-panel glow-frame"
                    style="--brand-color: <?= e($brandColor) ?>;"
                >
                    <span class="social-icon-wrap">
                        <?= renderPlatformIcon((string)$soc['platform_key'], 'social-svg') ?>
                    </span>
                    <div class="social-info">
                        <strong class="social-name"><?= e($soc['platform_name']) ?></strong>
                        <span class="social-sub"><?= e($soc['supporting_text']) ?></span>
                    </div>
                </a>
                <?php else: ?>
                <div class="social-card glass-panel is-disabled" aria-disabled="true" style="--brand-color: <?= e($brandColor) ?>;">
                    <span class="social-icon-wrap">
                        <?= renderPlatformIcon((string)$soc['platform_key'], 'social-svg') ?>
                    </span>
                    <div class="social-info">
                        <strong class="social-name"><?= e($soc['platform_name']) ?></strong>
                        <span class="social-sub">Link not configured yet</span>
                    </div>
                </div>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>

        <!-- Validated Contact Form -->
        <div class="contact-card glass-panel glow-frame reveal-on-scroll">
            <div class="contact-card-header">
                <h3>Send a Direct Inquiry</h3>
                <p>Fill out your details cleanly below. We validate every request and prepare a formatted handoff.</p>
            </div>

            <form id="contactForm" class="contact-form" novalidate>
                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                <input type="hidden" name="form_ts" value="<?= time() ?>">
                <!-- Honeypot spam protection -->
                <div class="hp-field" aria-hidden="true">
                    <label for="website_url">Website</label>
                    <input type="text" id="website_url" name="website_url" tabindex="-1" autocomplete="off">
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="full_name">Full Name</label>
                        <input type="text" id="full_name" name="full_name" placeholder="Your full name" required minlength="2" maxlength="120">
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="you@example.com" required maxlength="160">
                    </div>

                    <div class="form-group">
                        <label for="preferred_method">Preferred Contact Method</label>
                        <select id="preferred_method" name="preferred_method">
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Email">Email</option>
                            <option value="Telegram">Telegram</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="service_category">Service Category</label>
                        <select id="service_category" name="service_category">
                            <?php foreach ($services as $srv): ?>
                            <option value="<?= e($srv['title']) ?>"><?= e($srv['service_number']) ?> &mdash; <?= e($srv['title']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="4" placeholder="Describe your idea, website requirement, or assistance needed..." required minlength="10" maxlength="2000"></textarea>
                </div>

                <div id="contactFeedback" class="form-feedback hidden" role="status" aria-live="polite"></div>

                <div class="form-submit-row">
                    <button type="submit" id="contactSubmitBtn" class="btn-3d btn-primary-3d">
                        <span>Send Message</span>
                        <span class="btn-arrow" aria-hidden="true">&rarr;</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</section>
<?php endif; ?>

<script>
window.ASIF_SERVICES = <?= json_encode($servicesForJs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>
